# P40: working builds only. No corpus registry, candidate release or patch is read.
param([string]$Out = "builds", [string]$Evidence = "artefacts/calibration", [switch]$ValidatePathsOnly)
$ErrorActionPreference = "Stop"
$repo = (Get-Location).Path
New-Item -ItemType Directory -Force -Path $Out, $Evidence | Out-Null
$cases = Get-Content harness/src/runner/calibration-cases.json -Raw | ConvertFrom-Json
$logs = Join-Path (Resolve-Path -LiteralPath $Evidence).Path "build-logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null
if ($ValidatePathsOnly) { Write-Output $logs; return }
$env:npm_config_cache = Join-Path $env:RUNNER_TEMP "npm-cache-m8"
$tools = Join-Path $env:RUNNER_TEMP "m8-tools"
New-Item -ItemType Directory -Force -Path $tools | Out-Null
'{"private":true,"dependencies":{"vite":"8.3.2","@vitejs/plugin-react":"6.0.1"}}' | Out-File -Encoding utf8NoBOM (Join-Path $tools "package.json")
Copy-Item fixtures/oss-tools/ossBuild.mjs $tools
npm install --prefix $tools --ignore-scripts --no-audit --no-fund 2>&1 | Out-File (Join-Path $logs "tools.log")
$toolsExit = $LASTEXITCODE
$results = @()
foreach ($case in $cases) {
  $row = [ordered]@{ case = $case.id; app = $case.app; baseRef = $case.baseRef; label = "base"; candidateBuilt = $false; labelEvidence = "EXPLORATORY" }
  try {
    $appKey = $case.app.Replace("/", "-")
    $dest = Join-Path (Join-Path $Out $appKey) "base"
    if ($case.id -eq "controls") {
      New-Item -ItemType Directory -Force -Path $dest | Out-Null
      Copy-Item fixtures/m8-controls/* $dest
      $row.buildExit = 0
    } else {
      if ($toolsExit -ne 0) { throw "build tools install failed" }
      $fixture = Join-Path $repo "fixtures/oss/$($case.fixture)"
      $meta = Get-Content (Join-Path $fixture "fixture.json") -Raw | ConvertFrom-Json
      $version = $case.baseRef.Substring($case.baseRef.LastIndexOf('@') + 1)
      $times = npm view $meta.package time --json | ConvertFrom-Json -AsHashtable
      $before = ([datetime]$times[$version]).ToUniversalTime().AddDays(1).ToString("yyyy-MM-dd'T'HH:mm:ss'Z'")
      $row.before = $before
      $work = Join-Path $env:RUNNER_TEMP "m8-$($case.fixture)"
      node harness/src/probes/ossFixture.ts --fixture $fixture --version $version --out $work 2>&1 | Out-File (Join-Path $logs "$($case.id).fixture.log")
      if ($LASTEXITCODE -ne 0) { throw "fixture preparation failed" }
      Push-Location $work
      try {
        npm install --ignore-scripts --no-audit --no-fund "--before=$before" 2>&1 | Out-File (Join-Path $logs "$($case.id).install.log")
        $row.installExit = $LASTEXITCODE
      } finally { Pop-Location }
      if ($row.installExit -ne 0) { throw "working release install failed" }
      node (Join-Path $tools "ossBuild.mjs") $work $meta.stack 2>&1 | Out-File (Join-Path $logs "$($case.id).build.log")
      $row.buildExit = $LASTEXITCODE
      if ($row.buildExit -ne 0) { throw "working release build failed" }
      New-Item -ItemType Directory -Force -Path $dest | Out-Null
      Copy-Item -Recurse -Force (Join-Path $work "dist/*") $dest
      Copy-Item (Join-Path $work "package-lock.json") (Join-Path $logs "$($case.id).package-lock.json")
    }
  } catch {
    $row.error = $_.Exception.Message
  }
  $results += $row
}
$results | ConvertTo-Json -Depth 8 | Out-File -Encoding utf8NoBOM (Join-Path $Evidence "builds.json")
# Runtime records each unavailable build and continues to the other predeclared cases, without retrying.

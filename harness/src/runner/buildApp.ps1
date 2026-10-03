# Builds every side that an app's dev items need (DR-0066), for the item runner.
# Windows CI only; third-party code is installed with scripts off and a separate
# npm cache that is never saved (P17, P19).
#
#   ./harness/src/runner/buildApp.ps1 -App <app> -Out <builds dir> [-Items id,id]
#
# Output: <Out>/<app key>/base and <Out>/<app key>/<item id>, each a static build.
# - SPA (fixtures/spa/<app>): the base build, then each item's patch applied,
#   built and reverted (as m3-spa-build does).
# - Mined pair (oss/<id>): the fixture at the last good release (base), at the
#   first broken release (the regression item), and at the last good release
#   with each twin's patch. Each release installs with npm --before its own
#   publish time plus one day (DR-0063).
param(
  [Parameter(Mandatory = $true)][string]$App,
  [Parameter(Mandatory = $true)][string]$Out,
  [string]$Items = ""
)
$ErrorActionPreference = "Stop"
$repo = (Get-Location).Path
$appKey = $App.Replace("/", "-")
$dest = Join-Path (Resolve-Path -LiteralPath (New-Item -ItemType Directory -Force -Path $Out)).Path $appKey
New-Item -ItemType Directory -Force -Path $dest | Out-Null
$logs = Join-Path $dest "_logs"
New-Item -ItemType Directory -Force -Path $logs | Out-Null
$env:npm_config_cache = Join-Path $env:RUNNER_TEMP "npm-cache-items"
$wanted = if ($Items -eq "") { $null } else { $Items.Split(",") | ForEach-Object { $_.Trim() } }
$all = Get-ChildItem corpus/items -Filter *.json | Where-Object { $_.Name -notlike "* 2.*" } | ForEach-Object { Get-Content $_.FullName -Raw | ConvertFrom-Json }
$devItems = @($all | Where-Object { $_.app -eq $App -and $_.split -eq "dev" -and ($null -eq $wanted -or $wanted -contains $_.id) })
$results = @()

function Copy-Dist([string]$from, [string]$to) {
  if (Test-Path $to) { Remove-Item -Recurse -Force $to }
  Copy-Item -Recurse -Force $from $to
}

if ($App -like "oss/*") {
  $id = $App.Substring(4)
  $fixture = Join-Path $repo "fixtures/oss/$id"
  $meta = Get-Content (Join-Path $fixture "fixture.json") -Raw | ConvertFrom-Json
  $tools = Join-Path $env:RUNNER_TEMP "oss-tools"
  New-Item -ItemType Directory -Force -Path $tools | Out-Null
  '{"private":true,"dependencies":{"vite":"8.3.2","@vitejs/plugin-react":"6.0.1"}}' | Out-File -Encoding utf8NoBOM (Join-Path $tools "package.json")
  Copy-Item (Join-Path $repo "fixtures/oss-tools/ossBuild.mjs") $tools
  npm install --prefix $tools --ignore-scripts --no-audit --no-fund 2>&1 | Out-File (Join-Path $logs "tools.log")
  if ($LASTEXITCODE -ne 0) { throw "build tools install failed" }
  $times = npm view $meta.package time --json | ConvertFrom-Json -AsHashtable
  # The version pair comes from the regression item; the unchanged control is also oss-history, with base = candidate.
  $regression = @($all | Where-Object { $_.app -eq $App -and $_.split -eq "dev" -and $_.source -eq "oss-history" -and $_.expected.kind -eq "regression" }) | Select-Object -First 1
  if ($null -eq $regression) { throw "no dev regression item for $App" }
  $good = $regression.base.ref -replace '^.*@', ''
  $broken = $regression.candidate.ref -replace '^.*@', ''
  if ($good -eq $broken) { throw "the regression item's base and candidate are the same release ($good)" }
  function Build-Release([string]$version, [string]$label, [string]$patch) {
    $before = ([datetime]$times[$version]).ToUniversalTime().AddDays(1).ToString("yyyy-MM-dd'T'HH:mm:ss'Z'")
    $work = Join-Path $env:RUNNER_TEMP "item-oss-$label"
    if ($patch -ne "") { git apply $patch 2>&1 | Out-File (Join-Path $logs "$label.apply.log") }
    node harness/src/probes/ossFixture.ts --fixture $fixture --version $version --out $work 2>&1 | Out-File (Join-Path $logs "$label.fixture.log")
    if ($patch -ne "") { git apply -R $patch 2>&1 | Out-File -Append (Join-Path $logs "$label.apply.log") }
    Push-Location $work
    npm install --ignore-scripts --no-audit --no-fund "--before=$before" 2>&1 | Out-File (Join-Path $logs "$label.install.log")
    $installExit = $LASTEXITCODE
    Pop-Location
    node (Join-Path $tools "ossBuild.mjs") $work $meta.stack 2>&1 | Out-File (Join-Path $logs "$label.build.log")
    $buildExit = $LASTEXITCODE
    if ($buildExit -eq 0) { Copy-Dist (Join-Path $work "dist") (Join-Path $dest $label) }
    return [ordered]@{ label = $label; version = $version; before = $before; installExit = $installExit; buildExit = $buildExit }
  }
  $results += Build-Release $good "base" ""
  foreach ($item in $devItems) {
    if ($item.expected.kind -eq "unchanged") { continue }
    if ($item.source -eq "oss-history" -and $item.expected.kind -eq "regression") { $results += Build-Release $broken $item.id "" }
    elseif ($item.candidate.patch) { $results += Build-Release $good $item.id (Join-Path $repo "corpus/patches/$($item.candidate.patch)") }
  }
} else {
  $work = Join-Path $env:RUNNER_TEMP "item-spa"
  if (Test-Path $work) { Remove-Item -Recurse -Force $work }
  Copy-Item -Recurse -Force (Join-Path $repo "fixtures/spa/$App") $work
  $build = if ($App -eq "atomic-crm") { "npx --no-install vite build --config vite.demo.config.ts" } else { "npx --no-install vite build" }
  Push-Location $work
  npm ci --ignore-scripts --no-audit --no-fund 2>&1 | Out-File (Join-Path $logs "install.log")
  $installExit = $LASTEXITCODE
  Invoke-Expression "$build 2>&1" | Out-File (Join-Path $logs "base.build.log")
  $buildExit = $LASTEXITCODE
  if ($buildExit -eq 0) { Copy-Dist (Join-Path $work "dist") (Join-Path $dest "base") }
  $results += [ordered]@{ label = "base"; installExit = $installExit; buildExit = $buildExit }
  foreach ($item in $devItems) {
    if (-not $item.candidate.patch) { continue }
    $patch = Join-Path $repo "corpus/patches/$($item.candidate.patch)"
    # Patch paths are a/fixtures/spa/<app>/...; strip four components inside the app copy.
    git apply -p4 $patch 2>&1 | Out-File (Join-Path $logs "$($item.id).apply.log")
    $applyExit = $LASTEXITCODE
    Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
    Invoke-Expression "$build 2>&1" | Out-File (Join-Path $logs "$($item.id).build.log")
    $buildExit = $LASTEXITCODE
    if ($applyExit -eq 0 -and $buildExit -eq 0) { Copy-Dist (Join-Path $work "dist") (Join-Path $dest $item.id) }
    git apply -R -p4 $patch 2>&1 | Out-File -Append (Join-Path $logs "$($item.id).apply.log")
    $results += [ordered]@{ label = $item.id; applyExit = $applyExit; buildExit = $buildExit; revertExit = $LASTEXITCODE }
  }
  Pop-Location
}
$results | ConvertTo-Json | Out-File (Join-Path $logs "builds.json")
if ($results | Where-Object { $_.buildExit -ne 0 }) { Write-Host "one or more builds failed; see $logs/builds.json" }
exit 0

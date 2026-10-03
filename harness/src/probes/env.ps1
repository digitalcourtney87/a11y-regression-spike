# M1a environment snapshot (DR-0025; DR-0006 image identity; DR-0012 audio).
# Runs under PowerShell 7 (pwsh) on a GitHub-hosted Windows runner and writes
# one JSON document. Every field is best effort: a failed query records its
# error instead of stopping the snapshot.
param([Parameter(Mandatory = $true)][string]$Out)
$ErrorActionPreference = 'Stop'

function Get-Safely([scriptblock]$Block) {
  try { & $Block } catch { "error: $($_.Exception.Message)" }
}

$cv = Get-Safely { Get-ItemProperty 'HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion' }
$result = [ordered]@{
  imageOS      = $env:ImageOS
  imageVersion = $env:ImageVersion
  imageEnv     = Get-Safely { Get-ChildItem env: | Where-Object { $_.Name -match 'image' } | ForEach-Object { "$($_.Name)=$($_.Value)" } }
  imageData    = Get-Safely { foreach ($p in @('C:\imagegeneration\imagedata.json')) { if (Test-Path $p) { Get-Content $p -Raw | ConvertFrom-Json } } }
  runner       = [ordered]@{ os = $env:RUNNER_OS; arch = $env:RUNNER_ARCH; environment = $env:RUNNER_ENVIRONMENT }
  windows      = [ordered]@{ productName = $cv.ProductName; displayVersion = $cv.DisplayVersion; currentBuild = $cv.CurrentBuild; ubr = $cv.UBR; editionId = $cv.EditionID }
  user         = [ordered]@{
    name      = $env:USERNAME
    integrity = Get-Safely { (whoami /groups | Select-String 'Mandatory Label').Line.Trim() }
    sessionId = Get-Safely { (Get-Process -Id $PID).SessionId }
  }
  culture      = Get-Safely { (Get-Culture).Name }
  uiCulture    = Get-Safely { (Get-UICulture).Name }
  timeZone     = Get-Safely { (Get-TimeZone).Id }
  audio        = [ordered]@{
    soundDevices = Get-Safely { @(Get-CimInstance Win32_SoundDevice | ForEach-Object { [ordered]@{ name = $_.Name; status = $_.Status; pnp = $_.PNPDeviceID } }) }
    endpoints    = Get-Safely { @(Get-PnpDevice -Class AudioEndpoint -ErrorAction SilentlyContinue | ForEach-Object { [ordered]@{ name = $_.FriendlyName; status = "$($_.Status)"; id = $_.InstanceId } }) }
    services     = Get-Safely { @(Get-Service Audiosrv, AudioEndpointBuilder | ForEach-Object { [ordered]@{ name = $_.Name; status = "$($_.Status)"; startType = "$($_.StartType)" } }) }
  }
  devcon       = [ordered]@{
    onPath      = Get-Safely { $c = Get-Command devcon -ErrorAction SilentlyContinue; if ($c) { $c.Source } else { $null } }
    windowsKits = Get-Safely { @(Get-ChildItem 'C:\Program Files (x86)\Windows Kits\10\Tools' -Recurse -Filter devcon.exe -ErrorAction SilentlyContinue | ForEach-Object FullName) }
  }
  pnputil      = Get-Safely { $c = Get-Command pnputil -ErrorAction SilentlyContinue; if ($c) { $c.Source } else { $null } }
  dotnetSdks   = Get-Safely { @(dotnet --list-sdks) }
  installedChrome = Get-Safely { (Get-Item 'C:\Program Files\Google\Chrome\Application\chrome.exe').VersionInfo.ProductVersion }
  foregroundLockTimeout = Get-Safely { (Get-ItemProperty 'HKCU:\Control Panel\Desktop').ForegroundLockTimeout }
}

$dir = Split-Path -Parent $Out
if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
$json = $result | ConvertTo-Json -Depth 8
Set-Content -Path $Out -Value $json -Encoding utf8
Write-Output $json

# Scream 3.6 signature record and, once pinned, installation (DR-0012 D3
# Virtual audio, as amended by DR-0040 Scream Authenticode verification).
#
# Order: download; check the archive's SHA-256 against env/env.lock.json
# before anything is expanded; expand; record the Authenticode status, signer,
# issuer, thumbprint and certificate chain of every driver file to
# scream-signature.json; only then, and only if env.lock pins the signer
# thumbprint, verify the signature against the pins, trust the certificate and
# install. While the thumbprint is pending (the first M1a run), nothing is
# trusted or installed: the record decides the pin (DR-0040).
param(
  [Parameter(Mandatory = $true)][string]$Lock,
  [Parameter(Mandatory = $true)][string]$OutDir
)
$ErrorActionPreference = 'Stop'
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$recordPath = Join-Path $OutDir 'scream-signature.json'
$pins = (Get-Content $Lock -Raw | ConvertFrom-Json).scream
$record = [ordered]@{
  url              = $pins.url
  expectedSha256   = $pins.sha256
  thumbprintStatus = $pins.signerThumbprint.status
}
function Save-Record { $record | ConvertTo-Json -Depth 8 | Set-Content -Path $recordPath -Encoding utf8 }

function Get-ChainRecord([System.Security.Cryptography.X509Certificates.X509Certificate2]$Cert) {
  $chain = [System.Security.Cryptography.X509Certificates.X509Chain]::new()
  $chain.ChainPolicy.RevocationMode = [System.Security.Cryptography.X509Certificates.X509RevocationMode]::NoCheck
  $built = $chain.Build($Cert)
  [ordered]@{
    builds   = $built
    elements = @($chain.ChainElements | ForEach-Object { [ordered]@{ subject = $_.Certificate.Subject; issuer = $_.Certificate.Issuer; thumbprint = $_.Certificate.Thumbprint } })
    status   = @($chain.ChainStatus | ForEach-Object { "$($_.Status): $($_.StatusInformation.Trim())" })
  }
}

try {
  $record.servicesBefore = @(Get-Service Audiosrv, AudioEndpointBuilder | ForEach-Object { [ordered]@{ name = $_.Name; status = "$($_.Status)"; startType = "$($_.StartType)" } })
  $zip = Join-Path $env:RUNNER_TEMP 'Scream3.6.zip'
  Invoke-WebRequest -Uri $pins.url -OutFile $zip
  $record.sha256 = (Get-FileHash $zip -Algorithm SHA256).Hash.ToLowerInvariant()
  $record.sha256Ok = ($record.sha256 -eq $pins.sha256)
  if (-not $record.sha256Ok) { throw "Scream SHA-256 mismatch: got $($record.sha256)" }

  $dir = Join-Path $env:RUNNER_TEMP 'scream'
  Expand-Archive -Path $zip -DestinationPath $dir -Force
  $record.files = @(Get-ChildItem $dir -Recurse -File | ForEach-Object { $_.FullName.Substring($dir.Length + 1) })
  $inf = Get-ChildItem $dir -Recurse -Filter 'Scream.inf' | Where-Object { $_.FullName -match 'x64' } | Select-Object -First 1
  if ($null -eq $inf) { throw 'no x64 Scream.inf in the archive' }
  $record.inf = $inf.FullName.Substring($dir.Length + 1)

  $record.signatures = @()
  foreach ($file in @(Get-ChildItem $inf.DirectoryName -File | Where-Object { $_.Extension -in '.sys', '.cat' })) {
    $sig = Get-AuthenticodeSignature -FilePath $file.FullName
    $cert = $sig.SignerCertificate
    $entry = [ordered]@{
      file          = $file.Name
      status        = "$($sig.Status)"
      statusMessage = $sig.StatusMessage
      signatureType = "$($sig.SignatureType)"
    }
    if ($null -ne $cert) {
      $entry.signer     = $cert.Subject
      $entry.issuer     = $cert.Issuer
      $entry.thumbprint = $cert.Thumbprint
      $entry.notBefore  = $cert.NotBefore.ToString('o')
      $entry.notAfter   = $cert.NotAfter.ToString('o')
      $entry.selfSigned = ($cert.Subject -eq $cert.Issuer)
      $entry.chain      = Get-ChainRecord $cert
    }
    if ($null -ne $sig.TimeStamperCertificate) { $entry.timestamper = $sig.TimeStamperCertificate.Subject }
    $record.signatures += $entry
  }
  Save-Record

  if ($pins.signerThumbprint.status -ne 'pinned') {
    $record.install = 'skipped: the signer thumbprint is pending M1a, so this run records the signature only (DR-0040)'
  } else {
    $sys = $record.signatures | Where-Object { $_.file -ieq 'Scream.sys' } | Select-Object -First 1
    if ($null -eq $sys) { throw 'no Scream.sys signature record' }
    if ($sys.status -ne 'Valid') { throw "Scream.sys signature status is $($sys.status), not Valid" }
    if ($sys.status -ne $pins.signatureStatus.value) { throw 'signature status differs from env.lock' }
    if ($sys.signer -ne $pins.signer.value) { throw 'signer differs from env.lock' }
    if ($sys.issuer -ne $pins.issuer.value) { throw 'issuer differs from env.lock' }
    if ($sys.thumbprint -ne $pins.signerThumbprint.value) { throw 'signer thumbprint differs from env.lock' }
    $cert = (Get-AuthenticodeSignature -FilePath (Join-Path $inf.DirectoryName 'Scream.sys')).SignerCertificate
    $store = [System.Security.Cryptography.X509Certificates.X509Store]::new('TrustedPublisher', 'LocalMachine')
    $store.Open('ReadWrite'); $store.Add($cert); $store.Close()
    Start-Service Audiosrv, AudioEndpointBuilder
    $devcon = Get-ChildItem $dir -Recurse -Filter 'devcon*.exe' | Where-Object { $_.Name -match 'x64|devcon.exe' } | Select-Object -First 1
    if ($null -eq $devcon) { $devcon = Get-Command devcon -ErrorAction SilentlyContinue }
    if ($null -eq $devcon) { throw 'devcon is neither in the archive nor on PATH (DR-0012: a separate download needs the owner)' }
    $devconPath = if ($devcon -is [System.IO.FileInfo]) { $devcon.FullName } else { $devcon.Source }
    $record.devcon = $devconPath
    $record.installOutput = @(& $devconPath install $inf.FullName '*Scream' 2>&1 | ForEach-Object { "$_" })
    $record.install = "devcon exit code $LASTEXITCODE"
  }
  $record.servicesAfter = @(Get-Service Audiosrv, AudioEndpointBuilder | ForEach-Object { [ordered]@{ name = $_.Name; status = "$($_.Status)"; startType = "$($_.StartType)" } })
} catch {
  $record.error = $_.Exception.Message
  Save-Record
  throw
}
Save-Record
$record | ConvertTo-Json -Depth 8

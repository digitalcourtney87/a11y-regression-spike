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
#
# The archive's bundled devcon.exe is not signed, so it is never run. The
# device is created by RootDevice below, which makes the same SetupAPI and
# newdev calls as `devcon install` (DR-0047).
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

Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
using System.Text;

/// Creates a root-enumerated device for a hardware id and installs the INF's
/// driver on it: the SetupAPI sequence that `devcon install` performs.
public static class RootDevice {
  const int DICD_GENERATE_ID = 0x1;
  const int DIF_REGISTERDEVICE = 0x19;
  const int SPDRP_HARDWAREID = 0x1;
  const int INSTALLFLAG_FORCE = 0x1;

  [StructLayout(LayoutKind.Sequential)]
  public struct SP_DEVINFO_DATA { public int cbSize; public Guid ClassGuid; public int DevInst; public IntPtr Reserved; }

  [DllImport("setupapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  static extern bool SetupDiGetINFClass(string infName, out Guid classGuid, StringBuilder className, int classNameSize, out int requiredSize);
  [DllImport("setupapi.dll", SetLastError = true)]
  static extern IntPtr SetupDiCreateDeviceInfoList(ref Guid classGuid, IntPtr hwndParent);
  [DllImport("setupapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  static extern bool SetupDiCreateDeviceInfo(IntPtr set, string deviceName, ref Guid classGuid, string description, IntPtr hwndParent, int flags, ref SP_DEVINFO_DATA data);
  [DllImport("setupapi.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  static extern bool SetupDiSetDeviceRegistryProperty(IntPtr set, ref SP_DEVINFO_DATA data, int property, byte[] buffer, int size);
  [DllImport("setupapi.dll", SetLastError = true)]
  static extern bool SetupDiCallClassInstaller(int function, IntPtr set, ref SP_DEVINFO_DATA data);
  [DllImport("setupapi.dll", SetLastError = true)]
  static extern bool SetupDiDestroyDeviceInfoList(IntPtr set);
  [DllImport("newdev.dll", CharSet = CharSet.Unicode, SetLastError = true)]
  static extern bool UpdateDriverForPlugAndPlayDevices(IntPtr hwndParent, string hardwareId, string fullInfPath, int flags, out bool rebootRequired);

  static string Fail(string step) { return "failed at " + step + ": Win32 error " + Marshal.GetLastWin32Error(); }

  public static string Install(string infPath, string hardwareId) {
    Guid classGuid;
    var className = new StringBuilder(64);
    int required;
    if (!SetupDiGetINFClass(infPath, out classGuid, className, className.Capacity, out required)) return Fail("SetupDiGetINFClass");
    IntPtr set = SetupDiCreateDeviceInfoList(ref classGuid, IntPtr.Zero);
    if (set == new IntPtr(-1)) return Fail("SetupDiCreateDeviceInfoList");
    try {
      var data = new SP_DEVINFO_DATA();
      data.cbSize = Marshal.SizeOf(typeof(SP_DEVINFO_DATA));
      if (!SetupDiCreateDeviceInfo(set, className.ToString(), ref classGuid, null, IntPtr.Zero, DICD_GENERATE_ID, ref data)) return Fail("SetupDiCreateDeviceInfo");
      byte[] ids = Encoding.Unicode.GetBytes(hardwareId + "\0\0");
      if (!SetupDiSetDeviceRegistryProperty(set, ref data, SPDRP_HARDWAREID, ids, ids.Length)) return Fail("SetupDiSetDeviceRegistryProperty");
      if (!SetupDiCallClassInstaller(DIF_REGISTERDEVICE, set, ref data)) return Fail("SetupDiCallClassInstaller(DIF_REGISTERDEVICE)");
    } finally {
      SetupDiDestroyDeviceInfoList(set);
    }
    bool reboot;
    if (!UpdateDriverForPlugAndPlayDevices(IntPtr.Zero, hardwareId, infPath, INSTALLFLAG_FORCE, out reboot)) return Fail("UpdateDriverForPlugAndPlayDevices");
    return "installed: class " + className + ", reboot required " + reboot;
  }
}
'@

function Get-PeMachine([string]$Path) {
  $bytes = [System.IO.File]::ReadAllBytes($Path)
  $pe = [BitConverter]::ToInt32($bytes, 0x3C)
  $machine = [BitConverter]::ToUInt16($bytes, $pe + 4)
  switch ($machine) { 0x8664 { 'x64' } 0x014C { 'x86' } 0xAA64 { 'arm64' } default { '0x{0:X4}' -f $machine } }
}

function Get-SignatureRecord([string]$Path) {
  $sig = Get-AuthenticodeSignature -FilePath $Path
  $cert = $sig.SignerCertificate
  $entry = [ordered]@{
    file          = Split-Path -Leaf $Path
    status        = "$($sig.Status)"
    statusMessage = $sig.StatusMessage
    signatureType = "$($sig.SignatureType)"
  }
  if ($Path -match '\.(sys|exe|dll)$') { $entry.machine = Get-PeMachine $Path }
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
  $entry
}

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
  # Scream 3.6 ships a single driver folder (Install\driver); prefer it if there are several.
  $infs = @(Get-ChildItem $dir -Recurse -Filter 'Scream.inf')
  $inf = @($infs | Where-Object { $_.FullName -match '\\driver\\' }) + $infs | Select-Object -First 1
  if ($null -eq $inf) { throw 'no Scream.inf in the archive' }
  $record.inf = $inf.FullName.Substring($dir.Length + 1)
  $installBat = Get-ChildItem $dir -Recurse -Filter 'Install.bat' | Select-Object -First 1
  if ($null -ne $installBat) { $record.installBat = @(Get-Content $installBat.FullName) }
  $record.infHardwareIds = @(Select-String -Path $inf.FullName -Pattern 'Scream' | ForEach-Object { $_.Line.Trim() } | Select-Object -First 20)

  $record.signatures = @()
  foreach ($file in @(Get-ChildItem $inf.DirectoryName -File | Where-Object { $_.Extension -in '.sys', '.cat' })) {
    $record.signatures += Get-SignatureRecord $file.FullName
  }
  $devconInArchive = Get-ChildItem $dir -Recurse -Filter 'devcon*.exe' | Select-Object -First 1
  if ($null -ne $devconInArchive) {
    $record.devconInArchive = $devconInArchive.FullName.Substring($dir.Length + 1)
    $record.devconSignature = Get-SignatureRecord $devconInArchive.FullName
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
    $record.installResult = [RootDevice]::Install($inf.FullName, '*Scream')
    $record.install = $record.installResult
    if (-not $record.installResult.StartsWith('installed')) { throw "Scream install $($record.installResult)" }
    Start-Sleep -Seconds 5
  }
  $record.servicesAfter = @(Get-Service Audiosrv, AudioEndpointBuilder | ForEach-Object { [ordered]@{ name = $_.Name; status = "$($_.Status)"; startType = "$($_.StartType)" } })
} catch {
  $record.error = $_.Exception.Message
  Save-Record
  throw
}
Save-Record
$record | ConvertTo-Json -Depth 8

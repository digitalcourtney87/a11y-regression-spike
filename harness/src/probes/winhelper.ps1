# Windows helper for the M1a probes and the M1b handover (DR-0025, DR-0024,
# DR-0046). A JSON-lines command server: one request per stdin line, one
# response per stdout line. It runs under Windows PowerShell 5.1
# (powershell.exe) so that the .NET Framework MSAA interop (Accessibility.dll)
# is available. It never creates a UIA client (P4, DR-0046): focus is read
# through MSAA only. Timestamps are QPC ticks (Stopwatch), never wall-clock
# reads (D1, DR-0010).
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

Add-Type -ReferencedAssemblies Accessibility, System.Drawing, System.Windows.Forms -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;
using System.Text;
using Accessibility;

public static class Probe {
  [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
  [DllImport("user32.dll")] static extern bool BringWindowToTop(IntPtr h);
  [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr h, int cmd);
  [DllImport("user32.dll")] static extern bool IsIconic(IntPtr h);
  [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h, out uint pid);
  [DllImport("user32.dll")] static extern bool AttachThreadInput(uint idAttach, uint idAttachTo, bool attach);
  [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] static extern void keybd_event(byte vk, byte scan, uint flags, UIntPtr extra);
  [DllImport("user32.dll")] static extern int GetSystemMetrics(int index);
  [DllImport("user32.dll")] static extern uint GetDpiForSystem();
  [DllImport("user32.dll")] static extern bool SystemParametersInfo(uint action, uint param, ref uint value, uint winIni);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetClassName(IntPtr h, StringBuilder sb, int n);
  [DllImport("user32.dll", CharSet = CharSet.Unicode)] static extern int GetWindowText(IntPtr h, StringBuilder sb, int n);
  delegate bool EnumWindowsProc(IntPtr h, IntPtr l);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumWindowsProc cb, IntPtr l);
  [DllImport("user32.dll")] static extern IntPtr OpenInputDesktop(uint flags, bool inherit, uint access);
  [DllImport("user32.dll")] static extern bool CloseDesktop(IntPtr h);
  [DllImport("oleacc.dll")] static extern int AccessibleObjectFromWindow(IntPtr h, uint objId, ref Guid iid, [MarshalAs(UnmanagedType.Interface)] out object acc);
  [DllImport("oleacc.dll", CharSet = CharSet.Unicode)] static extern uint GetRoleText(uint role, StringBuilder sb, uint n);
  [DllImport("kernel32.dll")] static extern IntPtr OpenProcess(uint access, bool inherit, uint pid);
  [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr h);
  [DllImport("kernel32.dll")] static extern bool ProcessIdToSessionId(uint pid, out uint session);
  [DllImport("advapi32.dll")] static extern bool OpenProcessToken(IntPtr process, uint access, out IntPtr token);
  [DllImport("advapi32.dll")] static extern bool GetTokenInformation(IntPtr token, int cls, IntPtr info, int len, out int retLen);
  [DllImport("advapi32.dll")] static extern IntPtr GetSidSubAuthority(IntPtr sid, uint index);
  [DllImport("advapi32.dll")] static extern IntPtr GetSidSubAuthorityCount(IntPtr sid);

  const uint OBJID_CLIENT = 0xFFFFFFFC;
  const int CHILDID_SELF = 0;
  const uint PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;
  const uint TOKEN_QUERY = 0x0008;
  const int TokenIntegrityLevel = 25;
  const byte VK_MENU = 0x12;
  const uint KEYEVENTF_KEYUP = 0x0002;

  public static long QpcTicks() { return Stopwatch.GetTimestamp(); }
  public static long QpcFrequency() { return Stopwatch.Frequency; }
  public static bool QpcHighResolution() { return Stopwatch.IsHighResolution; }

  public static long Foreground() { return GetForegroundWindow().ToInt64(); }

  static string ClassOf(IntPtr h) { var sb = new StringBuilder(256); GetClassName(h, sb, sb.Capacity); return sb.ToString(); }
  static string TitleOf(IntPtr h) { var sb = new StringBuilder(512); GetWindowText(h, sb, sb.Capacity); return sb.ToString(); }

  public static string WindowInfo(long hwnd) {
    var h = new IntPtr(hwnd);
    uint pid; GetWindowThreadProcessId(h, out pid);
    return "{\"hwnd\":" + hwnd + ",\"pid\":" + pid + ",\"class\":" + Json(ClassOf(h)) + ",\"title\":" + Json(TitleOf(h)) + ",\"visible\":" + (IsWindowVisible(h) ? "true" : "false") + "}";
  }

  public static string WindowsForPid(int pid) {
    var found = new List<string>();
    EnumWindows(delegate (IntPtr h, IntPtr l) {
      uint owner; GetWindowThreadProcessId(h, out owner);
      if (owner == (uint)pid && IsWindowVisible(h)) found.Add(WindowInfo(h.ToInt64()));
      return true;
    }, IntPtr.Zero);
    return "[" + string.Join(",", found.ToArray()) + "]";
  }

  /// Tries foreground methods in order and reports which one worked. Only the
  /// last method injects a key (Alt); it is used only if the others fail, and
  /// never inside an observation window (DR-0013).
  public static string Activate(long hwnd) {
    var h = new IntPtr(hwnd);
    var tried = new List<string>();
    if (IsIconic(h)) ShowWindow(h, 9);
    tried.Add("SetForegroundWindow");
    SetForegroundWindow(h);
    if (GetForegroundWindow() == h) return ActivateResult("SetForegroundWindow", tried);
    tried.Add("AttachThreadInput");
    uint fgPid; uint fgThread = GetWindowThreadProcessId(GetForegroundWindow(), out fgPid);
    uint me = GetCurrentThreadId();
    if (fgThread != 0 && fgThread != me) AttachThreadInput(me, fgThread, true);
    BringWindowToTop(h); SetForegroundWindow(h);
    if (fgThread != 0 && fgThread != me) AttachThreadInput(me, fgThread, false);
    if (GetForegroundWindow() == h) return ActivateResult("AttachThreadInput", tried);
    tried.Add("AltKey");
    keybd_event(VK_MENU, 0, 0, UIntPtr.Zero);
    SetForegroundWindow(h);
    keybd_event(VK_MENU, 0, KEYEVENTF_KEYUP, UIntPtr.Zero);
    if (GetForegroundWindow() == h) return ActivateResult("AltKey", tried);
    return ActivateResult(null, tried);
  }

  static string ActivateResult(string method, List<string> tried) {
    var fg = GetForegroundWindow().ToInt64();
    var quoted = new List<string>(); foreach (var t in tried) quoted.Add(Json(t));
    return "{\"method\":" + (method == null ? "null" : Json(method)) + ",\"tried\":[" + string.Join(",", quoted.ToArray()) + "],\"foreground\":" + WindowInfo(fg) + "}";
  }

  /// MSAA-only focus read (P4, DR-0046): descends accFocus from the window's
  /// client object to the focused object and returns its name and role.
  public static string MsaaFocus(long hwnd) {
    var iid = new Guid("618736e0-3c3d-11cf-810c-00aa00389b71");
    object obj;
    int hr = AccessibleObjectFromWindow(new IntPtr(hwnd), OBJID_CLIENT, ref iid, out obj);
    if (hr != 0 || obj == null) return "{\"error\":\"AccessibleObjectFromWindow failed: 0x" + hr.ToString("X8") + "\"}";
    var acc = (IAccessible)obj;
    object child = CHILDID_SELF;
    int depth = 0;
    for (; depth < 64; depth++) {
      object focus;
      try { focus = acc.accFocus; } catch (Exception e) { return "{\"error\":" + Json("accFocus threw: " + e.Message) + ",\"depth\":" + depth + "}"; }
      if (focus == null) break;
      if (focus is int) { child = focus; break; }
      var next = focus as IAccessible;
      if (next == null || ReferenceEquals(next, acc)) break;
      acc = next; child = CHILDID_SELF;
    }
    string name = null, roleText = null; int role = -1;
    try { name = acc.get_accName(child); } catch { }
    try {
      object r = acc.get_accRole(child);
      if (r is int) { role = (int)r; var sb = new StringBuilder(128); GetRoleText((uint)role, sb, 128); roleText = sb.ToString(); }
      else if (r is string) roleText = (string)r;
    } catch { }
    return "{\"name\":" + (name == null ? "null" : Json(name)) + ",\"role\":" + role + ",\"roleText\":" + (roleText == null ? "null" : Json(roleText)) + ",\"depth\":" + depth + "}";
  }

  public static string ProcessInfo(int pid) {
    uint session; bool hasSession = ProcessIdToSessionId((uint)pid, out session);
    string integrity = "unknown";
    IntPtr proc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, (uint)pid);
    if (proc != IntPtr.Zero) {
      IntPtr token;
      if (OpenProcessToken(proc, TOKEN_QUERY, out token)) {
        int len; GetTokenInformation(token, TokenIntegrityLevel, IntPtr.Zero, 0, out len);
        IntPtr buf = Marshal.AllocHGlobal(len);
        try {
          if (GetTokenInformation(token, TokenIntegrityLevel, buf, len, out len)) {
            IntPtr sid = Marshal.ReadIntPtr(buf);
            int count = Marshal.ReadByte(GetSidSubAuthorityCount(sid));
            int rid = Marshal.ReadInt32(GetSidSubAuthority(sid, (uint)(count - 1)));
            integrity = rid >= 0x4000 ? "system" : rid >= 0x3000 ? "high" : rid >= 0x2000 ? "medium" : rid >= 0x1000 ? "low" : "untrusted";
            integrity += " (0x" + rid.ToString("X4") + ")";
          }
        } finally { Marshal.FreeHGlobal(buf); CloseHandle(token); }
      }
      CloseHandle(proc);
    }
    string name = null;
    try { name = Process.GetProcessById(pid).ProcessName; } catch { }
    return "{\"pid\":" + pid + ",\"name\":" + (name == null ? "null" : Json(name)) + ",\"session\":" + (hasSession ? session.ToString() : "null") + ",\"integrity\":" + Json(integrity) + "}";
  }

  public static string Modules(int pid, string pattern) {
    var hits = new List<string>();
    try {
      foreach (ProcessModule m in Process.GetProcessById(pid).Modules) {
        if (m.ModuleName.IndexOf(pattern, StringComparison.OrdinalIgnoreCase) >= 0) hits.Add(Json(m.ModuleName));
      }
    } catch (Exception e) { return "{\"pid\":" + pid + ",\"error\":" + Json(e.Message) + "}"; }
    return "{\"pid\":" + pid + ",\"modules\":[" + string.Join(",", hits.ToArray()) + "]}";
  }

  public static string Display() {
    uint lockTimeout = 0; SystemParametersInfo(0x2000, 0, ref lockTimeout, 0);
    IntPtr desk = OpenInputDesktop(0, false, 0x0100);
    bool interactive = desk != IntPtr.Zero; if (interactive) CloseDesktop(desk);
    uint dpi = 0; try { dpi = GetDpiForSystem(); } catch { }
    return "{\"width\":" + GetSystemMetrics(0) + ",\"height\":" + GetSystemMetrics(1) + ",\"dpi\":" + dpi + ",\"foregroundLockTimeout\":" + lockTimeout + ",\"inputDesktop\":" + (interactive ? "true" : "false") + ",\"session\":" + Process.GetCurrentProcess().SessionId + "}";
  }

  public static string Screenshot(string path) {
    int w = GetSystemMetrics(0), h = GetSystemMetrics(1);
    using (var bmp = new Bitmap(w, h)) {
      using (var g = Graphics.FromImage(bmp)) g.CopyFromScreen(0, 0, 0, 0, new Size(w, h));
      bmp.Save(path, ImageFormat.Png);
    }
    return "{\"path\":" + Json(path) + ",\"width\":" + w + ",\"height\":" + h + "}";
  }

  public static string Json(string s) {
    var sb = new StringBuilder("\"");
    foreach (char c in s) {
      if (c == '"') sb.Append("\\\""); else if (c == '\\') sb.Append("\\\\");
      else if (c < 0x20) sb.Append("\\u").Append(((int)c).ToString("x4"));
      else sb.Append(c);
    }
    return sb.Append('"').ToString();
  }
}
'@

function Invoke-ProbeCommand($req) {
  switch ($req.cmd) {
    'qpc'           { return '{"ticks":' + [Probe]::QpcTicks() + ',"frequency":' + [Probe]::QpcFrequency() + ',"highResolution":' + ([Probe]::QpcHighResolution()).ToString().ToLower() + '}' }
    'foreground'    { return [Probe]::WindowInfo([Probe]::Foreground()) }
    'windowsForPid' { return [Probe]::WindowsForPid([int]$req.pid) }
    'activate'      { return [Probe]::Activate([long]$req.hwnd) }
    'msaaFocus'     { return [Probe]::MsaaFocus([long]$req.hwnd) }
    'processInfo'   { return [Probe]::ProcessInfo([int]$req.pid) }
    'modules'       { return [Probe]::Modules([int]$req.pid, [string]$req.pattern) }
    'pidsByName'    { $p = @(Get-Process -Name $req.name -ErrorAction SilentlyContinue | ForEach-Object { $_.Id }); return '[' + ($p -join ',') + ']' }
    'display'       { return [Probe]::Display() }
    'screenshot'    { return [Probe]::Screenshot([string]$req.path) }
    'ping'          { return '{"pid":' + $PID + '}' }
    default         { throw "unknown command: $($req.cmd)" }
  }
}

while ($null -ne ($line = [Console]::In.ReadLine())) {
  $id = $null
  try {
    $req = $line | ConvertFrom-Json
    $id = $req.id
    $result = Invoke-ProbeCommand $req
    [Console]::Out.WriteLine('{"id":' + $id + ',"ok":true,"result":' + $result + '}')
  } catch {
    $idText = if ($null -eq $id) { 'null' } else { $id }
    [Console]::Out.WriteLine('{"id":' + $idText + ',"ok":false,"error":' + [Probe]::Json($_.Exception.Message) + '}')
  }
  [Console]::Out.Flush()
}

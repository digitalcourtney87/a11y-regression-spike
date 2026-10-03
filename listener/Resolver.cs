// Resolves hooked events on a separate MTA thread (DR-0019): the hook thread
// only stamps QPC and enqueues. Identity comes from MSAA (role, name) and UIA
// property reads (AutomationId, LiveSetting, AriaRole); no IA2 QueryService.
using System;
using System.Collections.Concurrent;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;
using System.Threading;
using Accessibility;

namespace A11ySpike.Listener;

internal readonly record struct RawEvent(long QpcTicks, uint EventId, IntPtr Hwnd, int IdObject, int IdChild);

internal sealed class Resolver : IDisposable
{
    private readonly BlockingCollection<RawEvent> _queue = new();
    private readonly StreamWriter _out;
    private readonly int _pid;
    private readonly Thread _thread;
    private IUIAutomation? _uia;
    private string _uiaStatus = "not started";
    private bool _uiaValidated;

    public Resolver(string outPath, int pid)
    {
        _out = new StreamWriter(outPath, append: false, new UTF8Encoding(false)) { AutoFlush = false };
        _pid = pid;
        _thread = new Thread(Run) { IsBackground = true, Name = "resolver" };
        _thread.SetApartmentState(ApartmentState.MTA);
    }

    public string UiaStatus => _uiaStatus;

    public void Start() => _thread.Start();

    public void Enqueue(RawEvent raw) => _queue.Add(raw);

    private void Run()
    {
        try
        {
            _uia = (IUIAutomation)Activator.CreateInstance(Type.GetTypeFromCLSID(UiaIds.CUIAutomation, true)!)!;
            _uiaStatus = "created, not yet validated";
        }
        catch (Exception e)
        {
            _uiaStatus = $"unavailable: {e.GetType().Name}: {e.Message}";
        }
        foreach (var raw in _queue.GetConsumingEnumerable())
        {
            Write(raw);
        }
        _out.Flush();
    }

    private void Write(RawEvent raw)
    {
        string? role = null, name = null, automationId = null, liveSetting = null, ariaRole = null, error = null;
        try
        {
            if (Native.AccessibleObjectFromEvent(raw.Hwnd, raw.IdObject, raw.IdChild, out var acc, out var child) == 0 && acc is not null)
            {
                object childId = child ?? 0;
                try { name = acc.get_accName(childId); } catch (COMException) { }
                try { role = Native.RoleText(acc.get_accRole(childId)); } catch (COMException) { }
                ReadUia(acc, childId is int c ? c : 0, ref automationId, ref liveSetting, ref ariaRole);
            }
        }
        catch (Exception e)
        {
            error = $"{e.GetType().Name}: {e.Message}";
        }

        using var buffer = new MemoryStream();
        using (var json = new Utf8JsonWriter(buffer))
        {
            json.WriteStartObject();
            json.WriteNumber("t", Qpc.ToNs(raw.QpcTicks));
            json.WriteString("channel", Events.ChannelOf(raw.EventId));
            json.WriteString("event", Events.NameOf(raw.EventId));
            json.WriteNumber("eventId", raw.EventId);
            json.WriteString("hwndClass", Native.ClassOf(raw.Hwnd));
            json.WriteNumber("idObject", raw.IdObject);
            json.WriteNumber("idChild", raw.IdChild);
            if (role is not null) json.WriteString("role", role);
            if (name is not null) json.WriteString("name", name);
            if (automationId is not null) json.WriteString("automationId", automationId);
            if (liveSetting is not null) json.WriteString("liveSetting", liveSetting);
            if (ariaRole is not null) json.WriteString("ariaRole", ariaRole);
            if (error is not null) json.WriteString("error", error);
            json.WriteEndObject();
        }
        _out.WriteLine(Encoding.UTF8.GetString(buffer.ToArray()));
    }

    private void ReadUia(IAccessible acc, int childId, ref string? automationId, ref string? liveSetting, ref string? ariaRole)
    {
        if (_uia is null) return;
        try
        {
            var element = _uia.ElementFromIAccessible(acc, childId);
            if (!_uiaValidated)
            {
                // Self-check of the hand-declared vtables: the element must
                // belong to the browser process this listener watches.
                var pid = element.GetCurrentPropertyValue(UiaIds.ProcessId);
                if (pid is int p && p == _pid)
                {
                    _uiaValidated = true;
                    _uiaStatus = "validated";
                }
                else
                {
                    _uia = null;
                    _uiaStatus = $"disabled: ProcessId read returned {pid ?? "null"}, expected {_pid}";
                    return;
                }
            }
            automationId = element.GetCurrentPropertyValue(UiaIds.AutomationId) as string;
            ariaRole = element.GetCurrentPropertyValue(UiaIds.AriaRole) as string;
            liveSetting = element.GetCurrentPropertyValue(UiaIds.LiveSetting) switch
            {
                0 => "off",
                1 => "polite",
                2 => "assertive",
                _ => null,
            };
            if (automationId == "") automationId = null;
            if (ariaRole == "") ariaRole = null;
        }
        catch (Exception e) when (e is COMException or InvalidCastException or ArgumentException)
        {
            // An element that cannot be resolved through UIA keeps its MSAA identity.
        }
    }

    public void Complete() => _queue.CompleteAdding();

    /// True when the resolver drained its queue and exited within the timeout.
    public bool Join() => _thread.Join(TimeSpan.FromSeconds(10));

    /// Events still queued (non-zero only if Join timed out).
    public int Remaining => _queue.Count;

    public void Dispose()
    {
        _queue.Dispose();
        _out.Dispose();
    }
}

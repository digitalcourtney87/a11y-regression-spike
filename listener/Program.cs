// Arm B2 platform-event listener (DR-0019 D10; HANDOFF §8.2).
//
//   a11y-listener --pid <browser pid> --out <events.jsonl>
//
// Hooks MSAA and IA2 WinEvents out of process for one Chrome browser process,
// stamps each with QPC on callback entry (D1), resolves identity on another
// thread and writes JSON lines. Commands on stdin: "ping" answers with a QPC
// reading for the native self-test (D1); "stop" (or end of input) unhooks,
// drains and exits. The first stdout line reports readiness.
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Text;
using System.Text.Json;
using System.Threading;

namespace A11ySpike.Listener;

internal static class Program
{
    // Kept in a static field so the delegate outlives the hooks.
    private static Native.WinEventProc? _callback;

    private static int Main(string[] args)
    {
        int pid = 0;
        string? outPath = null;
        for (int i = 0; i + 1 < args.Length; i += 2)
        {
            if (args[i] == "--pid") pid = int.Parse(args[i + 1], CultureInfo.InvariantCulture);
            else if (args[i] == "--out") outPath = args[i + 1];
        }
        if (pid <= 0 || outPath is null)
        {
            Console.Error.WriteLine("usage: a11y-listener --pid <browser pid> --out <events.jsonl>");
            return 2;
        }

        using var resolver = new Resolver(outPath, pid);
        resolver.Start();
        _callback = (hook, eventType, hwnd, idObject, idChild, thread, time) =>
        {
            long ticks = Stopwatch.GetTimestamp();
            resolver.Enqueue(new RawEvent(ticks, eventType, hwnd, idObject, idChild));
        };

        uint hookThreadId = 0;
        var hooks = new List<IntPtr>();
        using var ready = new ManualResetEventSlim(false);
        var hookThread = new Thread(() =>
        {
            hookThreadId = Native.GetCurrentThreadId();
            foreach (var (min, max) in Events.Ranges)
            {
                hooks.Add(Native.SetWinEventHook(min, max, IntPtr.Zero, _callback, (uint)pid, 0, Native.WINEVENT_OUTOFCONTEXT | Native.WINEVENT_SKIPOWNPROCESS));
            }
            ready.Set();
            while (Native.GetMessage(out var msg, IntPtr.Zero, 0, 0) > 0)
            {
                Native.TranslateMessage(ref msg);
                Native.DispatchMessage(ref msg);
            }
            foreach (var hook in hooks) Native.UnhookWinEvent(hook);
        }) { IsBackground = true, Name = "hooks" };
        hookThread.SetApartmentState(ApartmentState.STA);
        hookThread.Start();
        ready.Wait();

        var (anchorQpc, anchorWall) = WallAnchor.Capture();
        int installed = hooks.FindAll(h => h != IntPtr.Zero).Count;
        WriteLine(json =>
        {
            json.WriteBoolean("ready", true);
            json.WriteNumber("pid", pid);
            json.WriteNumber("hooks", installed);
            json.WriteNumber("ranges", Events.Ranges.Length);
            json.WriteNumber("frequency", Stopwatch.Frequency);
            json.WriteNumber("anchorQpcNs", anchorQpc);
            json.WriteString("anchorWall", anchorWall);
            json.WriteString("version", "0.3.0");
            json.WriteString("runtime", Environment.Version.ToString());
        });

        string? line;
        while ((line = Console.In.ReadLine()) is not null)
        {
            if (line == "ping")
            {
                long ticks = Stopwatch.GetTimestamp();
                WriteLine(json =>
                {
                    json.WriteNumber("ticks", ticks);
                    json.WriteNumber("frequency", Stopwatch.Frequency);
                    json.WriteString("uia", resolver.UiaStatus);
                });
            }
            else if (line == "stop")
            {
                break;
            }
        }

        Native.PostThreadMessage(hookThreadId, Native.WM_QUIT, IntPtr.Zero, IntPtr.Zero);
        hookThread.Join(TimeSpan.FromSeconds(5));
        resolver.Complete();
        // drained is false if the resolver did not finish writing within its
        // timeout; Node then treats the attempt's B2 evidence as incomplete.
        bool drained = resolver.Join();
        WriteLine(json =>
        {
            json.WriteBoolean("stopped", true);
            json.WriteBoolean("drained", drained);
            json.WriteNumber("remaining", resolver.Remaining);
            json.WriteString("uia", resolver.UiaStatus);
        });
        return 0;
    }

    /// Writes one JSON object as a line on stdout, escaped by Utf8JsonWriter.
    private static void WriteLine(Action<Utf8JsonWriter> body)
    {
        using var buffer = new MemoryStream();
        using (var json = new Utf8JsonWriter(buffer))
        {
            json.WriteStartObject();
            body(json);
            json.WriteEndObject();
        }
        Console.Out.WriteLine(Encoding.UTF8.GetString(buffer.ToArray()));
        Console.Out.Flush();
    }
}

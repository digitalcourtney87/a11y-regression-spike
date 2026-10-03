// The listener's single wall-clock anchor (D1, DR-0010; allowlisted by the
// collector clock rule, DR-0027). It pairs one QPC reading with one UTC wall
// reading for human-readable times only, never for measurement, alignment or
// validity. DateTime.UtcNow uses GetSystemTimePreciseAsFileTime on Windows.
using System;
using System.Diagnostics;
using System.Globalization;

namespace A11ySpike.Listener;

internal static class WallAnchor
{
    public static (long QpcNs, string WallIso) Capture()
    {
        long bestWidth = long.MaxValue;
        long bestQpc = 0;
        DateTime bestWall = default;
        for (int i = 0; i < 8; i++)
        {
            long before = Stopwatch.GetTimestamp();
            DateTime wall = DateTime.UtcNow;
            long after = Stopwatch.GetTimestamp();
            if (after - before < bestWidth)
            {
                bestWidth = after - before;
                bestQpc = before + (after - before) / 2;
                bestWall = wall;
            }
        }
        return (Qpc.ToNs(bestQpc), bestWall.ToString("o", CultureInfo.InvariantCulture));
    }
}

internal static class Qpc
{
    /// QPC ticks to nanoseconds, exactly (no overflow for any realistic uptime).
    public static long ToNs(long ticks)
    {
        long frequency = Stopwatch.Frequency;
        return ticks / frequency * 1_000_000_000L + ticks % frequency * 1_000_000_000L / frequency;
    }

    public static long NowNs() => ToNs(Stopwatch.GetTimestamp());
}

/**
 * The single wall-clock anchor per process (DR-0010, D1 Clock alignment).
 *
 * This is the ONLY harness file allowed to read the wall clock (DR-0027; the
 * clock policy in harness/src/policy/clockPolicy.ts enforces it). The anchor
 * pairs one QPC reading with one wall-clock reading so that QPC timestamps can
 * be rendered as human-readable times. It is never used for measurement,
 * alignment or validity decisions. One further use is allowed (DR-0039):
 * NVDA log lines, which carry only wall-clock times, may be bucketed into
 * segments through this anchor for parity counts and diagnostics, never for
 * latency, ordering or validity.
 *
 * Precision. D1 asks for one precise wall-clock anchor per process. The Node
 * anchor below is not yet precise on Windows. Node's `Date.now()` is V8's
 * Windows clock: a coarse `GetSystemTimeAsFileTime` reading (about 15.6 ms
 * granularity) advanced by the high-resolution tick count and resynced about
 * once a minute (DR-0010; desk research 2026-10-02). Bracketing the read with
 * QPC pins down when it was taken, but not how stale the coarse base was. On
 * the gate runners `wallIso` can therefore trail true UTC by 0 to about
 * 15.6 ms, and that offset stays fixed until the next resync. On Linux and
 * macOS the error is below the 1 ms resolution of `wallIso`. Because the
 * anchor only labels times for people, this affects no measurement.
 *
 * Approved by the owner 2026-10-02 (DR-0030): the Node anchor stays coarse
 * until M2. From M2 the Node process adopts the (QPC, wall) pair measured by
 * the listener's `WallAnchor.cs`. There, `DateTime.UtcNow` uses
 * `GetSystemTimePreciseAsFileTime` and `Stopwatch.GetTimestamp()` reads the
 * QPC counter that also backs `process.hrtime.bigint()`. Until then, treat a
 * Windows `wallIso` as accurate to about 16 ms.
 */

import { qpcNowNs } from "./qpc.ts";

export interface WallAnchor {
  /** QPC nanoseconds since boot at the moment the wall clock was read. */
  qpcNs: number;
  /**
   * The wall-clock reading, as an ISO 8601 UTC string (millisecond resolution).
   * On Windows it is accurate to about 16 ms until M2 (see the module comment).
   */
  wallIso: string;
}

/** Bracketing attempts used to find the tightest QPC window around the wall-clock read. */
const BRACKET_ATTEMPTS = 8;

let anchor: WallAnchor | undefined;

function measureAnchor(): WallAnchor {
  let best: { qpcNs: number; wallMs: number; widthNs: number } | undefined;
  for (let i = 0; i < BRACKET_ATTEMPTS; i++) {
    const before = qpcNowNs();
    const wallMs = Date.now();
    const after = qpcNowNs();
    const widthNs = after - before;
    if (best === undefined || widthNs < best.widthNs) {
      best = { qpcNs: before + Math.floor(widthNs / 2), wallMs, widthNs };
    }
  }
  if (best === undefined) {
    throw new Error("wall-clock anchor could not be measured");
  }
  return Object.freeze({ qpcNs: best.qpcNs, wallIso: new Date(best.wallMs).toISOString() });
}

/**
 * Returns this process's wall-clock anchor. The first call measures it (the
 * wall-clock read bracketed by QPC reads, keeping the tightest of several
 * attempts); every later call returns the same frozen object, so a process has
 * exactly one anchor.
 */
export function captureWallAnchor(): WallAnchor {
  anchor ??= measureAnchor();
  return anchor;
}

/**
 * Renders a QPC timestamp as a human-readable ISO 8601 UTC string using the
 * process anchor. For display and logs only.
 */
export function qpcToWallIso(qpcNs: number, wallAnchor: WallAnchor = captureWallAnchor()): string {
  const anchorMs = Date.parse(wallAnchor.wallIso);
  const offsetMs = (qpcNs - wallAnchor.qpcNs) / 1e6;
  return new Date(anchorMs + offsetMs).toISOString();
}

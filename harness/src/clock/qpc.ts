/**
 * The harness timebase (DR-0010, D1 Clock alignment).
 *
 * QPC is the only timebase. In Node, `process.hrtime.bigint()` is backed by
 * libuv's `uv_hrtime`, which reads QueryPerformanceCounter on Windows. Every
 * time field in the evidence contracts is QPC nanoseconds since boot, carried
 * as a JS number that must be a non-negative safe integer.
 *
 * Collectors, adapters and the runner read time only through this module.
 * Reading the wall clock is forbidden outside `wallAnchor.ts` (DR-0027).
 */

const MAX_SAFE_NS = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * Converts a QPC nanosecond reading to a number, refusing values that cannot
 * be represented exactly. 2^53 - 1 ns is about 104 days of uptime, far beyond
 * the life of an ephemeral hosted runner.
 */
export function qpcBigintToNs(value: bigint): number {
  if (value < 0n || value > MAX_SAFE_NS) {
    throw new RangeError(
      `QPC reading ${value.toString()} ns is not a non-negative safe integer; it cannot be stored exactly as a JS number`,
    );
  }
  return Number(value);
}

/** Current QPC time in nanoseconds since boot, as a non-negative safe integer. */
export function qpcNowNs(): number {
  return qpcBigintToNs(process.hrtime.bigint());
}

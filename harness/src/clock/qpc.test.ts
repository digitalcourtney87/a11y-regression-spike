import { describe, expect, test } from "vitest";

import { qpcBigintToNs, qpcNowNs } from "./qpc.ts";

describe("qpcNowNs", () => {
  test("returns a non-negative safe integer", () => {
    const t = qpcNowNs();
    expect(Number.isSafeInteger(t)).toBe(true);
    expect(t).toBeGreaterThanOrEqual(0);
  });

  test("is monotonic non-decreasing", () => {
    const a = qpcNowNs();
    const b = qpcNowNs();
    expect(b).toBeGreaterThanOrEqual(a);
  });
});

describe("qpcBigintToNs", () => {
  test("accepts zero and the largest safe integer", () => {
    expect(qpcBigintToNs(0n)).toBe(0);
    expect(qpcBigintToNs(BigInt(Number.MAX_SAFE_INTEGER))).toBe(Number.MAX_SAFE_INTEGER);
  });

  test("throws beyond the safe-integer range", () => {
    expect(() => qpcBigintToNs(BigInt(Number.MAX_SAFE_INTEGER) + 1n)).toThrow(RangeError);
  });

  test("throws on negative readings", () => {
    expect(() => qpcBigintToNs(-1n)).toThrow(RangeError);
  });
});

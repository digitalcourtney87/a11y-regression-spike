import { describe, expect, test } from "vitest";

import { qpcNowNs } from "./qpc.ts";
import { captureWallAnchor, qpcToWallIso } from "./wallAnchor.ts";

describe("captureWallAnchor", () => {
  test("returns one frozen anchor per process", () => {
    const first = captureWallAnchor();
    const second = captureWallAnchor();
    expect(second).toBe(first);
    expect(Object.isFrozen(first)).toBe(true);
  });

  test("pairs a safe-integer QPC reading with an ISO 8601 UTC wall time", () => {
    const { qpcNs, wallIso } = captureWallAnchor();
    expect(Number.isSafeInteger(qpcNs)).toBe(true);
    expect(qpcNs).toBeGreaterThanOrEqual(0);
    expect(qpcNs).toBeLessThanOrEqual(qpcNowNs());
    expect(wallIso).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(Math.abs(Date.parse(wallIso) - Date.now())).toBeLessThan(60_000);
  });
});

describe("qpcToWallIso", () => {
  test("renders a QPC timestamp relative to the anchor", () => {
    const anchor = { qpcNs: 5_000_000_000, wallIso: "2026-10-02T09:00:00.000Z" };
    expect(qpcToWallIso(5_000_000_000, anchor)).toBe("2026-10-02T09:00:00.000Z");
    expect(qpcToWallIso(6_500_000_000, anchor)).toBe("2026-10-02T09:00:01.500Z");
    expect(qpcToWallIso(4_000_000_000, anchor)).toBe("2026-10-02T08:59:59.000Z");
  });
});

import { describe, expect, test } from "vitest";

import { nativeDisagreementMs, outsideBracketNs, PAGE_CLAMP_MS, pageMappingUncertaintyMs, pageToQpcNs, uncoveredGapMs } from "./clockChecks.ts";

describe("clock checks (DR-0010)", () => {
  test("outsideBracketNs is zero inside the bracket and the distance outside it", () => {
    expect(outsideBracketNs({ t0: 100, t1: 200, value: 150 })).toBe(0);
    expect(outsideBracketNs({ t0: 100, t1: 200, value: 90 })).toBe(10);
    expect(outsideBracketNs({ t0: 100, t1: 200, value: 260 })).toBe(60);
  });

  test("native disagreement is the largest outside-bracket distance (ms)", () => {
    expect(nativeDisagreementMs([{ t0: 0, t1: 400_000, value: 200_000 }, { t0: 0, t1: 100_000, value: 700_000 }])).toBe(0.6);
    expect(nativeDisagreementMs([{ t0: 0, t1: 400_000, value: 200_000 }])).toBe(0);
    expect(() => nativeDisagreementMs([])).toThrow(RangeError);
  });

  test("page-mapping uncertainty uses the minimum-RTT sample plus the clamp", () => {
    const samples = [
      { t0: 0, t1: 900_000, value: 2_000_000 },
      { t0: 1_000_000, t1: 1_300_000, value: 1_500_000 },
    ];
    expect(pageMappingUncertaintyMs(samples)).toBeCloseTo(0.2 + PAGE_CLAMP_MS, 9);
    expect(pageMappingUncertaintyMs([{ t0: 0, t1: 300_000, value: 150_000 }])).toBeCloseTo(PAGE_CLAMP_MS, 9);
  });

  test("pageToQpcNs inverts the minimum-RTT mapping offset", () => {
    // Mapping value = NavigationStart + performance.now(); offset = value − QPC bracket midpoint.
    expect(pageToQpcNs(250, { navigationStartS: 1000, mappingOffsetNs: 2_000 })).toBe(1000 * 1e9 + 250 * 1e6 - 2_000);
  });
});

describe("frame gaps in corpus runs (P27, DR-0076)", () => {
  test("only the part of a gap that the page's own long work does not cover counts", () => {
    // A 160 ms gap fully inside a long animation frame: nothing uncovered.
    expect(uncoveredGapMs([[1000, 1160]], [[995, 170]])).toBe(0);
    // A 160 ms gap with 100 ms of overlapping long tasks (merged): 60 ms uncovered.
    expect(uncoveredGapMs([[1000, 1160]], [[1000, 60], [1040, 60]])).toBe(60);
    // A gap with no page work at all (throttled frames): all of it counts.
    expect(uncoveredGapMs([[2000, 2210]], [[1000, 80]])).toBe(210);
    // The worst gap decides; no gaps means nothing uncovered.
    expect(uncoveredGapMs([[0, 120], [500, 640]], [[0, 120]])).toBe(140);
    expect(uncoveredGapMs([], [[0, 500]])).toBe(0);
  });
});


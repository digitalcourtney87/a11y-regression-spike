import { describe, expect, expectTypeOf, test } from "vitest";
import type { GatingCanaryId, Leg, Preflight } from "../schema/index.ts";
import { GATING_CANARIES } from "../schema/index.ts";
import type { CanaryTally } from "./validity.ts";
import {
  CLOCK_LIMITS,
  GATE_LIMITS,
  INCONCLUSIVE_REASONS,
  VALIDITY_LIMIT,
  gateResult,
  inconclusiveReasons,
} from "./validity.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function goodPreflight(): Preflight {
  return {
    foregroundHwndOk: true,
    preCanaryOk: true,
    manifestValid: true,
    clock: {
      nativeSelfTestDisagreementMs: 0.05,
      pageMappingUncertaintyMs: 0.8,
      segmentDriftMs: 0.1,
      timeTicksHighResolution: true,
      maxRafGapMs: 17,
    },
    injectionMarkerOk: true,
    audioOk: true,
    synthOk: true,
  };
}

/** The preflight without the three NVDA-present checks. */
function absentLegPreflight(): Preflight {
  const p = goodPreflight();
  return { foregroundHwndOk: p.foregroundHwndOk, preCanaryOk: p.preCanaryOk, manifestValid: p.manifestValid, clock: p.clock };
}

/** A value a few ulps above `x`, so that it is strictly greater. */
function justAbove(x: number): number {
  const y = x * (1 + 4 * Number.EPSILON);
  expect(y).toBeGreaterThan(x);
  return y;
}

function tallies(overrides: Partial<Record<GatingCanaryId, Partial<Omit<CanaryTally, "canary">>>> = {}): CanaryTally[] {
  return GATING_CANARIES.map((canary) => ({ canary, attempts: 50, valid: 50, failures: 0, ...overrides[canary] }));
}

function codes(result: ReturnType<typeof gateResult>): string[] {
  return result.reasons.map((reason) => (reason.canary === undefined ? reason.code : `${reason.code}:${reason.canary}`));
}

// ---------------------------------------------------------------------------
// inconclusiveReasons
// ---------------------------------------------------------------------------

describe("inconclusiveReasons (D1, D12)", () => {
  test("takes only preflight data and the leg, never outcome data", () => {
    expectTypeOf(inconclusiveReasons).parameters.toEqualTypeOf<[Preflight, Leg]>();
    expect(inconclusiveReasons).toHaveLength(2);
  });

  test("a good preflight is valid on both legs", () => {
    expect(inconclusiveReasons(goodPreflight(), "nvda-present")).toEqual([]);
    expect(inconclusiveReasons(goodPreflight(), "nvda-absent")).toEqual([]);
  });

  test("the limits are the D1 values", () => {
    expect(CLOCK_LIMITS).toEqual({
      nativeSelfTestDisagreementMs: 0.5,
      pageMappingUncertaintyMs: 2,
      segmentDriftMs: 1,
      maxRafGapMs: 100,
    });
  });

  test.each([
    ["foregroundHwndOk", "FOREGROUND_HWND"],
    ["preCanaryOk", "PRE_CANARY"],
    ["manifestValid", "MANIFEST_INVALID"],
  ] as const)("%s false gives %s", (key, code) => {
    const p = goodPreflight();
    p[key] = false;
    expect(inconclusiveReasons(p, "nvda-absent")).toEqual([code]);
  });

  const clockCases = [
    ["nativeSelfTestDisagreementMs", "CLOCK_NATIVE_SELF_TEST"],
    ["pageMappingUncertaintyMs", "CLOCK_PAGE_MAPPING"],
    ["segmentDriftMs", "CLOCK_SEGMENT_DRIFT"],
    ["maxRafGapMs", "CLOCK_RAF_GAP"],
  ] as const;

  test.each(clockCases)("%s equal to its limit passes", (key) => {
    const p = goodPreflight();
    p.clock[key] = CLOCK_LIMITS[key];
    expect(inconclusiveReasons(p, "nvda-present")).toEqual([]);
  });

  test.each(clockCases)("%s strictly above its limit gives %s", (key, code) => {
    const p = goodPreflight();
    p.clock[key] = justAbove(CLOCK_LIMITS[key]);
    expect(inconclusiveReasons(p, "nvda-present")).toEqual([code]);
  });

  test.each(clockCases)("%s fails closed on NaN, Infinity and negative values (%s)", (key, code) => {
    for (const value of [Number.NaN, Number.POSITIVE_INFINITY, -0.001]) {
      const p = goodPreflight();
      p.clock[key] = value;
      expect(inconclusiveReasons(p, "nvda-absent")).toEqual([code]);
    }
  });

  test("low-resolution TimeTicks gives CLOCK_LOW_RES_TIMETICKS", () => {
    const p = goodPreflight();
    p.clock.timeTicksHighResolution = false;
    expect(inconclusiveReasons(p, "nvda-absent")).toEqual(["CLOCK_LOW_RES_TIMETICKS"]);
  });

  const nvdaCases = [
    ["injectionMarkerOk", "NVDA_INJECTION_MARKER"],
    ["audioOk", "AUDIO"],
    ["synthOk", "SYNTH_FALLBACK"],
  ] as const;

  test.each(nvdaCases)("nvda-present: %s false gives %s", (key, code) => {
    const p = goodPreflight();
    p[key] = false;
    expect(inconclusiveReasons(p, "nvda-present")).toEqual([code]);
  });

  test.each(nvdaCases)("nvda-present: missing %s counts as failed (%s)", (key, code) => {
    const p = goodPreflight();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- removing one optional key per case
    delete p[key];
    expect(inconclusiveReasons(p, "nvda-present")).toEqual([code]);
  });

  test("nvda-absent ignores the NVDA-only checks, missing or false", () => {
    expect(inconclusiveReasons(absentLegPreflight(), "nvda-absent")).toEqual([]);
    const p = goodPreflight();
    p.injectionMarkerOk = false;
    p.audioOk = false;
    p.synthOk = false;
    expect(inconclusiveReasons(p, "nvda-absent")).toEqual([]);
  });

  test("every failing check is reported, in the stable order", () => {
    const p: Preflight = {
      foregroundHwndOk: false,
      preCanaryOk: false,
      manifestValid: false,
      clock: {
        nativeSelfTestDisagreementMs: 1,
        pageMappingUncertaintyMs: 3,
        segmentDriftMs: 2,
        timeTicksHighResolution: false,
        maxRafGapMs: 250,
      },
    };
    expect(inconclusiveReasons(p, "nvda-present")).toEqual([...INCONCLUSIVE_REASONS]);
    expect(inconclusiveReasons(p, "nvda-absent")).toEqual(INCONCLUSIVE_REASONS.slice(0, 8));
  });
});

// ---------------------------------------------------------------------------
// gateResult
// ---------------------------------------------------------------------------

describe("gateResult (D12)", () => {
  test("the thresholds are the D12 values", () => {
    expect(GATE_LIMITS).toEqual({ minValidRunsPerCanary: 50, maxPooledFailures: 5, maxFailuresPerCanary: 3 });
    expect(VALIDITY_LIMIT).toBe(0.05);
  });

  test("50 clean valid runs per canary passes, with pooled counts", () => {
    const result = gateResult(tallies());
    expect(result.pass).toBe(true);
    expect(result.reasons).toEqual([]);
    expect(result.pooled).toEqual({ attempts: 250, valid: 250, inconclusive: 0, failures: 0, inconclusiveRate: 0 });
  });

  test("input order does not matter", () => {
    expect(gateResult(tallies({ K2: { failures: 2 } })).pooled).toEqual(gateResult(tallies({ K2: { failures: 2 } }).reverse()).pooled);
  });

  describe("pooled failures: 5 passes, 6 fails", () => {
    test("5 pooled failures (2, 1, 1, 1, 0) passes", () => {
      const result = gateResult(tallies({ K1: { failures: 2 }, K2: { failures: 1 }, K3: { failures: 1 }, K4: { failures: 1 } }));
      expect(result.pooled.failures).toBe(5);
      expect(result.pass).toBe(true);
    });

    test("6 pooled failures (2, 2, 1, 1, 0) fails", () => {
      const result = gateResult(tallies({ K1: { failures: 2 }, K2: { failures: 2 }, K3: { failures: 1 }, K4: { failures: 1 } }));
      expect(result.pooled.failures).toBe(6);
      expect(result.pass).toBe(false);
      expect(codes(result)).toEqual(["POOLED_FAILURES"]);
    });
  });

  describe("single canary: 3 failures passes, 4 fails", () => {
    test("3 failures on one canary passes", () => {
      const result = gateResult(tallies({ K4: { failures: 3 } }));
      expect(result.pass).toBe(true);
    });

    test("4 failures on one canary fails, though pooled failures stay within 5", () => {
      const result = gateResult(tallies({ K4: { failures: 4 } }));
      expect(result.pooled.failures).toBe(4);
      expect(result.pass).toBe(false);
      expect(codes(result)).toEqual(["CANARY_FAILURES:K4"]);
    });
  });

  describe("valid runs: 50 passes, 49 fails", () => {
    test("50 valid runs out of 51 attempts passes", () => {
      const result = gateResult(tallies({ K3: { attempts: 51, valid: 50 } }));
      expect(result.pass).toBe(true);
    });

    test("49 valid runs fails", () => {
      const result = gateResult(tallies({ K3: { attempts: 50, valid: 49 } }));
      expect(result.pass).toBe(false);
      expect(codes(result)).toEqual(["INSUFFICIENT_VALID_RUNS:K3"]);
    });
  });

  describe("validity rate: exactly 5% passes, just over fails", () => {
    test("15 INCONCLUSIVE in 300 attempts (exactly 5%) passes", () => {
      const result = gateResult(tallies(Object.fromEntries(GATING_CANARIES.map((c) => [c, { attempts: 60, valid: 57 }]))));
      expect(result.pooled).toEqual({ attempts: 300, valid: 285, inconclusive: 15, failures: 0, inconclusiveRate: 0.05 });
      expect(result.pass).toBe(true);
    });

    test("16 INCONCLUSIVE in 300 attempts (5.33%) fails", () => {
      const overrides = Object.fromEntries(GATING_CANARIES.map((c) => [c, { attempts: 60, valid: 57 }]));
      overrides.K5 = { attempts: 60, valid: 56 };
      const result = gateResult(tallies(overrides));
      expect(result.pooled.inconclusive).toBe(16);
      expect(result.pass).toBe(false);
      expect(codes(result)).toEqual(["VALIDITY_RATE"]);
    });

    test("250 INCONCLUSIVE in 5000 attempts (exactly 5%) passes the rate check", () => {
      const result = gateResult(tallies(Object.fromEntries(GATING_CANARIES.map((c) => [c, { attempts: 1000, valid: 950 }]))));
      expect(result.pooled.inconclusiveRate).toBe(0.05);
      expect(result.reasons).toEqual([]);
    });
  });

  test("every failing rule is reported together", () => {
    const result = gateResult(
      tallies({ K1: { attempts: 60, valid: 40, failures: 4 }, K2: { failures: 2 }, K3: { attempts: 0, valid: 0 } }),
    );
    expect(result.pass).toBe(false);
    expect(codes(result)).toEqual([
      "INSUFFICIENT_VALID_RUNS:K1",
      "CANARY_FAILURES:K1",
      "INSUFFICIENT_VALID_RUNS:K3",
      "POOLED_FAILURES",
      "VALIDITY_RATE",
    ]);
  });

  test("a missing canary fails the gate", () => {
    const result = gateResult(tallies().filter((t) => t.canary !== "K5"));
    expect(result.pass).toBe(false);
    expect(codes(result)).toEqual(["CANARY_MISSING:K5"]);
  });

  test("no input fails every canary and reports no rate", () => {
    const result = gateResult([]);
    expect(result.pass).toBe(false);
    expect(codes(result)).toEqual(GATING_CANARIES.map((c) => `CANARY_MISSING:${c}`));
    expect(result.pooled.inconclusiveRate).toBeNull();
  });

  describe("malformed input throws", () => {
    test.each([
      ["a duplicate canary", [...tallies(), { canary: "K1", attempts: 50, valid: 50, failures: 0 }]],
      ["a record-only canary", [...tallies(), { canary: "K6a" as string as GatingCanaryId, attempts: 20, valid: 20, failures: 0 }]],
      ["valid > attempts", tallies({ K1: { attempts: 50, valid: 51 } })],
      ["failures > valid", tallies({ K1: { attempts: 50, valid: 2, failures: 3 } })],
      ["a negative count", tallies({ K2: { failures: -1 } })],
      ["a fractional count", tallies({ K2: { attempts: 50.5 } })],
      ["a NaN count", tallies({ K2: { valid: Number.NaN } })],
    ] as const)("%s", (_label, input) => {
      expect(() => gateResult(input)).toThrow(RangeError);
    });
  });
});

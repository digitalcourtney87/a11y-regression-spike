import { describe, expect, test } from "vitest";

import type { Clustered } from "./stats.ts";
import { binomialCdf, clopperPearson, clusterBootstrap, logGamma, mcnemarExact, mulberry32, sampleSizeMcNemar, sampleSizeProportion } from "./stats.ts";

describe("logGamma and binomialCdf", () => {
  test("logGamma matches factorials", () => {
    expect(Math.exp(logGamma(5))).toBeCloseTo(24, 8);
    expect(Math.exp(logGamma(11))).toBeCloseTo(3628800, 2);
    expect(Math.exp(logGamma(0.5))).toBeCloseTo(Math.sqrt(Math.PI), 10);
  });

  test("binomialCdf", () => {
    expect(binomialCdf(1, 10, 0.5)).toBeCloseTo(11 / 1024, 12);
    expect(binomialCdf(10, 10, 0.3)).toBe(1);
    expect(binomialCdf(-1, 10, 0.3)).toBe(0);
    expect(binomialCdf(0, 5, 0.2)).toBeCloseTo(0.8 ** 5, 12);
  });
});

describe("clopperPearson", () => {
  test("zero successes: upper bound 1 − (α/2)^(1/n)", () => {
    const r = clopperPearson(0, 10);
    expect(r.lower).toBe(0);
    expect(r.upper).toBeCloseTo(1 - 0.025 ** (1 / 10), 6);
  });

  test("5 of 10 matches the published interval", () => {
    const r = clopperPearson(5, 10);
    expect(r.lower).toBeCloseTo(0.187086, 5);
    expect(r.upper).toBeCloseTo(0.812914, 5);
  });

  test("all successes", () => {
    const r = clopperPearson(20, 20);
    expect(r.upper).toBe(1);
    expect(r.lower).toBeCloseTo(0.025 ** (1 / 20), 6);
  });

  test("rejects bad counts", () => {
    expect(() => clopperPearson(3, 2)).toThrow(RangeError);
  });
});

describe("mcnemarExact", () => {
  test.each([
    [0, 0, 1],
    [0, 3, 0.25],
    [3, 0, 0.25],
    [1, 9, 2 * (11 / 1024)],
    [5, 5, 1],
  ])("b=%i c=%i gives p=%f", (b, c, p) => {
    expect(mcnemarExact(b, c)).toBeCloseTo(p, 10);
  });
});

describe("mulberry32 and clusterBootstrap", () => {
  test("the generator is seeded and deterministic", () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const xs = [a(), a(), a()];
    expect([b(), b(), b()]).toEqual(xs);
    expect(xs.every((x) => x >= 0 && x < 1)).toBe(true);
    expect(mulberry32(43)()).not.toBe(xs[0]);
  });

  test("the bootstrap is reproducible and brackets the point estimate", () => {
    const items: Clustered[] = Array.from({ length: 20 }, (_, i) => ({ cluster: `p${String(i)}`, value: i < 15 ? 1 : 0 }));
    const r1 = clusterBootstrap(items, 2000, 7);
    const r2 = clusterBootstrap(items, 2000, 7);
    expect(r1).toEqual(r2);
    expect(r1.point).toBe(0.75);
    expect(r1.lower).toBeLessThan(0.75);
    expect(r1.upper).toBeGreaterThan(0.75);
  });

  test("clusters move together", () => {
    // Two clusters, one all successes and one all failures: each replicate is 0, 0.5 or 1.
    const items = [
      { cluster: "a", value: 1 as const },
      { cluster: "a", value: 1 as const },
      { cluster: "b", value: 0 as const },
      { cluster: "b", value: 0 as const },
    ];
    const r = clusterBootstrap(items, 1000, 1);
    expect([0, 0.5, 1]).toContain(r.lower);
    expect([0, 0.5, 1]).toContain(r.upper);
  });
});

describe("sample sizes", () => {
  test("HANDOFF §10.3's example: p = 0.15, d = 0.08 gives about 77", () => {
    expect(sampleSizeProportion(0.15, 0.08)).toBe(77);
  });

  test("worst case p = 0.5, d = 0.1 gives 97", () => {
    expect(sampleSizeProportion(0.5, 0.1)).toBe(97);
  });

  test("McNemar: no difference needs infinitely many; a clear difference needs few", () => {
    expect(sampleSizeMcNemar(0.1, 0.1)).toBe(Number.POSITIVE_INFINITY);
    const n = sampleSizeMcNemar(0.15, 0);
    expect(n).toBeGreaterThan(30);
    expect(n).toBeLessThan(80);
  });
});

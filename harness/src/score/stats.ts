/**
 * Statistics the scorer implements (HANDOFF §10.3), besides the Wilson
 * interval (`wilson.ts`):
 *
 * - Clopper–Pearson exact intervals, for reliability rates;
 * - the exact McNemar test on discordant pairs, for paired arm comparisons;
 * - a pattern-level bootstrap (items sharing a `patternId` are not
 *   independent), with a seeded generator so a run can be repeated exactly;
 * - sample sizes for the power table: n ≈ z²·p(1 − p)/d² for a proportion,
 *   and Connor's formula for a paired (McNemar) comparison.
 *
 * Nothing here reads the clock or an unseeded random source.
 */
import { Z_95 } from "./wilson.ts";

/** ln Γ(x) for x > 0 (Lanczos, g = 7). */
export function logGamma(x: number): number {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  const y = x - 1;
  let a = c[0] ?? 0;
  const t = y + 7.5;
  for (let i = 1; i < 9; i++) a += (c[i] ?? 0) / (y + i);
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}

function logChoose(n: number, k: number): number {
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

/** P(X ≤ k) for X ~ Binomial(n, p). */
export function binomialCdf(k: number, n: number, p: number): number {
  if (k < 0) return 0;
  if (k >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;
  let s = 0;
  for (let i = 0; i <= k; i++) s += Math.exp(logChoose(n, i) + i * Math.log(p) + (n - i) * Math.log(1 - p));
  return Math.min(1, s);
}

function bisect(f: (p: number) => number, target: number, increasing: boolean): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const v = f(mid);
    if (increasing ? v < target : v > target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** Clopper–Pearson exact two-sided interval (default 95%) for `x` successes in `n` trials. */
export function clopperPearson(x: number, n: number, alpha = 0.05): { point: number; lower: number; upper: number } {
  if (!Number.isSafeInteger(n) || n <= 0 || !Number.isSafeInteger(x) || x < 0 || x > n) throw new RangeError(`bad counts ${String(x)}/${String(n)}`);
  // lower: P(X ≥ x | p) = α/2; upper: P(X ≤ x | p) = α/2.
  const lower = x === 0 ? 0 : bisect((p) => 1 - binomialCdf(x - 1, n, p), alpha / 2, true);
  const upper = x === n ? 1 : bisect((p) => binomialCdf(x, n, p), alpha / 2, false);
  return { point: x / n, lower, upper };
}

/** Exact two-sided McNemar test on the discordant counts b and c: p = min(1, 2·P(X ≤ min(b, c))), X ~ Binomial(b + c, ½). */
export function mcnemarExact(b: number, c: number): number {
  const n = b + c;
  if (n === 0) return 1;
  return Math.min(1, 2 * binomialCdf(Math.min(b, c), n, 0.5));
}

/** Mulberry32: a small seeded generator, uniform on [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Clustered {
  /** The independence cluster (`patternId`). */
  cluster: string;
  /** 1 for a success, 0 for a failure. */
  value: 0 | 1;
}

/**
 * Pattern-level percentile bootstrap of a proportion (HANDOFF §10.3): resample
 * clusters with replacement and pool their items. Returns the 2.5th and 97.5th
 * percentiles of `resamples` replicates.
 */
export function clusterBootstrap(items: readonly Clustered[], resamples: number, seed: number): { point: number; lower: number; upper: number } {
  if (items.length === 0) return { point: Number.NaN, lower: Number.NaN, upper: Number.NaN };
  const clusters = new Map<string, { s: number; n: number }>();
  for (const it of items) {
    const c = clusters.get(it.cluster) ?? { s: 0, n: 0 };
    c.s += it.value;
    c.n += 1;
    clusters.set(it.cluster, c);
  }
  const list = [...clusters.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([, v]) => v);
  const rand = mulberry32(seed);
  const reps: number[] = [];
  for (let r = 0; r < resamples; r++) {
    let s = 0;
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      const c = list[Math.floor(rand() * list.length)];
      if (c === undefined) continue;
      s += c.s;
      n += c.n;
    }
    reps.push(n === 0 ? 0 : s / n);
  }
  reps.sort((a, b) => a - b);
  const q = (p: number): number => reps[Math.min(reps.length - 1, Math.max(0, Math.floor(p * reps.length)))] ?? Number.NaN;
  const total = items.reduce((t, it) => t + it.value, 0);
  return { point: total / items.length, lower: q(0.025), upper: q(0.975) };
}

/** Patterns needed to estimate a proportion p within ±d (95%): n = z²·p(1 − p)/d², rounded up. */
export function sampleSizeProportion(p: number, d: number, z: number = Z_95): number {
  if (d <= 0) throw new RangeError("d must be positive");
  return Math.ceil((z * z * p * (1 - p)) / (d * d));
}

/** One-sided normal quantile for power 0.8. */
export const Z_POWER_80 = 0.841621;

/**
 * Pairs needed for a two-sided exact-in-spirit McNemar comparison at α = 0.05
 * with power 0.8 (Connor 1987): n = [z_{α/2}·√p_d + z_β·√(p_d − δ²)]² / δ²,
 * where p_d = p10 + p01 is the discordant proportion and δ = p10 − p01.
 * Infinity when δ = 0.
 */
export function sampleSizeMcNemar(p10: number, p01: number, zAlpha: number = Z_95, zBeta: number = Z_POWER_80): number {
  const pd = p10 + p01;
  const delta = p10 - p01;
  if (delta === 0) return Number.POSITIVE_INFINITY;
  const inner = Math.max(0, pd - delta * delta);
  return Math.ceil((zAlpha * Math.sqrt(pd) + zBeta * Math.sqrt(inner)) ** 2 / (delta * delta));
}

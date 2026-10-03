/**
 * Arm metrics over scored items (HANDOFF §6, §10.3; M5):
 *
 * - detection: a regression item FAILs with the correct symptom; REVIEW is not
 *   detection, and INCONCLUSIVE is a miss (R7);
 * - false FAIL: a benign or an unchanged item FAILs with any symptom,
 *   reported separately for the two (R1);
 * - REVIEW and INCONCLUSIVE rates per arm;
 * - detection weighted uniformly by symptom (the primary analysis, HANDOFF
 *   §10.3, PRD §36): the mean of the per-symptom detection rates, with a
 *   pattern-level bootstrap interval; the item-level rate is reported beside
 *   it. The secondary, owner-weighted analysis needs the owner's weights file,
 *   frozen with the protocol; none has been supplied;
 * - Wilson intervals over items, and a pattern-level bootstrap (10,000
 *   resamples, recorded seed) for the headline intervals;
 * - attempt-level reliability per leg: INCONCLUSIVE attempts and K1 canary
 *   passes, with Clopper–Pearson intervals;
 * - paired comparisons (PRD §34) as discordant counts with an exact McNemar
 *   test;
 * - Arm D's NVDA time against Arm C's, and how many of C's detections D keeps.
 *
 * "Correct symptom" is applied in two readings, both reported: any of the
 * arm's FAIL symptoms (primary, P29) and the earliest finding's
 * symptom only.
 */
import type { ItemScore } from "../oracles/arms.ts";
import { correctSymptom } from "../oracles/arms.ts";
import type { OracleRules } from "../oracles/rules.ts";
import type { Arm, CorpusItem } from "../schema/index.ts";
import { clopperPearson, clusterBootstrap, mcnemarExact, mulberry32, sampleSizeMcNemar, sampleSizeProportion } from "./stats.ts";
import { wilsonInterval } from "./wilson.ts";

export const ARMS: readonly Arm[] = ["A", "B", "B2", "C_UNION", "C_ADJUDICATED", "D_UNION", "D_ADJUDICATED"];
export const BOOTSTRAP_RESAMPLES = 10_000;
/** The bootstrap seed, recorded with every report (HANDOFF §10.3). */
export const BOOTSTRAP_SEED = 20261005;

export type Reading = "any" | "earliest";

export interface Interval {
  point: number;
  lower: number;
  upper: number;
}

export interface Rate {
  k: number;
  n: number;
  wilson: Interval | null;
  bootstrap: Interval | null;
}

export interface ArmMetrics {
  arm: Arm;
  /** Detection weighted uniformly by expected symptom (primary). */
  detectionUniform: { point: number; lower: number; upper: number; perSymptom: Record<string, { k: number; n: number }> };
  detection: Rate;
  detectionEarliest: Rate;
  regressionReview: number;
  regressionInconclusive: number;
  /** Regression items that FAILed with no correct symptom. */
  regressionWrongSymptom: number;
  falseFailBenign: Rate;
  falseFailUnchanged: Rate;
  review: { benign: number; unchanged: number };
  inconclusive: { k: number; n: number };
}

export interface Paired {
  label: string;
  x: Arm;
  y: Arm;
  /** Regression items detected by x and not y (b), and by y and not x (c). */
  b: number;
  c: number;
  p: number;
  /** False FAILs on benign and unchanged items: by x and not y, and by y and not x. */
  falseB: number;
  falseC: number;
  falseP: number;
}

export interface DCost {
  items: number;
  /** Mean NVDA AT-segment time per attempt (ms), summed over items. */
  cMs: number;
  dMs: number;
  /** Steps triggered over all AT steps, across items. */
  triggeredSteps: number;
  steps: number;
  cDetected: number;
  dKeptUnion: number;
  cAdjDetected: number;
  dKeptAdjudicated: number;
}

export interface PowerRow {
  basis: string;
  p: number;
  /** The proportion the sample size is planned with: p, or for a dev estimate the Wilson bound nearest 0.5. */
  planning: number;
  needed: Record<string, number>;
}

export interface PairedPower {
  label: string;
  p10: number;
  p01: number;
  needed: number;
}

export interface LegReliability {
  leg: string;
  attempts: number;
  inconclusiveAttempts: number;
  inconclusive: Interval;
  canaries: number;
  canariesPassed: number;
  canaryPass: Interval | null;
}

export interface Metrics {
  arms: ArmMetrics[];
  reliability: LegReliability[];
  paired: Paired[];
  dCost: DCost;
  power: { margins: number[]; rows: PowerRow[]; paired: PairedPower[]; testRegressionPatterns: number | null };
}

function rate(values: readonly { cluster: string; value: 0 | 1 }[]): Rate {
  const k = values.reduce((t, v) => t + v.value, 0);
  const n = values.length;
  return { k, n, wilson: n === 0 ? null : wilsonInterval(k, n), bootstrap: n === 0 ? null : clusterBootstrap(values, BOOTSTRAP_RESAMPLES, BOOTSTRAP_SEED) };
}

/**
 * Detection weighted uniformly by symptom: the mean over expected symptoms of
 * each symptom's detection rate. The interval is a pattern-level percentile
 * bootstrap: patterns are resampled within the split and the weighted mean is
 * recomputed (symptoms absent from a replicate are left out of its mean).
 */
export function uniformBySymptom(rows: readonly { symptom: string; cluster: string; value: 0 | 1 }[], resamples: number, seed: number): ArmMetrics["detectionUniform"] {
  const mean = (rs: readonly { symptom: string; value: 0 | 1 }[]): number => {
    const by = new Map<string, { k: number; n: number }>();
    for (const r of rs) {
      const c = by.get(r.symptom) ?? { k: 0, n: 0 };
      c.k += r.value;
      c.n += 1;
      by.set(r.symptom, c);
    }
    const rates = [...by.values()].map((c) => c.k / c.n);
    return rates.length === 0 ? Number.NaN : rates.reduce((a, b) => a + b, 0) / rates.length;
  };
  const perSymptom: Record<string, { k: number; n: number }> = {};
  for (const r of rows) {
    const c = perSymptom[r.symptom] ?? { k: 0, n: 0 };
    c.k += r.value;
    c.n += 1;
    perSymptom[r.symptom] = c;
  }
  const clusters = [...new Set(rows.map((r) => r.cluster))].sort();
  const byCluster = new Map(clusters.map((c) => [c, rows.filter((r) => r.cluster === c)]));
  const rand = mulberry32(seed);
  const reps: number[] = [];
  for (let i = 0; i < resamples && clusters.length > 0; i++) {
    const sample = Array.from({ length: clusters.length }, () => byCluster.get(clusters[Math.floor(rand() * clusters.length)] ?? "") ?? []).flat();
    reps.push(mean(sample));
  }
  reps.sort((a, b) => a - b);
  const q = (p: number): number => reps[Math.min(reps.length - 1, Math.max(0, Math.floor(p * reps.length)))] ?? Number.NaN;
  return { point: mean(rows), lower: q(0.025), upper: q(0.975), perSymptom };
}

export function detected(score: ItemScore, item: CorpusItem, arm: Arm, rules: OracleRules, reading: Reading): boolean {
  if (item.expected.kind !== "regression") return false;
  const r = score.arms[arm];
  if (r.verdict !== "FAIL") return false;
  const expected = item.expected.symptom;
  return reading === "earliest" ? correctSymptom(r.symptom, expected, rules) : r.symptoms.some((s) => correctSymptom(s, expected, rules));
}

function legReliability(scores: readonly ItemScore[]): LegReliability[] {
  return (["nvda-absent", "nvda-present"] as const).map((leg) => {
    const rs = scores.flatMap((s) => (s.legs[leg] === null ? [] : [s.legs[leg]]));
    const attempts = rs.reduce((t, r) => t + r.attempts, 0);
    const inc = rs.reduce((t, r) => t + r.inconclusiveAttempts, 0);
    const canaries = rs.reduce((t, r) => t + r.canaries, 0);
    const passed = rs.reduce((t, r) => t + r.canariesPassed, 0);
    return {
      leg,
      attempts,
      inconclusiveAttempts: inc,
      inconclusive: attempts === 0 ? { point: Number.NaN, lower: Number.NaN, upper: Number.NaN } : clopperPearson(inc, attempts),
      canaries,
      canariesPassed: passed,
      canaryPass: canaries === 0 ? null : clopperPearson(passed, canaries),
    };
  });
}

export function computeMetrics(scores: readonly ItemScore[], items: ReadonlyMap<string, CorpusItem>, rules: OracleRules, testRegressionPatterns: number | null): Metrics {
  const pairs = scores.flatMap((s) => {
    const it = items.get(s.itemId);
    return it === undefined ? [] : [{ s, it }];
  });
  const reg = pairs.filter((p) => p.it.expected.kind === "regression");
  const benign = pairs.filter((p) => p.it.expected.kind === "benign");
  const unchanged = pairs.filter((p) => p.it.expected.kind === "unchanged");
  const arms = ARMS.map((arm): ArmMetrics => {
    const det = (reading: Reading) => rate(reg.map(({ s, it }) => ({ cluster: it.patternId, value: detected(s, it, arm, rules, reading) ? 1 : 0 })));
    const ff = (set: typeof pairs) => rate(set.map(({ s, it }) => ({ cluster: it.patternId, value: s.arms[arm].verdict === "FAIL" ? 1 : 0 })));
    const v = (set: typeof pairs, verdict: string) => set.filter(({ s }) => s.arms[arm].verdict === verdict).length;
    const uniform = uniformBySymptom(
      reg.map(({ s, it }) => ({ symptom: it.expected.kind === "regression" ? it.expected.symptom : "", cluster: it.patternId, value: detected(s, it, arm, rules, "any") ? 1 : 0 })),
      BOOTSTRAP_RESAMPLES,
      BOOTSTRAP_SEED,
    );
    return {
      arm,
      detectionUniform: uniform,
      detection: det("any"),
      detectionEarliest: det("earliest"),
      regressionReview: v(reg, "REVIEW"),
      regressionInconclusive: v(reg, "INCONCLUSIVE"),
      regressionWrongSymptom: reg.filter(({ s, it }) => s.arms[arm].verdict === "FAIL" && !detected(s, it, arm, rules, "any")).length,
      falseFailBenign: ff(benign),
      falseFailUnchanged: ff(unchanged),
      review: { benign: v(benign, "REVIEW"), unchanged: v(unchanged, "REVIEW") },
      inconclusive: { k: v(pairs, "INCONCLUSIVE"), n: pairs.length },
    };
  });
  const comparisons: [string, Arm, Arm][] = [
    ["B2 versus B", "B2", "B"],
    ["C versus B2 (UNION)", "C_UNION", "B2"],
    ["C versus B2 (ADJUDICATED)", "C_ADJUDICATED", "B2"],
    ["D versus C (UNION)", "D_UNION", "C_UNION"],
    ["D versus C (ADJUDICATED)", "D_ADJUDICATED", "C_ADJUDICATED"],
  ];
  const ctrl = [...benign, ...unchanged];
  const paired = comparisons.map(([label, x, y]): Paired => {
    const b = reg.filter(({ s, it }) => detected(s, it, x, rules, "any") && !detected(s, it, y, rules, "any")).length;
    const c = reg.filter(({ s, it }) => !detected(s, it, x, rules, "any") && detected(s, it, y, rules, "any")).length;
    const falseB = ctrl.filter(({ s }) => s.arms[x].verdict === "FAIL" && s.arms[y].verdict !== "FAIL").length;
    const falseC = ctrl.filter(({ s }) => s.arms[x].verdict !== "FAIL" && s.arms[y].verdict === "FAIL").length;
    return { label, x, y, b, c, p: mcnemarExact(b, c), falseB, falseC, falseP: mcnemarExact(falseB, falseC) };
  });
  const withNvda = pairs.filter(({ s }) => s.nvdaMs !== null);
  const dCost: DCost = {
    items: withNvda.length,
    cMs: withNvda.reduce((t, { s }) => t + (s.nvdaMs?.all ?? 0), 0),
    dMs: withNvda.reduce((t, { s }) => t + (s.nvdaMs?.triggered ?? 0), 0),
    triggeredSteps: pairs.reduce((t, { s }) => t + (s.triggers ?? []).filter((x) => x.triggered).length, 0),
    steps: pairs.reduce((t, { s }) => t + (s.triggers ?? []).length, 0),
    cDetected: reg.filter(({ s, it }) => detected(s, it, "C_UNION", rules, "any")).length,
    dKeptUnion: reg.filter(({ s, it }) => detected(s, it, "C_UNION", rules, "any") && detected(s, it, "D_UNION", rules, "any")).length,
    cAdjDetected: reg.filter(({ s, it }) => detected(s, it, "C_ADJUDICATED", rules, "any")).length,
    dKeptAdjudicated: reg.filter(({ s, it }) => detected(s, it, "C_ADJUDICATED", rules, "any") && detected(s, it, "D_ADJUDICATED", rules, "any")).length,
  };
  const reliability = legReliability(scores);
  const margins = [0.05, 0.08, 0.1, 0.15];
  const row = (basis: string, p: number, planning: number = p): PowerRow => ({ basis, p, planning, needed: Object.fromEntries(margins.map((d) => [d.toFixed(2), sampleSizeProportion(planning, d)])) });
  // A dev estimate at or near 0 or 1 would plan for almost no patterns; plan with the Wilson bound nearest 0.5 instead.
  const planningP = (r: Rate): number => {
    if (r.wilson === null) return 0.5;
    const { point, lower, upper } = r.wilson;
    return point >= 0.5 ? Math.max(0.5, lower) : Math.min(0.5, upper);
  };
  const rows = [row("worst case", 0.5), row("HANDOFF §10.3 example", 0.15), ...arms.map((m) => row(`${m.arm} detection (dev)`, m.detection.n === 0 ? 0 : m.detection.k / m.detection.n, planningP(m.detection)))];
  const pairedPower = paired.map((p): PairedPower => {
    const n = reg.length;
    return { label: p.label, p10: n === 0 ? 0 : p.b / n, p01: n === 0 ? 0 : p.c / n, needed: n === 0 ? Number.POSITIVE_INFINITY : sampleSizeMcNemar(p.b / n, p.c / n) };
  });
  return { arms, reliability, paired, dCost, power: { margins, rows, paired: pairedPower, testRegressionPatterns } };
}

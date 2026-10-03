/**
 * Dev/test split by `patternId` (HANDOFF R5, §9 M3): items sharing a
 * patternId are not independent, so the split, like the bootstrap, works on
 * patterns, never on items. The split is stratified and uses a recorded seed,
 * so it can be reproduced exactly from the corpus and the seed.
 *
 * Method: each pattern gets a stratum (its items' modal expected class, see
 * `patternStratum`). Strata are visited in sorted order; within a stratum the
 * patternIds are sorted, shuffled with mulberry32 (Fisher–Yates, one
 * generator for the whole split) and the first round(n × testFraction) go to
 * the test split. The test fraction is an owner decision (what is measured).
 */
import type { CorpusItem } from "../schema/index.ts";
import { mulberry32 } from "../runner/canaries.ts";

export type Split = "dev" | "test";

/** The expected class of one item: "regression:<symptom>", "benign:<type>" or "unchanged". */
export function expectedClass(item: Pick<CorpusItem, "expected">): string {
  const e = item.expected;
  if (e.kind === "regression") return `regression:${e.symptom}`;
  if (e.kind === "benign") return `benign:${e.benignType}`;
  return "unchanged";
}

/** A pattern's stratum: the most common expected class among its items, ties broken by sort order. */
export function patternStratum(items: readonly Pick<CorpusItem, "expected">[]): string {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(expectedClass(item), (counts.get(expectedClass(item)) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const top = ranked[0];
  if (top === undefined) throw new RangeError("a pattern needs at least one item");
  return top[0];
}

export interface SplitAssignment {
  seed: number;
  testFraction: number;
  method: string;
  /** patternId → split, sorted by patternId. */
  assignments: Record<string, Split>;
  /** stratum → counts per split. */
  strata: Record<string, { dev: number; test: number }>;
}

export const SPLIT_METHOD =
  "Stratified by pattern stratum (modal expected class of the pattern's items). Strata in sorted order; within each, patternIds sorted, shuffled by Fisher–Yates with one mulberry32 generator seeded by `seed`; the first round(n × testFraction) go to test.";

/** Assigns every pattern to dev or test (deterministic for a given corpus, seed and fraction). */
export function assignSplit(patterns: ReadonlyMap<string, string>, seed: number, testFraction: number): SplitAssignment {
  if (!Number.isInteger(seed)) throw new RangeError("seed must be an integer");
  if (!(testFraction > 0 && testFraction < 1)) throw new RangeError("testFraction must be strictly between 0 and 1");
  const byStratum = new Map<string, string[]>();
  for (const [patternId, stratum] of patterns) byStratum.set(stratum, [...(byStratum.get(stratum) ?? []), patternId]);
  const random = mulberry32(seed);
  const assignments: Record<string, Split> = {};
  const strata: Record<string, { dev: number; test: number }> = {};
  for (const stratum of [...byStratum.keys()].sort()) {
    const ids = [...(byStratum.get(stratum) ?? [])].sort();
    for (let i = ids.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      const a = ids[i];
      const b = ids[j];
      if (a === undefined || b === undefined) continue;
      ids[i] = b;
      ids[j] = a;
    }
    const nTest = Math.round(ids.length * testFraction);
    ids.forEach((id, k) => (assignments[id] = k < nTest ? "test" : "dev"));
    strata[stratum] = { dev: ids.length - nTest, test: nTest };
  }
  const sorted: Record<string, Split> = {};
  for (const id of Object.keys(assignments).sort()) sorted[id] = assignments[id] as Split;
  return { seed, testFraction, method: SPLIT_METHOD, assignments: sorted, strata };
}

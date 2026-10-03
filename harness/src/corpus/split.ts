/**
 * Dev/test split by `patternId` (HANDOFF R5, §9 M3; P15, DR-0057): items
 * sharing a patternId are not independent, so the split, like the bootstrap,
 * works on patterns, never on items. Patterns are planned in
 * `corpus/patterns.json` before any item exists, and split there, so the
 * split cannot depend on corpus data.
 *
 * Method: patterns are split in batches (one per source, e.g. the SPA
 * regression patterns, then mined pairs once verified). Within a batch each
 * pattern has a stratum (its expected class); strata are visited in sorted
 * order, the patternIds in each are sorted, shuffled with mulberry32
 * (Fisher–Yates, one generator per batch seeded with the recorded seed) and
 * the first round(n × testFraction) go to the test split. A batch never
 * changes an earlier assignment (DR-0059).
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

/** A pattern's stratum from its items: the most common expected class, ties broken by sort order. */
export function patternStratum(items: readonly Pick<CorpusItem, "expected">[]): string {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(expectedClass(item), (counts.get(expectedClass(item)) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const top = ranked[0];
  if (top === undefined) throw new RangeError("a pattern needs at least one item");
  return top[0];
}

export interface SplitBatch {
  name: string;
  seed: number;
  testFraction: number;
  /** stratum → counts per split in this batch. */
  strata: Record<string, { dev: number; test: number }>;
}

export interface SplitAssignment {
  method: string;
  batches: SplitBatch[];
  /** patternId → split, sorted by patternId. */
  assignments: Record<string, Split>;
}

export const SPLIT_METHOD =
  "Per batch: stratified by pattern stratum (expected class). Strata in sorted order; within each, patternIds sorted, shuffled by Fisher–Yates with one mulberry32 generator per batch seeded by the batch's seed; the first round(n × testFraction) go to test. A batch never changes an earlier assignment.";

/** Splits one batch of patterns (patternId → stratum); deterministic for a given batch, seed and fraction. */
export function splitBatch(patterns: ReadonlyMap<string, string>, seed: number, testFraction: number): { assignments: Record<string, Split>; strata: SplitBatch["strata"] } {
  if (!Number.isInteger(seed)) throw new RangeError("seed must be an integer");
  if (!(testFraction > 0 && testFraction < 1)) throw new RangeError("testFraction must be strictly between 0 and 1");
  const byStratum = new Map<string, string[]>();
  for (const [patternId, stratum] of patterns) byStratum.set(stratum, [...(byStratum.get(stratum) ?? []), patternId]);
  const random = mulberry32(seed);
  const assignments: Record<string, Split> = {};
  const strata: SplitBatch["strata"] = {};
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
  return { assignments, strata };
}

/** Adds a batch to the split; refuses a repeated batch name or a pattern that already has a split. */
export function addBatch(existing: SplitAssignment | null, name: string, patterns: ReadonlyMap<string, string>, seed: number, testFraction: number): SplitAssignment {
  const base: SplitAssignment = existing ?? { method: SPLIT_METHOD, batches: [], assignments: {} };
  if (base.batches.some((b) => b.name === name)) throw new Error(`batch "${name}" is already split`);
  for (const id of patterns.keys()) if (base.assignments[id] !== undefined) throw new Error(`pattern "${id}" already has a split`);
  const { assignments, strata } = splitBatch(patterns, seed, testFraction);
  const merged: Record<string, Split> = { ...base.assignments, ...assignments };
  const sorted: Record<string, Split> = {};
  for (const id of Object.keys(merged).sort()) sorted[id] = merged[id] as Split;
  return { method: SPLIT_METHOD, batches: [...base.batches, { name, seed, testFraction, strata }], assignments: sorted };
}

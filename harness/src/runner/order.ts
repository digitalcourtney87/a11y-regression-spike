/**
 * Paired, counterbalanced order (HANDOFF §7.4; DR-0066). Within one item
 * block in one leg, base and candidate run in ABBA order: AB, BA, AB, ...,
 * so n attempts per side give 2n attempts with each side equally often first
 * in a pair. The number of attempts per side is the item's `repetitions`, or
 * HANDOFF §6's exploratory default: 3, and 5 for absence-based symptoms
 * (ANNOUNCEMENT_MISSING). Every item of a pattern (its benign twin included),
 * and a journey's unchanged control, uses the same n as the absence-based
 * regression it sits beside, so their false-FAIL evidence is gathered under
 * the same rule (Decided by Claude under DR-0045, DR-0068).
 */
import type { CorpusItem, Symptom } from "../schema/index.ts";
import type { Side } from "./itemValidity.ts";

export const DEFAULT_REPETITIONS = 3;
export const ABSENCE_REPETITIONS = 5;
export const ABSENCE_BASED: ReadonlySet<Symptom> = new Set(["ANNOUNCEMENT_MISSING"]);

/** ABBA order for n attempts per side. */
export function abbaOrder(n: number): Side[] {
  if (!Number.isInteger(n) || n < 1) throw new Error(`repetitions must be a positive integer, not ${String(n)}`);
  const order: Side[] = [];
  for (let i = 0; i < n; i++) order.push(...(i % 2 === 0 ? (["base", "candidate"] as const) : (["candidate", "base"] as const)));
  return order;
}

/**
 * Attempts per side for an item: its own `repetitions`, else 5 when a
 * regression item of its pattern, or (for an unchanged control) of its
 * journey, is absence-based, else 3.
 */
export function repetitionsFor(item: CorpusItem, corpus: readonly CorpusItem[]): number {
  if (item.repetitions !== undefined) return item.repetitions;
  const neighbours = item.expected.kind === "unchanged" ? corpus.filter((c) => c.journeyId === item.journeyId) : corpus.filter((c) => c.patternId === item.patternId);
  const absence = [item, ...neighbours].some((c) => c.expected.kind === "regression" && ABSENCE_BASED.has(c.expected.symptom));
  return absence ? ABSENCE_REPETITIONS : DEFAULT_REPETITIONS;
}

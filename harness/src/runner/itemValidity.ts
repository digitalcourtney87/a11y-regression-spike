/**
 * Side-aware validity for corpus items, from M4 (R9; DR-0035). It replaces
 * the Phase 0 rule of validity.ts for items: canaries are fixed pages, but a
 * candidate build can itself steal the foreground, stall frames or crash
 * NVDA, so a check that fails only on the candidate may be caused by the
 * thing being judged and cannot make the item INCONCLUSIVE (DR-0032).
 *
 * | A check fails on | Result |
 * |---|---|
 * | Both base and candidate | INCONCLUSIVE |
 * | The candidate only | A finding: REVIEW, unless a FAIL rule covers it |
 * | The base only | INCONCLUSIVE for that item |
 * | Neither | Valid |
 *
 * The rule is applied per item and per leg, over that leg's attempts of the
 * item (each leg derives its own per-item result, DR-0031). A check fails on
 * a side when it fails in any attempt of that side: with k = n, one invalid
 * attempt already leaves fewer than k valid ones (Decided by Claude under
 * DR-0045, DR-0066). Two checks are not per side:
 *
 * - The environment manifest covers both sides at once, so its failure counts
 *   as failing on both (DR-0035).
 * - The pre-block canary is a fixed page bracketing the item block, so its
 *   rule is unchanged: a failed pre-block canary makes the block INCONCLUSIVE
 *   (HANDOFF §7.4). A post-block canary never converts outcomes (DR-0032) and
 *   is not an input here.
 *
 * A setup error before activation (`ENV_FAILURE`, P13) is treated as a check
 * of its side, so a candidate whose page cannot load is a finding, not an
 * INCONCLUSIVE item (DR-0066). Which FAIL rules cover which candidate-only
 * findings is set with the M5 oracles and goes to the owner (hard rule 12;
 * DR-0035).
 */
import type { InconclusiveReason } from "./validity.ts";

export type Side = "base" | "candidate";

/** A per-attempt reason: a pre-outcome check (validity.ts) or a setup error before activation (P13). */
export type AttemptReason = InconclusiveReason | "ENV_FAILURE";

export interface SidedAttempt {
  side: Side;
  /** The attempt's failed pre-outcome checks; empty when every check passed. */
  reasons: readonly AttemptReason[];
}

export interface InconclusiveCause {
  reason: AttemptReason;
  /** Where the check failed: both sides, the base only, or the block's pre-block canary. */
  on: "both" | "base" | "block";
}

export interface ItemValidity {
  result: "VALID" | "INCONCLUSIVE";
  inconclusive: InconclusiveCause[];
  /** Checks that failed on the candidate only: findings, REVIEW unless a FAIL rule covers them (M5). */
  candidateFindings: AttemptReason[];
}

/** Checks that cover both sides at once (DR-0035). */
const BOTH_SIDES: ReadonlySet<AttemptReason> = new Set(["MANIFEST_INVALID"]);
/** Checks of the item block rather than of a side (HANDOFF §7.4). */
const BLOCK: ReadonlySet<AttemptReason> = new Set(["PRE_CANARY"]);

/** The side-aware validity of one item in one leg, from its attempts' pre-outcome checks only. */
export function itemValidity(attempts: readonly SidedAttempt[]): ItemValidity {
  const inconclusive: InconclusiveCause[] = [];
  const candidateFindings: AttemptReason[] = [];
  const failsOn = (reason: AttemptReason, side: Side): boolean => attempts.some((a) => a.side === side && a.reasons.includes(reason));
  const reasons = [...new Set(attempts.flatMap((a) => a.reasons))];
  for (const reason of reasons) {
    if (BLOCK.has(reason)) inconclusive.push({ reason, on: "block" });
    else if (BOTH_SIDES.has(reason)) inconclusive.push({ reason, on: "both" });
    else {
      const base = failsOn(reason, "base");
      const candidate = failsOn(reason, "candidate");
      if (base && candidate) inconclusive.push({ reason, on: "both" });
      else if (base) inconclusive.push({ reason, on: "base" });
      else candidateFindings.push(reason);
    }
  }
  return { result: inconclusive.length === 0 ? "VALID" : "INCONCLUSIVE", inconclusive, candidateFindings };
}

/**
 * Execution guard for the test split (DR-0034; HANDOFF §4 hard rule 5 and
 * §10.3).
 *
 * Hard rule 5 covers execution, not just scoring: test-split items must not be
 * executed before the protocol freeze. `assertItemExecutable` applies the
 * same freeze guard as the scorer (`assertSplitAllowed`, DR-0028, over the
 * frozen set of DR-0033) to a single corpus item. From M4 the runner must
 * call it before executing any test-split item, and must not start the item
 * if it throws. Dev-split items always pass.
 */
import type { CorpusItem } from "../schema/index.ts";
import { assertSplitAllowed, FreezeGuardRefusal, repositoryFreezeDeps } from "../score/freezeGuard.ts";
import type { FreezeGuardDeps, SplitDecision } from "../score/freezeGuard.ts";

/** The fields of a corpus item the guard needs. */
export type ExecutableItem = Pick<CorpusItem, "id" | "split">;

/** Thrown when a test-split item may not be executed; names the item and the reason. */
export class ItemExecutionRefusal extends Error {
  readonly itemId: string;
  readonly reason: string;
  constructor(itemId: string, reason: string, options?: { cause?: unknown }) {
    super(`refusing to execute test-split item "${itemId}" before the protocol freeze (hard rule 5, DR-0034): ${reason}`, options);
    this.name = "ItemExecutionRefusal";
    this.itemId = itemId;
    this.reason = reason;
  }
}

/**
 * Throws ItemExecutionRefusal unless `item` may be executed now (hard rule 5,
 * DR-0034). A dev-split item always passes without consulting git. Any other
 * split is checked as the test split (fail closed): it passes only if the
 * latest freeze tag records the current protocol hash of the frozen set.
 *
 * From M4 the runner must call this before executing any test-split item.
 * `deps` defaults to this repository's git tags and frozen set; tests inject
 * their own. Returns the freeze decision, which for the test split carries
 * the freeze tag and hash for the run record.
 */
export function assertItemExecutable(item: ExecutableItem, deps?: FreezeGuardDeps): Extract<SplitDecision, { allowed: true }> {
  if (item.split === "dev") return { allowed: true, split: "dev" };
  try {
    return assertSplitAllowed("test", deps ?? repositoryFreezeDeps());
  } catch (error) {
    if (error instanceof FreezeGuardRefusal) throw new ItemExecutionRefusal(item.id, error.message, { cause: error });
    throw error;
  }
}

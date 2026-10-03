/**
 * The part of an M4/M5 item block (`blocks/<item>.json.gz`, written by
 * `npm run m4:items`) that the oracles read. One block holds one item in one
 * leg: its side-aware validity (DR-0035) and every attempt of both sides, in
 * ABBA order. Fields added for M5 (DR-0079) are optional, so M4 blocks can
 * still be read; an oracle that needs a missing field judges the expectation
 * as not judgeable rather than guessing.
 */
import type { AxNode } from "../runner/axTree.ts";
import type { ItemValidity } from "../runner/itemValidity.ts";
import type { CorpusItem, Journey, Strategy } from "../schema/index.ts";

export type Leg = "nvda-absent" | "nvda-present";
export type Side = "base" | "candidate";
export type StepOutcome = "REACHED" | "PATH_CHANGED" | "UNREACHABLE" | "ENV_FAILURE";

export interface NodeRef {
  name: string;
  role: string;
  backendId?: number;
}

export interface GoalAttempt {
  attempt: number;
  /** QPC ns when the attempt's action began (M5, DR-0079). */
  t?: number;
  node?: NodeRef | null;
  line?: NodeRef[];
  speech?: string[];
}

export interface BlockStep {
  stepId: string;
  kind: "at" | "setup";
  strategy?: Strategy;
  startedAt?: number;
  observeFrom?: number;
  endedAt?: number;
  outcome?: StepOutcome;
  reachedAt?: number | null;
  goalTrace?: GoalAttempt[];
  focusAtEnd?: NodeRef | null;
  cursorAtEnd?: NodeRef[];
  targets?: { id: string; backendId: number | null }[];
  axTree?: AxNode[];
  settled?: { at: number; axTree: AxNode[] };
  error?: string;
}

export interface SpeechEvent {
  kind: "speak" | "cancel" | "other";
  t: number;
  text?: string;
  priority?: string;
}

export interface ListenerEvent {
  t: number;
  channel: string;
  event: string;
  role?: string;
  name?: string;
  liveSetting?: string;
  ariaRole?: string;
  automationId?: string;
}

export interface TimelineRecord {
  kind: "insert" | "remove" | "text" | "attr" | "focusin" | "focusout" | "history" | "title";
  target: string;
  parent?: string;
  detail?: string;
  liveWithContent?: boolean;
  inLive?: boolean;
  liveRoot?: string;
  tQpc?: number;
  doc?: number;
}

export interface AxeStep {
  violations: { id: string; targets: string[] }[];
  error?: string;
}

export interface BlockAttempt {
  side: Side;
  orderIndex: number;
  repetition: number;
  reasons: string[];
  steps: BlockStep[];
  notRun?: string[];
  error?: string;
  anchor?: { selector: string; name: string };
  speechEvents?: SpeechEvent[];
  listenerEvents?: ListenerEvent[];
  timeline?: TimelineRecord[];
  axe?: Record<string, AxeStep>;
  b2Evidence?: "complete" | "missing" | "not-in-leg";
}

export interface Block {
  item: CorpusItem;
  journeyId: string;
  leg: Leg;
  n: number;
  /** The bracketing K1 canaries (null when skipped). */
  pre?: { ok?: boolean } | null;
  post?: { ok?: boolean } | null;
  validity: ItemValidity;
  attempts: BlockAttempt[];
}

/** One item in both legs, with its journey: what the arms are scored on. */
export interface ItemEvidence {
  item: CorpusItem;
  journey: Journey;
  absent: Block | null;
  present: Block | null;
}

export function sideAttempts(block: Block, side: Side): BlockAttempt[] {
  return block.attempts.filter((a) => a.side === side);
}

export function stepOf(attempt: BlockAttempt, stepId: string): BlockStep | undefined {
  return attempt.steps.find((s) => s.stepId === stepId && s.kind === "at");
}

/** Whether the step ran to the end of its observation window in this attempt (it was not left unrun after an earlier UNREACHABLE). */
export function stepRan(attempt: BlockAttempt, stepId: string): boolean {
  const s = stepOf(attempt, stepId);
  return s !== undefined && s.outcome !== undefined && s.outcome !== "ENV_FAILURE" && !(attempt.notRun ?? []).includes(stepId);
}

/** Events whose QPC time falls within [from, to]. */
export function within<T>(events: readonly T[] | undefined, time: (e: T) => number | undefined, from: number, to: number): T[] {
  return (events ?? []).filter((e) => {
    const t = time(e);
    return t !== undefined && t >= from && t <= to;
  });
}

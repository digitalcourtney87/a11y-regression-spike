/**
 * Canary definitions and run plans (HANDOFF §9.1; DR-0013 D4, DR-0036,
 * DR-0037; DR-0021 D12 for the gate counts).
 *
 * Each attempt loads `fixtures/canaries/canary.html` with a query selecting
 * the canary, activates "Start canary", and observes for a fixed window.
 * Behaviour runs 500 ms after activation (fill delays over 350 ms, D4).
 */
import type { CanaryId } from "../schema/types.ts";

/**
 * What a gating canary must produce in the NVDA-present leg (G1). Matching
 * compares letters and digits only (`speechKey` in outcome.ts), because NVDA's
 * speech dictionaries rewrite text before it is queued, for example splitting
 * "K1" into "K 1" (observed in run 37114407343; DR-0048).
 */
export interface SpeechExpectation {
  /** Text one queued utterance must contain, compared by `speechKey`. */
  contains: string;
  /** Latest acceptable receipt time after activation (ms). */
  deadlineMs: number;
}

export interface CanarySpec {
  /** Item id for evidence, e.g. "K1" or "K6a:polite". */
  itemId: string;
  canary: CanaryId;
  variant?: string;
  delay?: string;
  query: string;
  gating: boolean;
  observeMs: number;
  /** Gating canaries only. */
  expectation?: SpeechExpectation;
  /** The text the canary's own update carries, for record-only analysis. */
  phrase?: string;
}

/** The fill delay after activation used by every canary (D4). */
export const FILL_DELAY_MS = 500;
/** Observation window after activation (ms). */
export const OBSERVE_MS = 4000;

function spec(canary: CanaryId, fields: Omit<CanarySpec, "canary" | "itemId" | "query" | "observeMs"> & { variant?: string; delay?: string }): CanarySpec {
  const params = new URLSearchParams({ id: canary });
  if (fields.variant !== undefined) params.set("variant", fields.variant);
  if (fields.delay !== undefined) params.set("delay", fields.delay);
  const suffix = fields.variant ?? fields.delay;
  return { canary, itemId: suffix === undefined ? canary : `${canary}:${suffix}`, query: `?${params.toString()}`, observeMs: OBSERVE_MS, ...fields };
}

/** The five gating canaries (K1–K5), whose NVDA outcome is scored in G1. */
export const GATING_SPECS: readonly CanarySpec[] = [
  // K1: polite update within 3 s of the text insertion.
  spec("K1", { gating: true, phrase: "K1 polite update arrived", expectation: { contains: "K1 polite update arrived", deadlineMs: FILL_DELAY_MS + 3000 } }),
  spec("K2", { gating: true, phrase: "K2 alert update arrived", expectation: { contains: "K2 alert update arrived", deadlineMs: OBSERVE_MS } }),
  // K3: name and role conveyed: the name immediately followed by the role.
  spec("K3", { gating: true, phrase: "K3 target button", expectation: { contains: "K3 target button button", deadlineMs: OBSERVE_MS } }),
  // K4: the dialog's name conveyed.
  spec("K4", { gating: true, phrase: "K4 settings dialog", expectation: { contains: "K4 settings dialog", deadlineMs: OBSERVE_MS } }),
  // K5: the h1 text conveyed after the route change.
  spec("K5", { gating: true, phrase: "K5 route heading", expectation: { contains: "K5 route heading", deadlineMs: OBSERVE_MS } }),
];

/** The K6e fill delays (D4): 0 ms, one rAF, 50, 100, 150, 250 and 500 ms. */
export const K6E_DELAYS = ["0", "raf", "50", "100", "150", "250", "500"] as const;

/** Record-only canaries (D4), each with its run count per leg. */
export const RECORD_ONLY_SPECS: readonly { spec: CanarySpec; runs: number }[] = [
  ...(["polite", "status", "assertive"] as const).map((variant) => ({ spec: spec("K6a", { gating: false, variant, phrase: `K6a ${variant} inserted populated` }), runs: 20 })),
  { spec: spec("K6b", { gating: false, phrase: "K6b alert inserted populated" }), runs: 20 },
  ...K6E_DELAYS.map((delay) => ({ spec: spec("K6e", { gating: false, delay, phrase: `K6e filled after ${delay}` }), runs: 10 })),
  { spec: spec("K7a", { gating: false, phrase: "K7a polite update" }), runs: 20 },
  { spec: spec("K7b", { gating: false, phrase: "K7b polite update" }), runs: 20 },
];

/** Every spec by item id. */
export function specByItemId(itemId: string): CanarySpec | undefined {
  return [...GATING_SPECS, ...RECORD_ONLY_SPECS.map((r) => r.spec)].find((s) => s.itemId === itemId);
}

export interface PlannedAttempt {
  /** Position in the whole plan (0-based). */
  index: number;
  spec: CanarySpec;
  /** 1-based repetition of this item. */
  repetition: number;
}

/** Deterministic PRNG (mulberry32) for the recorded-seed order (HANDOFF §7.4). */
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

export interface PlanOptions {
  /** Runs per gating canary. */
  gatingRuns: number;
  /** Include the record-only canaries at their D4 run counts. */
  recordOnly: boolean;
  /** Restrict to these item ids or canary ids (empty = all). */
  only?: readonly string[];
  seed: number;
}

/** Builds the attempt plan, shuffled with a recorded seed. */
export function buildPlan(options: PlanOptions): PlannedAttempt[] {
  const entries: { spec: CanarySpec; runs: number }[] = [
    ...GATING_SPECS.map((s) => ({ spec: s, runs: options.gatingRuns })),
    ...(options.recordOnly ? RECORD_ONLY_SPECS : []),
  ];
  const only = options.only ?? [];
  const selected = only.length === 0 ? entries : entries.filter((e) => only.includes(e.spec.itemId) || only.includes(e.spec.canary));
  const attempts: Omit<PlannedAttempt, "index">[] = [];
  for (const entry of selected) for (let r = 1; r <= entry.runs; r++) attempts.push({ spec: entry.spec, repetition: r });
  const random = mulberry32(options.seed);
  for (let i = attempts.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const tmp = attempts[i];
    const other = attempts[j];
    if (tmp === undefined || other === undefined) continue;
    attempts[i] = other;
    attempts[j] = tmp;
  }
  return attempts.map((a, index) => ({ ...a, index }));
}

/** The attempts for shard `shard` of `shards` (1-based), dealt round-robin. */
export function shardOf(plan: readonly PlannedAttempt[], shard: number, shards: number): PlannedAttempt[] {
  if (!Number.isInteger(shard) || !Number.isInteger(shards) || shard < 1 || shard > shards) throw new RangeError(`bad shard ${String(shard)}/${String(shards)}`);
  return plan.filter((a) => a.index % shards === shard - 1);
}

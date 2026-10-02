/**
 * Validity and gate rules for Phase 0 (D1, DR-0010; D12, DR-0021).
 *
 * INCONCLUSIVE is decided only by checks completed before the outcome is
 * known (D12). `inconclusiveReasons` therefore takes preflight data and the
 * leg alone; it never sees speech, events, signatures or verdicts.
 *
 * `gateResult` applies the D12 rule shared by G1 (speech, K1-K5) and G2 (B2
 * signature matches in the NVDA-absent leg, K1-K5). Phase 0 results are
 * exploratory; Wilson intervals are reported alongside, not computed here.
 */
import type { GatingCanaryId, Leg, Preflight } from "../schema/index.ts";
import { GATING_CANARIES } from "../schema/index.ts";

// ---------------------------------------------------------------------------
// Per-attempt validity
// ---------------------------------------------------------------------------

/**
 * Clock limits in milliseconds (D1, DR-0010). A measurement strictly greater
 * than its limit makes the attempt INCONCLUSIVE; a measurement equal to its
 * limit passes.
 */
export const CLOCK_LIMITS = {
  nativeSelfTestDisagreementMs: 0.5,
  pageMappingUncertaintyMs: 2,
  segmentDriftMs: 1,
  maxRafGapMs: 100,
} as const;

/** Stable reason codes, in the order `inconclusiveReasons` reports them. */
export const INCONCLUSIVE_REASONS = [
  "FOREGROUND_HWND",
  "PRE_CANARY",
  "MANIFEST_INVALID",
  "CLOCK_NATIVE_SELF_TEST",
  "CLOCK_PAGE_MAPPING",
  "CLOCK_SEGMENT_DRIFT",
  "CLOCK_LOW_RES_TIMETICKS",
  "CLOCK_RAF_GAP",
  "NVDA_INJECTION_MARKER",
  "AUDIO",
  "SYNTH_FALLBACK",
] as const;

export type InconclusiveReason = (typeof INCONCLUSIVE_REASONS)[number];

/**
 * True when a clock measurement is within its limit. NaN, negative and
 * infinite measurements fail closed (Proposed by Claude, not yet
 * owner-approved): they are not evidence that the clock was good.
 */
function withinLimit(value: number, limit: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= limit;
}

/**
 * The reasons an attempt is INCONCLUSIVE, decided from preflight data only
 * (D12, DR-0021). An empty array means the attempt is valid.
 *
 * On the NVDA-present leg the injection marker, audio and synth checks are
 * also required, and a missing check counts as failed (D3, D8, D12). Limiting
 * the audio check to that leg is Proposed by Claude (not yet owner-approved),
 * because D3 names no leg.
 */
export function inconclusiveReasons(preflight: Preflight, leg: Leg): InconclusiveReason[] {
  const reasons: InconclusiveReason[] = [];
  const { clock } = preflight;

  if (!preflight.foregroundHwndOk) reasons.push("FOREGROUND_HWND");
  if (!preflight.preCanaryOk) reasons.push("PRE_CANARY");
  if (!preflight.manifestValid) reasons.push("MANIFEST_INVALID");

  if (!withinLimit(clock.nativeSelfTestDisagreementMs, CLOCK_LIMITS.nativeSelfTestDisagreementMs)) {
    reasons.push("CLOCK_NATIVE_SELF_TEST");
  }
  if (!withinLimit(clock.pageMappingUncertaintyMs, CLOCK_LIMITS.pageMappingUncertaintyMs)) {
    reasons.push("CLOCK_PAGE_MAPPING");
  }
  if (!withinLimit(clock.segmentDriftMs, CLOCK_LIMITS.segmentDriftMs)) {
    reasons.push("CLOCK_SEGMENT_DRIFT");
  }
  if (!clock.timeTicksHighResolution) reasons.push("CLOCK_LOW_RES_TIMETICKS");
  if (!withinLimit(clock.maxRafGapMs, CLOCK_LIMITS.maxRafGapMs)) {
    reasons.push("CLOCK_RAF_GAP");
  }

  if (leg === "nvda-present") {
    if (preflight.injectionMarkerOk !== true) reasons.push("NVDA_INJECTION_MARKER");
    if (preflight.audioOk !== true) reasons.push("AUDIO");
    if (preflight.synthOk !== true) reasons.push("SYNTH_FALLBACK");
  }

  return reasons;
}

// ---------------------------------------------------------------------------
// Gates G1 and G2
// ---------------------------------------------------------------------------

/** Validity ceiling: INCONCLUSIVE attempts must be at most 5% of attempts (D12, DR-0021). */
export const VALIDITY_LIMIT = 0.05;

/** The D12 gate thresholds for G1 and G2 (DR-0021). */
export const GATE_LIMITS = {
  /** Every gating canary needs at least this many valid runs (retries off). */
  minValidRunsPerCanary: 50,
  /** Pooled failures across K1-K5 may not exceed this (at most 5 in 250). */
  maxPooledFailures: 5,
  /** No single canary may have more failures than this. */
  maxFailuresPerCanary: 3,
} as const;

/** One gating canary's tally for a gate run. */
export interface CanaryTally {
  canary: GatingCanaryId;
  /** Every attempt, valid or INCONCLUSIVE. */
  attempts: number;
  /** Attempts with no INCONCLUSIVE reason. */
  valid: number;
  /** Valid runs whose expected outcome (G1) or B2 signature (G2) was not observed. */
  failures: number;
}

export type GateReasonCode =
  | "CANARY_MISSING"
  | "INSUFFICIENT_VALID_RUNS"
  | "CANARY_FAILURES"
  | "POOLED_FAILURES"
  | "VALIDITY_RATE";

export interface GateReason {
  code: GateReasonCode;
  /** Set for per-canary reasons. */
  canary?: GatingCanaryId;
  message: string;
}

export interface GateResult {
  pass: boolean;
  /** Empty when `pass` is true. */
  reasons: GateReason[];
  pooled: {
    attempts: number;
    valid: number;
    /** attempts - valid. */
    inconclusive: number;
    failures: number;
    /** inconclusive / attempts, or null when there were no attempts. */
    inconclusiveRate: number | null;
  };
}

function isGatingCanary(value: string): value is GatingCanaryId {
  return (GATING_CANARIES as readonly string[]).includes(value);
}

function assertCount(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative integer, got ${String(value)}`);
  }
}

function assertTally(tally: CanaryTally): void {
  const { canary, attempts, valid, failures } = tally;
  if (!isGatingCanary(canary)) {
    throw new RangeError(`${String(canary)} is not a gating canary; gates use ${GATING_CANARIES.join(", ")} only`);
  }
  assertCount(attempts, `${canary}.attempts`);
  assertCount(valid, `${canary}.valid`);
  assertCount(failures, `${canary}.failures`);
  if (valid > attempts) {
    throw new RangeError(`${canary}: valid (${String(valid)}) exceeds attempts (${String(attempts)})`);
  }
  if (failures > valid) {
    throw new RangeError(`${canary}: failures (${String(failures)}) exceed valid runs (${String(valid)})`);
  }
}

/**
 * The D12 gate rule for G1 and G2 (DR-0021). The gate passes if and only if:
 * - every gating canary K1-K5 has at least 50 valid runs;
 * - pooled failures across K1-K5 are at most 5;
 * - no single canary has more than 3 failures; and
 * - pooled (attempts - valid) / attempts is at most 5%.
 *
 * Throws a RangeError on malformed input (non-integer or negative counts,
 * valid > attempts, failures > valid, a duplicate or non-gating canary).
 */
export function gateResult(input: readonly CanaryTally[]): GateResult {
  const byCanary = new Map<GatingCanaryId, CanaryTally>();
  for (const tally of input) {
    assertTally(tally);
    if (byCanary.has(tally.canary)) throw new RangeError(`duplicate tally for ${tally.canary}`);
    byCanary.set(tally.canary, tally);
  }

  const reasons: GateReason[] = [];
  let attempts = 0;
  let valid = 0;
  let failures = 0;

  for (const canary of GATING_CANARIES) {
    const tally = byCanary.get(canary);
    if (tally === undefined) {
      reasons.push({ code: "CANARY_MISSING", canary, message: `${canary}: no tally supplied` });
      continue;
    }
    attempts += tally.attempts;
    valid += tally.valid;
    failures += tally.failures;
    if (tally.valid < GATE_LIMITS.minValidRunsPerCanary) {
      reasons.push({
        code: "INSUFFICIENT_VALID_RUNS",
        canary,
        message: `${canary}: ${String(tally.valid)} valid runs, below the minimum of ${String(GATE_LIMITS.minValidRunsPerCanary)}`,
      });
    }
    if (tally.failures > GATE_LIMITS.maxFailuresPerCanary) {
      reasons.push({
        code: "CANARY_FAILURES",
        canary,
        message: `${canary}: ${String(tally.failures)} failures, above the maximum of ${String(GATE_LIMITS.maxFailuresPerCanary)}`,
      });
    }
  }

  if (failures > GATE_LIMITS.maxPooledFailures) {
    reasons.push({
      code: "POOLED_FAILURES",
      message: `${String(failures)} pooled failures, above the maximum of ${String(GATE_LIMITS.maxPooledFailures)}`,
    });
  }

  const inconclusive = attempts - valid;
  const inconclusiveRate = attempts > 0 ? inconclusive / attempts : null;
  if (inconclusiveRate !== null && inconclusiveRate > VALIDITY_LIMIT) {
    reasons.push({
      code: "VALIDITY_RATE",
      message: `${String(inconclusive)} of ${String(attempts)} attempts INCONCLUSIVE, above the ceiling of ${String(VALIDITY_LIMIT)}`,
    });
  }

  return {
    pass: reasons.length === 0,
    reasons,
    pooled: { attempts, valid, inconclusive, failures, inconclusiveRate },
  };
}

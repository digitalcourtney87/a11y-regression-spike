/**
 * Data contracts for the Phase 0 harness: schema v1.1 (DR-0026, accepted with
 * amendments by the owner 2026-10-02).
 *
 * Every type, field, optionality and literal of HANDOFF v1.0 §10.2 is mirrored
 * here unchanged. Schema v1.1 adds optional fields only, so any valid v1.0
 * document stays valid; each addition cites the owner decision it implements
 * and DR-0026 (Schema v1.1 additions). The owner's amendments to DR-0026 are:
 * (a) gate evidence must carry `leg`, `preflight` and a `segmentId` on every
 * step (`GateEvidencePackage`, enforced by the runner); (b)
 * `Utterance.priority` is required in packages whose `leg` is
 * "nvda-present"; (c) `harness/src/runner/validity.ts` is Phase 0-scoped
 * (DR-0035). Amendments (a) and (b) bind only documents that use v1.1 fields
 * (a gate package, or a `leg`), so a v1.0 document stays valid.
 *
 * The zod mirror lives in `schemas.ts`. `types.test.ts` asserts that every
 * interface here equals `z.infer` of its schema, so the two cannot drift.
 *
 * Time semantics (D1, DR-0010; DR-0026). Every time field (`Utterance.t`,
 * `Utterance.cancelledAt`, `PlatformEvent.t`, `StepEvidence.startedAt`,
 * `StepEvidence.endedAt`, `StepEvidence.focusTrace[].t` and
 * `StepEvidence.speechCancels[].t`) is a QueryPerformanceCounter (QPC)
 * reading in nanoseconds since boot: `process.hrtime.bigint()` in Node and
 * `Stopwatch.GetTimestamp()` scaled to nanoseconds in C#. In-page
 * `performance.now()` values are mapped to QPC before they are written
 * (D1). The TypeScript type stays `number`; the schema requires a
 * non-negative safe integer, which covers about 104 days of uptime and is
 * ample for ephemeral hosted runners. Wall-clock time never appears in these
 * contracts; one wall-clock anchor per process exists for human-readable
 * times only.
 */

export type Verdict = "PASS" | "FAIL" | "REVIEW" | "INCONCLUSIVE";

export type Symptom =
  | "NAME_NOT_CONVEYED" | "ROLE_NOT_CONVEYED" | "STATE_NOT_CONVEYED"
  | "ANNOUNCEMENT_MISSING" | "ANNOUNCEMENT_DUPLICATED" | "ANNOUNCEMENT_ORDER_BROKEN"
  | "ANNOUNCEMENT_INTERRUPTED" | "FOCUS_NOT_MOVED" | "FOCUS_NOT_RESTORED"
  | "FOCUS_ESCAPES_DIALOG" | "KEYBOARD_TRAP" | "NAV_TARGET_UNREACHABLE"
  | "INTERACTION_FAILS_UNDER_AT" | "ROUTE_CHANGE_SILENT" | "JOURNEY_BLOCKED";

export type BenignType =
  | "WRAPPER_ELEMENT" | "CLASS_RENAME" | "CSS_ONLY" | "COPY_EDIT"
  | "A11Y_IMPROVEMENT" | "EQUIVALENT_REFACTOR" | "TIMING_WITHIN_TOLERANCE";

/**
 * Kept exactly as in HANDOFF v1.0 §10.2 (DR-0026), even though Phase 0
 * runs A, B and B2 without NVDA and C with NVDA in separate legs (D11).
 */
export type Arm =
  | "A" | "B" | "B2"
  | "C_UNION" | "C_ADJUDICATED"
  | "D_UNION" | "D_ADJUDICATED";

export type Strategy =
  | "TAB" | "SHIFT_TAB" | "NEXT_HEADING" | "NEXT_FORM_FIELD" | "NEXT_BUTTON"
  | "NEXT_LANDMARK" | "BROWSE_NEXT" | "ACTIVATE" | "TYPE" | "READ_CURRENT"
  | "PRESS" // HANDOFF v1.8: one documented key (P25; DR-0067)
  | "FOCUS_MODE_TOGGLE" // HANDOFF v1.9: NVDA+Space (P26; DR-0071)
  | "DOCUMENT_TOP"; // HANDOFF v1.9: Control+Home in browse mode (P26; DR-0071)

/** The documented keys a PRESS step may send (P25; DR-0067). */
export type PressKey = "Escape" | "Space" | "Enter" | "ArrowUp" | "ArrowDown" | "ArrowLeft" | "ArrowRight" | "Home" | "End";

export interface Expectation {
  type: "announcementContains" | "focusOn" | "stateIs" | "orderBefore";
  value: string;
  /** orderBefore only. */
  before?: string;
}

export interface AtStep {
  kind: "at";
  id: string;
  strategy: Strategy;
  /** Goal-based and bounded. */
  until?: { name?: string; role?: string; maxAttempts: number };
  /** TYPE only. */
  text?: string;
  /** PRESS only, and required for it (P25; DR-0067). */
  key?: PressKey;
  /** Observation window after the action, in milliseconds. */
  observeMs: number;
  expectations: Expectation[];
  /** Owner overrides; automatic triggers come from protocol/triggers.v1.json. */
  manualTriggers?: string[];
}

export interface SetupStep {
  kind: "setup";
  id: string;
  /** Named Playwright setup function; never used inside AT segments. */
  fn: string;
}

export interface Journey {
  id: string;
  version: string;
  app: string;
  entryUrl: string;
  /** Declared handover focus anchor (selector). */
  anchor: string;
  steps: Array<AtStep | SetupStep>;
}

export type Expected =
  | { kind: "regression"; symptom: Symptom; mechanism: string } // mechanism is metadata only (R2)
  | { kind: "benign"; benignType: BenignType }
  | { kind: "unchanged" };

export interface CorpusItem {
  id: string;
  /** Independence cluster: the unit for the split and the bootstrap. */
  patternId: string;
  split: "dev" | "test";
  source: "seeded" | "oss-history" | "reconstructed";
  app: string;
  journeyId: string;
  base: { ref: string };
  candidate: { ref?: string; patch?: string };
  expected: Expected;
  repetitions?: number;
  /** Anonymised for reconstructed items. */
  provenance: { origin: string; licence?: string; url?: string };
}

/** Speech priority as carried on each relay speak message (NVDA Spri). */
export type UtterancePriority = "NORMAL" | "NEXT" | "NOW";

/** The channel NVDA is configured to use for Chromium (D8). */
export type NvdaChannel = "IA2" | "UIA";

/**
 * Whether an evidence package comes from the leg with or without NVDA (D11,
 * DR-0020). C and D both take B2 evidence from the nvda-absent leg and NVDA
 * evidence from the nvda-present leg, combined at item level (DR-0031). Every
 * canary, K6 and K7 included, runs in both legs: speech outcomes come from
 * nvda-present, B2 signatures from nvda-absent, and the K6a rule is evaluated
 * on the nvda-present leg (DR-0036).
 */
export type Leg = "nvda-absent" | "nvda-present";

export interface EnvManifest {
  harnessCommit: string;
  imageOS: string;
  imageVersion: string;
  windowsBuild: string;
  chromeVersion: string;
  chromeFlags: string[];
  nvdaVersion?: string;
  nvdaConfigHash?: string;
  /**
   * The adapter enum is kept exactly as in HANDOFF v1.0 §10.2, although no
   * AT Driver runs happen in Phase 0 (D2, DR-0011; DR-0026).
   */
  adapter?: { name: "guidepup" | "atdriver"; version: string };
  listenerVersion: string;
  nodeVersion: string;
  locale: string;
  /**
   * Runner image name as reported by the runner, e.g. "windows-2025-vs2026"
   * (DR-0006; DR-0026).
   */
  imageName?: string;
  /** Playwright version that launched Chrome for Testing (DR-0007; DR-0026). */
  playwrightVersion?: string;
  /** Whether the Chromium sandbox was enabled; D10 requires true (DR-0019; DR-0026). */
  chromeSandbox?: boolean;
  /**
   * Chrome's accessibility mode as logged by the harness; D10 locks it with
   * --force-renderer-accessibility=screen-reader in every arm (DR-0019; DR-0026).
   */
  axMode?: string;
  /** The channel NVDA was configured to use for Chromium (D8, DR-0017; DR-0026). */
  nvdaChannel?: NvdaChannel;
  /**
   * The active synthesiser as recorded at run time. D8 requires eSpeak NG with
   * rate boost off, at NVDA's default eSpeak NG rate (DR-0041, amending
   * DR-0017); `rate` is the effective rate read from the running synth each
   * run. Any fallback is INCONCLUSIVE (DR-0017; DR-0026).
   */
  synth?: { name: string; voice?: string; rate?: number; rateBoost?: boolean };
  /**
   * Audio state checked in preflight: at least one endpoint and Audiosrv
   * running, otherwise INCONCLUSIVE (D3, DR-0012; DR-0026).
   */
  audio?: { endpointCount: number; audiosrvRunning: boolean; driver?: string };
  /** .NET runtime version used by the B2 listener (D10, DR-0019; DR-0026). */
  dotnetVersion?: string;
}

export interface Utterance {
  text: string;
  /**
   * QPC nanoseconds (D1, DR-0010). For the relay tap, the receipt time of the
   * speak message, which NVDA sends when the sequence is queued, before
   * synthesis (D2, D13).
   */
  t: number;
  /**
   * QPC nanoseconds (D1, DR-0010). The relay carries only global cancels,
   * which are recorded in `StepEvidence.speechCancels`; attributing a cancel
   * to an utterance is an oracle concern (D2, D13).
   */
  cancelledAt?: number;
  /**
   * Speech priority of the relay speak message. It separates polite (NORMAL)
   * from assertive (NEXT) live-region speech and NOW-priority alerts
   * (D2, DR-0011; DR-0026). Required on every utterance of a package whose
   * `leg` is "nvda-present" (DR-0026 amendment b); the schema refinement
   * enforces it.
   */
  priority?: UtterancePriority;
}

export interface PlatformEvent {
  /** QPC nanoseconds, stamped on receipt before any property reads (D1, DR-0010). */
  t: number;
  channel: "MSAA" | "IA2" | "UIA";
  event: string;
  role?: string;
  name?: string;
  text?: string;
  /** Raw WinEvent or UIA event id (D10, DR-0019; DR-0026). */
  eventId?: number;
  /** Window class of the event's HWND (D10, DR-0019; DR-0026). */
  hwndClass?: string;
  /** UIA AutomationId, read to resolve identity (D10, DR-0019; DR-0026). */
  automationId?: string;
  /** UIA LiveSetting, read to resolve identity (D10, DR-0019; DR-0026). */
  liveSetting?: string;
  /** UIA AriaRole, read to resolve identity (D10, DR-0019; DR-0026). */
  ariaRole?: string;
  /**
   * True for UIA events, which are diagnostic only; WinEvents are the
   * primary B2 channel (D10, DR-0019; DR-0026).
   */
  diagnostic?: boolean;
}

export interface StepEvidence {
  stepId: string;
  /** QPC nanoseconds (D1, DR-0010). */
  startedAt: number;
  /** QPC nanoseconds (D1, DR-0010). */
  endedAt: number;
  outcome: "REACHED" | "PATH_CHANGED" | "UNREACHABLE" | "ENV_FAILURE";
  axe?: unknown;
  ariaSnapshot?: string;
  axTree?: unknown;
  mutations?: unknown[];
  platformEvents?: PlatformEvent[];
  /**
   * What NVDA queued to speak, from the relay tap. H2 is measured on queued
   * speech plus global cancels, not on audio, so queued-then-cancelled text
   * counts as spoken (D13, DR-0022).
   */
  speech?: Utterance[];
  /** Each `t` is QPC nanoseconds (D1, DR-0010). */
  focusTrace?: Array<{ t: number; target: string }>;
  /**
   * Global speech cancels received from the relay, each `t` in QPC
   * nanoseconds (D2, DR-0011; D13, DR-0022; DR-0026).
   */
  speechCancels?: Array<{ t: number }>;
  /**
   * Orchestrator-issued segment ID used, with QPC, to join collector logs.
   * It replaces the document.title marker (D1, DR-0010; DR-0026). Required,
   * and non-empty, in gate evidence (`GateStepEvidence`, DR-0026 amendment a).
   */
  segmentId?: string;
}

/** A step in gate evidence: `segmentId` is required (DR-0026 amendment a). */
export interface GateStepEvidence extends StepEvidence {
  /** Non-empty orchestrator-issued segment ID (DR-0026 amendment a). */
  segmentId: string;
}

/** Clock checks completed before the outcome is known (D1, DR-0010; D12, DR-0021). */
export interface ClockChecks {
  /** Disagreement between native processes in the QPC self-test, in ms. INCONCLUSIVE above 0.5. */
  nativeSelfTestDisagreementMs: number;
  /** Uncertainty of the performance.now() to QPC mapping, in ms. INCONCLUSIVE above 2. */
  pageMappingUncertaintyMs: number;
  /** Clock drift within the segment, in ms. INCONCLUSIVE above 1. */
  segmentDriftMs: number;
  /** False when Chrome's TimeTicks are low resolution, which is INCONCLUSIVE. */
  timeTicksHighResolution: boolean;
  /** Largest requestAnimationFrame gap, in ms. INCONCLUSIVE above 100. */
  maxRafGapMs: number;
}

/**
 * Checks completed before the outcome is known. INCONCLUSIVE is decided from
 * these alone, never by inspecting the outcome (D12, DR-0021; DR-0026).
 */
export interface Preflight {
  /**
   * The real foreground window (GetForegroundWindow) is the browser and
   * platform focus is on the declared anchor; false on either gives
   * FOREGROUND_HWND (DR-0024, DR-0021).
   */
  foregroundHwndOk: boolean;
  /** The pre-block known-answer canary passed. */
  preCanaryOk: boolean;
  /** The environment manifest is valid (HANDOFF hard rule 11). */
  manifestValid: boolean;
  clock: ClockChecks;
  /**
   * nvdaHelperRemote*.dll is loaded in chrome.exe and "Buffer load took" is in
   * the NVDA log (D8, DR-0017). Required when `leg` is "nvda-present".
   */
  injectionMarkerOk?: boolean;
  /**
   * At least one audio endpoint and Audiosrv running (D3, DR-0012). Required
   * when `leg` is "nvda-present"; limiting the check to that leg was approved
   * by the owner 2026-10-02 (DR-0030).
   */
  audioOk?: boolean;
  /**
   * The declared synthesiser is active, with no fallback (D8, DR-0017).
   * Required when `leg` is "nvda-present".
   */
  synthOk?: boolean;
}

export interface EvidencePackage {
  itemId: string;
  side: "base" | "candidate";
  repetition: number;
  /** Position in the counterbalanced sequence. */
  orderIndex: number;
  env: EnvManifest;
  /**
   * Known-answer canaries run before and after the block. A failed pre-block
   * canary makes the attempt INCONCLUSIVE (`preflight.preCanaryOk`). The
   * post-block canary is recorded but never voids or converts observed
   * outcomes, because the block's own pages could have caused it to fail
   * (DR-0021, DR-0032).
   */
  canaries: { pre: boolean; post: boolean };
  /**
   * Redefined in DR-0026 (approved by the owner 2026-10-02, DR-0030), derived
   * from the D1 limits (DR-0010): max(nativeSelfTestDisagreementMs,
   * pageMappingUncertaintyMs) from the clock preflight. It is no longer a
   * document.title pulse skew. When `preflight` is present the schema checks
   * that the two agree.
   */
  maxClockSkewMs: number;
  steps: StepEvidence[];
  /**
   * The leg this package comes from (D11, DR-0020; DR-0026). Required in gate
   * evidence (DR-0026 amendment a). When it is "nvda-present", every
   * utterance must carry `priority` (DR-0026 amendment b).
   */
  leg?: Leg;
  /**
   * Preflight checks (D12, DR-0021; DR-0026). When `leg` is "nvda-present",
   * `injectionMarkerOk`, `audioOk` and `synthOk` must be present. Required in
   * gate evidence (DR-0026 amendment a).
   */
  preflight?: Preflight;
}

/**
 * Gate evidence; the M1 runner validates every gate package against this
 * (DR-0026 amendment a). An EvidencePackage in which `leg` and `preflight`
 * are required and every step has a non-empty `segmentId`. The EvidencePackage
 * refinements (NVDA-present preflight keys, utterance priority, clock skew)
 * apply as well.
 */
export interface GateEvidencePackage extends Omit<EvidencePackage, "leg" | "preflight" | "steps"> {
  steps: GateStepEvidence[];
  leg: Leg;
  preflight: Preflight;
}

export interface ArmVerdict {
  itemId: string;
  arm: Arm;
  verdict: Verdict;
  symptom?: Symptom;
  /** Oracle rules that fired. */
  ruleIds: string[];
}

/** Known-answer canary IDs (D4, DR-0013; DR-0026). */
export type CanaryId =
  | "K1" | "K2" | "K3" | "K4" | "K5"
  | "K6a" | "K6b" | "K6e" | "K7a" | "K7b";

/** Canaries that gate G1 and G2 (D4, DR-0013; D12, DR-0021). */
export const GATING_CANARIES = ["K1", "K2", "K3", "K4", "K5"] as const satisfies readonly CanaryId[];

/**
 * Canaries recorded at 20 runs each but never gating (D4, DR-0013). They run
 * in both legs; the K6a rule is evaluated on the nvda-present leg (DR-0036).
 */
export const RECORD_ONLY_CANARIES = ["K6a", "K6b", "K6e", "K7a", "K7b"] as const satisfies readonly CanaryId[];

export type GatingCanaryId = (typeof GATING_CANARIES)[number];
export type RecordOnlyCanaryId = (typeof RECORD_ONLY_CANARIES)[number];

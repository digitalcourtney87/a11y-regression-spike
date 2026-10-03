/**
 * zod mirror of `types.ts` (schema v1.1; HANDOFF v1.0 §10.2 plus DR-0026,
 * accepted with amendments by the owner 2026-10-02).
 *
 * Every object schema is strict, so unknown keys are rejected. `types.test.ts`
 * asserts that `z.infer` of each schema equals the hand-written interface.
 *
 * Numeric constraints beyond §10.2 (QPC safe integers are required by D1;
 * the rest were approved by the owner 2026-10-02 with schema v1.1, DR-0030):
 * counts are non-negative integers, durations in milliseconds are
 * non-negative and finite, and `until.maxAttempts` is at least 1.
 *
 * DR-0026 amendments: (a) `GateEvidencePackageSchema` requires `leg`,
 * `preflight` and a non-empty `segmentId` on every step, and the M1 runner
 * validates every gate package against it; (b) when `leg` is "nvda-present",
 * every utterance must carry `priority`.
 */
import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

/**
 * QPC nanoseconds since boot (D1, DR-0010; DR-0026): a non-negative safe
 * integer. Rejects fractions, negatives and values of 2**53 or more.
 */
export const QpcNsSchema = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);

/** A duration in milliseconds: finite and non-negative. */
const DurationMsSchema = z.number().min(0);

/** A count: a non-negative integer. */
const CountSchema = z.number().int().min(0);

// ---------------------------------------------------------------------------
// Vocabulary (HANDOFF v1.0 §6 and §10.2)
// ---------------------------------------------------------------------------

export const VerdictSchema = z.enum(["PASS", "FAIL", "REVIEW", "INCONCLUSIVE"]);

export const SymptomSchema = z.enum([
  "NAME_NOT_CONVEYED", "ROLE_NOT_CONVEYED", "STATE_NOT_CONVEYED",
  "ANNOUNCEMENT_MISSING", "ANNOUNCEMENT_DUPLICATED", "ANNOUNCEMENT_ORDER_BROKEN",
  "ANNOUNCEMENT_INTERRUPTED", "FOCUS_NOT_MOVED", "FOCUS_NOT_RESTORED",
  "FOCUS_ESCAPES_DIALOG", "KEYBOARD_TRAP", "NAV_TARGET_UNREACHABLE",
  "INTERACTION_FAILS_UNDER_AT", "ROUTE_CHANGE_SILENT", "JOURNEY_BLOCKED",
]);

export const BenignTypeSchema = z.enum([
  "WRAPPER_ELEMENT", "CLASS_RENAME", "CSS_ONLY", "COPY_EDIT",
  "A11Y_IMPROVEMENT", "EQUIVALENT_REFACTOR", "TIMING_WITHIN_TOLERANCE",
]);

export const ArmSchema = z.enum([
  "A", "B", "B2",
  "C_UNION", "C_ADJUDICATED",
  "D_UNION", "D_ADJUDICATED",
]);

export const StrategySchema = z.enum([
  "TAB", "SHIFT_TAB", "NEXT_HEADING", "NEXT_FORM_FIELD", "NEXT_BUTTON",
  "NEXT_LANDMARK", "BROWSE_NEXT", "ACTIVATE", "TYPE", "READ_CURRENT",
]);

/** D4, DR-0013; DR-0026. */
export const CanaryIdSchema = z.enum([
  "K1", "K2", "K3", "K4", "K5",
  "K6a", "K6b", "K6e", "K7a", "K7b",
]);

/** D2, DR-0011; DR-0026. */
export const UtterancePrioritySchema = z.enum(["NORMAL", "NEXT", "NOW"]);

/** D8, DR-0017; DR-0026. */
export const NvdaChannelSchema = z.enum(["IA2", "UIA"]);

/** D11, DR-0020; DR-0026. */
export const LegSchema = z.enum(["nvda-absent", "nvda-present"]);

// ---------------------------------------------------------------------------
// Journeys
// ---------------------------------------------------------------------------

export const ExpectationSchema = z.strictObject({
  type: z.enum(["announcementContains", "focusOn", "stateIs", "orderBefore"]),
  value: z.string(),
  before: z.string().optional(),
});

export const AtStepSchema = z.strictObject({
  kind: z.literal("at"),
  id: z.string(),
  strategy: StrategySchema,
  until: z
    .strictObject({
      name: z.string().optional(),
      role: z.string().optional(),
      maxAttempts: z.number().int().min(1),
    })
    .optional(),
  text: z.string().optional(),
  observeMs: DurationMsSchema,
  expectations: z.array(ExpectationSchema),
  manualTriggers: z.array(z.string()).optional(),
});

export const SetupStepSchema = z.strictObject({
  kind: z.literal("setup"),
  id: z.string(),
  fn: z.string(),
});

export const JourneyStepSchema = z.discriminatedUnion("kind", [AtStepSchema, SetupStepSchema]);

export const JourneySchema = z.strictObject({
  id: z.string(),
  version: z.string(),
  app: z.string(),
  entryUrl: z.string(),
  anchor: z.string(),
  steps: z.array(JourneyStepSchema),
});

// ---------------------------------------------------------------------------
// Corpus
// ---------------------------------------------------------------------------

export const ExpectedSchema = z.discriminatedUnion("kind", [
  z.strictObject({
    kind: z.literal("regression"),
    symptom: SymptomSchema,
    mechanism: z.string(),
  }),
  z.strictObject({
    kind: z.literal("benign"),
    benignType: BenignTypeSchema,
  }),
  z.strictObject({
    kind: z.literal("unchanged"),
  }),
]);

export const CorpusItemSchema = z.strictObject({
  id: z.string(),
  patternId: z.string(),
  split: z.enum(["dev", "test"]),
  source: z.enum(["seeded", "oss-history", "reconstructed"]),
  app: z.string(),
  journeyId: z.string(),
  base: z.strictObject({ ref: z.string() }),
  candidate: z.strictObject({
    ref: z.string().optional(),
    patch: z.string().optional(),
  }),
  expected: ExpectedSchema,
  repetitions: z.number().int().min(1).optional(),
  provenance: z.strictObject({
    origin: z.string(),
    licence: z.string().optional(),
    url: z.string().optional(),
  }),
});

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

export const EnvManifestSchema = z.strictObject({
  harnessCommit: z.string(),
  imageOS: z.string(),
  imageVersion: z.string(),
  windowsBuild: z.string(),
  chromeVersion: z.string(),
  chromeFlags: z.array(z.string()),
  nvdaVersion: z.string().optional(),
  nvdaConfigHash: z.string().optional(),
  adapter: z
    .strictObject({
      name: z.enum(["guidepup", "atdriver"]),
      version: z.string(),
    })
    .optional(),
  listenerVersion: z.string(),
  nodeVersion: z.string(),
  locale: z.string(),
  // Schema v1.1 additions (DR-0026).
  imageName: z.string().optional(),
  playwrightVersion: z.string().optional(),
  chromeSandbox: z.boolean().optional(),
  axMode: z.string().optional(),
  nvdaChannel: NvdaChannelSchema.optional(),
  synth: z
    .strictObject({
      name: z.string(),
      voice: z.string().optional(),
      /**
       * NVDA's effective rate setting, 0 to 100 (range approved by the owner
       * 2026-10-02, DR-0030), recorded from the running synth (DR-0041).
       */
      rate: z.number().min(0).max(100).optional(),
      rateBoost: z.boolean().optional(),
    })
    .optional(),
  audio: z
    .strictObject({
      endpointCount: CountSchema,
      audiosrvRunning: z.boolean(),
      driver: z.string().optional(),
    })
    .optional(),
  dotnetVersion: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Evidence
// ---------------------------------------------------------------------------

export const UtteranceSchema = z.strictObject({
  text: z.string(),
  t: QpcNsSchema,
  cancelledAt: QpcNsSchema.optional(),
  priority: UtterancePrioritySchema.optional(),
});

/** A Win32 DWORD: WinEvent and UIA event ids fit in this range. */
const EventIdSchema = z.number().int().min(0).max(0xffff_ffff);

export const PlatformEventSchema = z.strictObject({
  t: QpcNsSchema,
  channel: z.enum(["MSAA", "IA2", "UIA"]),
  event: z.string(),
  role: z.string().optional(),
  name: z.string().optional(),
  text: z.string().optional(),
  // Schema v1.1 additions (D10, DR-0019; DR-0026).
  eventId: EventIdSchema.optional(),
  hwndClass: z.string().optional(),
  automationId: z.string().optional(),
  liveSetting: z.string().optional(),
  ariaRole: z.string().optional(),
  diagnostic: z.boolean().optional(),
});

export const StepEvidenceSchema = z.strictObject({
  stepId: z.string(),
  startedAt: QpcNsSchema,
  endedAt: QpcNsSchema,
  outcome: z.enum(["REACHED", "PATH_CHANGED", "UNREACHABLE", "ENV_FAILURE"]),
  axe: z.unknown().optional(),
  ariaSnapshot: z.string().optional(),
  axTree: z.unknown().optional(),
  mutations: z.array(z.unknown()).optional(),
  platformEvents: z.array(PlatformEventSchema).optional(),
  speech: z.array(UtteranceSchema).optional(),
  focusTrace: z.array(z.strictObject({ t: QpcNsSchema, target: z.string() })).optional(),
  // Schema v1.1 additions (DR-0026).
  speechCancels: z.array(z.strictObject({ t: QpcNsSchema })).optional(),
  segmentId: z.string().optional(),
});

/** D1, DR-0010; D12, DR-0021; DR-0026. */
export const ClockChecksSchema = z.strictObject({
  nativeSelfTestDisagreementMs: DurationMsSchema,
  pageMappingUncertaintyMs: DurationMsSchema,
  segmentDriftMs: DurationMsSchema,
  timeTicksHighResolution: z.boolean(),
  maxRafGapMs: DurationMsSchema,
});

/** D12, DR-0021; DR-0026. */
export const PreflightSchema = z.strictObject({
  foregroundHwndOk: z.boolean(),
  preCanaryOk: z.boolean(),
  manifestValid: z.boolean(),
  clock: ClockChecksSchema,
  injectionMarkerOk: z.boolean().optional(),
  audioOk: z.boolean().optional(),
  synthOk: z.boolean().optional(),
});

/** Preflight fields that must be present when `leg` is "nvda-present" (D12, DR-0021). */
export const NVDA_PRESENT_PREFLIGHT_KEYS = ["injectionMarkerOk", "audioOk", "synthOk"] as const;

/** The EvidencePackage fields shared by `EvidencePackageSchema` and `GateEvidencePackageSchema`. */
const evidencePackageShape = {
  itemId: z.string(),
  side: z.enum(["base", "candidate"]),
  repetition: CountSchema,
  orderIndex: CountSchema,
  env: EnvManifestSchema,
  canaries: z.strictObject({ pre: z.boolean(), post: z.boolean() }),
  maxClockSkewMs: DurationMsSchema,
  steps: z.array(StepEvidenceSchema),
  // Schema v1.1 additions (DR-0026).
  leg: LegSchema.optional(),
  preflight: PreflightSchema.optional(),
};

/** The fields the EvidencePackage refinements read; every gate package has them too. */
interface RefinedPackage {
  leg?: z.infer<typeof LegSchema>;
  preflight?: z.infer<typeof PreflightSchema>;
  maxClockSkewMs: number;
  steps: ReadonlyArray<{ speech?: ReadonlyArray<{ priority?: z.infer<typeof UtterancePrioritySchema> }> }>;
}

/** Cross-field rules of every evidence package, gate packages included. */
function refineEvidencePackage(pkg: RefinedPackage, ctx: z.RefinementCtx): void {
  if (pkg.leg === "nvda-present") {
    // D12 (DR-0021): the NVDA-present leg must record its NVDA-specific checks.
    for (const key of NVDA_PRESENT_PREFLIGHT_KEYS) {
      if (pkg.preflight?.[key] === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["preflight", key],
          message: `preflight.${key} is required when leg is "nvda-present" (D12)`,
        });
      }
    }
    // DR-0026 amendment b: every utterance on the NVDA-present leg carries its priority.
    pkg.steps.forEach((step, stepIndex) => {
      step.speech?.forEach((utterance, utteranceIndex) => {
        if (utterance.priority === undefined) {
          ctx.addIssue({
            code: "custom",
            path: ["steps", stepIndex, "speech", utteranceIndex, "priority"],
            message: 'priority is required on every utterance when leg is "nvda-present" (DR-0026 amendment b)',
          });
        }
      });
    });
  }
  // D1 (DR-0010): maxClockSkewMs is max(native self-test, page mapping).
  // Consistency check approved by the owner 2026-10-02 (DR-0030).
  if (pkg.preflight !== undefined) {
    const { nativeSelfTestDisagreementMs, pageMappingUncertaintyMs } = pkg.preflight.clock;
    const expected = Math.max(nativeSelfTestDisagreementMs, pageMappingUncertaintyMs);
    if (pkg.maxClockSkewMs !== expected) {
      ctx.addIssue({
        code: "custom",
        path: ["maxClockSkewMs"],
        message:
          "maxClockSkewMs must equal max(preflight.clock.nativeSelfTestDisagreementMs, " +
          "preflight.clock.pageMappingUncertaintyMs) (D1)",
      });
    }
  }
}

export const EvidencePackageSchema = z.strictObject(evidencePackageShape).superRefine(refineEvidencePackage);

/** A step in gate evidence: a non-empty `segmentId` is required (DR-0026 amendment a). */
export const GateStepEvidenceSchema = StepEvidenceSchema.extend({ segmentId: z.string().min(1) });

/**
 * Gate evidence; the M1 runner validates every gate package against this
 * (DR-0026 amendment a). `leg` and `preflight` are required and every step
 * has a non-empty `segmentId`; the EvidencePackage refinements also apply.
 */
export const GateEvidencePackageSchema = z
  .strictObject({
    ...evidencePackageShape,
    steps: z.array(GateStepEvidenceSchema),
    leg: LegSchema,
    preflight: PreflightSchema,
  })
  .superRefine(refineEvidencePackage);

export const ArmVerdictSchema = z.strictObject({
  itemId: z.string(),
  arm: ArmSchema,
  verdict: VerdictSchema,
  symptom: SymptomSchema.optional(),
  ruleIds: z.array(z.string()),
});

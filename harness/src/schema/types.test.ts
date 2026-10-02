/**
 * Type-level drift guard: every hand-written interface in types.ts must equal
 * z.infer (and z.input) of its zod schema. These assertions are checked by
 * `npm run typecheck`; the runtime test bodies are trivially true.
 */
import { describe, expectTypeOf, test } from "vitest";
import type { z } from "zod";
import type {
  ArmVerdict,
  Arm,
  AtStep,
  BenignType,
  CanaryId,
  ClockChecks,
  CorpusItem,
  EnvManifest,
  EvidencePackage,
  Expectation,
  Expected,
  Journey,
  Leg,
  NvdaChannel,
  PlatformEvent,
  Preflight,
  SetupStep,
  StepEvidence,
  Strategy,
  Symptom,
  Utterance,
  UtterancePriority,
  Verdict,
} from "./types.ts";
import { GATING_CANARIES, RECORD_ONLY_CANARIES } from "./types.ts";
import type {
  ArmSchema,
  ArmVerdictSchema,
  AtStepSchema,
  BenignTypeSchema,
  CanaryIdSchema,
  ClockChecksSchema,
  CorpusItemSchema,
  EnvManifestSchema,
  EvidencePackageSchema,
  ExpectationSchema,
  ExpectedSchema,
  JourneySchema,
  JourneyStepSchema,
  LegSchema,
  NvdaChannelSchema,
  PlatformEventSchema,
  PreflightSchema,
  QpcNsSchema,
  SetupStepSchema,
  StepEvidenceSchema,
  StrategySchema,
  SymptomSchema,
  UtterancePrioritySchema,
  UtteranceSchema,
  VerdictSchema,
} from "./schemas.ts";

describe("interfaces equal z.infer of their schemas", () => {
  test("vocabulary unions", () => {
    expectTypeOf<z.infer<typeof VerdictSchema>>().toEqualTypeOf<Verdict>();
    expectTypeOf<z.infer<typeof SymptomSchema>>().toEqualTypeOf<Symptom>();
    expectTypeOf<z.infer<typeof BenignTypeSchema>>().toEqualTypeOf<BenignType>();
    expectTypeOf<z.infer<typeof ArmSchema>>().toEqualTypeOf<Arm>();
    expectTypeOf<z.infer<typeof StrategySchema>>().toEqualTypeOf<Strategy>();
    expectTypeOf<z.infer<typeof CanaryIdSchema>>().toEqualTypeOf<CanaryId>();
    expectTypeOf<z.infer<typeof UtterancePrioritySchema>>().toEqualTypeOf<UtterancePriority>();
    expectTypeOf<z.infer<typeof NvdaChannelSchema>>().toEqualTypeOf<NvdaChannel>();
    expectTypeOf<z.infer<typeof LegSchema>>().toEqualTypeOf<Leg>();
    expectTypeOf<z.infer<typeof QpcNsSchema>>().toEqualTypeOf<number>();
  });

  test("journey contracts", () => {
    expectTypeOf<z.infer<typeof ExpectationSchema>>().toEqualTypeOf<Expectation>();
    expectTypeOf<z.infer<typeof AtStepSchema>>().toEqualTypeOf<AtStep>();
    expectTypeOf<z.infer<typeof SetupStepSchema>>().toEqualTypeOf<SetupStep>();
    expectTypeOf<z.infer<typeof JourneyStepSchema>>().toEqualTypeOf<AtStep | SetupStep>();
    expectTypeOf<z.infer<typeof JourneySchema>>().toEqualTypeOf<Journey>();
  });

  test("corpus contracts", () => {
    expectTypeOf<z.infer<typeof ExpectedSchema>>().toEqualTypeOf<Expected>();
    expectTypeOf<z.infer<typeof CorpusItemSchema>>().toEqualTypeOf<CorpusItem>();
  });

  test("environment and evidence contracts", () => {
    expectTypeOf<z.infer<typeof EnvManifestSchema>>().toEqualTypeOf<EnvManifest>();
    expectTypeOf<z.infer<typeof UtteranceSchema>>().toEqualTypeOf<Utterance>();
    expectTypeOf<z.infer<typeof PlatformEventSchema>>().toEqualTypeOf<PlatformEvent>();
    expectTypeOf<z.infer<typeof StepEvidenceSchema>>().toEqualTypeOf<StepEvidence>();
    expectTypeOf<z.infer<typeof ClockChecksSchema>>().toEqualTypeOf<ClockChecks>();
    expectTypeOf<z.infer<typeof PreflightSchema>>().toEqualTypeOf<Preflight>();
    expectTypeOf<z.infer<typeof EvidencePackageSchema>>().toEqualTypeOf<EvidencePackage>();
    expectTypeOf<z.infer<typeof ArmVerdictSchema>>().toEqualTypeOf<ArmVerdict>();
  });

  test("schemas have no transforms: input types equal output types", () => {
    expectTypeOf<z.input<typeof JourneySchema>>().toEqualTypeOf<Journey>();
    expectTypeOf<z.input<typeof CorpusItemSchema>>().toEqualTypeOf<CorpusItem>();
    expectTypeOf<z.input<typeof EvidencePackageSchema>>().toEqualTypeOf<EvidencePackage>();
    expectTypeOf<z.input<typeof ArmVerdictSchema>>().toEqualTypeOf<ArmVerdict>();
  });
});

describe("canary sets", () => {
  test("gating and record-only canaries partition CanaryId", () => {
    type Gating = (typeof GATING_CANARIES)[number];
    type RecordOnly = (typeof RECORD_ONLY_CANARIES)[number];
    expectTypeOf<Gating | RecordOnly>().toEqualTypeOf<CanaryId>();
    expectTypeOf<Extract<Gating, RecordOnly>>().toEqualTypeOf<never>();
  });
});

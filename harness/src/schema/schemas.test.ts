import { describe, expect, test } from "vitest";
import type { z } from "zod";
import {
  ArmSchema,
  ArmVerdictSchema,
  BenignTypeSchema,
  CanaryIdSchema,
  CorpusItemSchema,
  EvidencePackageSchema,
  ExpectedSchema,
  GATING_CANARIES,
  GateEvidencePackageSchema,
  JourneySchema,
  NVDA_PRESENT_PREFLIGHT_KEYS,
  PlatformEventSchema,
  QpcNsSchema,
  RECORD_ONLY_CANARIES,
  StrategySchema,
  SymptomSchema,
  UtteranceSchema,
  VerdictSchema,
} from "./index.ts";
import type {
  ArmVerdict,
  AtStep,
  BenignType,
  CorpusItem,
  EvidencePackage,
  GateEvidencePackage,
  Journey,
  Preflight,
  SetupStep,
  Strategy,
  Symptom,
  Verdict,
  Arm,
} from "./index.ts";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function defined<T>(value: T | undefined): T {
  if (value === undefined) throw new Error("test data is missing an expected value");
  return value;
}

function first<T>(values: readonly T[] | undefined): T {
  return defined(defined(values)[0]);
}

/** Issue paths of a failed parse; fails the test if the parse succeeded. */
function issuePaths(result: z.ZodSafeParseResult<unknown>): string[] {
  expect(result.success).toBe(false);
  return (result.error?.issues ?? []).map((issue) => issue.path.map(String).join("."));
}

function issueCodes(result: z.ZodSafeParseResult<unknown>): string[] {
  expect(result.success).toBe(false);
  return (result.error?.issues ?? []).map((issue) => issue.code);
}

// Base QPC reading for sample data: about 20 minutes after boot, in ns.
const T0 = 1_200_000_000_000;

interface TimeValues {
  utteranceT: number;
  cancelledAt: number;
  platformT: number;
  startedAt: number;
  endedAt: number;
  focusT: number;
  cancelT: number;
}

function evidencePackage(times: Partial<TimeValues> = {}): EvidencePackage {
  const t: TimeValues = {
    startedAt: T0,
    platformT: T0 + 501_000_000,
    utteranceT: T0 + 640_000_000,
    cancelledAt: T0 + 900_000_000,
    focusT: T0 + 950_000_000,
    cancelT: T0 + 900_000_000,
    endedAt: T0 + 3_000_000_000,
    ...times,
  };
  return {
    itemId: "canary-K1",
    side: "base",
    repetition: 0,
    orderIndex: 0,
    env: {
      harnessCommit: "0123456789abcdef0123456789abcdef01234567",
      imageOS: "win25",
      imageVersion: "20260101.1.0",
      windowsBuild: "10.0.26100.0",
      chromeVersion: "153.0.8010.12",
      chromeFlags: ["--force-renderer-accessibility=screen-reader"],
      nvdaVersion: "2026.2",
      nvdaConfigHash: "sha256:0000000000000000000000000000000000000000000000000000000000000000",
      adapter: { name: "guidepup", version: "0.35.0" },
      listenerVersion: "0.0.0",
      nodeVersion: "24.21.0",
      locale: "en-GB",
      imageName: "windows-2025-vs2026",
      playwrightVersion: "1.63.0",
      chromeSandbox: true,
      axMode: "screen-reader",
      nvdaChannel: "IA2",
      synth: { name: "espeak", voice: "en-gb", rate: 30, rateBoost: false },
      audio: { endpointCount: 1, audiosrvRunning: true, driver: "Scream 3.6" },
      dotnetVersion: "10.0.12",
    },
    canaries: { pre: true, post: true },
    maxClockSkewMs: 1.2,
    steps: [
      {
        stepId: "activate",
        segmentId: "seg-0001",
        startedAt: t.startedAt,
        endedAt: t.endedAt,
        outcome: "REACHED",
        platformEvents: [
          {
            t: t.platformT,
            channel: "IA2",
            event: "IA2_EVENT_TEXT_INSERTED",
            eventId: 0x11e, // IA2_EVENT_TEXT_INSERTED
            hwndClass: "Chrome_RenderWidgetHostHWND",
            automationId: "status",
            liveSetting: "Polite",
          },
        ],
        speech: [
          { text: "Saved", t: t.utteranceT, cancelledAt: t.cancelledAt, priority: "NORMAL" },
        ],
        focusTrace: [{ t: t.focusT, target: "button#save" }],
        speechCancels: [{ t: t.cancelT }],
      },
    ],
    leg: "nvda-present",
    preflight: {
      foregroundHwndOk: true,
      preCanaryOk: true,
      manifestValid: true,
      clock: {
        nativeSelfTestDisagreementMs: 0.05,
        pageMappingUncertaintyMs: 1.2,
        segmentDriftMs: 0.1,
        timeTicksHighResolution: true,
        maxRafGapMs: 20,
      },
      injectionMarkerOk: true,
      audioOk: true,
      synthOk: true,
    },
  };
}

/** A package carrying only HANDOFF v1.0 §10.2 fields, with no v1.1 additions. */
function v10Package(): EvidencePackage {
  return {
    itemId: "item-0001",
    side: "candidate",
    repetition: 2,
    orderIndex: 3,
    env: {
      harnessCommit: "0123456789abcdef0123456789abcdef01234567",
      imageOS: "win25",
      imageVersion: "20260101.1.0",
      windowsBuild: "10.0.26100.0",
      chromeVersion: "153.0.8010.12",
      chromeFlags: [],
      listenerVersion: "0.0.0",
      nodeVersion: "24.21.0",
      locale: "en-GB",
    },
    canaries: { pre: true, post: false },
    maxClockSkewMs: 0,
    steps: [{ stepId: "s1", startedAt: 0, endedAt: 1, outcome: "UNREACHABLE" }],
  };
}

/** The preflight without the three NVDA-present checks. */
function withoutNvdaChecks(preflight: Preflight): Preflight {
  return {
    foregroundHwndOk: preflight.foregroundHwndOk,
    preCanaryOk: preflight.preCanaryOk,
    manifestValid: preflight.manifestValid,
    clock: preflight.clock,
  };
}

function atStep(): AtStep {
  return {
    kind: "at",
    id: "activate-save",
    strategy: "ACTIVATE",
    until: { name: "Save", role: "button", maxAttempts: 3 },
    observeMs: 3000,
    expectations: [
      { type: "announcementContains", value: "Saved" },
      { type: "orderBefore", value: "Saved", before: "Save button" },
    ],
    manualTriggers: ["nvda"],
  };
}

function setupStep(): SetupStep {
  return { kind: "setup", id: "open", fn: "openCanaryPage" };
}

function journey(): Journey {
  return {
    id: "canary-k1",
    version: "1",
    app: "canaries",
    entryUrl: "http://127.0.0.1:4173/k1.html",
    anchor: "#start",
    steps: [setupStep(), atStep(), { ...atStep(), id: "type-name", strategy: "TYPE", text: "Ada" }],
  };
}

function corpusItem(): CorpusItem {
  return {
    id: "item-0001",
    patternId: "pattern-live-region-01",
    split: "dev",
    source: "seeded",
    app: "spa",
    journeyId: "checkout",
    base: { ref: "abc123" },
    candidate: { patch: "patches/item-0001.diff" },
    expected: { kind: "regression", symptom: "ANNOUNCEMENT_MISSING", mechanism: "region inserted populated" },
    repetitions: 5,
    provenance: { origin: "seeded-mutation", licence: "Apache-2.0" },
  };
}

function armVerdict(): ArmVerdict {
  return { itemId: "item-0001", arm: "B2", verdict: "FAIL", symptom: "ANNOUNCEMENT_MISSING", ruleIds: ["b2.live.1"] };
}

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

const ALL_SYMPTOMS: readonly Symptom[] = [
  "NAME_NOT_CONVEYED", "ROLE_NOT_CONVEYED", "STATE_NOT_CONVEYED",
  "ANNOUNCEMENT_MISSING", "ANNOUNCEMENT_DUPLICATED", "ANNOUNCEMENT_ORDER_BROKEN",
  "ANNOUNCEMENT_INTERRUPTED", "FOCUS_NOT_MOVED", "FOCUS_NOT_RESTORED",
  "FOCUS_ESCAPES_DIALOG", "KEYBOARD_TRAP", "NAV_TARGET_UNREACHABLE",
  "INTERACTION_FAILS_UNDER_AT", "ROUTE_CHANGE_SILENT", "JOURNEY_BLOCKED",
];
const ALL_BENIGN_TYPES: readonly BenignType[] = [
  "WRAPPER_ELEMENT", "CLASS_RENAME", "CSS_ONLY", "COPY_EDIT",
  "A11Y_IMPROVEMENT", "EQUIVALENT_REFACTOR", "TIMING_WITHIN_TOLERANCE",
];
const ALL_ARMS: readonly Arm[] = ["A", "B", "B2", "C_UNION", "C_ADJUDICATED", "D_UNION", "D_ADJUDICATED"];
const ALL_STRATEGIES: readonly Strategy[] = [
  "TAB", "SHIFT_TAB", "NEXT_HEADING", "NEXT_FORM_FIELD", "NEXT_BUTTON",
  "NEXT_LANDMARK", "BROWSE_NEXT", "ACTIVATE", "TYPE", "READ_CURRENT",
  "PRESS",
];
const ALL_VERDICTS: readonly Verdict[] = ["PASS", "FAIL", "REVIEW", "INCONCLUSIVE"];

describe("vocabulary enums", () => {
  const cases = [
    { name: "symptoms", schema: SymptomSchema, values: ALL_SYMPTOMS, count: 15, rejected: ["ANNOUNCEMENT_LATE", "name_not_conveyed"] },
    { name: "benign types", schema: BenignTypeSchema, values: ALL_BENIGN_TYPES, count: 7, rejected: ["REFACTOR", "css_only"] },
    { name: "arms", schema: ArmSchema, values: ALL_ARMS, count: 7, rejected: ["C", "D", "b2"] },
    { name: "strategies", schema: StrategySchema, values: ALL_STRATEGIES, count: 11, rejected: ["CLICK", "tab"] },
    { name: "verdicts", schema: VerdictSchema, values: ALL_VERDICTS, count: 4, rejected: ["WARN", "pass"] },
  ] as const;

  test.each(cases)("accepts all $count $name", ({ schema, values, count }) => {
    expect(values).toHaveLength(count);
    expect(new Set(values).size).toBe(count);
    expect([...schema.options].sort()).toEqual([...values].sort());
    for (const value of values) expect(schema.safeParse(value).success).toBe(true);
  });

  test.each(cases)("rejects other $name", ({ schema, rejected }) => {
    for (const value of [...rejected, "", 1, null, undefined]) {
      expect(schema.safeParse(value).success).toBe(false);
    }
  });

  test("canary IDs: gating and record-only sets partition the enum", () => {
    expect([...GATING_CANARIES]).toEqual(["K1", "K2", "K3", "K4", "K5"]);
    expect([...RECORD_ONLY_CANARIES]).toEqual(["K6a", "K6b", "K6e", "K7a", "K7b"]);
    expect([...CanaryIdSchema.options].sort()).toEqual([...GATING_CANARIES, ...RECORD_ONLY_CANARIES].sort());
    expect(CanaryIdSchema.safeParse("K6").success).toBe(false);
    expect(CanaryIdSchema.safeParse("K7").success).toBe(false);
  });

  test("adapter enum keeps both §10.2 names", () => {
    const pkg = evidencePackage();
    pkg.env.adapter = { name: "atdriver", version: "0.0.0" };
    expect(EvidencePackageSchema.safeParse(pkg).success).toBe(true);
    expect(EvidencePackageSchema.safeParse({ ...pkg, env: { ...pkg.env, adapter: { name: "nvda", version: "1" } } }).success).toBe(false);
  });

  test("utterance priority accepts NORMAL, NEXT and NOW only", () => {
    for (const priority of ["NORMAL", "NEXT", "NOW"]) {
      expect(UtteranceSchema.safeParse({ text: "x", t: 1, priority }).success).toBe(true);
    }
    expect(UtteranceSchema.safeParse({ text: "x", t: 1, priority: "HIGH" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Expected discriminated union
// ---------------------------------------------------------------------------

describe("Expected discriminated union", () => {
  test("accepts regression, benign and unchanged", () => {
    expect(ExpectedSchema.safeParse({ kind: "regression", symptom: "KEYBOARD_TRAP", mechanism: "tabindex" }).success).toBe(true);
    expect(ExpectedSchema.safeParse({ kind: "benign", benignType: "COPY_EDIT" }).success).toBe(true);
    expect(ExpectedSchema.safeParse({ kind: "unchanged" }).success).toBe(true);
  });

  test("regression requires symptom and mechanism", () => {
    expect(issuePaths(ExpectedSchema.safeParse({ kind: "regression", mechanism: "m" }))).toContain("symptom");
    expect(issuePaths(ExpectedSchema.safeParse({ kind: "regression", symptom: "KEYBOARD_TRAP" }))).toContain("mechanism");
  });

  test("benign requires a valid benignType", () => {
    expect(issuePaths(ExpectedSchema.safeParse({ kind: "benign" }))).toContain("benignType");
    expect(issuePaths(ExpectedSchema.safeParse({ kind: "benign", benignType: "KEYBOARD_TRAP" }))).toContain("benignType");
  });

  test("variants do not borrow each other's fields", () => {
    expect(issueCodes(ExpectedSchema.safeParse({ kind: "unchanged", symptom: "KEYBOARD_TRAP" }))).toContain("unrecognized_keys");
    expect(issueCodes(ExpectedSchema.safeParse({ kind: "benign", benignType: "COPY_EDIT", mechanism: "m" }))).toContain("unrecognized_keys");
    expect(
      issueCodes(ExpectedSchema.safeParse({ kind: "regression", symptom: "KEYBOARD_TRAP", mechanism: "m", benignType: "COPY_EDIT" })),
    ).toContain("unrecognized_keys");
  });

  test("rejects an unknown or missing kind", () => {
    expect(ExpectedSchema.safeParse({ kind: "improvement" }).success).toBe(false);
    expect(ExpectedSchema.safeParse({ symptom: "KEYBOARD_TRAP", mechanism: "m" }).success).toBe(false);
  });

  test("corpus items carry each variant", () => {
    const item = corpusItem();
    expect(CorpusItemSchema.safeParse(item).success).toBe(true);
    expect(CorpusItemSchema.safeParse({ ...item, expected: { kind: "benign", benignType: "A11Y_IMPROVEMENT" } }).success).toBe(true);
    expect(CorpusItemSchema.safeParse({ ...item, candidate: {}, expected: { kind: "unchanged" } }).success).toBe(true);
    expect(CorpusItemSchema.safeParse({ ...item, split: "holdout" }).success).toBe(false);
    expect(CorpusItemSchema.safeParse({ ...item, source: "customer" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AtStep versus SetupStep
// ---------------------------------------------------------------------------

describe("AtStep versus SetupStep", () => {
  test("a journey mixes setup and AT steps", () => {
    const parsed = JourneySchema.parse(journey());
    expect(parsed.steps.map((step) => step.kind)).toEqual(["setup", "at", "at"]);
  });

  test("a setup step cannot carry AT fields", () => {
    const j = journey();
    j.steps = [{ ...setupStep(), ...{ strategy: "TAB" } }];
    expect(issueCodes(JourneySchema.safeParse(j))).toContain("unrecognized_keys");
  });

  test("an AT step cannot carry a setup function", () => {
    const j = journey();
    j.steps = [{ ...atStep(), ...{ fn: "openCanaryPage" } }];
    expect(issueCodes(JourneySchema.safeParse(j))).toContain("unrecognized_keys");
  });

  test("an AT step requires strategy, observeMs and expectations", () => {
    for (const key of ["strategy", "observeMs", "expectations"] as const) {
      const step: Partial<AtStep> = atStep();
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- removing one required key per case
      delete step[key];
      expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [step] }))).toContain(`steps.0.${key}`);
    }
  });

  test("a PRESS step names one documented key, and only a PRESS step may (P25)", () => {
    const press = { ...atStep(), id: "escape", strategy: "PRESS", key: "Escape" };
    expect(JourneySchema.safeParse({ ...journey(), steps: [press] }).success).toBe(true);
    expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [{ ...press, key: undefined }] }))).toContain("steps.0.key");
    expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [{ ...atStep(), key: "Escape" }] }))).toContain("steps.0.key");
    expect(JourneySchema.safeParse({ ...journey(), steps: [{ ...press, key: "F4" }] }).success).toBe(false);
  });

  test("a setup step requires fn", () => {
    expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [{ kind: "setup", id: "x" }] }))).toContain("steps.0.fn");
  });

  test("an unknown step kind is rejected", () => {
    expect(JourneySchema.safeParse({ ...journey(), steps: [{ kind: "manual", id: "x" }] }).success).toBe(false);
  });

  test("until.maxAttempts is required and at least 1", () => {
    expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [{ ...atStep(), until: { name: "Save" } }] }))).toContain(
      "steps.0.until.maxAttempts",
    );
    expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [{ ...atStep(), until: { maxAttempts: 0 } }] }))).toContain(
      "steps.0.until.maxAttempts",
    );
  });

  test("expectation types are the four §10.2 literals", () => {
    const bad = { ...atStep(), expectations: [{ type: "announcementEquals", value: "x" }] };
    expect(issuePaths(JourneySchema.safeParse({ ...journey(), steps: [bad] }))).toContain("steps.0.expectations.0.type");
  });
});

// ---------------------------------------------------------------------------
// QPC time fields (D1)
// ---------------------------------------------------------------------------

describe("QPC time fields (D1)", () => {
  const timeFields: ReadonlyArray<{ key: keyof TimeValues; path: string }> = [
    { key: "utteranceT", path: "steps.0.speech.0.t" },
    { key: "cancelledAt", path: "steps.0.speech.0.cancelledAt" },
    { key: "platformT", path: "steps.0.platformEvents.0.t" },
    { key: "startedAt", path: "steps.0.startedAt" },
    { key: "endedAt", path: "steps.0.endedAt" },
    { key: "focusT", path: "steps.0.focusTrace.0.t" },
    { key: "cancelT", path: "steps.0.speechCancels.0.t" },
  ];
  const badValues = [1.5, -1, 2 ** 53, Number.NaN, Number.POSITIVE_INFINITY];

  test("the sample package is valid", () => {
    expect(EvidencePackageSchema.safeParse(evidencePackage()).success).toBe(true);
  });

  test.each(timeFields)("$path rejects 1.5, -1, 2**53, NaN and Infinity", ({ key, path }) => {
    for (const value of badValues) {
      // One value can break several checks (2**53 fails both int and max), so compare distinct paths.
      const paths = issuePaths(EvidencePackageSchema.safeParse(evidencePackage({ [key]: value })));
      expect([...new Set(paths)]).toEqual([path]);
    }
  });

  test.each(timeFields)("$path accepts 0 and Number.MAX_SAFE_INTEGER", ({ key }) => {
    for (const value of [0, Number.MAX_SAFE_INTEGER]) {
      expect(EvidencePackageSchema.safeParse(evidencePackage({ [key]: value })).success).toBe(true);
    }
  });

  test("QpcNsSchema boundaries", () => {
    expect(QpcNsSchema.safeParse(0).success).toBe(true);
    expect(QpcNsSchema.safeParse(2 ** 53 - 1).success).toBe(true);
    expect(QpcNsSchema.safeParse(2 ** 53).success).toBe(false);
    expect(QpcNsSchema.safeParse(-1).success).toBe(false);
    expect(QpcNsSchema.safeParse(1.5).success).toBe(false);
    expect(QpcNsSchema.safeParse("1").success).toBe(false);
    expect(QpcNsSchema.safeParse(BigInt(1)).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Strict objects
// ---------------------------------------------------------------------------

describe("strict objects reject unknown keys", () => {
  const packageCases: ReadonlyArray<{ path: string; target: (pkg: EvidencePackage) => object }> = [
    { path: "", target: (pkg) => pkg },
    { path: "env", target: (pkg) => pkg.env },
    { path: "env.adapter", target: (pkg) => defined(pkg.env.adapter) },
    { path: "env.synth", target: (pkg) => defined(pkg.env.synth) },
    { path: "env.audio", target: (pkg) => defined(pkg.env.audio) },
    { path: "canaries", target: (pkg) => pkg.canaries },
    { path: "preflight", target: (pkg) => defined(pkg.preflight) },
    { path: "preflight.clock", target: (pkg) => defined(pkg.preflight).clock },
    { path: "steps.0", target: (pkg) => first(pkg.steps) },
    { path: "steps.0.speech.0", target: (pkg) => first(first(pkg.steps).speech) },
    { path: "steps.0.platformEvents.0", target: (pkg) => first(first(pkg.steps).platformEvents) },
    { path: "steps.0.focusTrace.0", target: (pkg) => first(first(pkg.steps).focusTrace) },
    { path: "steps.0.speechCancels.0", target: (pkg) => first(first(pkg.steps).speechCancels) },
  ];

  test.each(packageCases)("evidence package at '$path'", ({ path, target }) => {
    const pkg = evidencePackage();
    Object.assign(target(pkg), { unexpected: true });
    const result = EvidencePackageSchema.safeParse(pkg);
    expect(issueCodes(result)).toEqual(["unrecognized_keys"]);
    expect(issuePaths(result)).toEqual([path]);
  });

  const journeyCases: ReadonlyArray<{ path: string; target: (j: Journey) => object }> = [
    { path: "", target: (j) => j },
    { path: "steps.0", target: (j) => first(j.steps) },
    { path: "steps.1", target: (j) => defined(j.steps[1]) },
    { path: "steps.1.until", target: (j) => defined((defined(j.steps[1]) as AtStep).until) },
    { path: "steps.1.expectations.0", target: (j) => first((defined(j.steps[1]) as AtStep).expectations) },
  ];

  test.each(journeyCases)("journey at '$path'", ({ path, target }) => {
    const j = journey();
    Object.assign(target(j), { unexpected: true });
    const result = JourneySchema.safeParse(j);
    expect(issueCodes(result)).toEqual(["unrecognized_keys"]);
    expect(issuePaths(result)).toEqual([path]);
  });

  const corpusCases: ReadonlyArray<{ path: string; target: (item: CorpusItem) => object }> = [
    { path: "", target: (item) => item },
    { path: "base", target: (item) => item.base },
    { path: "candidate", target: (item) => item.candidate },
    { path: "expected", target: (item) => item.expected },
    { path: "provenance", target: (item) => item.provenance },
  ];

  test.each(corpusCases)("corpus item at '$path'", ({ path, target }) => {
    const item = corpusItem();
    Object.assign(target(item), { unexpected: true });
    const result = CorpusItemSchema.safeParse(item);
    expect(issueCodes(result)).toEqual(["unrecognized_keys"]);
    expect(issuePaths(result)).toEqual([path]);
  });

  test("arm verdict", () => {
    const result = ArmVerdictSchema.safeParse({ ...armVerdict(), confidence: 0.9 });
    expect(issueCodes(result)).toEqual(["unrecognized_keys"]);
  });

  test("the removed document.title marker is not a field", () => {
    const pkg = evidencePackage();
    Object.assign(first(pkg.steps), { titleNonce: "abc" });
    expect(issueCodes(EvidencePackageSchema.safeParse(pkg))).toEqual(["unrecognized_keys"]);
  });
});

// ---------------------------------------------------------------------------
// Additive compatibility with HANDOFF v1.0 §10.2
// ---------------------------------------------------------------------------

describe("schema v1.1 is additive over §10.2", () => {
  test("a document with only v1.0 fields is valid", () => {
    expect(EvidencePackageSchema.safeParse(v10Package()).success).toBe(true);
    expect(ArmVerdictSchema.safeParse({ itemId: "i", arm: "A", verdict: "PASS", ruleIds: [] }).success).toBe(true);
  });

  test("maxClockSkewMs stays required", () => {
    const pkg: Partial<EvidencePackage> = v10Package();
    delete pkg.maxClockSkewMs;
    expect(issuePaths(EvidencePackageSchema.safeParse(pkg))).toEqual(["maxClockSkewMs"]);
  });

  test("platform event additions validate", () => {
    const base = { t: 1, channel: "UIA", event: "LiveRegionChanged", diagnostic: true, eventId: 20024, ariaRole: "status" };
    expect(PlatformEventSchema.safeParse(base).success).toBe(true);
    expect(PlatformEventSchema.safeParse({ ...base, eventId: -1 }).success).toBe(false);
    expect(PlatformEventSchema.safeParse({ ...base, eventId: 1.5 }).success).toBe(false);
    expect(PlatformEventSchema.safeParse({ ...base, channel: "ATK" }).success).toBe(false);
  });

  test("environment additions validate", () => {
    const pkg = evidencePackage();
    expect(EvidencePackageSchema.safeParse({ ...pkg, env: { ...pkg.env, nvdaChannel: "MSAA" } }).success).toBe(false);
    expect(EvidencePackageSchema.safeParse({ ...pkg, env: { ...pkg.env, audio: { endpointCount: -1, audiosrvRunning: true } } }).success).toBe(false);
    expect(EvidencePackageSchema.safeParse({ ...pkg, env: { ...pkg.env, synth: { rate: 50 } } }).success).toBe(false);
    expect(EvidencePackageSchema.safeParse({ ...pkg, env: { ...pkg.env, synth: { name: "espeak", rate: 101 } } }).success).toBe(false);
    expect(EvidencePackageSchema.safeParse({ ...pkg, leg: "both" }).success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Preflight refinements (D12, D1)
// ---------------------------------------------------------------------------

describe("nvda-present preflight refinement (D12)", () => {
  test.each(NVDA_PRESENT_PREFLIGHT_KEYS)("rejects a missing preflight.%s on the nvda-present leg", (key) => {
    const pkg = evidencePackage();
    const preflight = defined(pkg.preflight);
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- removing one key per case
    delete preflight[key];
    const result = EvidencePackageSchema.safeParse(pkg);
    expect(issuePaths(result)).toEqual([`preflight.${key}`]);
    expect(issueCodes(result)).toEqual(["custom"]);
  });

  test("reports every missing field at once", () => {
    const pkg = evidencePackage();
    pkg.preflight = withoutNvdaChecks(defined(pkg.preflight));
    expect(issuePaths(EvidencePackageSchema.safeParse(pkg))).toEqual([
      "preflight.injectionMarkerOk",
      "preflight.audioOk",
      "preflight.synthOk",
    ]);
  });

  test("rejects the nvda-present leg without any preflight", () => {
    const pkg = evidencePackage();
    delete pkg.preflight;
    expect(issuePaths(EvidencePackageSchema.safeParse(pkg))).toEqual([
      "preflight.injectionMarkerOk",
      "preflight.audioOk",
      "preflight.synthOk",
    ]);
  });

  test("present-but-false values satisfy the schema (validity decides, not the schema)", () => {
    const pkg = evidencePackage();
    pkg.preflight = { ...defined(pkg.preflight), injectionMarkerOk: false, audioOk: false, synthOk: false };
    expect(EvidencePackageSchema.safeParse(pkg).success).toBe(true);
  });

  test("the nvda-absent leg and a package with no leg do not need NVDA checks", () => {
    const pkg = evidencePackage();
    const reduced = withoutNvdaChecks(defined(pkg.preflight));
    expect(EvidencePackageSchema.safeParse({ ...pkg, leg: "nvda-absent", preflight: reduced }).success).toBe(true);
    const noLeg: Partial<EvidencePackage> = { ...pkg, preflight: reduced };
    delete noLeg.leg;
    expect(EvidencePackageSchema.safeParse(noLeg).success).toBe(true);
  });
});

describe("maxClockSkewMs consistency with the clock preflight (D1)", () => {
  test("must equal max(native self-test, page mapping) when preflight is present", () => {
    const pkg = evidencePackage();
    expect(EvidencePackageSchema.safeParse(pkg).success).toBe(true);
    pkg.maxClockSkewMs = 20;
    expect(issuePaths(EvidencePackageSchema.safeParse(pkg))).toEqual(["maxClockSkewMs"]);
  });

  test("is unconstrained when preflight is absent", () => {
    expect(EvidencePackageSchema.safeParse({ ...v10Package(), maxClockSkewMs: 20 }).success).toBe(true);
  });

  test("rejects a negative skew", () => {
    expect(issuePaths(EvidencePackageSchema.safeParse({ ...v10Package(), maxClockSkewMs: -0.1 }))).toEqual(["maxClockSkewMs"]);
  });
});

// ---------------------------------------------------------------------------
// Utterance priority on the NVDA-present leg (DR-0026 amendment b)
// ---------------------------------------------------------------------------

describe("utterance priority on the nvda-present leg (DR-0026 amendment b)", () => {
  function withSpeech(pkg: EvidencePackage, speech: Array<{ text: string; t: number; priority?: "NORMAL" | "NEXT" | "NOW" }>): EvidencePackage {
    const step = first(pkg.steps);
    pkg.steps = [{ ...step, speech }, { ...step, stepId: "second", speech: [...speech] }];
    return pkg;
  }

  test("rejects an utterance without priority, reporting each one", () => {
    const pkg = withSpeech(evidencePackage(), [
      { text: "Saved", t: T0 + 1, priority: "NORMAL" },
      { text: "Error", t: T0 + 2 },
    ]);
    const result = EvidencePackageSchema.safeParse(pkg);
    expect(issuePaths(result)).toEqual(["steps.0.speech.1.priority", "steps.1.speech.1.priority"]);
    expect(issueCodes(result)).toEqual(["custom", "custom"]);
  });

  test("accepts every priority value", () => {
    const pkg = withSpeech(evidencePackage(), [
      { text: "a", t: T0 + 1, priority: "NORMAL" },
      { text: "b", t: T0 + 2, priority: "NEXT" },
      { text: "c", t: T0 + 3, priority: "NOW" },
    ]);
    expect(EvidencePackageSchema.safeParse(pkg).success).toBe(true);
  });

  test("does not apply to the nvda-absent leg or to a package with no leg", () => {
    const pkg = withSpeech(evidencePackage(), [{ text: "Saved", t: T0 + 1 }]);
    expect(EvidencePackageSchema.safeParse({ ...pkg, leg: "nvda-absent" }).success).toBe(true);
    const noLeg: Partial<EvidencePackage> = { ...pkg };
    delete noLeg.leg;
    expect(EvidencePackageSchema.safeParse(noLeg).success).toBe(true);
  });

  test("a step with no speech needs no priority", () => {
    const pkg = evidencePackage();
    const step = first(pkg.steps);
    delete step.speech;
    expect(EvidencePackageSchema.safeParse(pkg).success).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Gate evidence (DR-0026 amendment a)
// ---------------------------------------------------------------------------

describe("gate evidence (DR-0026 amendment a)", () => {
  function gatePackage(): GateEvidencePackage {
    const pkg = evidencePackage();
    const step = first(pkg.steps);
    return { ...pkg, steps: [{ ...step, segmentId: "seg-0001" }], leg: "nvda-present", preflight: defined(pkg.preflight) };
  }

  test("a complete package is valid gate evidence on either leg", () => {
    expect(GateEvidencePackageSchema.safeParse(gatePackage()).success).toBe(true);
    const absent = gatePackage();
    absent.leg = "nvda-absent";
    absent.preflight = withoutNvdaChecks(absent.preflight);
    expect(GateEvidencePackageSchema.safeParse(absent).success).toBe(true);
  });

  test("every gate package is also a valid evidence package", () => {
    expect(EvidencePackageSchema.safeParse(gatePackage()).success).toBe(true);
  });

  test.each(["leg", "preflight"] as const)("requires %s", (key) => {
    const pkg: Partial<GateEvidencePackage> = gatePackage();
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- removing one required key per case
    delete pkg[key];
    expect(issuePaths(GateEvidencePackageSchema.safeParse(pkg))).toEqual([key]);
  });

  test("requires a segmentId on every step", () => {
    const pkg = gatePackage();
    const step = first(pkg.steps);
    const second: Partial<typeof step> = { ...step, stepId: "second" };
    delete second.segmentId;
    const result = GateEvidencePackageSchema.safeParse({ ...pkg, steps: [step, second] });
    expect(issuePaths(result)).toEqual(["steps.1.segmentId"]);
  });

  test("rejects an empty segmentId", () => {
    const pkg = gatePackage();
    pkg.steps = [{ ...first(pkg.steps), segmentId: "" }];
    const result = GateEvidencePackageSchema.safeParse(pkg);
    expect(issuePaths(result)).toEqual(["steps.0.segmentId"]);
    expect(issueCodes(result)).toEqual(["too_small"]);
  });

  test("an ordinary evidence package without leg, preflight or segmentId is not gate evidence", () => {
    const paths = issuePaths(GateEvidencePackageSchema.safeParse(v10Package()));
    expect(paths).toEqual(expect.arrayContaining(["leg", "preflight", "steps.0.segmentId"]));
  });

  test("the evidence package refinements apply to gate evidence", () => {
    const missingAudio = gatePackage();
    delete missingAudio.preflight.audioOk;
    expect(issuePaths(GateEvidencePackageSchema.safeParse(missingAudio))).toEqual(["preflight.audioOk"]);

    const noPriority = gatePackage();
    noPriority.steps = [{ ...first(noPriority.steps), speech: [{ text: "Saved", t: T0 + 1 }] }];
    expect(issuePaths(GateEvidencePackageSchema.safeParse(noPriority))).toEqual(["steps.0.speech.0.priority"]);

    const skew = gatePackage();
    skew.maxClockSkewMs = 20;
    expect(issuePaths(GateEvidencePackageSchema.safeParse(skew))).toEqual(["maxClockSkewMs"]);
  });

  test("rejects unknown keys like every evidence schema", () => {
    const pkg = gatePackage();
    Object.assign(first(pkg.steps), { titleNonce: "abc" });
    expect(issueCodes(GateEvidencePackageSchema.safeParse(pkg))).toEqual(["unrecognized_keys"]);
  });
});

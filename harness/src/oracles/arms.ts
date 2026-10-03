/**
 * The seven scored arms (HANDOFF §10.2) from the per-leg family comparisons
 * (M5). Arms nest as PRD §33 defines them: B is A plus the tree, B2 is B plus
 * the timeline and platform events, so an arm fails whenever a family it
 * contains fails. C and D add NVDA's evidence from the NVDA-present leg,
 * combined at item level (DR-0031):
 *
 * - UNION: FAIL if B2 or NVDA FAILs (HANDOFF R3).
 * - ADJUDICATED: NVDA's FAILs stand; a B2 FAIL becomes REVIEW when NVDA's
 *   output at that step is unchanged between base and candidate (R3). Output
 *   is unchanged when every candidate attempt's speech at the step, as a set
 *   of normalised utterances, equals that of some base attempt.
 * - D takes NVDA evidence only for the steps its triggers select on the
 *   NVDA-absent B2 evidence (`triggers.ts`); it can adjudicate only there.
 *
 * An item's verdict in a leg: INCONCLUSIVE when the leg's block is
 * INCONCLUSIVE (side-aware validity, DR-0035) or missing; FAIL when a family
 * FAILs, with the symptom of the earliest finding in journey order; REVIEW
 * when a finding is REVIEW or a check failed on the candidate only (DR-0035;
 * no FAIL rule covers those, P35); PASS otherwise.
 * Combining legs, FAIL outranks INCONCLUSIVE, which outranks REVIEW and PASS.
 */
import { speechKey } from "../runner/outcome.ts";
import type { Arm, ArmVerdict, Symptom, Verdict } from "../schema/index.ts";
import type { FamilyComparison, Finding } from "./compare.ts";
import { compareFamily } from "./compare.ts";
import type { Block, ItemEvidence } from "./evidence.ts";
import { stepOf, stepRan } from "./evidence.ts";
import type { Family } from "./expectations.ts";
import { stepSpeech } from "./expectations.ts";
import type { OracleRules } from "./rules.ts";
import type { StepTriggering } from "./triggers.ts";
import { triggeredSteps } from "./triggers.ts";

export interface ArmResult extends ArmVerdict {
  /** Every symptom a FAIL finding gave, earliest first. */
  symptoms: Symptom[];
  findings: Finding[];
}

export interface ItemScore {
  itemId: string;
  arms: Record<Arm, ArmResult>;
  comparisons: FamilyComparison[];
  triggers: StepTriggering[] | null;
  /** NVDA-present leg: mean AT segment time per attempt (ms), for all steps (C) and triggered steps only (D). */
  nvdaMs: { all: number; triggered: number } | null;
  /** Per leg: attempts, attempts with a failed pre-outcome check, and the bracketing K1 canaries run and passed. */
  legs: Record<"nvda-absent" | "nvda-present", LegCounts | null>;
}

export interface LegCounts {
  attempts: number;
  inconclusiveAttempts: number;
  canaries: number;
  canariesPassed: number;
}

function legCounts(block: Block | null): LegCounts | null {
  if (block === null) return null;
  const canaries = [block.pre, block.post].flatMap((c) => (c === null || c === undefined ? [] : [c]));
  return { attempts: block.attempts.length, inconclusiveAttempts: block.attempts.filter((a) => a.reasons.length > 0).length, canaries: canaries.length, canariesPassed: canaries.filter((c) => c.ok === true).length };
}

interface LegVerdict {
  verdict: Verdict;
  findings: Finding[];
}

function byOrder(a: Finding, b: Finding): number {
  return a.stepIndex - b.stepIndex || a.order - b.order;
}

function legVerdict(block: Block | null, findings: readonly Finding[]): LegVerdict {
  if (block === null || block.validity.result !== "VALID") return { verdict: "INCONCLUSIVE", findings: [...findings] };
  const sorted = [...findings].sort(byOrder);
  if (sorted.some((f) => f.verdict === "FAIL")) return { verdict: "FAIL", findings: sorted };
  if (sorted.length > 0 || block.validity.candidateFindings.length > 0) return { verdict: "REVIEW", findings: sorted };
  return { verdict: "PASS", findings: sorted };
}

function armResult(itemId: string, arm: Arm, verdict: Verdict, findings: readonly Finding[]): ArmResult {
  const fails = [...findings].filter((f) => f.verdict === "FAIL").sort(byOrder);
  const symptoms = [...new Set(fails.flatMap((f) => (f.symptom === undefined ? [] : [f.symptom])))];
  const first = verdict === "FAIL" ? symptoms[0] : undefined;
  return { itemId, arm, verdict, ...(first === undefined ? {} : { symptom: first }), ruleIds: [...new Set(findings.map((f) => `${f.family}:${f.rule}`))], symptoms, findings: [...findings] };
}

function combine(a: LegVerdict, b: LegVerdict): Verdict {
  const vs = [a.verdict, b.verdict];
  if (vs.includes("FAIL")) return "FAIL";
  if (vs.includes("INCONCLUSIVE")) return "INCONCLUSIVE";
  if (vs.includes("REVIEW")) return "REVIEW";
  return "PASS";
}

/** A step's speech signature in one attempt: its normalised utterances, as a sorted set. */
function signature(block: Block, attemptIndex: number, stepId: string): string | null {
  const a = block.attempts[attemptIndex];
  if (a === undefined || !stepRan(a, stepId)) return null;
  const s = stepOf(a, stepId);
  if (s === undefined) return null;
  const u = stepSpeech(s, a);
  if (u === null) return null;
  return [...new Set(u.map(speechKey).filter((x) => x !== ""))].sort().join("\n");
}

/** Whether NVDA's output at a step is unchanged between base and candidate (R3). */
export function nvdaUnchanged(present: Block | null, stepId: string): boolean {
  if (present === null || present.validity.result !== "VALID") return false;
  const idx = (side: "base" | "candidate"): number[] => present.attempts.flatMap((a, i) => (a.side === side ? [i] : []));
  const base = new Set(idx("base").map((i) => signature(present, i, stepId)));
  if (base.has(null)) return false;
  return idx("candidate").every((i) => {
    const sig = signature(present, i, stepId);
    return sig !== null && base.has(sig);
  });
}

function adjudicate(b2: LegVerdict, nvda: LegVerdict, present: Block | null, canAdjudicate: (stepId: string) => boolean): { verdict: Verdict; findings: Finding[] } {
  const findings: Finding[] = [];
  for (const f of b2.findings) {
    if (f.verdict === "FAIL" && canAdjudicate(f.stepId) && nvdaUnchanged(present, f.stepId)) findings.push({ ...f, verdict: "REVIEW", rule: `${f.rule}+adjudicated`, detail: `${f.detail}; NVDA output unchanged at ${f.stepId}` });
    else findings.push(f);
  }
  findings.push(...nvda.findings);
  if (findings.some((f) => f.verdict === "FAIL")) return { verdict: "FAIL", findings };
  if (b2.verdict === "INCONCLUSIVE" || nvda.verdict === "INCONCLUSIVE") return { verdict: "INCONCLUSIVE", findings };
  if (findings.length > 0 || b2.verdict === "REVIEW" || nvda.verdict === "REVIEW") return { verdict: "REVIEW", findings };
  return { verdict: "PASS", findings };
}

function segmentMs(present: Block, steps: ReadonlySet<string> | null): number {
  const per = present.attempts.map((a) =>
    a.steps.filter((s) => s.kind === "at" && (steps === null || steps.has(s.stepId)) && s.startedAt !== undefined && s.endedAt !== undefined).reduce((t, s) => t + ((s.endedAt ?? 0) - (s.startedAt ?? 0)) / 1e6, 0),
  );
  return per.length === 0 ? 0 : per.reduce((x, y) => x + y, 0) / per.length;
}

/** Scores one item in every arm. */
export function scoreItem(ev: ItemEvidence, rules: OracleRules): ItemScore {
  const id = ev.item.id;
  const families: [Family, Block | null][] = [["A", ev.absent], ["B", ev.absent], ["B2", ev.absent], ["NVDA", ev.present]];
  const comparisons = families.map(([f, block]) => (block === null || block.validity.result !== "VALID" ? { family: f, findings: [], expectations: [] } : compareFamily(f, block, ev.journey, rules)));
  const of = (f: Family): Finding[] => comparisons.find((c) => c.family === f)?.findings ?? [];
  const a = legVerdict(ev.absent, of("A"));
  const b = legVerdict(ev.absent, [...of("A"), ...of("B")]);
  const b2 = legVerdict(ev.absent, [...of("A"), ...of("B"), ...of("B2")]);
  const nvda = legVerdict(ev.present, of("NVDA"));
  const triggers = triggeredSteps(ev.journey, ev.absent);
  const triggered = new Set((triggers ?? []).filter((t) => t.triggered).map((t) => t.stepId));
  const nvdaD: LegVerdict = triggered.size === 0 ? { verdict: "PASS", findings: [] } : legVerdict(ev.present, of("NVDA").filter((f) => triggered.has(f.stepId)));
  const cAdj = adjudicate(b2, nvda, ev.present, () => true);
  const dAdj = adjudicate(b2, nvdaD, ev.present, (s) => triggered.has(s));
  const arms: Record<Arm, ArmResult> = {
    A: armResult(id, "A", a.verdict, a.findings),
    B: armResult(id, "B", b.verdict, b.findings),
    B2: armResult(id, "B2", b2.verdict, b2.findings),
    C_UNION: armResult(id, "C_UNION", combine(b2, nvda), [...b2.findings, ...nvda.findings]),
    C_ADJUDICATED: armResult(id, "C_ADJUDICATED", cAdj.verdict, cAdj.findings),
    D_UNION: armResult(id, "D_UNION", combine(b2, nvdaD), [...b2.findings, ...nvdaD.findings]),
    D_ADJUDICATED: armResult(id, "D_ADJUDICATED", dAdj.verdict, dAdj.findings),
  };
  const nvdaMs = ev.present === null ? null : { all: segmentMs(ev.present, null), triggered: segmentMs(ev.present, triggered) };
  return { itemId: id, arms, comparisons, triggers, nvdaMs, legs: { "nvda-absent": legCounts(ev.absent), "nvda-present": legCounts(ev.present) } };
}

/** Whether a FAIL's symptom is the correct one: equal, or both in the reachability family (P29, DR-0081). */
export function correctSymptom(found: Symptom | undefined, expected: Symptom, rules: OracleRules): boolean {
  if (found === undefined) return false;
  return found === expected || (rules.reachabilityFamily.has(found) && rules.reachabilityFamily.has(expected));
}


/**
 * Base against candidate, within one leg, for one family of evidence (M5).
 * Each leg derives its own per-item result from its own repetitions, with
 * k of n per side (DR-0031); the exploratory default is k = n (HANDOFF §6).
 *
 * Steps are taken in journey order. For each AT step:
 *
 * 1. Reachability (families B and NVDA, from the leg's step outcomes; P24):
 *    the base must reach the step in k of n attempts. A candidate that is
 *    UNREACHABLE in k of n gives FAIL with a reachability symptom and ends
 *    the comparison (later steps did not run); in fewer than k, REVIEW.
 *    PATH_CHANGED in any candidate attempt gives REVIEW (PRD §21,
 *    "unexpected but functional navigation").
 * 2. Each expectation of the step, when the step ran in every attempt:
 *    - the base does not meet it in any attempt: the family cannot observe
 *      it, and it gives nothing;
 *    - the base meets it in some attempts but not k: REVIEW (an inconsistent
 *      baseline is ambiguous evidence, extract §3.3);
 *    - the base meets it in k of n and the candidate fails it in k of n:
 *      FAIL, with the symptom of the candidate's most common failure class;
 *      in fewer than k: REVIEW.
 *    - announcementContains also gives ANNOUNCEMENT_DUPLICATED when the base
 *      carries the text exactly once in k of n attempts and the candidate at
 *      least twice in k of n. From speech alone, a duplicate is REVIEW, not
 *      FAIL (DR-0042; P36, DR-0081).
 * 3. Step rules that are not expectations: Arm A's new axe violations
 *    (`axe.ts`), at every step both sides ran, including the step where the
 *    candidate's journey stopped; and B2's ROUTE_CHANGE_SILENT (`route.ts`).
 *
 * Failure classes become symptoms: name, role and state map directly; an
 * absent announcement is ANNOUNCEMENT_MISSING; a focus failure is
 * KEYBOARD_TRAP, FOCUS_ESCAPES_DIALOG, FOCUS_NOT_RESTORED or FOCUS_NOT_MOVED
 * from the step's place in the journey (`focusSymptom`); an unreachable step
 * is JOURNEY_BLOCKED, INTERACTION_FAILS_UNDER_AT or NAV_TARGET_UNREACHABLE
 * (`reachSymptom`).
 */
import type { AtStep, Expectation, Journey, Symptom } from "../schema/index.ts";
import { axeFindings } from "./axe.ts";
import { routeFindings } from "./route.ts";
import type { Block, BlockAttempt, BlockStep } from "./evidence.ts";
import { sideAttempts, stepOf, stepRan } from "./evidence.ts";
import type { Evaluation, FailClass, Family, Target } from "./expectations.ts";
import { evaluate, parseTarget, stepSpeech } from "./expectations.ts";
import type { OracleRules } from "./rules.ts";
import { spokenContains } from "./speech.ts";
import { matchesName, Tree } from "./tree.ts";

export type FindingVerdict = "FAIL" | "REVIEW";

export interface Finding {
  verdict: FindingVerdict;
  symptom?: Symptom;
  family: Family;
  /** Index of the AT step in the journey; findings are ordered by it, then by `order`. */
  stepIndex: number;
  stepId: string;
  order: number;
  rule: string;
  detail: string;
}

export interface ExpectationRecord {
  stepId: string;
  expectation: string;
  family: Family;
  base: Evaluation[];
  candidate: Evaluation[];
  result: "pass" | "fail" | "review" | "unobservable" | "not-judgeable" | "not-run";
}

export interface FamilyComparison {
  family: Family;
  findings: Finding[];
  expectations: ExpectationRecord[];
}

const ACTIONS = new Set(["ACTIVATE", "PRESS", "TYPE"]);
const BROWSE = new Set(["NEXT_HEADING", "NEXT_FORM_FIELD", "NEXT_BUTTON", "NEXT_LANDMARK", "BROWSE_NEXT", "READ_CURRENT"]);
const CLASS_ORDER: readonly FailClass[] = ["role", "name", "state", "focus", "absent"];

function atSteps(journey: Journey): AtStep[] {
  return journey.steps.filter((s): s is AtStep => s.kind === "at");
}

function modalClass(evals: readonly Evaluation[]): FailClass {
  const tally = new Map<FailClass, number>();
  for (const e of evals) if (e.cls !== undefined) tally.set(e.cls, (tally.get(e.cls) ?? 0) + 1);
  return [...tally.entries()].sort((a, b) => b[1] - a[1] || CLASS_ORDER.indexOf(a[0]) - CLASS_ORDER.indexOf(b[0]))[0]?.[0] ?? "focus";
}

/** Whether the candidate's focus stayed where it was through the step: the same node in the tree, or silence from NVDA. */
function focusStayed(family: Family, step: BlockStep, previous: BlockStep | undefined, attempt: BlockAttempt): boolean {
  if (family === "NVDA") return (stepSpeech(step, attempt) ?? []).length === 0;
  if (previous?.axTree === undefined || step.axTree === undefined) return false;
  const before = new Tree(previous.axTree).focused();
  const after = new Tree(step.axTree).focused();
  if (before === undefined || after === undefined) return false;
  if (before.backendId !== undefined && after.backendId !== undefined) return before.backendId === after.backendId;
  return before.role === after.role && before.name === after.name;
}

/** Whether the candidate's focus at the step's start was inside a component a documented key should leave (tree), or NVDA said nothing (speech). */
function inComponent(family: Family, previous: BlockStep | undefined, rules: OracleRules): boolean {
  if (family === "NVDA") return true;
  if (previous?.axTree === undefined) return false;
  const tree = new Tree(previous.axTree);
  const f = tree.focused();
  return f !== undefined && [f, ...tree.ancestors(f)].some((n) => rules.componentRoles.has(n.role));
}

/**
 * The focus symptom from the step's place in the journey:
 * - KEYBOARD_TRAP: the step presses Escape (a documented key for leaving a
 *   component) and the candidate's focus stays inside the component;
 * - FOCUS_ESCAPES_DIALOG: the target is a dialog that an earlier step already
 *   had focus in;
 * - FOCUS_NOT_RESTORED: the target is the journey's anchor or an earlier
 *   step's focus target, and focus went elsewhere in between;
 * - FOCUS_NOT_MOVED otherwise.
 */
export function focusSymptom(
  family: Family,
  journey: Journey,
  index: number,
  t: Target,
  candidates: readonly BlockAttempt[],
  anchorName: string | undefined,
  rules: OracleRules,
): Symptom {
  const steps = atSteps(journey);
  const step = steps[index];
  if (step === undefined) return "FOCUS_NOT_MOVED";
  if (step.strategy === "PRESS" && step.key === "Escape") {
    const trapped = candidates.every((a) => {
      const s = stepOf(a, step.id);
      const prev = steps[index - 1] === undefined ? undefined : stepOf(a, steps[index - 1]?.id ?? "");
      return s !== undefined && focusStayed(family, s, prev, a) && inComponent(family, prev, rules);
    });
    if (trapped) return "KEYBOARD_TRAP";
  }
  const value = `${t.role}|${t.name}`;
  const earlier = steps.slice(0, index).flatMap((s) => s.expectations.filter((e) => e.type === "focusOn").map((e) => e.value));
  if ((t.role === "dialog" || t.role === "alertdialog") && earlier.includes(value)) return "FOCUS_ESCAPES_DIALOG";
  const left = earlier.some((v) => v !== value);
  const isAnchor = anchorName !== undefined && t.name !== "*" && !t.name.startsWith("#") && matchesName(t.name, { name: anchorName });
  if (index > 0 && ((earlier.includes(value) && left) || isAnchor)) return "FOCUS_NOT_RESTORED";
  return "FOCUS_NOT_MOVED";
}

/**
 * The reachability symptom for a step the candidate cannot get past (P24):
 * JOURNEY_BLOCKED when the goal names its target and the candidate never
 * meets that name; INTERACTION_FAILS_UNDER_AT when an action (ACTIVATE, PRESS
 * or TYPE) came since the last navigation step, so the target depended on it;
 * NAV_TARGET_UNREACHABLE otherwise. The three form one family for scoring
 * (P29, DR-0081), so this choice is for the report.
 */
export function reachSymptom(family: Family, journey: Journey, index: number, candidates: readonly BlockAttempt[], rules: OracleRules): Symptom {
  const steps = atSteps(journey);
  const step = steps[index];
  const name = step?.until?.name;
  if (step !== undefined && name !== undefined) {
    const seen = candidates.some((a) => {
      const s = stepOf(a, step.id);
      if (s === undefined) return false;
      if (family === "NVDA") return (s.goalTrace ?? []).some((g) => (g.speech ?? []).some((u) => spokenContains(u, name, rules)) || (g.node != null && matchesName(name, g.node)));
      return s.axTree !== undefined && new Tree(s.axTree).accessible().some((n) => matchesName(name, n));
    });
    if (!seen) return "JOURNEY_BLOCKED";
  }
  for (let i = index - 1; i >= 0; i--) {
    const s = steps[i];
    if (s === undefined) break;
    if (ACTIONS.has(s.strategy)) return "INTERACTION_FAILS_UNDER_AT";
    if (s.until !== undefined || s.strategy === "TAB" || s.strategy === "SHIFT_TAB" || BROWSE.has(s.strategy)) break;
  }
  return "NAV_TARGET_UNREACHABLE";
}

function classSymptom(cls: FailClass): Symptom | null {
  if (cls === "name") return "NAME_NOT_CONVEYED";
  if (cls === "role") return "ROLE_NOT_CONVEYED";
  if (cls === "state") return "STATE_NOT_CONVEYED";
  if (cls === "absent") return "ANNOUNCEMENT_MISSING";
  return null;
}

function reached(a: BlockAttempt, stepId: string): boolean {
  const o = stepOf(a, stepId)?.outcome;
  return o === "REACHED" || o === "PATH_CHANGED";
}

/** Families that judge reachability from their leg's step outcomes. */
const REACH_FAMILIES: ReadonlySet<Family> = new Set(["B", "NVDA"]);

/** Families that judge expectations. */
const EXPECTATION_FAMILIES: ReadonlySet<Family> = new Set(["B", "B2", "NVDA"]);

/** Compares base and candidate in one leg for one family. `k` is the number of attempts per side that must agree (k = n by default). */
export function compareFamily(family: Family, block: Block, journey: Journey, rules: OracleRules, kOverride?: number): FamilyComparison {
  const findings: Finding[] = [];
  const expectations: ExpectationRecord[] = [];
  const base = sideAttempts(block, "base");
  const cand = sideAttempts(block, "candidate");
  const k = kOverride ?? Math.min(base.length, cand.length);
  // Without attempts on both sides there is nothing to compare.
  if (base.length === 0 || cand.length === 0 || k < 1) return { family, findings: [], expectations: [] };
  const anchorName = base[0]?.anchor?.name;
  const steps = atSteps(journey);
  const push = (f: Omit<Finding, "family">): void => {
    findings.push({ ...f, family });
  };
  for (const [index, step] of steps.entries()) {
    // 1. Reachability.
    const baseReached = base.filter((a) => reached(a, step.id)).length;
    if (baseReached < k) {
      if (REACH_FAMILIES.has(family)) push({ verdict: "REVIEW", stepIndex: index, stepId: step.id, order: 0, rule: "base-not-reached", detail: `base reached the step in ${String(baseReached)} of ${String(base.length)} attempts` });
      break;
    }
    const candUnreachable = cand.filter((a) => stepOf(a, step.id)?.outcome === "UNREACHABLE").length;
    const candRan = cand.filter((a) => reached(a, step.id)).length;
    // Arm A judges the state each step ends in, including the one where a candidate's journey stopped (axe ran there too).
    if (family === "A" && candUnreachable > 0) {
      for (const f of axeFindings(step.id, base, cand, k, rules)) push({ ...f, stepIndex: index, stepId: step.id, order: 100 });
      break;
    }
    if (REACH_FAMILIES.has(family)) {
      if (candUnreachable >= k) {
        push({ verdict: "FAIL", symptom: reachSymptom(family, journey, index, cand, rules), stepIndex: index, stepId: step.id, order: 0, rule: "unreachable", detail: `candidate UNREACHABLE in ${String(candUnreachable)} of ${String(cand.length)}` });
        break;
      }
      if (candUnreachable > 0) {
        push({ verdict: "REVIEW", stepIndex: index, stepId: step.id, order: 0, rule: "unreachable-partial", detail: `candidate UNREACHABLE in ${String(candUnreachable)} of ${String(cand.length)}` });
        break;
      }
      const changed = cand.filter((a) => stepOf(a, step.id)?.outcome === "PATH_CHANGED").length;
      if (changed > 0) push({ verdict: "REVIEW", stepIndex: index, stepId: step.id, order: 0, rule: "path-changed", detail: `candidate PATH_CHANGED in ${String(changed)} of ${String(cand.length)}` });
    }
    if (candRan < cand.length || base.some((a) => !stepRan(a, step.id)) || cand.some((a) => !stepRan(a, step.id))) {
      for (const e of step.expectations) expectations.push({ stepId: step.id, expectation: `${e.type}:${e.value}`, family, base: [], candidate: [], result: "not-run" });
      break;
    }
    // 2. Expectations.
    if (EXPECTATION_FAMILIES.has(family)) {
      for (const [ei, e] of step.expectations.entries()) {
        if (family === "B2" && e.type !== "announcementContains") continue;
        const record = judgeExpectation(family, e, step.id, base, cand, k, rules);
        expectations.push(record.record);
        if (record.finding === null) continue;
        let symptom = record.finding.symptom;
        if (record.finding.verdict === "FAIL" && record.cls === "focus") {
          const t = parseTarget(e);
          symptom = t === null ? "FOCUS_NOT_MOVED" : focusSymptom(family, journey, index, t, cand, anchorName, rules);
        }
        push({ ...record.finding, ...(symptom === undefined ? {} : { symptom }), stepIndex: index, stepId: step.id, order: 1 + ei });
      }
    }
    // 3. Step rules.
    if (family === "A") for (const f of axeFindings(step.id, base, cand, k, rules)) push({ ...f, stepIndex: index, stepId: step.id, order: 100 });
    // A step that declares the announcement it expects is judged by that expectation, not by the generic route rule.
    if (family === "B2" && !step.expectations.some((e) => e.type === "announcementContains")) for (const f of routeFindings(step.id, base, cand, k)) push({ ...f, stepIndex: index, stepId: step.id, order: 100 });
  }
  return { family, findings, expectations };
}

interface Judged {
  record: ExpectationRecord;
  finding: Omit<Finding, "family" | "stepIndex" | "stepId" | "order"> | null;
  cls?: FailClass;
}

function judgeExpectation(family: Family, e: Expectation, stepId: string, base: readonly BlockAttempt[], cand: readonly BlockAttempt[], k: number, rules: OracleRules): Judged {
  const at = (a: BlockAttempt): Evaluation => {
    const s = stepOf(a, stepId);
    return s === undefined ? { status: "na" } : evaluate(family, e, s, a, rules);
  };
  const b = base.map(at);
  const c = cand.map(at);
  const label = `${e.type}:${e.value}`;
  const record = (result: ExpectationRecord["result"]): ExpectationRecord => ({ stepId, expectation: label, family, base: b, candidate: c, result });
  if ([...b, ...c].some((x) => x.status === "na")) return { record: record("not-judgeable"), finding: null };
  const baseMet = b.filter((x) => x.status === "met").length;
  if (baseMet === 0) return { record: record("unobservable"), finding: null };
  if (baseMet < k) return { record: record("review"), finding: { verdict: "REVIEW", rule: "base-inconsistent", detail: `${label}: base met it in ${String(baseMet)} of ${String(b.length)}` } };
  const failed = c.filter((x) => x.status === "unmet");
  if (failed.length >= k) {
    const cls = modalClass(failed);
    const symptom = classSymptom(cls);
    return { record: record("fail"), finding: { verdict: "FAIL", ...(symptom === null ? {} : { symptom }), rule: `expectation-${cls}`, detail: `${label}: candidate ${failed.map((x) => x.seen ?? "").join(" / ")}` }, cls };
  }
  if (failed.length > 0) return { record: record("review"), finding: { verdict: "REVIEW", rule: "candidate-partial", detail: `${label}: candidate failed it in ${String(failed.length)} of ${String(c.length)}` } };
  if (e.type === "announcementContains") {
    const once = b.filter((x) => x.count === 1).length;
    const twice = c.filter((x) => (x.count ?? 0) >= 2).length;
    if (once >= k && twice >= k) {
      if (family === "NVDA") return { record: record("review"), finding: { verdict: "REVIEW", rule: "duplicate-speech-only", detail: `${label}: spoken twice in the candidate, once in the base (DR-0042)` } };
      return { record: record("fail"), finding: { verdict: "FAIL", symptom: "ANNOUNCEMENT_DUPLICATED", rule: "duplicate", detail: `${label}: ${c.map((x) => String(x.count ?? 0)).join("/")} in the candidate, once in the base` } };
    }
    if (once >= k && twice > 0) return { record: record("review"), finding: { verdict: "REVIEW", rule: "duplicate-partial", detail: `${label}: twice in ${String(twice)} of ${String(c.length)} candidate attempts` } };
  }
  return { record: record("pass"), finding: null };
}


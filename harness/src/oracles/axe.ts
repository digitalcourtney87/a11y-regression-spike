/**
 * Arm A's rule (M5): axe at every journey state (PRD §33), run in its own
 * browser context in the NVDA-absent leg (DR-0024). At each step, an axe rule
 * whose violation count is higher in every candidate attempt (k of n) than in
 * every base attempt is a new violation. Counts, not targets, are compared,
 * so a benign class rename cannot make a violation look new. A new violation
 * of a rule in `protocol/oracles/rules.v1.json` gives FAIL with that rule's
 * symptom; any other new violation gives REVIEW. axe's "incomplete" results
 * are not used.
 */
import type { BlockAttempt } from "./evidence.ts";
import type { Finding } from "./compare.ts";
import type { OracleRules } from "./rules.ts";

function counts(a: BlockAttempt, stepId: string): Map<string, number> | null {
  const step = a.axe?.[stepId];
  if (step === undefined || step.error !== undefined) return null;
  const out = new Map<string, number>();
  for (const v of step.violations) out.set(v.id, v.targets.length);
  return out;
}

export function axeFindings(stepId: string, base: readonly BlockAttempt[], cand: readonly BlockAttempt[], k: number, rules: OracleRules): Omit<Finding, "family" | "stepIndex" | "stepId" | "order">[] {
  const b = base.map((a) => counts(a, stepId));
  const c = cand.map((a) => counts(a, stepId));
  if (b.some((x) => x === null) || c.some((x) => x === null)) return [];
  const bc = b as Map<string, number>[];
  const cc = c as Map<string, number>[];
  const ids = [...new Set(cc.flatMap((m) => [...m.keys()]))].sort();
  const out: Omit<Finding, "family" | "stepIndex" | "stepId" | "order">[] = [];
  for (const id of ids) {
    const baseMax = Math.max(...bc.map((m) => m.get(id) ?? 0));
    const higher = cc.filter((m) => (m.get(id) ?? 0) > baseMax).length;
    if (higher < k) continue;
    const symptom = rules.axeSymptom.get(id);
    const detail = `axe ${id}: base at most ${String(baseMax)}, candidate ${cc.map((m) => String(m.get(id) ?? 0)).join("/")}`;
    out.push(symptom === undefined ? { verdict: "REVIEW", rule: "axe-new-unmapped", detail } : { verdict: "FAIL", symptom, rule: `axe-${id}`, detail });
  }
  return out;
}

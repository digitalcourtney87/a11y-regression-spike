/**
 * The M5 scorer's report: arm metrics, paired comparisons, Arm D's cost, the
 * per-item verdicts, expectation observability, trigger firing and the power
 * table. Every result is EXPLORATORY (HANDOFF §4 rule 5).
 */
import type { ItemScore } from "../oracles/arms.ts";
import type { OracleRules } from "../oracles/rules.ts";
import { TRIGGER_IDS } from "../oracles/triggers.ts";
import type { Arm, CorpusItem } from "../schema/index.ts";
import type { Interval, Metrics, Rate } from "./armMetrics.ts";
import { ARMS, BOOTSTRAP_RESAMPLES, BOOTSTRAP_SEED, detected } from "./armMetrics.ts";

export interface ReportMeta {
  split: string;
  runs: string[];
  harnessCommit: string;
  /** Split items with no block, scored INCONCLUSIVE in every arm (--allow-missing). */
  missing?: string[];
}

const pct = (x: number): string => `${(100 * x).toFixed(0)}%`;
const iv = (i: Interval | null): string => (i === null || Number.isNaN(i.lower) ? "–" : `${pct(i.lower)}–${pct(i.upper)}`);
const rateCell = (r: Rate): string => (r.n === 0 ? "–" : `${String(r.k)}/${String(r.n)} (${pct(r.k / r.n)}; W ${iv(r.wilson)}; boot ${iv(r.bootstrap)})`);
const abbrev = (s: string | undefined): string => (s === undefined ? "?" : s.split("_").map((w) => w[0]).join(""));

function cell(score: ItemScore, item: CorpusItem, arm: Arm, rules: OracleRules): string {
  const r = score.arms[arm];
  if (r.verdict === "PASS") return "PASS";
  if (r.verdict === "REVIEW") return "REVIEW";
  if (r.verdict === "INCONCLUSIVE") return "INC";
  const syms = r.symptoms.map(abbrev).join("+");
  if (item.expected.kind !== "regression") return `FAIL ${syms}`;
  return `FAIL ${syms} ${detected(score, item, arm, rules, "any") ? "✓" : "✗"}`;
}

export function renderDevReport(metrics: Metrics, scores: readonly ItemScore[], items: ReadonlyMap<string, CorpusItem>, rules: OracleRules, meta: ReportMeta): string {
  const L: string[] = [];
  L.push(`# M5 ${meta.split}-split report (EXPLORATORY)`, "");
  L.push(`Runs: ${meta.runs.join(", ")}. Harness commit: ${meta.harnessCommit}. Oracle tables: \`protocol/oracles/rules.v1.json\`; triggers: \`protocol/triggers.v1.json\`. k = n per side and leg (DR-0031). Bootstrap: ${String(BOOTSTRAP_RESAMPLES)} pattern-level resamples, seed ${String(BOOTSTRAP_SEED)}. Detection needs a FAIL with the correct symptom; REVIEW is not detection and INCONCLUSIVE is a miss. "Any" credits an arm when any of its FAIL symptoms is correct; "earliest" only the earliest finding's. The reachability symptoms count as one family (P29). Rules approved by the owner 2026-10-03 (P28–P36, DR-0081). W = Wilson 95% over items; boot = pattern bootstrap 95%.`, "");
  if ((meta.missing ?? []).length > 0) L.push(`**Incomplete evidence:** ${String(meta.missing?.length ?? 0)} item(s) of the split have no block and are scored INCONCLUSIVE in every arm: ${(meta.missing ?? []).join(", ")}.`, "");
  L.push("## Arms", "", "Primary: detection weighted uniformly by expected symptom (HANDOFF §10.3), the mean of the per-symptom rates, with a pattern-level bootstrap 95% interval. The item-level rates follow.", "");
  L.push("| Arm | Detection, uniform by symptom | Symptoms detected (any) |", "|---|---|---|");
  for (const m of metrics.arms) {
    const u = m.detectionUniform;
    const per = Object.entries(u.perSymptom).sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([k, v]) => `${abbrev(k)} ${String(v.k)}/${String(v.n)}`).join(", ");
    L.push(`| ${m.arm} | ${Number.isNaN(u.point) ? "–" : `${pct(u.point)} (boot ${pct(u.lower)}–${pct(u.upper)})`} | ${per} |`);
  }
  L.push("", "The secondary, owner-weighted analysis needs the owner's weights file (HANDOFF §10.3); none has been supplied.", "");
  L.push("| Arm | Detection (any) | Detection (earliest) | Wrong symptom | REVIEW (regr.) | INC (regr.) | False FAIL, benign | False FAIL, unchanged | REVIEW benign / unchanged | INC items |", "|---|---|---|---|---|---|---|---|---|---|");
  for (const m of metrics.arms) {
    L.push(`| ${m.arm} | ${rateCell(m.detection)} | ${String(m.detectionEarliest.k)}/${String(m.detectionEarliest.n)} | ${String(m.regressionWrongSymptom)} | ${String(m.regressionReview)} | ${String(m.regressionInconclusive)} | ${rateCell(m.falseFailBenign)} | ${rateCell(m.falseFailUnchanged)} | ${String(m.review.benign)} / ${String(m.review.unchanged)} | ${String(m.inconclusive.k)}/${String(m.inconclusive.n)} |`);
  }
  L.push("", "## Reliability per leg (attempt level)", "", "| Leg | Attempts | INCONCLUSIVE attempts (Clopper–Pearson 95%) | K1 canaries passed (Clopper–Pearson 95%) |", "|---|---|---|---|");
  for (const r of metrics.reliability) L.push(`| ${r.leg} | ${String(r.attempts)} | ${String(r.inconclusiveAttempts)} (${iv(r.inconclusive)}) | ${String(r.canariesPassed)}/${String(r.canaries)} (${iv(r.canaryPass)}) |`);
  L.push("", "## Paired comparisons (PRD §34)", "");
  L.push("Discordant regression items (x detects, y does not: b; y detects, x does not: c) with the exact McNemar p; and discordant false FAILs on benign and unchanged items.", "");
  L.push("| Comparison | b | c | p | False FAIL b | False FAIL c | p |", "|---|---|---|---|---|---|---|");
  for (const p of metrics.paired) L.push(`| ${p.label} | ${String(p.b)} | ${String(p.c)} | ${p.p.toFixed(3)} | ${String(p.falseB)} | ${String(p.falseC)} | ${p.falseP.toFixed(3)} |`);
  const d = metrics.dCost;
  L.push("", "## Arm D: runtime and retention (H3)", "");
  L.push(`Over ${String(d.items)} items, NVDA AT-segment time per attempt summed over items: C ${(d.cMs / 1000).toFixed(1)} s, D ${(d.dMs / 1000).toFixed(1)} s (${d.cMs === 0 ? "–" : pct(d.dMs / d.cMs)} of C). Triggered steps: ${String(d.triggeredSteps)} of ${String(d.steps)}. D keeps ${String(d.dKeptUnion)} of C's ${String(d.cDetected)} detections under UNION and ${String(d.dKeptAdjudicated)} of ${String(d.cAdjDetected)} under ADJUDICATED. Runtime is estimated from the durations of triggered NVDA segments (HANDOFF §8.4); NVDA start-up and handover are excluded.`, "");
  const ordered = [...scores].sort((a, b) => (a.itemId < b.itemId ? -1 : 1));
  L.push("## Regression items", "", `| Item | Expected | ${ARMS.join(" | ")} |`, `|---|---|${ARMS.map(() => "---").join("|")}|`);
  for (const s of ordered) {
    const it = items.get(s.itemId);
    if (it?.expected.kind !== "regression") continue;
    L.push(`| ${s.itemId} | ${abbrev(it.expected.symptom)} | ${ARMS.map((a) => cell(s, it, a, rules)).join(" | ")} |`);
  }
  L.push("", "## Benign and unchanged items not PASS in every arm", "", `| Item | Kind | ${ARMS.join(" | ")} |`, `|---|---|${ARMS.map(() => "---").join("|")}|`);
  let any = false;
  for (const s of ordered) {
    const it = items.get(s.itemId);
    if (it === undefined || it.expected.kind === "regression") continue;
    if (ARMS.every((a) => s.arms[a].verdict === "PASS")) continue;
    any = true;
    L.push(`| ${s.itemId} | ${it.expected.kind === "benign" ? it.expected.benignType : "unchanged"} | ${ARMS.map((a) => cell(s, it, a, rules)).join(" | ")} |`);
  }
  if (!any) L.push("| (none) | | | | | | | | |");
  L.push("", "## Findings behind each non-PASS verdict", "");
  for (const s of ordered) {
    const fs = s.comparisons.flatMap((c) => c.findings);
    if (fs.length === 0) continue;
    L.push(`- **${s.itemId}**`);
    for (const f of fs) L.push(`  - ${f.family} ${f.verdict}${f.symptom === undefined ? "" : ` ${f.symptom}`} at \`${f.stepId}\` (${f.rule}): ${f.detail.replace(/\|/g, "/")}`);
  }
  L.push("", "## Expectations each family can observe", "", "Per family, journey expectations by result over all items: observable ones pass or fail; \"unobservable\" means the base does not meet the expectation in that family's evidence; \"not judgeable\" means evidence is missing.", "");
  const results = ["pass", "fail", "review", "unobservable", "not-judgeable", "not-run"] as const;
  L.push(`| Family | ${results.join(" | ")} |`, `|---|${results.map(() => "---").join("|")}|`);
  for (const fam of ["B", "B2", "NVDA"] as const) {
    const recs = scores.flatMap((s) => s.comparisons.filter((c) => c.family === fam).flatMap((c) => c.expectations));
    L.push(`| ${fam} | ${results.map((r) => String(recs.filter((x) => x.result === r).length)).join(" | ")} |`);
  }
  L.push("", "## Triggers (Arm D)", "", "| Trigger | Steps it fired on (items × steps) |", "|---|---|");
  for (const t of TRIGGER_IDS) L.push(`| ${t} | ${String(scores.reduce((n, s) => n + (s.triggers ?? []).filter((x) => x.fired.includes(t)).length, 0))} |`);
  const pw = metrics.power;
  L.push("", "## Power table", "", `Patterns needed to estimate a detection rate within ±d (95%), n = z²·p(1 − p)/d², planned with p, or for a dev estimate with its Wilson 95% bound nearest 0.5, since 20 dev patterns cannot pin a rate near 0 or 1. The test split holds ${pw.testRegressionPatterns === null ? "–" : String(pw.testRegressionPatterns)} regression patterns (\`corpus/split.json\`, dropped patterns excluded).`, "");
  L.push(`| Basis | p (dev) | Planning p | ${pw.margins.map((m) => `±${m.toFixed(2)}`).join(" | ")} |`, `|---|---|---|${pw.margins.map(() => "---").join("|")}|`);
  for (const r of pw.rows) L.push(`| ${r.basis} | ${r.p.toFixed(2)} | ${r.planning.toFixed(2)} | ${pw.margins.map((m) => String(r.needed[m.toFixed(2)] ?? "–")).join(" | ")} |`);
  L.push("", "Pairs needed for each paired comparison at α = 0.05 and power 0.8 (Connor 1987), from the dev discordant proportions. With 20 dev patterns these proportions are rough.", "");
  L.push("| Comparison | p10 | p01 | Patterns needed |", "|---|---|---|---|");
  for (const p of pw.paired) L.push(`| ${p.label} | ${p.p10.toFixed(2)} | ${p.p01.toFixed(2)} | ${Number.isFinite(p.needed) ? String(p.needed) : "∞ (no difference)"} |`);
  L.push("", "## Biases and limits", "");
  L.push("- Speech is what NVDA queues plus global cancels, not audio: queued-then-cancelled text counts as spoken, and cancellations inside NVDA's speech manager never reach the relay (R10, DR-0022). This makes ANNOUNCEMENT_DUPLICATED anti-conservative; a duplicate seen only in speech is REVIEW (DR-0042; P36).");
  L.push("- The oracles were developed on this split. Its results show the rules work as written; they are not estimates for the test split.");
  L.push("- Every dev pattern has one regression item, so item-level and pattern-level counts agree; the bootstrap matters for the test split's mixed clusters (P20).");
  L.push("- The tree and B2 tie an announcement's text to a live region read at the step's end or 1 s into its window (DR-0079). A message shown and removed within that second is missed by both.");
  return `${L.join("\n")}\n`;
}

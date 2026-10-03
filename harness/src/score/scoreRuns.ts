/**
 * Scoring downloaded runs (M5): reads every item block below the given run
 * directories, keeps the items of the requested split, scores each in every
 * arm, computes the arm metrics and writes the report (markdown) and the
 * scores (JSON). `cli.ts` imports this module only after the freeze guard has
 * allowed the split (DR-0028), so the guard never loads the scoring code.
 */
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { scoreItem } from "../oracles/arms.ts";
import { itemEvidence, readBlocks, readJourneys } from "../oracles/load.ts";
import { oracleRules } from "../oracles/rules.ts";
import type { CorpusItem } from "../schema/index.ts";
import { CorpusItemSchema } from "../schema/schemas.ts";
import { computeMetrics } from "./armMetrics.ts";
import { renderDevReport } from "./devReport.ts";
import type { Split } from "./freezeGuard.ts";
import { REPO_ROOT } from "./freezeGuard.ts";

export interface ScoreRequest {
  split: Split;
  runs: string[];
  out?: string;
  json?: string;
}

export interface ScoreIo {
  out(line: string): void;
  err(line: string): void;
}

function corpusItems(root: string): Map<string, CorpusItem> {
  const dir = join(root, "corpus/items");
  const out = new Map<string, CorpusItem>();
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".json") || name.includes(" 2.")) continue;
    const it = CorpusItemSchema.parse(JSON.parse(readFileSync(join(dir, name), "utf8")));
    out.set(it.id, it);
  }
  return out;
}

/**
 * Regression patterns assigned to the test split and not dropped
 * (`corpus/split.json`, `corpus/patterns.json`). Test items are built only
 * after M5's power table (P15), so the count comes from the split, not from
 * items. Reading these assignments executes and scores nothing (hard rule 5).
 */
function testRegressionPatterns(root: string): number {
  const split = JSON.parse(readFileSync(join(root, "corpus/split.json"), "utf8")) as { assignments: Record<string, string> };
  const patterns = JSON.parse(readFileSync(join(root, "corpus/patterns.json"), "utf8")) as { patterns: { id: string; stratum: string; status?: string }[] };
  return patterns.patterns.filter((p) => p.stratum.startsWith("regression:") && p.status !== "dropped" && split.assignments[p.id] === "test").length;
}

function headCommit(root: string): string {
  try {
    return execFileSync("git", ["rev-parse", "--short=12", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
}

/** Scores the runs and returns the exit code (0 on success). */
export function scoreRuns(req: ScoreRequest, io: ScoreIo, root: string = REPO_ROOT): number {
  const rules = oracleRules();
  const corpus = corpusItems(root);
  const blocks = readBlocks(req.runs);
  const evidence = itemEvidence(blocks, readJourneys(join(root, "journeys"))).filter((e) => corpus.get(e.item.id)?.split === req.split);
  if (evidence.length === 0) {
    io.err(`no ${req.split}-split item blocks under ${req.runs.join(", ")}`);
    return 2;
  }
  const scores = evidence.map((e) => scoreItem(e, rules));
  const testPatterns = testRegressionPatterns(root);
  const metrics = computeMetrics(scores, corpus, rules, testPatterns);
  const report = renderDevReport(metrics, scores, corpus, rules, { split: req.split, runs: req.runs, harnessCommit: headCommit(root) });
  const first = req.runs[0] ?? ".";
  const out = resolve(req.out ?? join(first, `report-m5-${req.split}.md`));
  const json = resolve(req.json ?? join(first, `report-m5-${req.split}.json`));
  writeFileSync(out, report);
  writeFileSync(json, `${JSON.stringify({ label: "EXPLORATORY", split: req.split, runs: req.runs, metrics, scores: scores.map((s) => ({ itemId: s.itemId, arms: s.arms, triggers: s.triggers, nvdaMs: s.nvdaMs, expectations: s.comparisons.flatMap((c) => c.expectations) })) }, null, 2)}\n`);
  for (const m of metrics.arms) io.out(`${m.arm.padEnd(14)} detection ${String(m.detection.k)}/${String(m.detection.n)}  false FAIL benign ${String(m.falseFailBenign.k)}/${String(m.falseFailBenign.n)}  unchanged ${String(m.falseFailUnchanged.k)}/${String(m.falseFailUnchanged.n)}`);
  io.out(`${String(scores.length)} items scored; report ${out}`);
  return 0;
}

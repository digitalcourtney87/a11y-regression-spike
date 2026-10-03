/**
 * `npm run report:phase0 -- <artefacts dir>`: reads every attempts-*.jsonl and
 * summary-*.json under the directory (as `gh run download` lays them out),
 * prints the Markdown report and writes report.json and report.md next to it
 * (G1, NVDA-present leg), plus report-g2.json and report-g2.md when the
 * directory holds NVDA-absent attempts (G2, B2 signatures).
 */
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { buildReport, renderReport } from "./report.ts";
import type { AttemptRecord, JobSummary } from "./report.ts";
import { buildG2Report, renderG2Report } from "./reportG2.ts";
import type { B2Attempt } from "./reportG2.ts";

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const dir = resolve(process.argv[2] ?? "artefacts");
const files = walk(dir);
const attempts: (AttemptRecord & B2Attempt)[] = files
  .filter((f) => /attempts-.*\.jsonl$/.test(f))
  .flatMap((f) => readFileSync(f, "utf8").split("\n").filter((l) => l.trim() !== "").map((l) => JSON.parse(l) as B2Attempt));
const summaries: JobSummary[] = files.filter((f) => /summary-.*\.json$/.test(f)).map((f) => JSON.parse(readFileSync(f, "utf8")) as JobSummary);

const report = buildReport(attempts, summaries);
const markdown = renderReport(report);
writeFileSync(join(dir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
writeFileSync(join(dir, "report.md"), markdown);
process.stdout.write(markdown);
if (attempts.some((a) => a.leg === "nvda-absent")) {
  const g2 = buildG2Report(attempts);
  const g2Markdown = renderG2Report(g2);
  writeFileSync(join(dir, "report-g2.json"), `${JSON.stringify(g2, null, 2)}\n`);
  writeFileSync(join(dir, "report-g2.md"), g2Markdown);
  process.stdout.write(`\n${g2Markdown}`);
}

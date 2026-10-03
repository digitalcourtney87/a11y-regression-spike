/**
 * `npm run corpus -- validate` checks every corpus item (validate.ts) and
 * prints a summary; it exits non-zero on any error.
 *
 * `npm run corpus -- split --seed <n> --test-fraction <f>` assigns each
 * pattern to dev or test (split.ts), writes `corpus/split.json` with the seed
 * and method, and sets each item's `split` field to match. The test fraction
 * and seed are recorded in docs/DECISIONS.md before the split is run.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { assignSplit } from "./split.ts";
import type { SplitAssignment } from "./split.ts";
import { validateCorpus } from "./validate.ts";
import type { CorpusFiles } from "./validate.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const ITEMS = join(repoRoot, "corpus/items");
const PATCHES = join(repoRoot, "corpus/patches");
const JOURNEYS = join(repoRoot, "journeys");
const SPLIT = join(repoRoot, "corpus/split.json");

function list(dir: string, suffix: string): string[] {
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(suffix)).sort() : [];
}

function readFiles(): CorpusFiles {
  const items = new Map<string, unknown>();
  for (const f of list(ITEMS, ".json")) items.set(f, JSON.parse(readFileSync(join(ITEMS, f), "utf8")) as unknown);
  return {
    items,
    patches: new Set(list(PATCHES, ".patch")),
    journeys: new Set(list(JOURNEYS, ".json").map((f) => f.replace(/\.json$/, ""))),
    split: existsSync(SPLIT) ? (JSON.parse(readFileSync(SPLIT, "utf8")) as SplitAssignment) : null,
  };
}

const [command, ...rest] = process.argv.slice(2);
const files = readFiles();

if (command === "validate") {
  const report = validateCorpus(files);
  process.stdout.write(`${JSON.stringify(report.summary, null, 2)}\n`);
  for (const w of report.warnings) process.stdout.write(`warning: ${w}\n`);
  for (const e of report.errors) process.stderr.write(`error: ${e}\n`);
  if (report.errors.length > 0) process.exitCode = 1;
} else if (command === "split") {
  const { values } = parseArgs({ args: rest, options: { seed: { type: "string" }, "test-fraction": { type: "string" } } });
  if (values.seed === undefined || values["test-fraction"] === undefined) throw new Error("split needs --seed and --test-fraction");
  const report = validateCorpus({ ...files, split: null });
  if (report.errors.length > 0) {
    for (const e of report.errors) process.stderr.write(`error: ${e}\n`);
    throw new Error("fix the corpus errors before splitting");
  }
  const assignment = assignSplit(report.strata, Number(values.seed), Number(values["test-fraction"]));
  writeFileSync(SPLIT, `${JSON.stringify(assignment, null, 2)}\n`);
  for (const item of report.valid) {
    const split = assignment.assignments[item.patternId];
    if (split !== undefined && split !== item.split) writeFileSync(join(ITEMS, `${item.id}.json`), `${JSON.stringify({ ...item, split }, null, 2)}\n`);
  }
  process.stdout.write(`${JSON.stringify(assignment.strata, null, 2)}\n`);
} else {
  process.stderr.write("usage: npm run corpus -- validate | split --seed <n> --test-fraction <f>\n");
  process.exitCode = 2;
}

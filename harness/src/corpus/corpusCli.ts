/**
 * `npm run corpus -- validate` checks every corpus item (validate.ts) and
 * prints a summary; it exits non-zero on any error.
 *
 * `npm run corpus -- mutate` turns every spec in `corpus/specs/` into its
 * patch and corpus item (mutate.ts), checking that each patch applies to the
 * current base with `git apply --check`.
 *
 * `npm run corpus -- split --seed <n> --test-fraction <f>` assigns each
 * pattern to dev or test (split.ts), writes `corpus/split.json` with the seed
 * and method, and sets each item's `split` field to match. The test fraction
 * and seed are recorded in docs/DECISIONS.md before the split is run.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { applyEdits, itemFromSpec, MutationSpecSchema } from "./mutate.ts";
import type { MutationSpec } from "./mutate.ts";
import { assignSplit } from "./split.ts";
import type { SplitAssignment } from "./split.ts";
import { validateCorpus } from "./validate.ts";
import type { CorpusFiles } from "./validate.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const ITEMS = join(repoRoot, "corpus/items");
const PATCHES = join(repoRoot, "corpus/patches");
const JOURNEYS = join(repoRoot, "journeys");
const SPLIT = join(repoRoot, "corpus/split.json");
const SPECS = join(repoRoot, "corpus/specs");
const SPA_ROOT = "fixtures/spa/atomic-crm";

/** Writes the patch for one spec (paths relative to the repository root) and returns it. */
function patchFor(spec: MutationSpec): string {
  const work = mkdtempSync(join(tmpdir(), "corpus-mutate-"));
  try {
    const byFile = new Map<string, MutationSpec["edits"]>();
    for (const edit of spec.edits) byFile.set(edit.file, [...(byFile.get(edit.file) ?? []), edit]);
    for (const [file, edits] of byFile) {
      const rel = `${SPA_ROOT}/${file}`;
      const text = readFileSync(join(repoRoot, rel), "utf8");
      for (const [side, content] of [["orig", text], ["mut", applyEdits(text, edits, rel)]] as const) {
        mkdirSync(dirname(join(work, side, rel)), { recursive: true });
        writeFileSync(join(work, side, rel), content);
      }
    }
    let diff = "";
    try {
      execFileSync("git", ["diff", "--no-index", "--src-prefix=a/", "--dst-prefix=b/", "orig", "mut"], { cwd: work, encoding: "utf8" });
    } catch (error) {
      // git diff --no-index exits 1 when the trees differ; its output is the patch.
      diff = (error as { stdout?: string }).stdout ?? "";
    }
    if (diff === "") throw new Error(`${spec.id}: the edits produce no difference`);
    return diff.replaceAll("a/orig/", "a/").replaceAll("b/mut/", "b/");
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

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
} else if (command === "mutate") {
  const baseCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", SPA_ROOT], { cwd: repoRoot, encoding: "utf8" }).trim();
  for (const file of list(SPECS, ".json")) {
    const spec = MutationSpecSchema.parse(JSON.parse(readFileSync(join(SPECS, file), "utf8")));
    if (`${spec.id}.json` !== file) throw new Error(`${file}: id "${spec.id}" must match the file name`);
    const patchPath = join(PATCHES, `${spec.id}.patch`);
    writeFileSync(patchPath, patchFor(spec));
    execFileSync("git", ["apply", "--check", patchPath], { cwd: repoRoot });
    const split = files.split?.assignments[spec.patternId] ?? "dev";
    writeFileSync(join(ITEMS, `${spec.id}.json`), `${JSON.stringify(itemFromSpec(spec, `atomic-crm@${baseCommit}`, split), null, 2)}\n`);
    process.stdout.write(`${spec.id}: patch and item written (${spec.operator})\n`);
  }
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
  process.stderr.write("usage: npm run corpus -- validate | mutate | split --seed <n> --test-fraction <f>\n");
  process.exitCode = 2;
}

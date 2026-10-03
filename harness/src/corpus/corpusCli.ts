/**
 * `npm run corpus -- validate` checks every corpus item (validate.ts) and
 * prints a summary; it exits non-zero on any error.
 *
 * `npm run corpus -- mutate` turns every spec in `corpus/specs/` into its
 * patch and corpus item (mutate.ts), checking that each patch applies to the
 * current base with `git apply --check`.
 *
 * `npm run corpus -- plan spa-regression` adds the planned SPA regression
 * patterns to `corpus/patterns.json` (patterns.ts).
 *
 * `npm run corpus -- split --batch <name> --seed <n> --test-fraction <f>`
 * splits one batch of planned (not dropped) patterns into dev and test
 * (split.ts), adding it to `corpus/split.json` without changing any earlier
 * assignment. The seed and fraction are owner decisions (P15) and are recorded
 * in docs/DECISIONS.md before the split is run.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";

import { applyEdits, itemFromSpec, MutationSpecSchema } from "./mutate.ts";
import type { MutationSpec } from "./mutate.ts";
import { addPatterns, PatternRegistrySchema, planSpaRegressionPatterns } from "./patterns.ts";
import type { PatternRegistry } from "./patterns.ts";
import { addBatch } from "./split.ts";
import type { SplitAssignment } from "./split.ts";
import { validateCorpus } from "./validate.ts";
import type { CorpusFiles } from "./validate.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const ITEMS = join(repoRoot, "corpus/items");
const PATCHES = join(repoRoot, "corpus/patches");
const JOURNEYS = join(repoRoot, "journeys");
const SPLIT = join(repoRoot, "corpus/split.json");
const SPECS = join(repoRoot, "corpus/specs");
const PATTERNS = join(repoRoot, "corpus/patterns.json");

function readRegistry(): PatternRegistry | null {
  return existsSync(PATTERNS) ? PatternRegistrySchema.parse(JSON.parse(readFileSync(PATTERNS, "utf8"))) : null;
}

/** Writes the patch for one spec (paths relative to the repository root) and returns it. */
function patchFor(spec: MutationSpec): string {
  const work = mkdtempSync(join(tmpdir(), "corpus-mutate-"));
  try {
    const byFile = new Map<string, MutationSpec["edits"]>();
    for (const edit of spec.edits) byFile.set(edit.file, [...(byFile.get(edit.file) ?? []), edit]);
    for (const [file, edits] of byFile) {
      const rel = `fixtures/spa/${spec.app}/${file}`;
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
    patterns: readRegistry(),
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
  for (const file of list(SPECS, ".json")) {
    const spec = MutationSpecSchema.parse(JSON.parse(readFileSync(join(SPECS, file), "utf8")));
    if (`${spec.id}.json` !== file) throw new Error(`${file}: id "${spec.id}" must match the file name`);
    const planned = files.patterns?.patterns.find((p) => p.id === spec.patternId);
    if (planned?.status !== "planned" || planned.operator !== spec.operator || planned.context !== spec.app) throw new Error(`${file}: pattern "${spec.patternId}" is not a planned ${spec.app} pattern for operator ${spec.operator}`);
    if (files.split?.assignments[spec.patternId] !== "dev") throw new Error(`${file}: pattern "${spec.patternId}" is not in the dev split; test patterns are not built in M3 (P15)`);
    const baseCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", `fixtures/spa/${spec.app}`], { cwd: repoRoot, encoding: "utf8" }).trim();
    const patchPath = join(PATCHES, `${spec.id}.patch`);
    writeFileSync(patchPath, patchFor(spec));
    execFileSync("git", ["apply", "--check", patchPath], { cwd: repoRoot });
    writeFileSync(join(ITEMS, `${spec.id}.json`), `${JSON.stringify(itemFromSpec(spec, `${spec.app}@${baseCommit}`, "dev"), null, 2)}\n`);
    process.stdout.write(`${spec.id}: patch and item written (${spec.operator})\n`);
  }
} else if (command === "plan") {
  const [batch] = rest;
  if (batch !== "spa-regression") throw new Error("plan supports: spa-regression");
  writeFileSync(PATTERNS, `${JSON.stringify(addPatterns(files.patterns ?? null, planSpaRegressionPatterns(batch)), null, 2)}\n`);
  process.stdout.write(`planned batch ${batch}\n`);
} else if (command === "split") {
  const { values } = parseArgs({ args: rest, options: { batch: { type: "string" }, seed: { type: "string" }, "test-fraction": { type: "string" } } });
  if (values.batch === undefined || values.seed === undefined || values["test-fraction"] === undefined) throw new Error("split needs --batch, --seed and --test-fraction");
  const batch = values.batch;
  const planned = (files.patterns?.patterns ?? []).filter((p) => p.batch === batch && p.status === "planned");
  if (planned.length === 0) throw new Error(`no planned patterns in batch "${batch}"`);
  const assignment = addBatch(files.split, batch, new Map(planned.map((p) => [p.id, p.stratum])), Number(values.seed), Number(values["test-fraction"]));
  writeFileSync(SPLIT, `${JSON.stringify(assignment, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify(assignment.batches.at(-1), null, 2)}\n`);
} else {
  process.stderr.write("usage: npm run corpus -- validate | mutate | plan <batch> | split --batch <name> --seed <n> --test-fraction <f>\n");
  process.exitCode = 2;
}

/**
 * `npm run corpus -- validate` checks every corpus item (validate.ts) and
 * prints a summary; it exits non-zero on any error.
 *
 * `npm run corpus -- mutate` turns every spec in `corpus/specs/` into its
 * patch and corpus item (mutate.ts), in its pattern's split, checking that
 * each patch applies to the current base with `git apply --check`. Test
 * patterns are built only after M5's power table (P15, P37); building one
 * executes nothing (hard rule 5).
 *
 * `npm run corpus -- oss-items` writes the version-pair regression item of
 * each assigned pattern of the `oss-regression` batch, in its split (oss.ts;
 * DR-0064; test patterns from P37).
 *
 * `npm run corpus -- unchanged` writes one unchanged control per journey of
 * the corpus items (P15; DR-0066): `<journey>-unchanged`, base against base,
 * in the pattern and split of the journey's first regression item (by id).
 *
 * `npm run corpus -- plan spa-regression` adds the planned SPA regression
 * patterns to `corpus/patterns.json` (patterns.ts); `plan oss-regression`
 * adds one pattern per verified mined pair in `corpus/oss-candidates.json`
 * (oss.ts).
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

import { operatorById } from "./catalogue.ts";
import { CorpusItemSchema } from "../schema/schemas.ts";
import type { CorpusItem } from "../schema/index.ts";
import { applyEdits, appDir, isSpaApp, itemFromSpec, MutationSpecSchema } from "./mutate.ts";
import type { MutationSpec } from "./mutate.ts";
import { itemFromOssCandidate, OssCandidatesSchema, planOssRegressionPatterns } from "./oss.ts";
import { addPatterns, PatternRegistrySchema, planSpaRegressionPatterns } from "./patterns.ts";
import type { PatternRegistry } from "./patterns.ts";
import { addBatch } from "./split.ts";
import type { SplitAssignment } from "./split.ts";
import { checkJourneys } from "../runner/journeys.ts";
import { SETUP_NAMES } from "../runner/setups.ts";
import { validateCorpus } from "./validate.ts";
import type { CorpusFiles } from "./validate.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const ITEMS = join(repoRoot, "corpus/items");
const PATCHES = join(repoRoot, "corpus/patches");
const JOURNEYS = join(repoRoot, "journeys");
const SPLIT = join(repoRoot, "corpus/split.json");
const SPECS = join(repoRoot, "corpus/specs");
const PATTERNS = join(repoRoot, "corpus/patterns.json");
const OSS_CANDIDATES = join(repoRoot, "corpus/oss-candidates.json");

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
      const rel = `${appDir(spec.app)}/${file}`;
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
  // Sync conflict copies ("name 2.json", see .gitignore) are never corpus files.
  return existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith(suffix) && !f.includes(" 2.")).sort() : [];
}

function readJourneys(): Map<string, unknown> {
  const files = new Map<string, unknown>();
  for (const f of list(JOURNEYS, ".json")) files.set(f, JSON.parse(readFileSync(join(JOURNEYS, f), "utf8")) as unknown);
  return files;
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
  const journeyErrors = checkJourneys(readJourneys(), report.valid, SETUP_NAMES).errors;
  for (const e of journeyErrors) process.stderr.write(`error: ${e}\n`);
  if (report.errors.length > 0 || journeyErrors.length > 0) process.exitCode = 1;
} else if (command === "mutate") {
  for (const file of list(SPECS, ".json")) {
    const spec = MutationSpecSchema.parse(JSON.parse(readFileSync(join(SPECS, file), "utf8")));
    if (`${spec.id}.json` !== file) throw new Error(`${file}: id "${spec.id}" must match the file name`);
    const planned = files.patterns?.patterns.find((p) => p.id === spec.patternId);
    if (spec.twinOf !== undefined && operatorById(spec.operator)?.kind !== "benign") throw new Error(`${file}: a twin needs a benign operator, not ${spec.operator}`);
    let baseRef: string;
    let licence: string | undefined;
    if (isSpaApp(spec.app)) {
      const twin = spec.twinOf === undefined ? null : MutationSpecSchema.parse(JSON.parse(readFileSync(join(SPECS, `${spec.twinOf}.json`), "utf8")));
      // A benign twin (P20): a benign operator on the same pattern, app and journey as its regression spec.
      if (twin !== null && (twin.patternId !== spec.patternId || twin.app !== spec.app || twin.journeyId !== spec.journeyId)) throw new Error(`${file}: a twin shares its regression spec's pattern, app and journey`);
      const expectedOperator = twin === null ? spec.operator : twin.operator;
      if (planned?.status !== "planned" || planned.operator !== expectedOperator || planned.context !== spec.app) throw new Error(`${file}: pattern "${spec.patternId}" is not a planned ${spec.app} pattern for operator ${expectedOperator}`);
      baseRef = `${spec.app}@${execFileSync("git", ["log", "-1", "--format=%H", "--", appDir(spec.app)], { cwd: repoRoot, encoding: "utf8" }).trim()}`;
    } else {
      // A mined pair's regression is a version pair, so a spec on its fixture is only ever a benign twin (DR-0064),
      // on the regression item's base: same pattern, app and journey.
      if (spec.twinOf === undefined) throw new Error(`${file}: a spec on a mined pair's fixture must be a benign twin (twinOf its regression item)`);
      const regression = CorpusItemSchema.parse(JSON.parse(readFileSync(join(ITEMS, `${spec.twinOf}.json`), "utf8")));
      if (regression.source !== "oss-history" || regression.patternId !== spec.patternId || regression.app !== spec.app || regression.journeyId !== spec.journeyId) throw new Error(`${file}: a twin shares its regression item's pattern, app and journey`);
      if (planned?.status !== "planned" || planned.batch !== "oss-regression" || planned.id !== `oss--${spec.app.slice("oss/".length)}`) throw new Error(`${file}: pattern "${spec.patternId}" is not the planned pattern of ${spec.app}`);
      baseRef = regression.base.ref;
      licence = regression.provenance.licence;
    }
    // Test patterns are built after M5's power table (P15, P37), in the split their pattern was assigned.
    const split = files.split?.assignments[spec.patternId];
    if (split !== "dev" && split !== "test") throw new Error(`${file}: pattern "${spec.patternId}" has no split assignment`);
    const patchPath = join(PATCHES, `${spec.id}.patch`);
    writeFileSync(patchPath, patchFor(spec));
    execFileSync("git", ["apply", "--check", patchPath], { cwd: repoRoot });
    writeFileSync(join(ITEMS, `${spec.id}.json`), `${JSON.stringify(itemFromSpec(spec, baseRef, split, licence), null, 2)}\n`);
    process.stdout.write(`${spec.id}: patch and item written (${spec.operator})\n`);
  }
} else if (command === "unchanged") {
  const items = validateCorpus(files).valid;
  const journeyIds = [...new Set(items.filter((i) => i.expected.kind !== "unchanged").map((i) => i.journeyId))].sort();
  for (const journeyId of journeyIds) {
    const first = items.filter((i) => i.journeyId === journeyId && i.expected.kind === "regression").sort((a, b) => (a.id < b.id ? -1 : 1))[0];
    if (first === undefined) throw new Error(`journey ${journeyId}: no regression item`);
    const item: CorpusItem = {
      id: `${journeyId}-unchanged`,
      patternId: first.patternId,
      split: first.split,
      source: first.source,
      app: first.app,
      journeyId,
      base: { ref: first.base.ref },
      candidate: { ref: first.base.ref },
      expected: { kind: "unchanged" },
      provenance: { origin: `unchanged control for journey ${journeyId} (P15)`, ...(first.provenance.licence === undefined ? {} : { licence: first.provenance.licence }) },
    };
    writeFileSync(join(ITEMS, `${item.id}.json`), `${JSON.stringify(item, null, 2)}\n`);
    process.stdout.write(`${item.id}: unchanged control in pattern ${item.patternId} (${item.split})\n`);
  }
} else if (command === "oss-items") {
  // The regression item of each assigned pattern of the oss-regression batch (DR-0064), in its split (test patterns from P37).
  const registry = OssCandidatesSchema.parse(JSON.parse(readFileSync(OSS_CANDIDATES, "utf8")));
  for (const pattern of (files.patterns?.patterns ?? []).filter((p) => p.batch === "oss-regression" && p.status === "planned")) {
    const split = files.split?.assignments[pattern.id];
    if (split !== "dev" && split !== "test") continue;
    const candidate = registry.candidates.find((c) => `oss--${c.id}` === pattern.id);
    if (candidate === undefined) throw new Error(`${pattern.id}: no candidate in corpus/oss-candidates.json`);
    const fixtureCommit = execFileSync("git", ["log", "-1", "--format=%H", "--", `fixtures/oss/${candidate.id}`], { cwd: repoRoot, encoding: "utf8" }).trim();
    if (fixtureCommit === "") throw new Error(`${candidate.id}: fixtures/oss/${candidate.id} is not committed`);
    const item = itemFromOssCandidate(candidate, fixtureCommit, split);
    writeFileSync(join(ITEMS, `${item.id}.json`), `${JSON.stringify(item, null, 2)}\n`);
    process.stdout.write(`${item.id}: item written (${candidate.package} ${String(candidate.good)} to ${String(candidate.broken)})\n`);
  }
} else if (command === "plan") {
  const [batch] = rest;
  let patterns;
  if (batch === "spa-regression") patterns = planSpaRegressionPatterns(batch);
  else if (batch === "oss-regression") patterns = planOssRegressionPatterns(OssCandidatesSchema.parse(JSON.parse(readFileSync(OSS_CANDIDATES, "utf8"))), batch);
  else throw new Error("plan supports: spa-regression, oss-regression");
  writeFileSync(PATTERNS, `${JSON.stringify(addPatterns(files.patterns ?? null, patterns), null, 2)}\n`);
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
  process.stderr.write("usage: npm run corpus -- validate | mutate | oss-items | unchanged | plan <batch> | split --batch <name> --seed <n> --test-fraction <f>\n");
  process.exitCode = 2;
}

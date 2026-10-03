/**
 * Corpus validation (HANDOFF §10.2, R1, R5; DR-0056). Pure: it takes the item
 * files' contents and the names of the patch and journey files, and returns
 * errors (the corpus is not usable), warnings (expected while M3 is under way)
 * and a summary. `corpusCli.ts` reads the files.
 *
 * Errors: a file that fails `CorpusItemSchema`; an id that does not match its
 * file name; a duplicate id; a candidate with neither or both of `ref` and
 * `patch`; a patch that does not exist; items of one pattern in different
 * splits; an item whose split differs from `corpus/split.json`; a pattern
 * missing from split.json once it exists.
 * Warnings: a journey that does not exist yet (journeys come in M4).
 */
import { CorpusItemSchema } from "../schema/schemas.ts";
import type { CorpusItem } from "../schema/index.ts";
import { expectedClass, patternStratum } from "./split.ts";
import type { SplitAssignment } from "./split.ts";

export interface CorpusFiles {
  /** File name (e.g. "a1.json") → parsed JSON content. */
  items: ReadonlyMap<string, unknown>;
  /** Names of files in corpus/patches. */
  patches: ReadonlySet<string>;
  /** Journey ids that exist (file names in journeys/ without ".json"). */
  journeys: ReadonlySet<string>;
  split: SplitAssignment | null;
}

export interface CorpusSummary {
  items: number;
  patterns: number;
  bySplit: Record<string, { items: number; patterns: number; regression: number; benign: number; unchanged: number }>;
  byClass: Record<string, number>;
  bySource: Record<string, number>;
}

export interface CorpusReport {
  errors: string[];
  warnings: string[];
  summary: CorpusSummary;
  /** patternId → stratum, for `assignSplit`. */
  strata: Map<string, string>;
  valid: CorpusItem[];
}

export function validateCorpus(files: CorpusFiles): CorpusReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const valid: CorpusItem[] = [];
  const seen = new Set<string>();
  for (const [file, content] of [...files.items.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    const parsed = CorpusItemSchema.safeParse(content);
    if (!parsed.success) {
      errors.push(`${file}: ${parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
      continue;
    }
    const item = parsed.data;
    if (`${item.id}.json` !== file) errors.push(`${file}: id "${item.id}" must match the file name`);
    if (seen.has(item.id)) errors.push(`${file}: duplicate id "${item.id}"`);
    seen.add(item.id);
    const hasRef = item.candidate.ref !== undefined;
    const hasPatch = item.candidate.patch !== undefined;
    if (hasRef === hasPatch) errors.push(`${file}: candidate needs exactly one of ref and patch`);
    if (item.candidate.patch !== undefined && !files.patches.has(item.candidate.patch)) errors.push(`${file}: patch "${item.candidate.patch}" not found in corpus/patches`);
    if (!files.journeys.has(item.journeyId)) warnings.push(`${file}: journey "${item.journeyId}" not found in journeys/ (expected until M4)`);
    valid.push(item);
  }

  const byPattern = new Map<string, CorpusItem[]>();
  for (const item of valid) byPattern.set(item.patternId, [...(byPattern.get(item.patternId) ?? []), item]);
  const strata = new Map<string, string>();
  for (const [patternId, items] of [...byPattern.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    strata.set(patternId, patternStratum(items));
    const splits = new Set(items.map((i) => i.split));
    if (splits.size > 1) errors.push(`pattern "${patternId}": items are in both splits (${items.map((i) => `${i.id}=${i.split}`).join(", ")})`);
    if (files.split !== null) {
      const assigned = files.split.assignments[patternId];
      if (assigned === undefined) errors.push(`pattern "${patternId}": missing from corpus/split.json`);
      else for (const i of items) if (i.split !== assigned) errors.push(`${i.id}.json: split "${i.split}" differs from corpus/split.json ("${assigned}")`);
    }
  }

  const bySplit: CorpusSummary["bySplit"] = {};
  const byClass: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  for (const split of ["dev", "test"] as const) {
    const items = valid.filter((i) => i.split === split);
    bySplit[split] = {
      items: items.length,
      patterns: new Set(items.map((i) => i.patternId)).size,
      regression: items.filter((i) => i.expected.kind === "regression").length,
      benign: items.filter((i) => i.expected.kind === "benign").length,
      unchanged: items.filter((i) => i.expected.kind === "unchanged").length,
    };
  }
  for (const item of valid) {
    byClass[expectedClass(item)] = (byClass[expectedClass(item)] ?? 0) + 1;
    bySource[item.source] = (bySource[item.source] ?? 0) + 1;
  }
  return { errors, warnings, summary: { items: valid.length, patterns: byPattern.size, bySplit, byClass, bySource }, strata, valid };
}

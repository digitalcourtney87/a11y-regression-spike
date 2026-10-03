/**
 * Mined open-source pairs (DR-0062, DR-0063). `corpus/oss-candidates.json`
 * records every candidate the mining pass kept, with its documentary and
 * reproduction checks, and every rejection with its reason. A candidate that
 * passed both checks is one pattern of the `oss-regression` batch: its
 * context is the library and issue, its stratum is its symptom, and its
 * operator is the catalogue mechanism it matches, or "mined" when no
 * catalogue mechanism describes it (the mechanism is metadata; the symptom is
 * the scored unit, R2).
 *
 * A dev pattern's regression item is a version pair (DR-0064): app
 * "oss/<id>" (the fixture in `fixtures/oss/<id>`), base = the fixture built
 * against the last good release, candidate = the same fixture built against
 * the first broken one. Its benign twin is a mutation spec on the fixture at
 * the last good release (mutate.ts).
 */
import { z } from "zod";

import type { CorpusItem } from "../schema/index.ts";
import { SymptomSchema } from "../schema/schemas.ts";
import { REGRESSION_OPERATORS } from "./catalogue.ts";
import type { PlannedPattern } from "./patterns.ts";

/** The operator of a mined pair that matches no catalogue mechanism. */
export const MINED_OPERATOR = "mined";

export const ReproductionSchema = z.strictObject({
  /** The m3-oss-repro run the result comes from. */
  run: z.number().int().positive(),
  /** Whether the check held on the last-good release and failed on the first broken one, driven as the issue describes. */
  pointer: z.boolean(),
  /** The same, driven from the keyboard; a pair enters the corpus only if this is true. */
  keyboard: z.boolean(),
});

export const OssCandidateSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  repo: z.string().regex(/^[\w.-]+\/[\w.-]+$/),
  refs: z.array(z.string()).min(1),
  stack: z.enum(["react", "vanilla", "web-components", "vue"]),
  package: z.string().min(1),
  /** The package's SPDX licence, from npm (DR-0062 requires a permissive one). */
  licence: z.enum(["MIT", "Apache-2.0", "BSD-2-Clause", "BSD-3-Clause", "ISC"]),
  good: z.string().nullable(),
  broken: z.string().nullable(),
  fixed: z.string().nullable(),
  symptom: SymptomSchema,
  documentary: z.enum(["accept", "pending"]),
  operator: z.string().optional(),
  reproduction: ReproductionSchema.optional(),
  note: z.string().min(1),
});

export const OssCandidatesSchema = z.strictObject({
  label: z.literal("EXPLORATORY"),
  method: z.string(),
  candidates: z.array(OssCandidateSchema),
  rejected: z.array(z.strictObject({ id: z.string(), reason: z.string().min(1) })),
});

export type OssCandidate = z.infer<typeof OssCandidateSchema>;
export type OssCandidates = z.infer<typeof OssCandidatesSchema>;

/** Whether a candidate passed both checks (DR-0062) and the keyboard rule (DR-0063). */
export function isVerified(c: OssCandidate): boolean {
  return c.documentary === "accept" && c.good !== null && c.broken !== null && c.reproduction?.keyboard === true;
}

/** One planned pattern per verified candidate; refuses an operator that is neither "mined" nor a catalogue mechanism for that symptom in an open-source context. */
export function planOssRegressionPatterns(registry: OssCandidates, batch = "oss-regression"): PlannedPattern[] {
  return registry.candidates.filter(isVerified).map((c) => {
    const operator = c.operator ?? MINED_OPERATOR;
    if (operator !== MINED_OPERATOR) {
      const op = REGRESSION_OPERATORS.find((o) => o.id === operator);
      if (op === undefined || op.symptom !== c.symptom || !op.contexts.includes("oss")) throw new Error(`${c.id}: operator "${operator}" is not an open-source mechanism for ${c.symptom}`);
    }
    const issue = /#(\d+)/.exec(c.refs[0] ?? "")?.[1];
    if (issue === undefined) throw new Error(`${c.id}: its first ref must name the issue or pull request (#n)`);
    return {
      id: `oss--${c.id}`,
      batch,
      context: `oss:${c.repo}#${issue}`,
      operator,
      stratum: `regression:${c.symptom}`,
      status: "planned" as const,
      note: `${c.package} ${String(c.good)} to ${String(c.broken)}: ${c.note}`,
    };
  });
}

/** The journey of a mined pair's fixture: one per fixture (journeys come in M4). */
export function ossJourneyId(id: string): string {
  return `oss-${id}`;
}

/** "oss/<id>@<fixture commit>+<package>@<version>": the fixture at a commit, built against one release. */
export function ossRef(id: string, fixtureCommit: string, pkg: string, version: string): string {
  return `oss/${id}@${fixtureCommit}+${pkg}@${version}`;
}

export function parseOssRef(ref: string): { app: string; fixtureCommit: string; package: string; version: string } | null {
  const m = /^(oss\/[a-z0-9][a-z0-9-]*)@([0-9a-f]{40})\+(.+)@([^@]+)$/.exec(ref);
  return m === null ? null : { app: m[1] ?? "", fixtureCommit: m[2] ?? "", package: m[3] ?? "", version: m[4] ?? "" };
}

/** The regression item of a verified pair: the fixture at the last good release against the first broken one. */
export function itemFromOssCandidate(c: OssCandidate, fixtureCommit: string, split: "dev" | "test"): CorpusItem {
  if (!isVerified(c) || c.good === null || c.broken === null || c.reproduction === undefined) throw new Error(`${c.id}: not a verified pair`);
  const operator = c.operator ?? MINED_OPERATOR;
  const op = REGRESSION_OPERATORS.find((o) => o.id === operator);
  const mechanism = op === undefined ? `${MINED_OPERATOR}: ${c.note}` : `${op.id}: ${op.mechanism} (${c.note})`;
  const issue = /#(\d+)/.exec(c.refs[0] ?? "")?.[1];
  if (issue === undefined) throw new Error(`${c.id}: its first ref must name the issue or pull request (#n)`);
  return {
    id: `oss-${c.id}`,
    patternId: `oss--${c.id}`,
    split,
    source: "oss-history",
    app: `oss/${c.id}`,
    journeyId: ossJourneyId(c.id),
    base: { ref: ossRef(c.id, fixtureCommit, c.package, c.good) },
    candidate: { ref: ossRef(c.id, fixtureCommit, c.package, c.broken) },
    expected: { kind: "regression", symptom: c.symptom, mechanism },
    provenance: {
      origin: `mined from ${c.repo} (${c.refs.join(", ")}); verified by m3-oss-repro run ${String(c.reproduction.run)} (DR-0063)`,
      licence: `${c.licence} (${c.package})`,
      url: `https://github.com/${c.repo}/issues/${issue}`,
    },
  };
}

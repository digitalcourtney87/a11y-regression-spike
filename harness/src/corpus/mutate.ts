/**
 * Mutation specs for seeded items (HANDOFF §9 M3; corpus plan §6). A spec in
 * `corpus/specs/<item id>.json` names a catalogue operator and the exact edits
 * that realise it in one vendored SPA (`fixtures/spa/<app>`), or, for the
 * benign twin of a mined pair, in that pair's fixture (`fixtures/oss/<id>`,
 * app "oss/<id>"; DR-0064); `npm run corpus -- mutate` turns it into
 * `corpus/patches/<item id>.patch` and `corpus/items/<item id>.json`.
 *
 * Edits are anchored: each `find` must occur in its file exactly once, or
 * the given `occurrence` (1-based) is replaced, so a spec fails loudly instead
 * of mutating the wrong place when the base changes.
 */
import { z } from "zod";

import type { CorpusItem } from "../schema/index.ts";
import { operatorById } from "./catalogue.ts";
import { SPA_APPS } from "./patterns.ts";

const LICENCES: Record<(typeof SPA_APPS)[number], string> = {
  "atomic-crm": "MIT (Atomic CRM, marmelab/atomic-crm)",
  "react-admin-simple": "MIT (react-admin, marmelab/react-admin)",
};

export const EditSchema = z.strictObject({
  /** Path relative to the SPA root (e.g. "src/components/ui/dialog.tsx"). */
  file: z.string().min(1),
  find: z.string().min(1),
  replace: z.string(),
  /** 1-based; required when `find` occurs more than once. */
  occurrence: z.number().int().min(1).optional(),
});

/** An SPA app, or "oss/<fixture id>" for a mined pair's fixture. */
export const AppSchema = z.union([z.enum(SPA_APPS), z.string().regex(/^oss\/[a-z0-9][a-z0-9-]*$/)]);

export type App = z.infer<typeof AppSchema>;

export function isSpaApp(app: string): app is (typeof SPA_APPS)[number] {
  return (SPA_APPS as readonly string[]).includes(app);
}

/** The app's directory, relative to the repository root. */
export function appDir(app: App): string {
  return isSpaApp(app) ? `fixtures/spa/${app}` : `fixtures/${app}`;
}

export const MutationSpecSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  patternId: z.string().min(1),
  operator: z.string().min(1),
  app: AppSchema,
  journeyId: z.string().min(1),
  /** Where in the app the mechanism applies, for people reading the corpus. */
  target: z.string().min(1),
  edits: z.array(EditSchema).min(1),
  repetitions: z.number().int().min(1).optional(),
  /**
   * A benign twin (P20, DR-0061) names the regression it is paired with, and
   * shares its pattern and journey: a regression spec for an SPA, or the
   * mined pair's regression item for an "oss/<id>" app.
   */
  twinOf: z.string().optional(),
});

export type Edit = z.infer<typeof EditSchema>;
export type MutationSpec = z.infer<typeof MutationSpecSchema>;

/** Applies anchored edits to one file's text; throws when an anchor is missing or ambiguous. */
export function applyEdits(text: string, edits: readonly Pick<Edit, "find" | "replace" | "occurrence">[], file = "file"): string {
  let out = text;
  for (const edit of edits) {
    const positions: number[] = [];
    for (let i = out.indexOf(edit.find); i >= 0; i = out.indexOf(edit.find, i + 1)) positions.push(i);
    if (positions.length === 0) throw new Error(`${file}: anchor not found: ${JSON.stringify(edit.find.slice(0, 80))}`);
    if (edit.occurrence === undefined && positions.length > 1) throw new Error(`${file}: anchor occurs ${String(positions.length)} times; give an occurrence: ${JSON.stringify(edit.find.slice(0, 80))}`);
    const at = positions[(edit.occurrence ?? 1) - 1];
    if (at === undefined) throw new Error(`${file}: occurrence ${String(edit.occurrence)} of ${String(positions.length)} not found`);
    out = out.slice(0, at) + edit.replace + out.slice(at + edit.find.length);
  }
  if (out === text) throw new Error(`${file}: the edits change nothing`);
  return out;
}

/** The corpus item a spec produces (seeded; candidate = the generated patch). An "oss/<id>" app needs the library's licence. */
export function itemFromSpec(spec: MutationSpec, baseRef: string, split: "dev" | "test", licence?: string): CorpusItem {
  const operator = operatorById(spec.operator);
  if (operator === undefined) throw new Error(`${spec.id}: unknown operator "${spec.operator}"`);
  const expected: CorpusItem["expected"] =
    operator.kind === "regression" ? { kind: "regression", symptom: operator.symptom, mechanism: `${operator.id}: ${operator.mechanism} (${spec.target})` } : { kind: "benign", benignType: operator.benignType };
  return {
    id: spec.id,
    patternId: spec.patternId,
    split,
    source: "seeded",
    app: spec.app,
    journeyId: spec.journeyId,
    base: { ref: baseRef },
    candidate: { patch: `${spec.id}.patch` },
    expected,
    ...(spec.repetitions === undefined ? {} : { repetitions: spec.repetitions }),
    provenance: { origin: `seeded by Claude with operator ${operator.id}`, licence: licenceFor(spec.app, licence) },
  };
}

function licenceFor(app: App, licence: string | undefined): string {
  if (licence !== undefined) return licence;
  if (isSpaApp(app)) return LICENCES[app];
  throw new Error(`${app}: a mined pair's fixture needs its library's licence`);
}

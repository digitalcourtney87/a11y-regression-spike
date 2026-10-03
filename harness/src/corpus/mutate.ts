/**
 * Mutation specs for seeded items (HANDOFF §9 M3; corpus plan §6). A spec in
 * `corpus/specs/<item id>.json` names a catalogue operator and the exact edits
 * that realise it in the vendored SPA; `npm run corpus -- mutate` turns it
 * into `corpus/patches/<item id>.patch` and `corpus/items/<item id>.json`.
 *
 * Edits are anchored: each `find` must occur in its file exactly once, or
 * the given `occurrence` (1-based) is replaced, so a spec fails loudly instead
 * of mutating the wrong place when the base changes.
 */
import { z } from "zod";

import type { CorpusItem } from "../schema/index.ts";
import { operatorById } from "./catalogue.ts";

export const EditSchema = z.strictObject({
  /** Path relative to the SPA root (e.g. "src/components/ui/dialog.tsx"). */
  file: z.string().min(1),
  find: z.string().min(1),
  replace: z.string(),
  /** 1-based; required when `find` occurs more than once. */
  occurrence: z.number().int().min(1).optional(),
});

export const MutationSpecSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  patternId: z.string().min(1),
  operator: z.string().min(1),
  app: z.literal("atomic-crm"),
  journeyId: z.string().min(1),
  /** Where in the app the mechanism applies, for people reading the corpus. */
  target: z.string().min(1),
  edits: z.array(EditSchema).min(1),
  repetitions: z.number().int().min(1).optional(),
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

/** The corpus item a spec produces (seeded; candidate = the generated patch). */
export function itemFromSpec(spec: MutationSpec, baseRef: string, split: "dev" | "test"): CorpusItem {
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
    provenance: { origin: `seeded by Claude with operator ${operator.id}`, licence: "MIT (Atomic CRM, marmelab/atomic-crm)" },
  };
}

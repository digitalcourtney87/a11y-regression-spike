/**
 * The pattern registry, `corpus/patterns.json` (DR-0059): every planned
 * pattern, by batch, before any item exists. A pattern is one catalogue
 * mechanism in one context (an SPA, or one mined open-source pair), so the
 * same mechanism in two apps is two patterns, and in two places of one app is
 * one pattern with two items (corpus plan §1).
 */
import { z } from "zod";

import { REGRESSION_OPERATORS } from "./catalogue.ts";

/** The SPA contexts (P14, P19). */
export const SPA_APPS = ["atomic-crm", "react-admin-simple"] as const;

export const PlannedPatternSchema = z.strictObject({
  id: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  batch: z.string().min(1),
  /** An SPA app id, or "oss:<library>#<issue>" for a mined pair. */
  context: z.string().min(1),
  operator: z.string().min(1),
  /** The expected class the split stratifies on, e.g. "regression:FOCUS_NOT_MOVED". */
  stratum: z.string().min(1),
  /** "dropped" keeps the record when a planned pattern turns out not to be buildable in its context, decided from the base alone. */
  status: z.enum(["planned", "dropped"]),
  note: z.string().optional(),
});

export const PatternRegistrySchema = z.strictObject({ patterns: z.array(PlannedPatternSchema) });

export type PlannedPattern = z.infer<typeof PlannedPatternSchema>;
export type PatternRegistry = z.infer<typeof PatternRegistrySchema>;

/** One pattern per SPA app per catalogue mechanism that can be built in an SPA. */
export function planSpaRegressionPatterns(batch = "spa-regression"): PlannedPattern[] {
  return SPA_APPS.flatMap((app) =>
    REGRESSION_OPERATORS.filter((o) => o.contexts.includes("spa")).map((o) => ({
      id: `${app}--${o.id}`,
      batch,
      context: app,
      operator: o.id,
      stratum: `regression:${o.symptom}`,
      status: "planned" as const,
    })),
  );
}

/** Adds patterns to the registry; refuses a repeated id. */
export function addPatterns(registry: PatternRegistry | null, patterns: readonly PlannedPattern[]): PatternRegistry {
  const existing = registry?.patterns ?? [];
  const ids = new Set(existing.map((p) => p.id));
  for (const p of patterns) {
    if (ids.has(p.id)) throw new Error(`pattern "${p.id}" is already planned`);
    ids.add(p.id);
  }
  return { patterns: [...existing, ...patterns] };
}

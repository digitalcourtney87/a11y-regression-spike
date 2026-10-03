/**
 * The M5 oracle tables (`protocol/oracles/rules.v1.json`), parsed once and
 * typed. The file is in the frozen set (DR-0033), so a change to any table
 * changes the protocol hash.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { z } from "zod";

import type { Symptom } from "../schema/index.ts";

const SYMPTOMS = [
  "NAME_NOT_CONVEYED", "ROLE_NOT_CONVEYED", "STATE_NOT_CONVEYED", "ANNOUNCEMENT_MISSING", "ANNOUNCEMENT_DUPLICATED",
  "ANNOUNCEMENT_ORDER_BROKEN", "ANNOUNCEMENT_INTERRUPTED", "FOCUS_NOT_MOVED", "FOCUS_NOT_RESTORED", "FOCUS_ESCAPES_DIALOG",
  "KEYBOARD_TRAP", "NAV_TARGET_UNREACHABLE", "INTERACTION_FAILS_UNDER_AT", "ROUTE_CHANGE_SILENT", "JOURNEY_BLOCKED",
] as const satisfies readonly Symptom[];

const StatePhraseSchema = z.object({ true: z.string(), false: z.string().optional(), negations: z.array(z.string()) });

export const OracleRulesSchema = z.object({
  version: z.literal("1"),
  axeSymptoms: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
  reachabilityFamily: z.object({ members: z.array(z.enum(SYMPTOMS)) }),
  liveRoles: z.array(z.string()),
  componentRoles: z.object({ roles: z.array(z.string()) }),
  nvda: z.object({ symbols: z.record(z.string(), z.string()), states: z.record(z.string(), StatePhraseSchema) }),
});

export interface OracleRules {
  /** axe rule id → the symptom a new violation of it gives (Arm A). */
  axeSymptom: ReadonlyMap<string, Symptom>;
  reachabilityFamily: ReadonlySet<Symptom>;
  liveRoles: ReadonlySet<string>;
  componentRoles: ReadonlySet<string>;
  symbols: Readonly<Record<string, string>>;
  states: Readonly<Record<string, z.infer<typeof StatePhraseSchema>>>;
}

export function parseOracleRules(raw: unknown): OracleRules {
  const r = OracleRulesSchema.parse(raw);
  const axeSymptom = new Map<string, Symptom>();
  for (const [symptom, ids] of Object.entries(r.axeSymptoms)) {
    if (symptom === "note" || typeof ids === "string") continue;
    const s = z.enum(SYMPTOMS).parse(symptom);
    for (const id of ids) {
      if (axeSymptom.has(id)) throw new Error(`axe rule ${id} is mapped twice`);
      axeSymptom.set(id, s);
    }
  }
  return {
    axeSymptom,
    reachabilityFamily: new Set(r.reachabilityFamily.members),
    liveRoles: new Set(r.liveRoles),
    componentRoles: new Set(r.componentRoles.roles),
    symbols: r.nvda.symbols,
    states: r.nvda.states,
  };
}

export const RULES_PATH = resolve(import.meta.dirname, "../../../protocol/oracles/rules.v1.json");

let cached: OracleRules | undefined;

export function oracleRules(): OracleRules {
  cached ??= parseOracleRules(JSON.parse(readFileSync(RULES_PATH, "utf8")));
  return cached;
}

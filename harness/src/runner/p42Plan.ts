/** P42/DR-0120: one dispatch of the three registered owned-control cases; v2 runs in the absent leg only. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { CALIBRATION_CASES } from "./calibration.ts";
import type { CalibrationCase } from "./calibration.ts";
const requestSchema = z.strictObject({ approval: z.literal("DR-0120"), dispatches: z.literal(1), jobs: z.literal(2), timeoutMinutes: z.literal(60), repetitions: z.literal(3), cases: z.tuple([z.literal("p42-cursor"), z.literal("p42-cursor-v2"), z.literal("p42-focus")]) });
/** The approved cases in their fixed order, for one leg, or for both when no leg is given (the build). */
export function p42Plan(request: unknown, leg?: "nvda-absent" | "nvda-present"): CalibrationCase[] {
  const approved = requestSchema.parse(request);
  const cases = approved.cases.map((id) => {
    const selected = CALIBRATION_CASES.find((c) => c.id === id);
    if (selected === undefined || selected.approval !== "P42/DR-0120" || selected.app !== "m9-controls") throw new Error(`missing approved P42 case ${id}`);
    return selected;
  });
  return leg === undefined ? cases : cases.filter((c) => c.legs.includes(leg));
}
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw new Error("pass the approved P42 request path");
  console.log(JSON.stringify(p42Plan(JSON.parse(readFileSync(process.argv[2] ?? "", "utf8")))));
}

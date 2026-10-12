/** P41/DR-0116: same four missing working cases; no controls or retries. */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { CALIBRATION_CASES } from "./calibration.ts";
const requestSchema = z.strictObject({ approval: z.literal("DR-0116"), dispatches: z.literal(1), jobs: z.literal(2), timeoutMinutes: z.literal(60), repetitions: z.literal(3), cases: z.tuple([z.literal("bootstrap-modal"), z.literal("vuetify-input"), z.literal("calendar"), z.literal("multiselect")]) });
export function recoveryPlan(request: unknown) {
  const approved = requestSchema.parse(request);
  return approved.cases.map((id) => {
    const selected = CALIBRATION_CASES.find((c) => c.id === id);
    if (selected === undefined) throw new Error(`missing approved recovery case ${id}`);
    return selected;
  });
}
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw new Error("pass the approved recovery request path");
  console.log(JSON.stringify(recoveryPlan(JSON.parse(readFileSync(process.argv[2] ?? "", "utf8")))));
}

/** One approved M8 or P42 leg: serial base-only cases, no retry or corpus loading. */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseArgs } from "node:util";

import { qpcNowNs } from "../clock/qpc.ts";
import { p42Plan } from "./p42Plan.ts";
import { recoveryPlan } from "./recoveryPlan.ts";
import { CALIBRATION_CASES } from "./calibration.ts";

const { values } = parseArgs({ options: { leg: { type: "string" }, "recovery-request": { type: "string" }, "p42-request": { type: "string" }, out: { type: "string", default: "artefacts/calibration" } } });
if (values.leg !== "nvda-absent" && values.leg !== "nvda-present") throw new Error("calibration requires one declared leg");
const recoveryRequest = values["recovery-request"];
const p42Request = values["p42-request"];
if (recoveryRequest !== undefined && p42Request !== undefined) throw new Error("pass one approved request");
// Without a request only the original P40 cases are eligible; P42 cases need the P42 request (DR-0120).
const cases = p42Request !== undefined ? p42Plan(JSON.parse(readFileSync(p42Request, "utf8")), values.leg) : recoveryRequest !== undefined ? recoveryPlan(JSON.parse(readFileSync(recoveryRequest, "utf8"))) : CALIBRATION_CASES.filter((c) => c.approval === "P40/DR-0114");
const approval = p42Request !== undefined ? "P42/DR-0120" : recoveryRequest === undefined ? "P40/DR-0114" : "P41/DR-0116";
if (recoveryRequest === undefined && p42Request === undefined) {
  const request = JSON.parse(readFileSync(".github/m8-request.json", "utf8")) as { approval?: string; dispatches?: number; jobs?: number; timeoutMinutes?: number; repetitions?: number };
  if (request.approval !== "DR-0114" || request.dispatches !== 1 || request.jobs !== 2 || request.timeoutMinutes !== 60 || request.repetitions !== 3) throw new Error("request exceeds the approved P40 envelope");
}
const out = values.out;
mkdirSync(out, { recursive: true });
const results: { case: string; startedQpcNs: number; endedQpcNs: number; status: string; exitCode?: number | null; error?: string }[] = [];
for (const selected of cases) {
  const startedQpcNs = qpcNowNs();
  if (!existsSync(join("builds", selected.app.replaceAll("/", "-"), "base", "index.html"))) {
    results.push({ case: selected.id, startedQpcNs, endedQpcNs: qpcNowNs(), status: "build-unavailable" });
  } else {
    const child = spawnSync(process.execPath, ["harness/src/runner/itemRun.ts", "--leg", values.leg, "--app", selected.app, "--builds", "builds", "--out", join(out, selected.id), "--env", join(out, "env.json"), "--split", "dev", "--sides", "base", "--reps", "3", "--journeys", selected.journeys.join(","), "--calibration", selected.id, "--no-axe"], { stdio: "inherit" });
    results.push({ case: selected.id, startedQpcNs, endedQpcNs: qpcNowNs(), status: child.status === 0 && child.error === undefined ? "completed" : "runner-failed", exitCode: child.status, ...(child.error === undefined ? {} : { error: child.error.message }) });
  }
  writeFileSync(join(out, "pilot-summary.json"), `${JSON.stringify({ label: "EXPLORATORY", approval, leg: values.leg, dispatches: 1, repetitions: 3, results }, null, 2)}\n`);
}
if (results.some((r) => r.status !== "completed")) process.exitCode = 1;

/** The approved pilot cannot fan out beyond two Windows jobs or120runner-minutes. */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";
import { parse } from "yaml";

interface CalibrationWorkflow {
  jobs: Record<string, { "runs-on": string; "timeout-minutes": number; strategy: { matrix: { leg: string[] } } }>;
}

test("the pilot has one static two-leg job and stays within the P40 limit", () => {
  const path = resolve(import.meta.dirname, "../../../.github/workflows/m8-calibration.yml");
  const workflow = existsSync(path) ? parse(readFileSync(path, "utf8")) as CalibrationWorkflow : { jobs: {} };
  expect(Object.keys(workflow.jobs)).toEqual(["calibration"]);
  const job = workflow.jobs.calibration;
  if (job === undefined) throw new Error("missing calibration job");
  expect(job["runs-on"]).toBe("windows-2025");
  expect(job.strategy.matrix.leg).toEqual(["nvda-absent", "nvda-present"]);
  expect(job["timeout-minutes"]).toBeLessThanOrEqual(60);
  expect(job.strategy.matrix.leg.length * job["timeout-minutes"]).toBeLessThanOrEqual(120);
});


test("the consumed P40 pilot cannot start another Windows job", () => {
  const workflow = parse(readFileSync(resolve(import.meta.dirname, "../../../.github/workflows/m8-calibration.yml"), "utf8")) as { on: Record<string, unknown>; jobs: { calibration: { if?: string } } };
  expect(workflow.on).not.toHaveProperty("workflow_dispatch");
  expect(workflow.jobs.calibration.if).toBe("${{ false }}");
});

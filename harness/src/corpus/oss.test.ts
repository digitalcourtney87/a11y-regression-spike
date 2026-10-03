import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

import { isVerified, OssCandidatesSchema, planOssRegressionPatterns } from "./oss.ts";
import type { OssCandidate, OssCandidates } from "./oss.ts";

const candidate = (over: Partial<OssCandidate>): OssCandidate => ({
  id: "lib-1",
  repo: "org/lib",
  refs: ["#1", "PR #2"],
  stack: "react",
  package: "lib",
  licence: "MIT",
  good: "1.0.0",
  broken: "1.1.0",
  fixed: "1.2.0",
  symptom: "FOCUS_NOT_RESTORED",
  documentary: "accept",
  reproduction: { run: 1, pointer: true, keyboard: true },
  note: "n",
  ...over,
});
const registry = (candidates: OssCandidate[]): OssCandidates => ({ label: "EXPLORATORY", method: "DR-0062", candidates, rejected: [] });

describe("mined pairs", () => {
  test("the committed candidate registry is valid", () => {
    const raw: unknown = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../../corpus/oss-candidates.json"), "utf8"));
    expect(() => OssCandidatesSchema.parse(raw)).not.toThrow();
  });
  test("a pair is verified only with both releases and a keyboard reproduction", () => {
    expect(isVerified(candidate({}))).toBe(true);
    expect(isVerified(candidate({ reproduction: { run: 1, pointer: true, keyboard: false } }))).toBe(false);
    expect(isVerified(candidate({ reproduction: undefined }))).toBe(false);
    expect(isVerified(candidate({ good: null }))).toBe(false);
    expect(isVerified(candidate({ documentary: "pending" }))).toBe(false);
  });
  test("plans one pattern per verified pair, with a catalogue mechanism or mined", () => {
    const planned = planOssRegressionPatterns(
      registry([candidate({ operator: "menu-focus-not-restored" }), candidate({ id: "lib-2", symptom: "JOURNEY_BLOCKED" }), candidate({ id: "lib-3", reproduction: undefined })]),
    );
    expect(planned).toEqual([
      { id: "oss--lib-1", batch: "oss-regression", context: "oss:org/lib#1", operator: "menu-focus-not-restored", stratum: "regression:FOCUS_NOT_RESTORED", status: "planned", note: "lib 1.0.0 to 1.1.0: n" },
      { id: "oss--lib-2", batch: "oss-regression", context: "oss:org/lib#1", operator: "mined", stratum: "regression:JOURNEY_BLOCKED", status: "planned", note: "lib 1.0.0 to 1.1.0: n" },
    ]);
  });
  test("refuses an operator for another symptom or one not built from open-source pairs", () => {
    expect(() => planOssRegressionPatterns(registry([candidate({ operator: "dialog-containment-removed" })]))).toThrow(/not an open-source mechanism/);
    expect(() => planOssRegressionPatterns(registry([candidate({ symptom: "NAME_NOT_CONVEYED", operator: "image-alt-removed" })]))).toThrow(/not an open-source mechanism/);
  });
});

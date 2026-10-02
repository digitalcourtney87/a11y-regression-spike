/**
 * Repository clock policy (DR-0027, implementing DR-0010 D1): no collector,
 * adapter, runner, clock or listener source reads the wall clock outside the
 * allowlisted anchor files. Pattern and allowlist unit tests live next to the
 * policy in harness/src/policy/clockPolicy.test.ts.
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { scanRepoForWallClockReads } from "../../src/policy/clockPolicy.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");

describe("repository clock policy", () => {
  test("locates the repository root", () => {
    expect(existsSync(resolve(repoRoot, "package.json"))).toBe(true);
    expect(existsSync(resolve(repoRoot, "harness/src/clock/wallAnchor.ts"))).toBe(true);
  });

  test("has zero forbidden wall-clock reads", () => {
    expect(scanRepoForWallClockReads(repoRoot)).toEqual([]);
  });
});

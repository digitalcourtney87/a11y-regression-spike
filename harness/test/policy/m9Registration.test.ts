/** P42/DR-0120: the registered controls, journeys and criteria cannot change after registration. Static hashing only; nothing is executed. */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, test } from "vitest";

const repoRoot = resolve(import.meta.dirname, "../../..");
const sums = readFileSync(resolve(repoRoot, "docs/research/m9-registration/SHA256SUMS"), "utf8").trim().split("\n").map((line) => {
  const [hash, path] = line.split(/\s+/);
  return { hash: hash ?? "", path: path ?? "" };
});

test("the registration covers the criteria, both control files and all eight journeys", () => {
  expect(sums.map((s) => s.path)).toEqual([
    "docs/plans/2026-10-12-m9-registered-criteria.md",
    "fixtures/m9-controls/controls.js",
    "fixtures/m9-controls/index.html",
    ...["delayed-label", "focus-hidden-label", "generated-text", "ignored-wrappers", "marker-list", "plain-page", "static-label", "unnamed-wrapper"].map((c) => `journeys/m9-${c}.json`),
  ]);
});

test.each(sums)("$path is unchanged since registration", ({ hash, path }) => {
  expect(createHash("sha256").update(readFileSync(resolve(repoRoot, path))).digest("hex")).toBe(hash);
});

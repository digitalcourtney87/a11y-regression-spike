/**
 * Every workflow in .github/workflows passes the S7 workflow policy (DR-0016
 * D7, DR-0006, DR-0008), and each rule fires on an inline bad workflow. Local
 * actions are exempt from W1 in a workflow, so every local action manifest
 * (.github/actions/**\/action.yml, and any other directory a local `uses:`
 * points at) passes the action policy too. Detailed edge cases for each rule
 * live next to the policy in harness/src/policy/workflowPolicy.test.ts.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { checkActionManifest, checkWorkflow } from "../../src/policy/workflowPolicy.ts";
import type { WorkflowRule } from "../../src/policy/workflowPolicy.ts";
import { listLocalActions, listWorkflowFiles } from "./workflowFiles.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const workflowFiles = listWorkflowFiles(repoRoot);
const localActions = listLocalActions(repoRoot);

describe("repository workflows", () => {
  test("ci.yml exists", () => {
    expect(workflowFiles).toContain(".github/workflows/ci.yml");
  });

  test.each(workflowFiles)("%s passes the workflow policy", (rel) => {
    const text = readFileSync(join(repoRoot, rel), "utf8");
    expect(checkWorkflow(text, rel)).toEqual([]);
  });
});

describe("repository local actions", () => {
  test("every local `uses: ./…` resolves to an action manifest", () => {
    expect(localActions.unresolved).toEqual([]);
  });

  test("every local action manifest passes the action policy (W0, W1, W3, W4, W8)", () => {
    const violations = localActions.manifests.flatMap((rel) => checkActionManifest(readFileSync(join(repoRoot, rel), "utf8"), rel));
    expect(violations).toEqual([]);
  });
});

describe("local action discovery", () => {
  test("finds globbed, referenced and transitively referenced manifests, and reports unresolved ones", () => {
    const root = mkdtempSync(join(tmpdir(), "local-actions-"));
    try {
      const put = (rel: string, text: string): void => {
        mkdirSync(dirname(join(root, rel)), { recursive: true });
        writeFileSync(join(root, rel), text);
      };
      const steps = (uses: string[]): string => `runs:\n  using: composite\n  steps:\n${uses.map((u) => `    - uses: ${u}\n`).join("")}`;
      put(".github/workflows/ci.yml", "jobs:\n  a:\n    steps:\n      - uses: ./tools/build\n      - uses: ./missing\n  b:\n    uses: ./.github/workflows/reusable.yml\n");
      put(".github/workflows/reusable.yml", "jobs: {}\n");
      put(".github/actions/setup/action.yml", steps(["./.github/actions/deep"]));
      put(".github/actions/deep/action.yaml", steps(["actions/setup-node@v7"]));
      put("tools/build/action.yml", steps(["./.github/actions/setup"]));
      expect(listLocalActions(root)).toEqual({
        manifests: [".github/actions/deep/action.yaml", ".github/actions/setup/action.yml", "tools/build/action.yml"],
        unresolved: [".github/workflows/ci.yml: ./missing"],
      });
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});

const CHECKOUT = "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1";

/** A compliant workflow with one substitution applied, so exactly one rule breaks. */
function variant(replace: Partial<Record<"on" | "permissions" | "runsOn" | "timeout" | "checkout" | "run", string>>): string {
  return [
    "name: bad",
    replace.on ?? "on: pull_request",
    replace.permissions ?? "permissions:\n  contents: read",
    "jobs:",
    "  check:",
    `    runs-on: ${replace.runsOn ?? "ubuntu-24.04"}`,
    replace.timeout ?? "    timeout-minutes: 15",
    "    steps:",
    replace.checkout ?? `      - uses: ${CHECKOUT}\n        with:\n          persist-credentials: false`,
    `      - run: ${replace.run ?? "npm test"}`,
    "",
  ].join("\n");
}

describe("each workflow rule fires on an inline bad workflow", () => {
  test("the compliant base has no violations", () => {
    expect(checkWorkflow(variant({}), "bad.yml")).toEqual([]);
  });

  test.each<[WorkflowRule, string]>([
    ["W1", variant({ checkout: "      - uses: actions/checkout@v7 # v7.0.1\n        with:\n          persist-credentials: false" })],
    ["W2", variant({ permissions: "permissions: write-all" })],
    ["W3", variant({ run: 'echo "${{ github.head_ref }}"' })],
    ["W4", variant({ run: "echo ok\n        env:\n          T: ${{ secrets.TOKEN }}" })],
    ["W4", variant({ run: 'echo "$T" | base64\n        env:\n          T: ${{ toJSON(secrets) }}' })],
    ["W4", variant({ run: "echo ok\n        env:\n          T: ${{ github.token }}" })],
    ["W5", variant({ on: "on: pull_request_target" })],
    ["W6", variant({ runsOn: "windows-latest" })],
    ["W7", variant({ timeout: "    continue-on-error: false" })],
    ["W8", variant({ checkout: `      - uses: ${CHECKOUT}` })],
  ])("%s", (rule, yamlText) => {
    expect(checkWorkflow(yamlText, "bad.yml").map((v) => v.rule)).toEqual([rule]);
  });
});

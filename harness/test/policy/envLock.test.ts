/**
 * env/env.lock.json is valid and agrees with the rest of the repository
 * (DR-0007 Toolchain pins, DR-0008 GitHub Action pins; DR-0040 and DR-0041 for
 * the Scream signature fields and the NVDA synth): every remote action in
 * every workflow and every local action manifest is recorded in env.lock with
 * status "pinned" and is used at the recorded SHA and version, and the Node
 * and TypeScript pins match .nvmrc and package.json. An action whose status is
 * "pending-owner" therefore cannot be used by any workflow until the owner
 * approves it (`actions/setup-dotnet` was approved on 2026-10-03, DR-0046).
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { findActionPin, loadEnvLock } from "../../src/policy/envLock.ts";
import type { EnvLock } from "../../src/policy/envLock.ts";
import { extractUses } from "../../src/policy/workflowPolicy.ts";
import { listLocalActions, listWorkflowFiles } from "./workflowFiles.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const lock = loadEnvLock(join(repoRoot, "env", "env.lock.json"));
const workflowFiles = listWorkflowFiles(repoRoot);
const actionManifests = listLocalActions(repoRoot).manifests;

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}
const pkg = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as PackageJson;
const allDeps: Record<string, string> = { ...pkg.dependencies, ...pkg.devDependencies };

describe("env.lock", () => {
  test("pins the verified Phase 0 values", () => {
    expect(lock.runners).toMatchObject({ gates: "windows-2025", probeOnly: "windows-2022", linux: "ubuntu-24.04" });
    expect(lock.node.version).toBe("24.21.0");
    expect(lock.typescript.version).toBe("6.0.3");
    expect(lock.playwright.version).toBe("1.63.0");
    expect(lock.chromeForTesting.version).toBe("153.0.8010.12");
    expect(lock.chromeFlags.flags).toEqual(["--force-renderer-accessibility=screen-reader"]);
    expect(lock.chromiumSandbox.value).toBe(true);
    expect(lock.guidepup.version).toBe("0.35.0");
    expect(lock.guidepupSetup.version).toBe("0.29.1");
    expect(lock.nvda).toMatchObject({
      version: "2026.2",
      guidepupAsset: "0.2.1-2026.2",
      sha256: "7df0ca3c1c9e8c6521bc7553486ca360ed6f0b4f9bdbd6603131e38b5c1497a1",
    });
    expect(lock.nvda.synth).toMatchObject({ name: "espeak", rate: "nvda-default", rateBoost: false });
    expect(lock.scream).toMatchObject({
      version: "3.6",
      url: "https://github.com/duncanthrax/scream/releases/download/3.6/Scream3.6.zip",
      sha256: "25ea5e778b4e6995a98d448b9b5f6d321f681663f1aeeec69d8e63183d008b19",
      signerThumbprint: { status: "pending-M1a", value: null },
      signatureStatus: { status: "pending-M1a", value: null },
      signer: { status: "pending-M1a", value: null },
      issuer: { status: "pending-M1a", value: null },
    });
    expect(lock.dotnet.sdk).toBe("10.0.401");
  });

  test("records the four action pins; actions/setup-dotnet was approved on 2026-10-03 (DR-0046)", () => {
    expect(lock.actions).toEqual({
      checkout: { status: "pinned", repo: "actions/checkout", version: "v7.0.1", sha: "3d3c42e5aac5ba805825da76410c181273ba90b1" },
      "setup-node": { status: "pinned", repo: "actions/setup-node", version: "v7.0.0", sha: "820762786026740c76f36085b0efc47a31fe5020" },
      "upload-artifact": {
        status: "pinned",
        repo: "actions/upload-artifact",
        version: "v7.0.1",
        sha: "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
      },
      "setup-dotnet": {
        status: "pinned",
        repo: "actions/setup-dotnet",
        version: "v6.0.0",
        sha: "a98b56852c35b8e3190ac28c8c2271da59106c68",
        note: expect.stringMatching(/\bDR-0046\b/) as unknown,
      },
    });
  });

  test("the Node pin matches .nvmrc", () => {
    expect(readFileSync(join(repoRoot, ".nvmrc"), "utf8").trim()).toBe(lock.node.version);
  });

  test("the TypeScript pin matches package.json", () => {
    expect(allDeps.typescript).toBe(lock.typescript.version);
  });

  test("package.json, where it already lists them, matches the Playwright and Guidepup pins", () => {
    const expected: Record<string, string> = {
      playwright: lock.playwright.version,
      "@playwright/test": lock.playwright.version,
      "playwright-core": lock.playwright.version,
      "@guidepup/guidepup": lock.guidepup.version,
      "@guidepup/setup": lock.guidepupSetup.version,
    };
    for (const [name, version] of Object.entries(expected)) {
      if (name in allDeps) expect(allDeps[name], name).toBe(version);
    }
  });
});

/**
 * Problems with the remote `uses:` entries of one workflow or action manifest:
 * each Action must be recorded in env.lock with status "pinned" (not
 * "pending-owner") and used at the recorded SHA with the recorded version
 * comment.
 */
function pinProblems(yamlText: string, rel: string, envLock: EnvLock = lock): string[] {
  const problems: string[] = [];
  for (const entry of extractUses(yamlText)) {
    if (entry.repo === null) continue;
    const where = `${rel}:${String(entry.line)} ${entry.value}`;
    const pin = findActionPin(envLock, entry.repo);
    if (pin === undefined) {
      problems.push(`${where}: ${entry.repo} is not recorded in env.lock`);
      continue;
    }
    if (pin.status !== "pinned") {
      problems.push(`${where}: ${entry.repo} has env.lock status "${pin.status}" (${pin.note}); no workflow may use it until it is "pinned"`);
    }
    if (entry.sha !== pin.sha) problems.push(`${where}: SHA differs from env.lock (${pin.sha})`);
    if (entry.versionComment !== pin.version) problems.push(`${where}: version comment differs from env.lock (${pin.version})`);
  }
  return problems;
}

function expectPinsMatchLock(rel: string): void {
  expect(pinProblems(readFileSync(join(repoRoot, rel), "utf8"), rel)).toEqual([]);
}

describe("workflow and local action pins match env.lock", () => {
  test("at least one workflow uses a remote action", () => {
    const total = workflowFiles.flatMap((rel) => extractUses(readFileSync(join(repoRoot, rel), "utf8"))).filter((u) => u.repo !== null);
    expect(total.length).toBeGreaterThan(0);
  });

  test.each(workflowFiles)("%s", (rel) => {
    expectPinsMatchLock(rel);
  });

  test("every local action manifest", () => {
    for (const rel of actionManifests) expectPinsMatchLock(rel);
  });
});

describe("the env.lock cross-check", () => {
  const CHECKOUT = "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1";
  const SETUP_DOTNET = "actions/setup-dotnet@a98b56852c35b8e3190ac28c8c2271da59106c68 # v6.0.0";

  function workflow(...uses: string[]): string {
    return `jobs:\n  build:\n    runs-on: ubuntu-24.04\n    steps:\n${uses.map((u) => `      - uses: ${u}\n`).join("")}`;
  }

  test("accepts a pinned Action at its recorded SHA and version", () => {
    expect(pinProblems(workflow(CHECKOUT), "ok.yml")).toEqual([]);
  });

  /** The committed lock with setup-dotnet turned back into a pending-owner pin. */
  const pending: EnvLock = {
    ...lock,
    actions: {
      ...lock.actions,
      "setup-dotnet": {
        status: "pending-owner",
        repo: "actions/setup-dotnet",
        version: "v6.0.0",
        sha: "a98b56852c35b8e3190ac28c8c2271da59106c68",
        note: "Adoption is pending owner item P9.",
      },
    },
  };

  test("refuses a pending-owner Action, even at the recorded SHA", () => {
    const problems = pinProblems(workflow(CHECKOUT, SETUP_DOTNET), "listener.yml", pending);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/^listener\.yml:\d+ .*actions\/setup-dotnet has env\.lock status "pending-owner" \(.*\bP9\b.*\); no workflow may use it/);
  });

  test("refuses the same use in a local action manifest", () => {
    const manifest = `runs:\n  using: composite\n  steps:\n    - uses: ${SETUP_DOTNET}\n`;
    expect(pinProblems(manifest, ".github/actions/build/action.yml", pending)).toEqual([expect.stringMatching(/"pending-owner"/)]);
  });

  test("accepts actions/setup-dotnet once the owner approves and its status is pinned", () => {
    const approved: EnvLock = {
      ...lock,
      actions: { ...lock.actions, "setup-dotnet": { status: "pinned", repo: "actions/setup-dotnet", version: "v6.0.0", sha: "a98b56852c35b8e3190ac28c8c2271da59106c68" } },
    };
    expect(pinProblems(workflow(SETUP_DOTNET), "listener.yml", approved)).toEqual([]);
  });

  test.each<[string, string, RegExp]>([
    ["an Action not recorded in env.lock", "actions/cache@0123456789abcdef0123456789abcdef01234567 # v5.0.0", /is not recorded in env\.lock/],
    ["a SHA other than the recorded one", "actions/checkout@0123456789abcdef0123456789abcdef01234567 # v7.0.1", /SHA differs from env\.lock/],
    ["a version comment other than the recorded one", "actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.0", /version comment differs from env\.lock/],
  ])("refuses %s", (_label, uses, message) => {
    expect(pinProblems(workflow(uses), "bad.yml")).toEqual([expect.stringMatching(message)]);
  });
});

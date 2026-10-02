/**
 * env/env.lock.json is valid and agrees with the rest of the repository
 * (DR-0007 Toolchain pins, DR-0008 GitHub Action pins): every remote action in
 * every workflow and every local action manifest uses the SHA and version
 * recorded in env.lock, and the Node and TypeScript pins match .nvmrc and
 * package.json.
 */
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { findActionPin, loadEnvLock } from "../../src/policy/envLock.ts";
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
    expect(lock.scream).toMatchObject({
      version: "3.6",
      url: "https://github.com/duncanthrax/scream/releases/download/3.6/Scream3.6.zip",
      sha256: "25ea5e778b4e6995a98d448b9b5f6d321f681663f1aeeec69d8e63183d008b19",
      signerThumbprint: { status: "pending-M1a", value: null },
    });
    expect(lock.dotnet.sdk).toBe("10.0.401");
  });

  test("records the four resolved action pins", () => {
    expect(lock.actions).toEqual({
      checkout: { status: "pinned", repo: "actions/checkout", version: "v7.0.1", sha: "3d3c42e5aac5ba805825da76410c181273ba90b1" },
      "setup-node": { status: "pinned", repo: "actions/setup-node", version: "v7.0.0", sha: "820762786026740c76f36085b0efc47a31fe5020" },
      "upload-artifact": {
        status: "pinned",
        repo: "actions/upload-artifact",
        version: "v7.0.1",
        sha: "043fb46d1a93c77aae656e7c1c64a875d1fc6a0a",
      },
      "setup-dotnet": { status: "pinned", repo: "actions/setup-dotnet", version: "v6.0.0", sha: "a98b56852c35b8e3190ac28c8c2271da59106c68" },
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

/** Checks every remote `uses:` in one repository file against env.lock. */
function expectPinsMatchLock(rel: string): void {
  const uses = extractUses(readFileSync(join(repoRoot, rel), "utf8")).filter((u) => u.repo !== null);
  for (const entry of uses) {
    const where = `${rel}:${String(entry.line)} ${entry.value}`;
    const pin = findActionPin(lock, entry.repo ?? "");
    expect(pin, `${where}: ${entry.repo ?? ""} is not recorded in env.lock`).toBeDefined();
    expect(entry.sha, `${where}: SHA differs from env.lock`).toBe(pin?.sha);
    expect(entry.versionComment, `${where}: version comment differs from env.lock`).toBe(pin?.version);
  }
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

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { EnvLockSchema, findActionPin, parseEnvLock } from "./envLock.ts";

const lockPath = resolve(import.meta.dirname, "../../../env/env.lock.json");
const lockText = readFileSync(lockPath, "utf8");

function mutated(mutate: (lock: Record<string, unknown>) => void): unknown {
  const lock = JSON.parse(lockText) as Record<string, unknown>;
  mutate(lock);
  return lock;
}

function section(lock: Record<string, unknown>, key: string): Record<string, unknown> {
  return lock[key] as Record<string, unknown>;
}

describe("EnvLockSchema", () => {
  test("accepts the committed env.lock", () => {
    expect(() => parseEnvLock(lockText)).not.toThrow();
  });

  test.each<[string, (lock: Record<string, unknown>) => void]>([
    ["an unknown top-level key", (l) => (l.extra = 1)],
    ["an unknown key inside a pin", (l) => (section(l, "node").extra = 1)],
    ["a missing status", (l) => delete section(l, "node").status],
    ["an unknown status", (l) => (section(l, "node").status = "maybe")],
    ["a pending status on a resolved version pin", (l) => (section(l, "node").status = "pending-M1a")],
    ["a non-semver version", (l) => (section(l, "typescript").version = "6.0")],
    ["a short action SHA", (l) => (section(section(l, "actions"), "checkout").sha = "3d3c42e")],
    ["an uppercase action SHA", (l) => (section(section(l, "actions"), "checkout").sha = "3D3C42E5AAC5BA805825DA76410C181273BA90B1")],
    ["an action version without v", (l) => (section(section(l, "actions"), "checkout").version = "7.0.1")],
    ["a malformed SHA-256", (l) => (section(l, "nvda").sha256 = "abc")],
    ["an http Scream URL", (l) => (section(l, "scream").url = "http://example.com/Scream3.6.zip")],
    ["a pinned thumbprint without a value", (l) => (section(section(l, "scream"), "signerThumbprint").status = "pinned")],
    ["a pending thumbprint with a value", (l) => (section(section(l, "scream"), "signerThumbprint").value = "A".repeat(40))],
    ["a moving runner label", (l) => (section(l, "runners").gates = "windows-latest")],
    ["a chrome flag without dashes", (l) => (section(l, "chromeFlags").flags = ["force-renderer-accessibility"])],
  ])("rejects %s", (_label, mutate) => {
    expect(EnvLockSchema.safeParse(mutated(mutate)).success).toBe(false);
  });

  test("accepts a resolved thumbprint once pinned", () => {
    const lock = mutated((l) => {
      section(l, "scream").signerThumbprint = { status: "pinned", value: "0123456789ABCDEF0123456789ABCDEF01234567" };
    });
    expect(EnvLockSchema.safeParse(lock).success).toBe(true);
  });

  test("findActionPin looks up by owner/repo", () => {
    const lock = parseEnvLock(lockText);
    expect(findActionPin(lock, "actions/checkout")?.sha).toBe("3d3c42e5aac5ba805825da76410c181273ba90b1");
    expect(findActionPin(lock, "actions/unknown")).toBeUndefined();
  });
});

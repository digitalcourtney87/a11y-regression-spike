import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { ACTION_PIN_STATUSES, EnvLockSchema, findActionPin, parseEnvLock, SIGNATURE_STATUSES } from "./envLock.ts";

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

/** Resets the Scream signature fields to their pre-M1a pending state. */
function screamPending(lock: Record<string, unknown>): Record<string, unknown> {
  const scream = section(lock, "scream");
  for (const key of ["signerThumbprint", "signatureStatus", "signer", "issuer"]) scream[key] = { status: "pending-M1a", value: null };
  return scream;
}

/** Turns the setup-dotnet pin into a pending-owner pin, then applies a mutation. */
function pendingOwner(lock: Record<string, unknown>, mutate: (action: Record<string, unknown>) => void): void {
  const action = section(section(lock, "actions"), "setup-dotnet");
  action.status = "pending-owner";
  action.note = "Adoption is pending owner item P9.";
  mutate(action);
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
    ["an unknown action status", (l) => (section(section(l, "actions"), "checkout").status = "pending-M1a")],
    ["a pending-owner action without a note", (l) => { pendingOwner(l, (a) => delete a.note); }],
    ["a pending-owner note that names no owner item", (l) => { pendingOwner(l, (a) => (a.note = "awaiting approval")); }],
    ["a pending-owner action without a SHA", (l) => { pendingOwner(l, (a) => delete a.sha); }],
    ["a pending-owner status on a toolchain pin", (l) => (section(l, "node").status = "pending-owner")],
    ["a malformed SHA-256", (l) => (section(l, "nvda").sha256 = "abc")],
    ["an http Scream URL", (l) => (section(l, "scream").url = "http://example.com/Scream3.6.zip")],
    ["a pinned thumbprint without a value", (l) => (section(screamPending(l), "signerThumbprint").status = "pinned")],
    ["a pending thumbprint with a value", (l) => (section(screamPending(l), "signerThumbprint").value = "A".repeat(40))],
    ["a pinned signature status without a value", (l) => (section(screamPending(l), "signatureStatus").status = "pinned")],
    ["a pending signer with a value", (l) => (section(screamPending(l), "signer").value = "CN=Example")],
    ["a missing issuer", (l) => delete section(l, "scream").issuer],
    ["an unknown signature status", (l) => (section(l, "scream").signatureStatus = { status: "pinned", value: "Trusted" })],
    ["an empty signer", (l) => (section(l, "scream").signer = { status: "pinned", value: "" })],
    ["a missing NVDA synth block", (l) => delete section(l, "nvda").synth],
    ["a numeric eSpeak rate", (l) => (section(section(l, "nvda"), "synth").rate = 30)],
    ["rate boost on", (l) => (section(section(l, "nvda"), "synth").rateBoost = true)],
    ["another synthesiser", (l) => (section(section(l, "nvda"), "synth").name = "sapi5")],
    ["an unknown key in the synth block", (l) => (section(section(l, "nvda"), "synth").voice = "en-gb")],
    ["a moving runner label", (l) => (section(l, "runners").gates = "windows-latest")],
    ["a chrome flag without dashes", (l) => (section(l, "chromeFlags").flags = ["force-renderer-accessibility"])],
  ])("rejects %s", (_label, mutate) => {
    expect(EnvLockSchema.safeParse(mutated(mutate)).success).toBe(false);
  });

  test("accepts a resolved thumbprint once the signature status, signer and issuer are pinned (DR-0040)", () => {
    const lock = mutated((l) => {
      const scream = section(l, "scream");
      scream.signatureStatus = { status: "pinned", value: "Valid" };
      scream.signer = { status: "pinned", value: "CN=Example Signer" };
      scream.issuer = { status: "pinned", value: "CN=Example Issuing CA" };
      scream.signerThumbprint = { status: "pinned", value: "0123456789ABCDEF0123456789ABCDEF01234567" };
    });
    expect(EnvLockSchema.safeParse(lock).success).toBe(true);
  });

  test("records the signature status, signer and issuer before the thumbprint (DR-0040)", () => {
    const lock = mutated((l) => {
      const scream = section(l, "scream");
      scream.signatureStatus = { status: "pinned", value: "UnknownError" };
      scream.signer = { status: "pinned", value: "CN=Self Signed" };
      scream.issuer = { status: "pinned", value: "CN=Self Signed" };
    });
    expect(EnvLockSchema.safeParse(lock).success).toBe(true);
  });

  test("refuses a pinned thumbprint while the signature status, signer or issuer is pending (DR-0040)", () => {
    const lock = mutated((l) => {
      const scream = screamPending(l);
      scream.signatureStatus = { status: "pinned", value: "Valid" };
      scream.signerThumbprint = { status: "pinned", value: "0123456789ABCDEF0123456789ABCDEF01234567" };
    });
    const result = EnvLockSchema.safeParse(lock);
    expect(result.success).toBe(false);
    expect((result.error?.issues ?? []).map((issue) => issue.path.join("."))).toEqual(["scream.signer.status", "scream.issuer.status"]);
  });

  test("signature statuses are PowerShell's SignatureStatus values", () => {
    expect([...SIGNATURE_STATUSES]).toEqual([
      "Valid",
      "UnknownError",
      "NotSigned",
      "HashMismatch",
      "NotTrusted",
      "NotSupportedFileFormat",
      "Incompatible",
    ]);
  });

  test("records actions/setup-dotnet as pinned after the owner approved P2 (DR-0046)", () => {
    expect(findActionPin(parseEnvLock(lockText), "actions/setup-dotnet")).toMatchObject({
      status: "pinned",
      sha: "a98b56852c35b8e3190ac28c8c2271da59106c68",
    });
  });

  test("still accepts a pending-owner pin whose note names the owner item", () => {
    expect(EnvLockSchema.safeParse(mutated((l) => { pendingOwner(l, () => undefined); })).success).toBe(true);
  });

  test("action pin statuses are pinned and pending-owner", () => {
    expect([...ACTION_PIN_STATUSES]).toEqual(["pinned", "pending-owner"]);
  });

  test("findActionPin looks up by owner/repo", () => {
    const lock = parseEnvLock(lockText);
    expect(findActionPin(lock, "actions/checkout")?.sha).toBe("3d3c42e5aac5ba805825da76410c181273ba90b1");
    expect(findActionPin(lock, "actions/unknown")).toBeUndefined();
  });
});

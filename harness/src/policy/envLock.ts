/**
 * Schema for env/env.lock.json, the Phase 0 environment pins (DR-0006 Runner
 * images, DR-0007 Toolchain pins, DR-0008 GitHub Action pins, DR-0009 NVDA
 * provisioning via Guidepup (setup-action archived), DR-0012 D3 Virtual
 * audio as amended by DR-0040 Scream Authenticode verification, DR-0017 D8
 * NVDA channel and voice as amended by DR-0041 eSpeak NG at NVDA's default
 * rate, DR-0019 D10 B2 scope and listener).
 *
 * Every pin records a status: "pinned" (value resolved and fixed) or
 * "pending-M1a" (to be resolved by the M1a runner probes; value is null).
 * A GitHub Action pin may instead be "pending-owner": its version and SHA are
 * recorded, but adopting it awaits a pending owner item (hard rule 12), which
 * its note must name (P<n>). No workflow may use such an Action: the env.lock
 * cross-check test (harness/test/policy/envLock.test.ts) requires every Action
 * a workflow or local action uses to be "pinned". `actions/setup-dotnet` was
 * pending owner item P2 until the owner approved it on 2026-10-03 (DR-0046).
 *
 * Scream (DR-0040): M1a records the Authenticode signature status, signer and
 * issuer, not just the signer thumbprint, and the schema refuses a pinned
 * thumbprint until all three are pinned. If the chain is valid and the signer
 * is consistent with the release, the thumbprint is pinned; if the
 * certificate is self-signed, authenticity rests on trust on first use and
 * the owner is asked before pinning.
 *
 * NVDA synth (DR-0041): eSpeak NG at NVDA's default rate ("nvda-default", 30
 * on a fresh NVDA 2026.2 configuration) with rate boost off. The effective
 * rate is recorded per run in the evidence manifest, not here.
 */

import { readFileSync } from "node:fs";
import { z } from "zod";

export const PIN_STATUSES = ["pinned", "pending-M1a"] as const;
export type PinStatus = (typeof PIN_STATUSES)[number];

const status = z.enum(PIN_STATUSES);
const note = z.string().min(1).optional();
const semver = z.string().regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, "expected a semantic version");
const vSemver = z.string().regex(/^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, "expected v<semver>");
const sha1Hex = z.string().regex(/^[0-9a-f]{40}$/, "expected a 40-character lowercase hex commit SHA");
const sha256Hex = z.string().regex(/^[0-9a-f]{64}$/, "expected a 64-character lowercase hex SHA-256");
const isoDate = z.iso.date();
const runnerLabel = z.string().regex(/^[a-z]+-\d+(?:\.\d+)?$/, "expected an explicit runner image label");

const versionPin = z.strictObject({ status: z.literal("pinned"), version: semver, note });

/** A value that M1a will resolve: null while pending, set once pinned. */
function pendingOr<T extends z.ZodType>(value: T) {
  return z.discriminatedUnion("status", [
    z.strictObject({ status: z.literal("pending-M1a"), value: z.null() }),
    z.strictObject({ status: z.literal("pinned"), value }),
  ]);
}

/**
 * Authenticode signature status as reported by PowerShell's
 * Get-AuthenticodeSignature (System.Management.Automation.SignatureStatus).
 */
export const SIGNATURE_STATUSES = [
  "Valid",
  "UnknownError",
  "NotSigned",
  "HashMismatch",
  "NotTrusted",
  "NotSupportedFileFormat",
  "Incompatible",
] as const;

/** A certificate distinguished name, for example the subject or issuer of the signer certificate. */
const distinguishedName = z.string().min(1);

const screamPin = z
  .strictObject({
    status: z.literal("pinned"),
    version: z.string().regex(/^\d+\.\d+$/, "expected major.minor"),
    url: z.url({ protocol: /^https$/ }),
    sha256: sha256Hex,
    sizeBytes: z.number().int().positive().optional(),
    licence: z.string().min(1).optional(),
    signerThumbprint: pendingOr(z.string().regex(/^[0-9A-Fa-f]{40}$/, "expected a 40-character hex certificate thumbprint")),
    // DR-0040: recorded in M1a alongside the thumbprint.
    signatureStatus: pendingOr(z.enum(SIGNATURE_STATUSES)),
    signer: pendingOr(distinguishedName),
    issuer: pendingOr(distinguishedName),
    note,
  })
  .superRefine((scream, ctx) => {
    if (scream.signerThumbprint.status !== "pinned") return;
    for (const key of ["signatureStatus", "signer", "issuer"] as const) {
      if (scream[key].status !== "pinned") {
        ctx.addIssue({
          code: "custom",
          path: [key, "status"],
          message: `scream.${key} must be pinned before scream.signerThumbprint is pinned (DR-0040)`,
        });
      }
    }
  });

/** The declared NVDA synthesiser (D8, DR-0017, amended by DR-0041). */
const nvdaSynth = z.strictObject({
  name: z.literal("espeak"),
  rate: z.literal("nvda-default"),
  rateBoost: z.literal(false),
  note,
});

/**
 * Statuses of a GitHub Action pin. "pending-owner": recorded, but adopting the
 * Action awaits a pending owner item (hard rule 12), so no workflow may use it.
 */
export const ACTION_PIN_STATUSES = ["pinned", "pending-owner"] as const;
export type ActionPinStatus = (typeof ACTION_PIN_STATUSES)[number];

const actionRepo = z.string().regex(/^[A-Za-z0-9-]+\/[A-Za-z0-9._-]+$/, "expected owner/repo");

const actionPin = z.discriminatedUnion("status", [
  z.strictObject({ status: z.literal("pinned"), repo: actionRepo, version: vSemver, sha: sha1Hex, note }),
  z.strictObject({
    status: z.literal("pending-owner"),
    repo: actionRepo,
    version: vSemver,
    sha: sha1Hex,
    note: z.string().regex(/\bP\d+\b/, "a pending-owner Action pin's note must name the pending owner item (P<n>)"),
  }),
]);

export const EnvLockSchema = z.strictObject({
  lockVersion: z.literal(1),
  resolvedOn: isoDate,
  note,
  runners: z.strictObject({
    status,
    gates: runnerLabel,
    probeOnly: runnerLabel,
    linux: runnerLabel,
    note,
  }),
  node: versionPin,
  typescript: versionPin,
  playwright: versionPin,
  chromeForTesting: z.strictObject({
    status: z.literal("pinned"),
    version: z.string().regex(/^\d+\.\d+\.\d+\.\d+$/, "expected a four-part Chrome version"),
    note,
  }),
  chromeFlags: z.strictObject({ status, flags: z.array(z.string().startsWith("--")).min(1), note }),
  chromiumSandbox: z.strictObject({ status, value: z.boolean(), note }),
  guidepup: versionPin,
  guidepupSetup: versionPin,
  nvda: z.strictObject({
    status: z.literal("pinned"),
    version: z.string().regex(/^\d{4}\.\d+(?:\.\d+)?$/, "expected an NVDA year.release version"),
    guidepupAsset: z.string().min(1),
    sha256: sha256Hex,
    relayCertificateValidUntil: isoDate.optional(),
    synth: nvdaSynth,
    note,
  }),
  scream: screamPin,
  dotnet: z.strictObject({ status: z.literal("pinned"), sdk: semver, runtime: semver.optional(), note }),
  actions: z.record(z.string().regex(/^[a-z0-9-]+$/), actionPin),
});

export type EnvLock = z.infer<typeof EnvLockSchema>;
export type ActionPin = z.infer<typeof actionPin>;

/** Parses and validates env.lock JSON text. Throws a ZodError (or SyntaxError) on failure. */
export function parseEnvLock(jsonText: string): EnvLock {
  return EnvLockSchema.parse(JSON.parse(jsonText) as unknown);
}

/** Reads and validates env/env.lock.json. */
export function loadEnvLock(path: string): EnvLock {
  return parseEnvLock(readFileSync(path, "utf8"));
}

/** Finds the action pin for an `owner/repo`, if env.lock records one. */
export function findActionPin(lock: EnvLock, repo: string): ActionPin | undefined {
  return Object.values(lock.actions).find((pin) => pin.repo === repo);
}

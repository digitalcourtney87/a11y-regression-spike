/**
 * Validates every sample document in __fixtures__/.
 *
 * File names follow `<valid|invalid>.<schema>.<case>.json`. Each invalid
 * fixture must fail for its declared reason (the issue path below), so a
 * fixture cannot pass this test by being broken in some other way.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import type { z } from "zod";
import { ArmVerdictSchema, CorpusItemSchema, EvidencePackageSchema, JourneySchema } from "./index.ts";

const FIXTURE_DIR = fileURLToPath(new URL("./__fixtures__/", import.meta.url));
const NAME_PATTERN = /^(valid|invalid)\.([a-z-]+)\.([a-z0-9-]+)\.json$/;

const SCHEMAS: Readonly<Record<string, z.ZodType>> = {
  "evidence-package": EvidencePackageSchema,
  journey: JourneySchema,
  "corpus-item": CorpusItemSchema,
  "arm-verdict": ArmVerdictSchema,
};

/** The issue path each invalid fixture must produce (dot-joined; "" is the root). */
const EXPECTED_INVALID_PATHS: Readonly<Record<string, string>> = {
  "invalid.evidence-package.nvda-present-missing-audio.json": "preflight.audioOk",
  "invalid.evidence-package.nvda-present-no-preflight.json": "preflight.injectionMarkerOk",
  "invalid.evidence-package.fractional-qpc.json": "steps.0.speech.0.t",
  "invalid.evidence-package.negative-qpc.json": "steps.0.startedAt",
  "invalid.evidence-package.unsafe-qpc.json": "steps.0.platformEvents.0.t",
  "invalid.evidence-package.title-marker-key.json": "steps.0",
  "invalid.evidence-package.skew-mismatch.json": "maxClockSkewMs",
  "invalid.evidence-package.missing-max-clock-skew.json": "maxClockSkewMs",
  "invalid.corpus-item.regression-without-symptom.json": "expected.symptom",
  "invalid.corpus-item.unknown-benign-type.json": "expected.benignType",
  "invalid.journey.setup-step-with-strategy.json": "steps.0",
  "invalid.arm-verdict.unknown-arm.json": "arm",
};

interface Fixture {
  file: string;
  validity: "valid" | "invalid";
  schemaName: string;
  schema: z.ZodType;
  data: unknown;
}

function loadFixtures(): Fixture[] {
  return readdirSync(FIXTURE_DIR)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const match = NAME_PATTERN.exec(file);
      if (match === null) throw new Error(`fixture name does not match the convention: ${file}`);
      const [, validity, schemaName] = match;
      if (validity !== "valid" && validity !== "invalid") throw new Error(`bad validity in ${file}`);
      if (schemaName === undefined) throw new Error(`no schema name in ${file}`);
      const schema = SCHEMAS[schemaName];
      if (schema === undefined) throw new Error(`unknown schema "${schemaName}" in ${file}`);
      const data: unknown = JSON.parse(readFileSync(join(FIXTURE_DIR, file), "utf8"));
      return { file, validity, schemaName, schema, data };
    });
}

const fixtures = loadFixtures();
const valid = fixtures.filter((f) => f.validity === "valid");
const invalid = fixtures.filter((f) => f.validity === "invalid");

describe("schema fixtures", () => {
  test("every schema has at least one valid fixture", () => {
    expect(new Set(valid.map((f) => f.schemaName))).toEqual(new Set(Object.keys(SCHEMAS)));
  });

  test("every invalid fixture declares its expected failure, and vice versa", () => {
    expect(invalid.map((f) => f.file).sort()).toEqual(Object.keys(EXPECTED_INVALID_PATHS).sort());
  });

  test.each(valid.map((f) => [f.file, f] as const))("%s parses", (_file, fixture) => {
    const result = fixture.schema.safeParse(fixture.data);
    expect(result.error?.issues ?? []).toEqual([]);
    expect(result.success).toBe(true);
  });

  test.each(invalid.map((f) => [f.file, f] as const))("%s is rejected for its declared reason", (file, fixture) => {
    const result = fixture.schema.safeParse(fixture.data);
    expect(result.success).toBe(false);
    const paths = (result.error?.issues ?? []).map((issue) => issue.path.map(String).join("."));
    expect(paths).toContain(EXPECTED_INVALID_PATHS[file]);
  });
});

import { describe, expect, test } from "vitest";

import { assignSplit, expectedClass, patternStratum } from "./split.ts";
import { validateCorpus } from "./validate.ts";
import type { CorpusFiles } from "./validate.ts";

function item(id: string, patternId: string, fields: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id,
    patternId,
    split: "dev",
    source: "seeded",
    app: "spa",
    journeyId: "j1",
    base: { ref: "base" },
    candidate: { patch: `${id}.patch` },
    expected: { kind: "regression", symptom: "FOCUS_NOT_MOVED", mechanism: "focus() removed" },
    provenance: { origin: "seeded by Claude" },
    ...fields,
  };
}

function files(items: Record<string, unknown>[], extra: Partial<CorpusFiles> = {}): CorpusFiles {
  return {
    items: new Map(items.map((i) => [`${String(i.id)}.json`, i])),
    patches: new Set(items.map((i) => `${String(i.id)}.patch`)),
    journeys: new Set(["j1"]),
    split: null,
    ...extra,
  };
}

describe("patternStratum", () => {
  test("is the modal expected class, ties broken by sort order", () => {
    const reg = { expected: { kind: "regression" as const, symptom: "FOCUS_NOT_MOVED" as const, mechanism: "m" } };
    const ben = { expected: { kind: "benign" as const, benignType: "CSS_ONLY" as const } };
    expect(expectedClass(reg)).toBe("regression:FOCUS_NOT_MOVED");
    expect(patternStratum([reg, reg, ben])).toBe("regression:FOCUS_NOT_MOVED");
    expect(patternStratum([reg, ben])).toBe("benign:CSS_ONLY");
  });
});

describe("assignSplit", () => {
  const patterns = new Map<string, string>([
    ...Array.from({ length: 10 }, (_, i): [string, string] => [`r${String(i)}`, "regression:FOCUS_NOT_MOVED"]),
    ...Array.from({ length: 5 }, (_, i): [string, string] => [`b${String(i)}`, "benign:CSS_ONLY"]),
  ]);
  test("is deterministic for a seed and stratified by the test fraction", () => {
    const a = assignSplit(patterns, 20261003, 0.6);
    expect(assignSplit(patterns, 20261003, 0.6)).toEqual(a);
    expect(a.strata).toEqual({ "benign:CSS_ONLY": { dev: 2, test: 3 }, "regression:FOCUS_NOT_MOVED": { dev: 4, test: 6 } });
    expect(Object.keys(a.assignments)).toHaveLength(15);
    expect(assignSplit(patterns, 1, 0.6).assignments).not.toEqual(a.assignments);
  });
  test("rejects a bad seed or fraction", () => {
    expect(() => assignSplit(patterns, 1.5, 0.5)).toThrow(RangeError);
    expect(() => assignSplit(patterns, 1, 1)).toThrow(RangeError);
  });
});

describe("validateCorpus", () => {
  test("accepts a consistent corpus and summarises it", () => {
    const report = validateCorpus(files([item("a1", "p1"), item("a2", "p1"), item("b1", "p2", { expected: { kind: "benign", benignType: "COPY_EDIT" } })]));
    expect(report.errors).toEqual([]);
    expect(report.summary).toMatchObject({ items: 3, patterns: 2, bySplit: { dev: { items: 3, patterns: 2, regression: 2, benign: 1 } } });
    expect(report.strata.get("p2")).toBe("benign:COPY_EDIT");
  });
  test("reports schema, id, candidate, patch and split errors", () => {
    const base = files([item("a1", "p1"), item("a2", "p1", { split: "test" }), item("a3", "p3", { candidate: {} }), item("a5", "p5", { expected: { kind: "nope" } })], {
      patches: new Set(["a1.patch", "a2.patch"]),
    });
    const items = new Map(base.items);
    items.set("a4.json", { ...item("a4", "p4"), id: "other" });
    const report = validateCorpus({ ...base, items });
    expect(report.errors.join("\n")).toMatch(/a3.json: candidate needs exactly one of ref and patch/);
    expect(report.errors.join("\n")).toMatch(/a4.json: id "other" must match the file name/);
    expect(report.errors.join("\n")).toMatch(/a4.json: patch "a4.patch" not found/);
    expect(report.errors.join("\n")).toMatch(/a5.json: expected/);
    expect(report.errors.join("\n")).toMatch(/pattern "p1": items are in both splits/);
  });
  test("checks items against corpus/split.json", () => {
    const split = { seed: 1, testFraction: 0.5, method: "m", assignments: { p1: "test" as const }, strata: {} };
    const report = validateCorpus(files([item("a1", "p1"), item("b1", "p2")], { split }));
    expect(report.errors).toEqual(['a1.json: split "dev" differs from corpus/split.json ("test")', 'pattern "p2": missing from corpus/split.json']);
  });
  test("only warns about a missing journey", () => {
    const report = validateCorpus(files([item("a1", "p1", { journeyId: "later" })]));
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual(['a1.json: journey "later" not found in journeys/ (expected until M4)']);
  });
});

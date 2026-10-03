import { describe, expect, test } from "vitest";

import { addPatterns, planSpaRegressionPatterns } from "./patterns.ts";
import { addBatch, expectedClass, patternStratum, splitBatch } from "./split.ts";
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

describe("splitBatch and addBatch", () => {
  const patterns = new Map<string, string>([
    ...Array.from({ length: 10 }, (_, i): [string, string] => [`r${String(i)}`, "regression:FOCUS_NOT_MOVED"]),
    ...Array.from({ length: 5 }, (_, i): [string, string] => [`b${String(i)}`, "benign:CSS_ONLY"]),
  ]);
  test("is deterministic for a seed and stratified by the test fraction", () => {
    const a = splitBatch(patterns, 20261004, 0.7);
    expect(splitBatch(patterns, 20261004, 0.7)).toEqual(a);
    expect(a.strata).toEqual({ "benign:CSS_ONLY": { dev: 1, test: 4 }, "regression:FOCUS_NOT_MOVED": { dev: 3, test: 7 } });
    expect(splitBatch(patterns, 1, 0.7).assignments).not.toEqual(a.assignments);
  });
  test("adds batches without changing earlier assignments, and refuses repeats", () => {
    const first = addBatch(null, "spa", patterns, 20261004, 0.7);
    const second = addBatch(first, "oss", new Map([["o1", "regression:FOCUS_NOT_MOVED"]]), 20261004, 0.7);
    for (const [id, split] of Object.entries(first.assignments)) expect(second.assignments[id]).toBe(split);
    expect(second.batches.map((b) => b.name)).toEqual(["spa", "oss"]);
    expect(() => addBatch(second, "spa", new Map([["x", "s"]]), 1, 0.5)).toThrow(/already split/);
    expect(() => addBatch(second, "new", new Map([["r1", "s"]]), 1, 0.5)).toThrow(/already has a split/);
  });
  test("rejects a bad seed or fraction", () => {
    expect(() => splitBatch(patterns, 1.5, 0.5)).toThrow(RangeError);
    expect(() => splitBatch(patterns, 1, 1)).toThrow(RangeError);
  });
});

describe("pattern registry", () => {
  test("plans one pattern per SPA app per mechanism, and refuses repeated ids", () => {
    const planned = planSpaRegressionPatterns();
    expect(planned).toHaveLength(74);
    expect(planned[0]).toMatchObject({ id: "atomic-crm--icon-button-label-removed", context: "atomic-crm", stratum: "regression:NAME_NOT_CONVEYED", status: "planned" });
    const registry = addPatterns(null, planned);
    expect(() => addPatterns(registry, planned.slice(0, 1))).toThrow(/already planned/);
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
    const split = { method: "m", batches: [], assignments: { p1: "test" as const } };
    const report = validateCorpus(files([item("a1", "p1"), item("b1", "p2")], { split }));
    expect(report.errors).toEqual(['a1.json: split "dev" differs from corpus/split.json ("test")', 'pattern "p2": missing from corpus/split.json']);
  });
  test("only warns about a missing journey", () => {
    const report = validateCorpus(files([item("a1", "p1", { journeyId: "later" })]));
    expect(report.errors).toEqual([]);
    expect(report.warnings).toEqual(['a1.json: journey "later" not found in journeys/ (expected until M4)']);
  });
  test("checks items against the pattern registry", () => {
    const patterns = { patterns: [{ id: "p1", batch: "b", context: "atomic-crm", operator: "o", stratum: "s", status: "dropped" as const }] };
    const report = validateCorpus(files([item("a1", "p1"), item("b1", "p2")], { patterns }));
    expect(report.errors).toEqual(['pattern "p1": dropped in corpus/patterns.json', 'pattern "p2": not planned in corpus/patterns.json']);
  });
});

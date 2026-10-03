import { describe, expect, test } from "vitest";

import { BENIGN_OPERATORS, operatorById, REGRESSION_OPERATORS } from "./catalogue.ts";
import { appDir, applyEdits, isSpaApp, itemFromSpec, MutationSpecSchema } from "./mutate.ts";
import { CorpusItemSchema } from "../schema/schemas.ts";

describe("catalogue (P16)", () => {
  test("has 37 regression operators over the 13 primary-analysis symptoms and one benign operator per BenignType", () => {
    expect(REGRESSION_OPERATORS).toHaveLength(37);
    expect(new Set(REGRESSION_OPERATORS.map((o) => o.symptom)).size).toBe(13);
    expect(REGRESSION_OPERATORS.map((o) => o.symptom)).not.toContain("ANNOUNCEMENT_ORDER_BROKEN");
    expect(REGRESSION_OPERATORS.map((o) => o.symptom)).not.toContain("ANNOUNCEMENT_INTERRUPTED");
    expect(new Set(BENIGN_OPERATORS.map((o) => o.benignType)).size).toBe(7);
    expect(new Set([...REGRESSION_OPERATORS, ...BENIGN_OPERATORS].map((o) => o.id)).size).toBe(44);
    expect(REGRESSION_OPERATORS.filter((o) => o.creationTime === true).map((o) => o.id)).toEqual(["toast-region-created-populated"]);
  });
});

describe("applyEdits", () => {
  test("replaces a unique anchor", () => {
    expect(applyEdits('<Button aria-label="Add task">', [{ find: ' aria-label="Add task"', replace: "" }])).toBe("<Button>");
  });
  test("needs an occurrence for an ambiguous anchor, and replaces that one", () => {
    expect(() => applyEdits("a x a", [{ find: "a", replace: "b" }])).toThrow(/occurs 2 times/);
    expect(applyEdits("a x a", [{ find: "a", replace: "b", occurrence: 2 }])).toBe("a x b");
  });
  test("fails loudly on a missing anchor or a no-op", () => {
    expect(() => applyEdits("abc", [{ find: "zzz", replace: "" }], "f.tsx")).toThrow(/f.tsx: anchor not found/);
    expect(() => applyEdits("abc", [{ find: "b", replace: "b" }])).toThrow(/change nothing/);
  });
});

describe("itemFromSpec", () => {
  const spec = MutationSpecSchema.parse({
    id: "dlg-focus-task",
    patternId: "spa-dialog-initial-focus-removed",
    operator: "dialog-initial-focus-removed",
    app: "atomic-crm",
    journeyId: "add-task",
    target: "task create dialog",
    edits: [{ file: "src/components/ui/dialog.tsx", find: "x", replace: "y" }],
  });
  test("produces a valid seeded corpus item with the operator's symptom", () => {
    const item = itemFromSpec(spec, "atomic-crm@abc", "dev");
    expect(CorpusItemSchema.safeParse(item).success).toBe(true);
    expect(item).toMatchObject({ source: "seeded", candidate: { patch: "dlg-focus-task.patch" }, expected: { kind: "regression", symptom: "FOCUS_NOT_MOVED" } });
  });
  test("maps a benign operator to its BenignType and rejects an unknown operator", () => {
    expect(itemFromSpec({ ...spec, operator: "css-only" }, "r", "dev").expected).toEqual({ kind: "benign", benignType: "CSS_ONLY" });
    expect(() => itemFromSpec({ ...spec, operator: "nope" }, "r", "dev")).toThrow(/unknown operator/);
    expect(operatorById("css-only")?.kind).toBe("benign");
  });
});

describe("apps", () => {
  test("an app is an SPA or a mined pair's fixture, each with its own directory", () => {
    expect(appDir("atomic-crm")).toBe("fixtures/spa/atomic-crm");
    expect(appDir("oss/carbon-19563")).toBe("fixtures/oss/carbon-19563");
    expect(isSpaApp("react-admin-simple")).toBe(true);
    expect(isSpaApp("oss/carbon-19563")).toBe(false);
    const base = { id: "t", patternId: "p", operator: "css-only", journeyId: "j", target: "x", edits: [{ file: "f", find: "a", replace: "b" }] };
    expect(MutationSpecSchema.safeParse({ ...base, app: "oss/carbon-19563" }).success).toBe(true);
    expect(MutationSpecSchema.safeParse({ ...base, app: "oss/../spa" }).success).toBe(false);
    expect(MutationSpecSchema.safeParse({ ...base, app: "other-app" }).success).toBe(false);
  });
  test("a twin on a mined pair's fixture takes its library's licence, and needs one", () => {
    const spec = MutationSpecSchema.parse({ id: "oss-x-twin", patternId: "oss--x", operator: "css-only", app: "oss/x", journeyId: "oss-x", target: "t", edits: [{ file: "f", find: "a", replace: "b" }], twinOf: "oss-x" });
    expect(itemFromSpec(spec, "r", "dev", "MIT (lib)").provenance.licence).toBe("MIT (lib)");
    expect(() => itemFromSpec(spec, "r", "dev")).toThrow(/needs its library's licence/);
  });
});


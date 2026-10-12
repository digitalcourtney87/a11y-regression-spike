import { describe, expect, test } from "vitest";

import { CALIBRATION_CASES, calibrationCaseFor, calibrationItems, captureCalibrationPoint, focusFromFullTree } from "./calibration.ts";

const request = { caseId: "bootstrap-modal", app: "oss/bootstrap-39189", journeys: "oss-bootstrap-39189", split: "dev", sides: "base", items: "", reps: "3", shard: "1/1" };

describe("M8 calibration isolation", () => {
  test("leaves ordinary runs on their existing path", () => {
    expect(calibrationCaseFor({ ...request, caseId: "", split: "test" })).toBeNull();
  });

  test.each([
    { split: "test" },
    { sides: "both" },
    { items: "oss-bootstrap-39189" },
    { reps: "5" },
    { shard: "1/2" },
    { shard: "2/2" },
    { app: "oss/carbon-7861" },
    { journeys: "oss-bootstrap-39189,oss-carbon-7861" },
    { caseId: "unregistered-case" },
  ])("refuses a request outside the approved base-only plan: %j", (change) => {
    expect(() => calibrationCaseFor({ ...request, ...change })).toThrow();
  });

  test("creates exploratory pseudo-items without assigned corpus input or candidates", () => {
    const selected = calibrationCaseFor(request);
    expect(selected).not.toBeNull();
    if (selected === null) throw new Error("missing selected case");
    const items = calibrationItems(selected);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ id: "m8-oss-bootstrap-39189", split: "dev", base: { ref: "bootstrap@5.3.1" }, candidate: {}, expected: { kind: "unchanged" }, repetitions: 3 });
  });
});

describe("read-only diagnostic points", () => {
  test("retains an unavailable focus read rather than substituting evidence or failing the step", async () => {
    let clock = 100;
    const goal = { attempt: 1, node: { role: "button", name: "Open details" } };
    const point = await captureCalibrationPoint("goal-check", "nvda-present", goal, () => Promise.reject(new Error("focus unavailable")), () => ++clock);
    expect(point.goal).toEqual(goal);
    expect(point.domFocus).toBeNull();
    expect(point.error).toBe("focus unavailable");
    expect(point.startedQpcNs).toBe(101);
    expect(point.endedQpcNs).toBe(102);
    expect(point.internalMode).toMatchObject({ available: false });
  });

  test("retains an unavailable diagnostic goal read without altering execution", async () => {
    const focus = { tag: "INPUT", id: "actual", role: null, ariaLabel: "Actual field", labels: [], value: "", text: "", ancestors: [] };
    const point = await captureCalibrationPoint("observation-end", "nvda-present", () => Promise.reject(new Error("mode/focus read failed")), () => Promise.resolve(focus), () => 123);
    expect(point.goal).toBeNull();
    expect(point.goalError).toBe("mode/focus read failed");
    expect(point.domFocus).toEqual(focus);
  });

  test("stores early and late focus as separate observations without producing a revised verdict", async () => {
    const focus = { tag: "DIV", id: "details", role: "dialog", ariaLabel: "Details", labels: [], value: null, text: "Details", ancestors: [] };
    const early = await captureCalibrationPoint("goal-check", "nvda-absent", { attempt: 1, node: { role: "button", name: "Open details" } }, () => Promise.resolve(focus), () => 123);
    const late = await captureCalibrationPoint("observation-end", "nvda-absent", { attempt: 1, node: { role: "dialog", name: "Details" } }, () => Promise.resolve(focus), () => 456);
    expect(early.goal?.node?.role).toBe("button");
    expect(late.goal?.node?.role).toBe("dialog");
    expect(early).not.toHaveProperty("outcome");
    expect(late).not.toHaveProperty("verdict");
    expect(late.internalMode).toMatchObject({ available: false });
  });
});

describe("P42 registered cases (DR-0120)", () => {
  const p42 = { caseId: "p42-cursor", app: "m9-controls", journeys: "m9-marker-list,m9-generated-text,m9-ignored-wrappers,m9-plain-page", split: "dev", sides: "base", items: "", reps: "3", shard: "1/1" };

  test("M8 cases keep v1, no full-tree read and their own P40 label", () => {
    expect(CALIBRATION_CASES.filter((c) => !c.id.startsWith("p42-")).every((c) => c.cursor === "v1" && !c.fullTreeFocusName && c.approval === "P40/DR-0114")).toBe(true);
  });

  test("P42 cases carry their own approval, cursor model and legs", () => {
    expect(CALIBRATION_CASES.filter((c) => c.id.startsWith("p42-")).map((c) => [c.id, c.approval, c.cursor, c.legs, c.fullTreeFocusName])).toEqual([
      ["p42-cursor", "P42/DR-0120", "v1", ["nvda-absent", "nvda-present"], true],
      ["p42-cursor-v2", "P42/DR-0120", "v2", ["nvda-absent"], true],
      ["p42-focus", "P42/DR-0120", "v1", ["nvda-absent", "nvda-present"], true],
    ]);
  });

  test("a case is refused in a leg it does not declare", () => {
    expect(() => calibrationCaseFor({ ...p42, caseId: "p42-cursor-v2", leg: "nvda-present" })).toThrow();
    expect(calibrationCaseFor({ ...p42, caseId: "p42-cursor-v2", leg: "nvda-absent" })?.cursor).toBe("v2");
  });

  test("P42 pseudo-items are labelled with their own approval", () => {
    const selected = calibrationCaseFor({ ...p42, leg: "nvda-absent" });
    if (selected === null) throw new Error("missing selected case");
    const items = calibrationItems(selected);
    expect(items.map((i) => i.id)).toEqual(["m9-marker-list", "m9-generated-text", "m9-ignored-wrappers", "m9-plain-page"].map((j) => `m8-${j}`));
    for (const i of items) expect(i.provenance.origin).toContain("P42/DR-0120");
  });
});

describe("same-instant full-tree focus name (P42)", () => {
  const tree = [
    { id: "1", role: "RootWebArea", name: "", props: {}, children: ["2"], backendId: 1 },
    { id: "2", role: "textbox", name: "Item name", props: {}, parent: "1", children: [], backendId: 7 },
  ];

  test("reads the focused backend node's name and role from the full tree", () => {
    expect(focusFromFullTree(tree, 7)).toEqual({ backendId: 7, name: "Item name", role: "textbox" });
  });

  test("records a focused node absent from the tree without inventing a name", () => {
    expect(focusFromFullTree(tree, 9)).toEqual({ backendId: 9, name: null, role: null });
  });

  test("is recorded beside the other reads, and its failure is kept explicit", async () => {
    const focus = { tag: "INPUT", id: "field", role: null, ariaLabel: null, labels: [], value: "", text: "", ancestors: [] };
    const ok = await captureCalibrationPoint("goal-check", "nvda-absent", { attempt: 1, node: { role: "textbox", name: "" } }, () => Promise.resolve(focus), () => 1, () => Promise.resolve({ backendId: 7, name: "Item name", role: "textbox" }));
    expect(ok.fullTreeFocus).toEqual({ backendId: 7, name: "Item name", role: "textbox" });
    const failed = await captureCalibrationPoint("goal-check", "nvda-present", null, () => Promise.resolve(focus), () => 1, () => Promise.reject(new Error("tree unavailable")));
    expect(failed.fullTreeFocus).toBeNull();
    expect(failed.fullTreeError).toBe("tree unavailable");
    const m8 = await captureCalibrationPoint("goal-check", "nvda-absent", null, () => Promise.resolve(focus), () => 1);
    expect(m8).not.toHaveProperty("fullTreeFocus");
  });
});

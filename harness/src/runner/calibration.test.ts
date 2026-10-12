import { describe, expect, test } from "vitest";

import { calibrationCaseFor, calibrationItems, captureCalibrationPoint } from "./calibration.ts";

const request = { caseId: "bootstrap-modal", app: "oss/bootstrap-39189", journeys: "oss-bootstrap-39189", split: "dev", sides: "base", items: "", reps: "3" };

describe("M8 calibration isolation", () => {
  test("leaves ordinary runs on their existing path", () => {
    expect(calibrationCaseFor({ ...request, caseId: "", split: "test" })).toBeNull();
  });

  test.each([
    { split: "test" },
    { sides: "both" },
    { items: "oss-bootstrap-39189" },
    { reps: "5" },
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

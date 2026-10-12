import { expect, test } from "vitest";
import { p42Plan } from "./p42Plan.ts";

const approved = { approval: "DR-0120", dispatches: 1, jobs: 2, timeoutMinutes: 60, repetitions: 3, cases: ["p42-cursor", "p42-cursor-v2", "p42-focus"] };

test("the absent leg runs v1, then v2, then the focus controls", () => {
  expect(p42Plan(approved, "nvda-absent").map((c) => [c.id, c.cursor])).toEqual([["p42-cursor", "v1"], ["p42-cursor-v2", "v2"], ["p42-focus", "v1"]]);
});

test("the present leg runs the cursor and focus controls once each", () => {
  expect(p42Plan(approved, "nvda-present").map((c) => c.id)).toEqual(["p42-cursor", "p42-focus"]);
});

test("every selected case is the owned m9 controls, three repetitions, base only", () => {
  for (const leg of ["nvda-absent", "nvda-present"] as const) for (const c of p42Plan(approved, leg)) expect([c.app, c.baseRef, c.approval]).toEqual(["m9-controls", "owned-m9-controls@1", "P42/DR-0120"]);
});

test.each([{ approval: "DR-0116" }, { dispatches: 2 }, { jobs: 3 }, { timeoutMinutes: 61 }, { repetitions: 5 }, { cases: ["controls", ...approved.cases] }, { cases: approved.cases.slice(1) }, { cases: ["p42-cursor-v2", "p42-cursor", "p42-focus"] }, { cases: ["bootstrap-modal", "p42-cursor-v2", "p42-focus"] }, { retry: true }])("rejects a changed scope or budget: %j", (change) => {
  expect(() => p42Plan({ ...approved, ...change }, "nvda-absent")).toThrow();
});

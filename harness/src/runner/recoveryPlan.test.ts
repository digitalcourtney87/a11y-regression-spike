import { expect, test } from "vitest";
import { recoveryPlan } from "./recoveryPlan.ts";
const approved = { approval: "DR-0116", dispatches: 1, jobs: 2, timeoutMinutes: 60, repetitions: 3, cases: ["bootstrap-modal", "vuetify-input", "calendar", "multiselect"] };
test("P41 selects exactly the four missing working releases", () => {
  expect(recoveryPlan(approved).map((c) => c.baseRef)).toEqual(["bootstrap@5.3.1", "vuetify@3.3.6", "office-ui-fabric-react@5.40.2", "carbon-components-react@7.28.0"]);
});
test.each([{ approval: "DR-0114" }, { dispatches: 2 }, { jobs: 3 }, { timeoutMinutes: 61 }, { repetitions: 5 }, { cases: ["controls", ...approved.cases] }, { cases: approved.cases.slice(1) }, { cases: ["bootstrap-modal", "bootstrap-modal", "calendar", "multiselect"] }, { retry: true }])("rejects a changed recovery scope or budget: %j", (change) => {
  expect(() => recoveryPlan({ ...approved, ...change })).toThrow();
});

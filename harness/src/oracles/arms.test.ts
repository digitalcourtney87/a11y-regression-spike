import { describe, expect, test } from "vitest";

import type { AxNode } from "../runner/axTree.ts";
import { correctSymptom, nvdaUnchanged, scoreItem } from "./arms.ts";
import type { ItemEvidence } from "./evidence.ts";
import { oracleRules } from "./rules.ts";
import { at, attempt, axTree, block, eventsAt, item, journey, recordsAt, speechAt, steps } from "./testkit.ts";
import { descriptorRole, triggeredSteps } from "./triggers.ts";

const rules = oracleRules();

const j = journey([
  at("reach", "TAB", [{ type: "focusOn", value: "button|Save" }], { until: { role: "button", maxAttempts: 3 } }),
  at("save", "ACTIVATE", [{ type: "announcementContains", value: "Saved" }]),
]);
const focused = (name: string): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "button", name, props: { focused: true } }] });

/** NVDA-absent: the tree loses the button's name in the candidate; NVDA-present: speech as given. */
function evidence(candidateName: string, candidateSpeech: string[], liveEvents = false): ItemEvidence {
  const it = item("regression", "NAME_NOT_CONVEYED");
  const absent = block(it, "nvda-absent", 3, (side) =>
    attempt(side, steps(j, { reach: { tree: focused(side === "base" ? "Save" : candidateName) }, save: { tree: focused("Save") } }), {
      axe: { reach: { violations: [] }, save: { violations: [] } },
      ...(liveEvents ? { listenerEvents: eventsAt(j, "save", [{ event: "EVENT_SYSTEM_ALERT", role: "alert", ariaRole: "alert" }]) } : {}),
    }),
  );
  const present = block(it, "nvda-present", 3, (side) =>
    attempt(side, steps(j, {}), { speechEvents: [...speechAt(j, "reach", side === "base" ? ["Save button"] : candidateSpeech), ...speechAt(j, "save", ["alert Saved"])] }),
  );
  return { item: it, journey: j, absent, present };
}

describe("arms", () => {
  test("arms nest: a tree FAIL is a FAIL in B, B2, C and D, and A passes", () => {
    const s = scoreItem(evidence("", ["button"]), rules);
    expect(s.arms.A.verdict).toBe("PASS");
    for (const arm of ["B", "B2", "C_UNION", "C_ADJUDICATED", "D_UNION", "D_ADJUDICATED"] as const) {
      expect(s.arms[arm].verdict).toBe("FAIL");
      expect(s.arms[arm].symptoms).toContain("NAME_NOT_CONVEYED");
    }
  });

  test("ADJUDICATED downgrades a B2 FAIL to REVIEW when NVDA's output at that step is unchanged", () => {
    const s = scoreItem(evidence("", ["Save button"]), rules);
    expect(s.arms.C_UNION.verdict).toBe("FAIL");
    expect(s.arms.C_ADJUDICATED.verdict).toBe("REVIEW");
    expect(s.arms.C_ADJUDICATED.findings.some((f) => f.rule.endsWith("+adjudicated"))).toBe(true);
  });

  test("D cannot adjudicate an untriggered step, so the B2 FAIL stands there", () => {
    const s = scoreItem(evidence("", ["Save button"]), rules);
    expect(s.triggers?.find((t) => t.stepId === "reach")?.triggered).toBe(false);
    expect(s.arms.D_ADJUDICATED.verdict).toBe("FAIL");
  });

  test("an INCONCLUSIVE leg: FAIL elsewhere still FAILs under UNION; otherwise the item is INCONCLUSIVE", () => {
    const ev = evidence("", ["button"]);
    if (ev.present === null || ev.absent === null) throw new Error("fixture");
    const present = { ...ev.present, validity: { result: "INCONCLUSIVE" as const, inconclusive: [{ reason: "AUDIO" as const, on: "both" as const }], candidateFindings: [] } };
    expect(scoreItem({ ...ev, present }, rules).arms.C_UNION.verdict).toBe("FAIL");
    const clean = evidence("Save", ["Save button"]);
    expect(scoreItem({ ...clean, present }, rules).arms.C_UNION.verdict).toBe("INCONCLUSIVE");
    expect(scoreItem({ ...clean, present }, rules).arms.B2.verdict).toBe("PASS");
  });

  test("a check failing on the candidate only makes a passing item REVIEW (DR-0035)", () => {
    const ev = evidence("Save", ["Save button"]);
    if (ev.absent === null) throw new Error("fixture");
    const absent = { ...ev.absent, validity: { result: "VALID" as const, inconclusive: [], candidateFindings: ["CLOCK_RAF_GAP" as const] } };
    expect(scoreItem({ ...ev, absent }, rules).arms.B.verdict).toBe("REVIEW");
  });

  test("nvdaUnchanged compares each candidate attempt's speech with the base's", () => {
    expect(nvdaUnchanged(evidence("", ["Save button"]).present, "reach")).toBe(true);
    expect(nvdaUnchanged(evidence("", ["button"]).present, "reach")).toBe(false);
  });

  test("the reachability family", () => {
    expect(correctSymptom("JOURNEY_BLOCKED", "INTERACTION_FAILS_UNDER_AT", rules)).toBe(true);
    expect(correctSymptom("NAV_TARGET_UNREACHABLE", "JOURNEY_BLOCKED", rules)).toBe(true);
    expect(correctSymptom("FOCUS_NOT_MOVED", "FOCUS_NOT_RESTORED", rules)).toBe(false);
    expect(correctSymptom(undefined, "NAME_NOT_CONVEYED", rules)).toBe(false);
  });
});

describe("triggers", () => {
  test("descriptor roles", () => {
    expect(descriptorRole("div#root[status]")).toBe("status");
    expect(descriptorRole("span")).toBeUndefined();
  });

  test("each trigger fires on its evidence", () => {
    const jt = journey([at("a", "ACTIVATE"), at("b", "TAB"), at("c", "ACTIVATE"), at("d", "ACTIVATE")]);
    const it = item("unchanged");
    const absent = block(it, "nvda-absent", 1, (side) =>
      attempt(side, steps(jt, { c: { tree: axTree({ role: "RootWebArea" }) }, d: { tree: axTree({ role: "RootWebArea", kids: [{ role: "dialog", name: "X" }] }) } }), {
        timeline: [...recordsAt(jt, "a", [{ kind: "insert", target: "span", inLive: true, liveRoot: "div[status]" }]), ...recordsAt(jt, "b", [{ kind: "focusin", target: "button" }]), ...recordsAt(jt, "c", [{ kind: "history", target: "history", detail: "pushState" }, { kind: "focusin", target: "h1" }])],
        listenerEvents: eventsAt(jt, "a", [{ event: "EVENT_SYSTEM_ALERT", role: "alert", ariaRole: "alert" }]),
      }),
    );
    const t = triggeredSteps(jt, absent);
    expect(t?.find((x) => x.stepId === "a")?.fired).toEqual(["T1-live-region", "T2-role-status", "T3-role-alert"]);
    expect(t?.find((x) => x.stepId === "b")?.triggered).toBe(false);
    expect(t?.find((x) => x.stepId === "c")?.fired).toEqual(["T5-route-transition", "T6-programmatic-focus"]);
    expect(t?.find((x) => x.stepId === "d")?.fired).toEqual(["T4-dialog-opening"]);
  });

  test("no triggers without a valid NVDA-absent block", () => {
    const absent = block(item("unchanged"), "nvda-absent", 1, (side) => attempt(side, steps(j, {})));
    expect(triggeredSteps(j, { ...absent, validity: { result: "INCONCLUSIVE", inconclusive: [], candidateFindings: [] } })).toBeNull();
    expect(triggeredSteps(j, null)).toBeNull();
  });
});

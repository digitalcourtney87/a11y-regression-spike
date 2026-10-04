import { describe, expect, test } from "vitest";

import type { AxNode } from "../runner/axTree.ts";
import { compareFamily } from "./compare.ts";
import { oracleRules } from "./rules.ts";
import { at, attempt, axTree, block, eventsAt, item, journey, recordsAt, speechAt, steps } from "./testkit.ts";

const rules = oracleRules();

function focusedTree(role: string, name: string): AxNode[] {
  return axTree({ role: "RootWebArea", name: "Page", kids: [{ role: "main", kids: [{ role, name, props: { focused: true } }, { role: "button", name: "Other" }] }] });
}

describe("expectations from the tree (family B)", () => {
  const j = journey([at("reach", "TAB", [{ type: "focusOn", value: "button|Save" }], { until: { role: "button", maxAttempts: 3 } })]);

  test("a lost name is NAME_NOT_CONVEYED", () => {
    const b = block(item("regression"), "nvda-absent", 3, (side) => attempt(side, steps(j, { reach: { tree: focusedTree("button", side === "base" ? "Save" : "") } })));
    const r = compareFamily("B", b, j, rules);
    expect(r.findings).toMatchObject([{ verdict: "FAIL", symptom: "NAME_NOT_CONVEYED", stepId: "reach" }]);
  });

  test("a lost role is ROLE_NOT_CONVEYED", () => {
    const b = block(item("regression"), "nvda-absent", 3, (side) => attempt(side, steps(j, { reach: { tree: focusedTree(side === "base" ? "button" : "generic", "Save") } })));
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ROLE_NOT_CONVEYED" }]);
  });

  test("an expectation the base never meets is unobservable and gives nothing", () => {
    const b = block(item("benign"), "nvda-absent", 3, () => attempt("base", steps(j, { reach: { tree: focusedTree("link", "Save") } })));
    const r = compareFamily("B", b, j, rules);
    expect(r.findings).toEqual([]);
    expect(r.expectations[0]?.result).toBe("unobservable");
  });

  test("an inconsistent base gives REVIEW", () => {
    const b = block(item("benign"), "nvda-absent", 3, (side, rep) => attempt(side, steps(j, { reach: { tree: focusedTree("button", side === "base" && rep === 2 ? "" : "Save") } })));
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "REVIEW", rule: "base-inconsistent" }]);
  });

  test("a candidate that fails in fewer than k attempts gives REVIEW", () => {
    const b = block(item("benign"), "nvda-absent", 3, (side, rep) => attempt(side, steps(j, { reach: { tree: focusedTree("button", side === "candidate" && rep === 1 ? "" : "Save") } })));
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "REVIEW", rule: "candidate-partial" }]);
  });

  test("a focused wrapper whose only child is the dialog counts as focus on the dialog", () => {
    const jd = journey([at("open", "ACTIVATE", [{ type: "focusOn", value: "dialog|New post" }])]);
    const tree = (name: string): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "generic", name, props: { focused: true }, kids: [{ role: "dialog", name, kids: [{ role: "heading", name: "New post" }, { role: "button", name: "Close" }] }] }] });
    const b = block(item("regression"), "nvda-absent", 3, (side) => attempt(side, steps(jd, { open: { tree: tree(side === "base" ? "New post" : "") } })));
    const r = compareFamily("B", b, jd, rules);
    expect(r.expectations[0]?.base.every((e) => e.status === "met")).toBe(true);
    expect(r.findings).toMatchObject([{ verdict: "FAIL", symptom: "NAME_NOT_CONVEYED" }]);
  });

  test("stateIs reads the target's state", () => {
    const js = journey([at("tick", "PRESS", [{ type: "stateIs", value: "checkbox|Done|checked=true" }], { key: "Space" })]);
    const tree = (checked: string): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "checkbox", name: "Done", props: { focused: true, checked } }] });
    const b = block(item("regression", "STATE_NOT_CONVEYED"), "nvda-absent", 3, (side) => attempt(side, steps(js, { tick: { tree: tree(side === "base" ? "true" : "false") } })));
    expect(compareFamily("B", b, js, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "STATE_NOT_CONVEYED" }]);
  });

  test("a DOM-id target is found by its backend node id", () => {
    const js = journey([at("tick", "PRESS", [{ type: "stateIs", value: "checkbox|#cb|checked=true" }], { key: "Space" })]);
    const b = block(item("regression", "STATE_NOT_CONVEYED"), "nvda-absent", 3, (side) => {
      const tree = axTree({ role: "RootWebArea", kids: [{ role: "checkbox", props: { checked: side === "base" ? "true" : "false" } }] });
      return attempt(side, steps(js, { tick: { tree, targets: [{ id: "cb", backendId: tree[1]?.backendId ?? null }] } }));
    });
    expect(compareFamily("B", b, js, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "STATE_NOT_CONVEYED" }]);
  });
});

describe("reachability (families B and NVDA)", () => {
  const goal = at("reach-done", "NEXT_HEADING", [{ type: "focusOn", value: "heading|Done" }], { until: { name: "Done", role: "heading", maxAttempts: 3 } });

  test("after an action, a target that is present but unreached is INTERACTION_FAILS_UNDER_AT", () => {
    const j = journey([at("save", "ACTIVATE"), goal]);
    const b = block(item("regression", "JOURNEY_BLOCKED"), "nvda-absent", 3, (side) =>
      attempt(side, steps(j, { "reach-done": { outcome: side === "base" ? "REACHED" : "UNREACHABLE", tree: axTree({ role: "RootWebArea", kids: [{ role: "link", name: "Done" }] }) } })),
    );
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "INTERACTION_FAILS_UNDER_AT", stepId: "reach-done" }]);
  });

  test("a goal whose name the candidate never meets is JOURNEY_BLOCKED", () => {
    const j = journey([at("save", "ACTIVATE"), goal]);
    const b = block(item("regression", "JOURNEY_BLOCKED"), "nvda-absent", 3, (side) =>
      attempt(side, steps(j, { "reach-done": { outcome: side === "base" ? "REACHED" : "UNREACHABLE", tree: axTree({ role: "RootWebArea", kids: [{ role: "link", name: side === "base" ? "Done" : "Save" }] }) } })),
    );
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "JOURNEY_BLOCKED" }]);
  });

  test("with no action before it, an unreached present target is NAV_TARGET_UNREACHABLE", () => {
    const j = journey([goal]);
    const b = block(item("regression", "NAV_TARGET_UNREACHABLE"), "nvda-absent", 3, (side) =>
      attempt(side, steps(j, { "reach-done": { outcome: side === "base" ? "REACHED" : "UNREACHABLE", tree: axTree({ role: "RootWebArea", kids: [{ role: "paragraph", name: "Done" }] }) } })),
    );
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "NAV_TARGET_UNREACHABLE" }]);
  });

  test("a partly unreachable candidate gives REVIEW, and PATH_CHANGED gives REVIEW", () => {
    const j = journey([goal]);
    const partial = block(item("benign"), "nvda-absent", 3, (side, rep) => attempt(side, steps(j, { "reach-done": { outcome: side === "candidate" && rep === 1 ? "UNREACHABLE" : "REACHED" } })));
    expect(compareFamily("B", partial, j, rules).findings).toMatchObject([{ verdict: "REVIEW", rule: "unreachable-partial" }]);
    const changed = block(item("benign"), "nvda-absent", 3, (side) => attempt(side, steps(j, { "reach-done": { outcome: side === "candidate" ? "PATH_CHANGED" : "REACHED" } })));
    expect(compareFamily("B", changed, j, rules).findings[0]).toMatchObject({ verdict: "REVIEW", rule: "path-changed" });
  });
});

describe("focus symptoms from the journey", () => {
  const j = journey([
    at("reach", "TAB", [{ type: "focusOn", value: "button|Actions" }], { until: { role: "button", maxAttempts: 3 } }),
    at("open", "ACTIVATE", [{ type: "focusOn", value: "menu|Actions" }]),
    at("close", "PRESS", [{ type: "focusOn", value: "button|Actions" }], { key: "Escape" }),
  ]);
  const onButton = (): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "button", name: "Actions", props: { focused: true } }] });
  const inMenu = (): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "menu", name: "Actions", kids: [{ role: "menuitem", name: "Delete", props: { focused: true } }] }] });

  test("Escape that leaves focus inside the menu is KEYBOARD_TRAP", () => {
    const b = block(item("regression", "KEYBOARD_TRAP"), "nvda-absent", 3, (side) => {
      const menu = inMenu();
      return attempt(side, steps(j, { reach: { tree: onButton() }, open: { tree: menu }, close: { tree: side === "base" ? onButton() : menu } }));
    });
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "KEYBOARD_TRAP", stepId: "close" }]);
  });

  test("Escape that closes the menu but loses focus is FOCUS_NOT_RESTORED", () => {
    const b = block(item("regression", "FOCUS_NOT_RESTORED"), "nvda-absent", 3, (side) =>
      attempt(side, steps(j, { reach: { tree: onButton() }, open: { tree: inMenu() }, close: { tree: side === "base" ? onButton() : axTree({ role: "RootWebArea", name: "Page", props: { focused: true } }) } })),
    );
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "FOCUS_NOT_RESTORED" }]);
  });

  test("from speech, silence after Escape is KEYBOARD_TRAP", () => {
    const b = block(item("regression", "KEYBOARD_TRAP"), "nvda-present", 3, (side) =>
      attempt(side, steps(j, {}), { speechEvents: [...speechAt(j, "reach", ["Actions menu button collapsed"]), ...speechAt(j, "open", ["Actions menu"]), ...(side === "base" ? speechAt(j, "close", ["Actions menu button collapsed"]) : [])] }),
    );
    expect(compareFamily("NVDA", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "KEYBOARD_TRAP" }]);
  });
});

describe("announcements", () => {
  const j = journey([at("save", "ACTIVATE", [{ type: "announcementContains", value: "Saved" }])]);
  const regions = (n: number): AxNode[] =>
    axTree({ role: "RootWebArea", kids: [{ role: "alert", props: { live: "assertive" }, kids: [{ role: "StaticText", name: "Saved" }] }, ...(n > 1 ? [{ role: "status", props: { live: "polite" }, kids: [{ role: "StaticText", name: "Saved" }] }] : [])] });

  test("from speech, a duplicate is REVIEW, not FAIL (DR-0042)", () => {
    const b = block(item("regression", "ANNOUNCEMENT_DUPLICATED"), "nvda-present", 3, (side) => attempt(side, steps(j, {}), { speechEvents: speechAt(j, "save", side === "base" ? ["alert Saved"] : ["alert Saved", "Saved"]) }));
    expect(compareFamily("NVDA", b, j, rules).findings).toMatchObject([{ verdict: "REVIEW", rule: "duplicate-speech-only" }]);
  });

  test("from speech, a missing announcement is ANNOUNCEMENT_MISSING", () => {
    const b = block(item("regression", "ANNOUNCEMENT_MISSING"), "nvda-present", 5, (side) => attempt(side, steps(j, {}), { speechEvents: speechAt(j, "save", side === "base" ? ["alert Saved"] : ["Page document"]) }));
    expect(compareFamily("NVDA", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ANNOUNCEMENT_MISSING" }]);
  });

  test("the tree sees two live regions holding the text as a duplicate", () => {
    const b = block(item("regression", "ANNOUNCEMENT_DUPLICATED"), "nvda-absent", 3, (side) => attempt(side, steps(j, { save: { tree: regions(1), settled: regions(side === "base" ? 1 : 2) } })));
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ANNOUNCEMENT_DUPLICATED" }]);
  });

  test("events: a status region created already filled raises no event, so B2 finds it missing while the tree does not", () => {
    const status = (): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "status", props: { live: "polite" }, kids: [{ role: "StaticText", name: "Saved" }] }] });
    const alert = (): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "alert", props: { live: "assertive" }, kids: [{ role: "StaticText", name: "Saved" }] }] });
    const b = block(item("regression", "ANNOUNCEMENT_MISSING"), "nvda-absent", 5, (side) =>
      attempt(side, steps(j, { save: { settled: side === "base" ? alert() : status(), tree: axTree({ role: "RootWebArea" }) } }), {
        listenerEvents: side === "base" ? eventsAt(j, "save", [{ event: "EVENT_SYSTEM_ALERT", role: "alert", liveSetting: "assertive", ariaRole: "alert" }]) : [],
      }),
    );
    expect(compareFamily("B", b, j, rules).findings).toEqual([]);
    expect(compareFamily("B2", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ANNOUNCEMENT_MISSING" }]);
  });

  test("events: an alert plus a live-region change for the same text is a duplicate", () => {
    const b = block(item("regression", "ANNOUNCEMENT_DUPLICATED"), "nvda-absent", 3, (side) =>
      attempt(side, steps(j, { save: { settled: regions(side === "base" ? 1 : 2) } }), {
        listenerEvents: eventsAt(j, "save", [
          { event: "EVENT_SYSTEM_ALERT", role: "alert", liveSetting: "assertive", ariaRole: "alert" },
          ...(side === "candidate" ? [{ event: "EVENT_OBJECT_LIVEREGIONCHANGED", role: "text", liveSetting: "polite", ariaRole: "status" }] : []),
        ]),
      }),
    );
    expect(compareFamily("B2", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ANNOUNCEMENT_DUPLICATED" }]);
  });
});

describe("axe (family A)", () => {
  const j = journey([at("open", "ACTIVATE"), at("next", "TAB")]);
  const axe = (open: Record<string, number>) => ({ open: { violations: Object.entries(open).map(([id, n]) => ({ id, targets: Array.from({ length: n }, (_, i) => `#t${String(i)}`) })) }, next: { violations: [] } });

  test("a higher count of a mapped rule gives FAIL with its symptom; an unmapped one gives REVIEW", () => {
    const b = block(item("regression"), "nvda-absent", 3, (side) => attempt(side, steps(j, {}), { axe: axe(side === "base" ? { "button-name": 1, "color-contrast": 2 } : { "button-name": 2, "color-contrast": 3 }) }));
    const r = compareFamily("A", b, j, rules);
    expect(r.findings).toMatchObject([
      { verdict: "FAIL", symptom: "NAME_NOT_CONVEYED", rule: "axe-button-name" },
      { verdict: "REVIEW", rule: "axe-new-unmapped" },
    ]);
  });

  test("equal counts with different targets are not new (a class rename)", () => {
    const b = block(item("benign"), "nvda-absent", 3, (side) => attempt(side, steps(j, {}), { axe: axe({ "button-name": side === "base" ? 1 : 1 }) }));
    expect(compareFamily("A", b, j, rules).findings).toEqual([]);
  });
});

describe("route changes (family B2)", () => {
  const j = journey([at("go", "ACTIVATE")]);
  test("a route change conveyed in the base and silent in the candidate is ROUTE_CHANGE_SILENT", () => {
    const b = block(item("regression", "ROUTE_CHANGE_SILENT"), "nvda-absent", 3, (side) =>
      attempt(side, steps(j, {}), {
        timeline: recordsAt(j, "go", [{ kind: "history", target: "history", detail: "pushState" }, ...(side === "base" ? [{ kind: "title" as const, target: "title", detail: "Contacts" }] : [])]),
        listenerEvents: side === "base" ? eventsAt(j, "go", [{ event: "EVENT_OBJECT_HIDE" }, { event: "EVENT_OBJECT_FOCUS", role: "heading", name: "Contacts" }]) : [],
      }),
    );
    expect(compareFamily("B2", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ROUTE_CHANGE_SILENT" }]);
  });

  test("no route change, no finding", () => {
    const b = block(item("benign"), "nvda-absent", 3, (side) => attempt(side, steps(j, {})));
    expect(compareFamily("B2", b, j, rules).findings).toEqual([]);
  });
});

describe("tree text", () => {
  test("text below an ignored wrapper still counts inside a live region", () => {
    const j = journey([at("save", "ACTIVATE", [{ type: "announcementContains", value: "Element created" }])]);
    const toast = (text: string): AxNode[] =>
      axTree({ role: "RootWebArea", kids: [{ role: "region", name: "Notifications", props: { live: "polite" }, kids: [{ role: "list", kids: [{ role: "listitem", kids: [{ role: "none", ignored: true, kids: [{ role: "generic", kids: [{ role: "StaticText", name: text }] }] }] }] }] }] });
    const b = block(item("regression", "ANNOUNCEMENT_MISSING"), "nvda-absent", 3, (side) => attempt(side, steps(j, { save: { settled: toast(side === "base" ? "Element created" : "") } })));
    expect(compareFamily("B", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "ANNOUNCEMENT_MISSING" }]);
  });
});

describe("missing evidence is explicit (PR #8 review)", () => {
  const j = journey([at("reach", "TAB", [{ type: "focusOn", value: "button|Save" }], { until: { role: "button", maxAttempts: 3 } })]);
  const tree = (name: string): AxNode[] => axTree({ role: "RootWebArea", kids: [{ role: "button", name, props: { focused: true } }] });

  test("a block with fewer attempts than planned gives REVIEW, not a FAIL from fewer runs", () => {
    const b = block(item("regression"), "nvda-absent", 3, (side) => attempt(side, steps(j, { reach: { tree: tree(side === "base" ? "Save" : "") } })));
    const truncated = { ...b, attempts: b.attempts.filter((a) => a.side === "base" || a.repetition === 1) };
    const r = compareFamily("B", truncated, j, rules);
    expect(r.findings).toMatchObject([{ verdict: "REVIEW", rule: "attempts-missing" }]);
  });

  test("missing B2 platform events give REVIEW (P13, DR-0074)", () => {
    const b = block(item("benign"), "nvda-absent", 3, (side, rep) => attempt(side, steps(j, { reach: { tree: tree("Save") } }), { b2Evidence: side === "candidate" && rep === 2 ? "missing" : "complete" }));
    expect(compareFamily("B2", b, j, rules).findings).toMatchObject([{ verdict: "REVIEW", rule: "b2-evidence-missing" }]);
  });

  test("missing axe results at a step give REVIEW", () => {
    const b = block(item("benign"), "nvda-absent", 3, (side, rep) => attempt(side, steps(j, {}), { axe: side === "base" && rep === 1 ? {} : { reach: { violations: [] } } }));
    expect(compareFamily("A", b, j, rules).findings).toMatchObject([{ verdict: "REVIEW", rule: "axe-evidence-missing" }]);
  });

  test("axe is still compared at a step the base did not always reach", () => {
    const b = block(item("regression"), "nvda-absent", 3, (side, rep) =>
      attempt(side, steps(j, { reach: { outcome: side === "base" && rep === 1 ? "UNREACHABLE" : "REACHED" } }), { axe: { reach: { violations: side === "base" ? [] : [{ id: "button-name", targets: ["#x"] }] } } }),
    );
    expect(compareFamily("A", b, j, rules).findings).toMatchObject([{ verdict: "FAIL", symptom: "NAME_NOT_CONVEYED" }]);
  });
});

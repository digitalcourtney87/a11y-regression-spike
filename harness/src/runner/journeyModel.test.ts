import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { describe, expect, test } from "vitest";

import type { CorpusItem } from "../schema/index.ts";
import { CorpusItemSchema } from "../schema/schemas.ts";
import { ancestors, flattenAxTree, pruneAxTree } from "./axTree.ts";
import type { CdpAxNode } from "./axTree.ts";
import { goalOutcome, modalCount, nodeMatchesGoal, speechMatchesGoal } from "./goals.ts";
import { checkJourneys } from "./journeys.ts";
import { abbaOrder, repetitionsFor } from "./order.ts";
import { SETUP_NAMES } from "./setups.ts";
import { indexOfBackend, nextIndex } from "./virtualCursor.ts";

const n = (nodeId: string, role: string, name: string, childIds: string[] = [], extra: Partial<CdpAxNode> = {}): CdpAxNode => ({
  nodeId,
  role: { value: role },
  name: { value: name },
  childIds,
  ...extra,
});

// RootWebArea > [banner > heading "Posts" > text, ignored div > [nav "Menu" > link "Comments", main > [heading "Edit post", button "Save", textbox "Title" (editable), text "Done", region (unnamed)]]]
const cdp: CdpAxNode[] = [
  n("1", "RootWebArea", "Example", ["2", "5"]),
  n("2", "banner", "", ["3"], { parentId: "1" }),
  n("3", "heading", "Posts", ["4"], { parentId: "2", properties: [{ name: "level", value: { value: 1 } }], backendDOMNodeId: 30 }),
  n("4", "StaticText", "Posts", [], { parentId: "3" }),
  n("5", "generic", "", ["6", "8"], { parentId: "1", ignored: true }),
  n("6", "navigation", "Menu", ["7"], { parentId: "5" }),
  n("7", "link", "Comments", [], { parentId: "6", properties: [{ name: "focusable", value: { value: true } }], backendDOMNodeId: 70 }),
  n("8", "main", "", ["9", "10", "11", "12", "13"], { parentId: "5" }),
  n("9", "heading", "Edit post", [], { parentId: "8" }),
  n("10", "button", "Save", [], { parentId: "8", properties: [{ name: "pressed", value: { value: "false" } }, { name: "unknownProp", value: { value: 1 } }] }),
  n("11", "textbox", "Title", [], { parentId: "8", properties: [{ name: "editable", value: { value: "plaintext" } }], value: { value: "Hello" } }),
  n("12", "StaticText", "Done", [], { parentId: "8" }),
  n("13", "region", "", [], { parentId: "8" }),
];
const nodes = pruneAxTree(cdp);
const flat = flattenAxTree(nodes);
const at = (i: number | null): string => (i === null ? "none" : `${flat[i]?.role ?? "?"}:${flat[i]?.name ?? "?"}`);

describe("accessibility tree", () => {
  test("keeps role, name, value, the listed properties and links", () => {
    expect(nodes.find((x) => x.id === "10")).toEqual({ id: "10", role: "button", name: "Save", props: { pressed: "false" }, parent: "8", children: [] });
    expect(nodes.find((x) => x.id === "11")?.value).toBe("Hello");
    expect(nodes.find((x) => x.id === "5")?.ignored).toBe(true);
  });
  test("lists non-ignored nodes in document order, through ignored ones", () => {
    expect(flat.map((x) => x.id)).toEqual(["1", "2", "3", "4", "6", "7", "8", "9", "10", "11", "12", "13"]);
    const link = flat[5];
    expect(link?.name).toBe("Comments");
    if (link !== undefined) expect(ancestors(link, nodes).map((a) => a.id)).toEqual(["6", "5", "1"]);
  });
});

describe("simulated virtual cursor (P23)", () => {
  test("quick navigation by NVDA's role sets", () => {
    expect(at(nextIndex(flat, -1, "NEXT_HEADING"))).toBe("heading:Posts");
    expect(at(nextIndex(flat, 2, "NEXT_HEADING"))).toBe("heading:Edit post");
    expect(nextIndex(flat, 7, "NEXT_HEADING")).toBeNull();
    expect(at(nextIndex(flat, -1, "NEXT_BUTTON"))).toBe("button:Save");
    expect(at(nextIndex(flat, -1, "NEXT_FORM_FIELD"))).toBe("button:Save");
    expect(at(nextIndex(flat, 8, "NEXT_FORM_FIELD"))).toBe("textbox:Title");
    expect(at(nextIndex(flat, -1, "NEXT_LANDMARK"))).toBe("banner:");
    expect(at(nextIndex(flat, 1, "NEXT_LANDMARK"))).toBe("navigation:Menu");
    expect(at(nextIndex(flat, 4, "NEXT_LANDMARK"))).toBe("main:");
    // An unnamed region is not a landmark.
    expect(nextIndex(flat, 6, "NEXT_LANDMARK")).toBeNull();
  });
  test("browse next moves by line items, and read current stays", () => {
    // The heading's own text run is part of the heading's line.
    expect(at(nextIndex(flat, 2, "BROWSE_NEXT"))).toBe("link:Comments");
    expect(at(nextIndex(flat, 9, "BROWSE_NEXT"))).toBe("StaticText:Done");
    expect(at(nextIndex(flat, 5, "READ_CURRENT"))).toBe("link:Comments");
    expect(nextIndex(flat, -1, "READ_CURRENT")).toBeNull();
  });
  test("follows focus by backend node id", () => {
    expect(indexOfBackend(flat, 70)).toBe(5);
    expect(indexOfBackend(flat, 999)).toBe(-1);
    expect(indexOfBackend(flat, undefined)).toBe(-1);
  });
});

describe("goals (P24)", () => {
  test("a node meets a goal by contained name and role, with aliases and MSAA roles", () => {
    expect(nodeMatchesGoal({ name: "Comments (12)", role: "link" }, { name: "comments", role: "link", maxAttempts: 5 })).toBe(true);
    expect(nodeMatchesGoal({ name: "Save", role: "ToggleButton" }, { name: "Save", role: "button", maxAttempts: 1 })).toBe(true);
    expect(nodeMatchesGoal({ name: "Save", role: "push button" }, { name: "Save", role: "button", maxAttempts: 1 })).toBe(true);
    expect(nodeMatchesGoal({ name: "Save", role: "link" }, { name: "Save", role: "button", maxAttempts: 1 })).toBe(false);
    expect(nodeMatchesGoal({ name: "Cancel", role: "button" }, { name: "Save", maxAttempts: 1 })).toBe(false);
  });
  test("speech meets a goal when it names the target and speaks its role word", () => {
    expect(speechMatchesGoal(["Posts from /custom2", "heading level 1"], { name: "Posts from custom2", role: "heading", maxAttempts: 3 })).toBe(true);
    expect(speechMatchesGoal(["navigation landmark", "Posts link"], { role: "navigation", maxAttempts: 3 })).toBe(true);
    expect(speechMatchesGoal(["Comments", "link"], { name: "Comments", role: "button", maxAttempts: 3 })).toBe(false);
    expect(speechMatchesGoal([], { maxAttempts: 3 })).toBe(false);
  });
  test("PATH_CHANGED is relative to the base side's most common count", () => {
    expect(modalCount([2, 2, 3])).toBe(2);
    expect(modalCount([3, 2])).toBe(2);
    expect(modalCount([null, null])).toBeNull();
    expect(goalOutcome(2, 2)).toBe("REACHED");
    expect(goalOutcome(3, 2)).toBe("PATH_CHANGED");
    expect(goalOutcome(null, 2)).toBe("UNREACHABLE");
    expect(goalOutcome(4, null)).toBe("REACHED");
  });
});

describe("counterbalanced order", () => {
  test("ABBA pairs for n attempts per side", () => {
    expect(abbaOrder(3)).toEqual(["base", "candidate", "candidate", "base", "base", "candidate"]);
    expect(abbaOrder(1)).toEqual(["base", "candidate"]);
    expect(() => abbaOrder(0)).toThrow();
  });
  test("n is 5 beside an absence-based regression, else 3, unless the item sets it", () => {
    const item = (id: string, patternId: string, journeyId: string, expected: CorpusItem["expected"], repetitions?: number): CorpusItem => ({
      id,
      patternId,
      split: "dev",
      source: "seeded",
      app: "a",
      journeyId,
      base: { ref: "r" },
      candidate: { patch: `${id}.patch` },
      expected,
      ...(repetitions === undefined ? {} : { repetitions }),
      provenance: { origin: "o" },
    });
    const corpus = [
      item("m", "p1", "j1", { kind: "regression", symptom: "ANNOUNCEMENT_MISSING", mechanism: "x" }),
      item("m-twin", "p1", "j1", { kind: "benign", benignType: "CSS_ONLY" }),
      item("f", "p2", "j2", { kind: "regression", symptom: "FOCUS_NOT_MOVED", mechanism: "x" }),
      item("j1-unchanged", "p1", "j1", { kind: "unchanged" }),
      item("j2-unchanged", "p2", "j2", { kind: "unchanged" }),
      item("r", "p3", "j2", { kind: "regression", symptom: "NAME_NOT_CONVEYED", mechanism: "x" }, 4),
    ];
    expect(corpus.map((c) => repetitionsFor(c, corpus))).toEqual([5, 5, 3, 5, 3, 4]);
  });
});

describe("journey checks", () => {
  const journey = { id: "j1", version: "1", app: "a", entryUrl: "/", anchor: "#start", steps: [{ kind: "at", id: "s1", strategy: "TAB", observeMs: 500, expectations: [{ type: "focusOn", value: "button|Save" }] }] };
  const item = (journeyId: string, app = "a"): CorpusItem => ({ id: `i-${journeyId}`, patternId: "p", split: "dev", source: "seeded", app, journeyId, base: { ref: "r" }, candidate: { patch: "x.patch" }, expected: { kind: "unchanged" }, provenance: { origin: "o" } });
  test("accepts a valid journey used by its items", () => {
    expect(checkJourneys(new Map([["j1.json", journey]]), [item("j1")], new Set()).errors).toEqual([]);
  });
  test("reports a missing journey, a wrong app, an unknown setup, a bad expectation and an empty TYPE", () => {
    const bad = { ...journey, steps: [{ kind: "setup", id: "s0", fn: "nope" }, { kind: "at", id: "s1", strategy: "TYPE", observeMs: 0, expectations: [{ type: "focusOn", value: "Save" }, { type: "stateIs", value: "checkbox|x" }] }] };
    const errors = checkJourneys(new Map([["j1.json", bad]]), [item("j1", "b"), item("j2")], new Set()).errors;
    expect(errors.join("\n")).toMatch(/unknown setup "nope"/);
    expect(errors.join("\n")).toMatch(/TYPE step "s1" needs text/);
    expect(errors.join("\n")).toMatch(/focusOn "Save" is not/);
    expect(errors.join("\n")).toMatch(/stateIs "checkbox\|x" is not/);
    expect(errors.join("\n")).toMatch(/is for app "a", not "b"/);
    expect(errors.join("\n")).toMatch(/journey "j2" not found/);
  });
  test("every committed journey is valid, and every corpus item has its journey", () => {
    const dir = resolve(import.meta.dirname, "../../../journeys");
    const files = new Map(readdirSync(dir).filter((f) => f.endsWith(".json") && !f.includes(" 2.")).map((f) => [f, JSON.parse(readFileSync(join(dir, f), "utf8")) as unknown]));
    const itemsDir = resolve(import.meta.dirname, "../../../corpus/items");
    const items = readdirSync(itemsDir).filter((f) => f.endsWith(".json") && !f.includes(" 2.")).map((f) => CorpusItemSchema.parse(JSON.parse(readFileSync(join(itemsDir, f), "utf8"))));
    expect(checkJourneys(files, items, SETUP_NAMES).errors).toEqual([]);
  });
});

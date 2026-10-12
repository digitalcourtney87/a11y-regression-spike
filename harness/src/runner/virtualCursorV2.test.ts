import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { flattenAxTree } from "./axTree.ts";
import type { AxNode } from "./axTree.ts";
import { indexOfBackend, lineAt, nextIndex } from "./virtualCursor.ts";
import { browseV2, indexOfPosition, lineAtV2, positionAt } from "./virtualCursorV2.ts";
import type { CursorPosition } from "./virtualCursorV2.ts";

/** Development data only (P42/DR-0120): the M8 owned feedback-document tree that exposed the stall. */
const ownedTree = JSON.parse(readFileSync(resolve(import.meta.dirname, "../../../docs/research/m8-calibration-evidence/owned-feedback-ax.json"), "utf8")) as AxNode[];

function node(id: string, role: string, name: string, parent: string | undefined, children: string[], backendId?: number, ignored = false): AxNode {
  return { id, role, name, props: {}, children, ...(parent === undefined ? {} : { parent }), ...(backendId === undefined ? {} : { backendId }), ...(ignored ? { ignored: true as const } : {}) };
}

/** v1 as the item runner drives it (NVDA-absent BROWSE_NEXT): a position is a backend id, kept when the new node has none. */
function replayV1(all: AxNode[], steps: number): string[][] {
  const flat = flattenAxTree(all);
  let backendId: number | undefined;
  let atTop = true;
  const lines: string[][] = [];
  for (let s = 0; s < steps; s++) {
    const from = atTop ? -1 : indexOfBackend(flat, backendId);
    atTop = false;
    const idx = nextIndex(flat, from, "BROWSE_NEXT");
    if (idx === null) continue;
    const n = flat[idx];
    if (n?.backendId !== undefined) backendId = n.backendId;
    lines.push(lineAt(flat, idx).map((i) => flat[i]?.name ?? ""));
  }
  return lines;
}

function replayV2(all: AxNode[], steps: number): { names: string[][]; ids: string[][] } {
  let position: CursorPosition | null = null;
  const names: string[][] = [];
  const ids: string[][] = [];
  for (let s = 0; s < steps; s++) {
    const r = browseV2(all, position, "BROWSE_NEXT");
    if (r === null) continue;
    position = r.position;
    names.push(r.line.map((n) => n.name));
    ids.push(r.line.map((n) => n.id));
  }
  return { names, ids };
}

/** An option whose CSS marker sits under an ignored, backend-carrying container, as in the M8 tree. */
const markerTree: AxNode[] = [
  node("1", "RootWebArea", "", undefined, ["2", "5", "9"], 1),
  node("2", "heading", "Top", "1", ["3"], 2),
  node("3", "StaticText", "Top", "2", [], 3),
  node("5", "option", "First", "1", ["6", "8"], 5),
  node("6", "none", "", "5", ["7"], 6, true),
  node("7", "StaticText", "1. ", "6", []),
  node("8", "StaticText", "First", "5", [], 8),
  node("9", "paragraph", "", "1", ["10"], 9),
  node("10", "StaticText", "After", "9", [], 10),
];

/** Generated text with no DOM node, outside any line container. */
const generatedTree: AxNode[] = [
  node("1", "RootWebArea", "", undefined, ["2", "4", "9"], 1),
  node("2", "heading", "Top", "1", ["3"], 2),
  node("3", "StaticText", "Top", "2", [], 3),
  node("4", "generic", "", "1", ["5", "7"], 4, true),
  node("5", "none", "", "4", ["6"], 5, true),
  node("6", "StaticText", "Note: ", "5", []),
  node("7", "StaticText", "Check the panel.", "4", [], 7),
  node("9", "paragraph", "", "1", ["10"], 9),
  node("10", "StaticText", "After", "9", [], 10),
];

/** No ignored ancestry or generated text. */
const plainTree: AxNode[] = [
  node("1", "RootWebArea", "", undefined, ["2", "4", "6", "8"], 1),
  node("2", "heading", "Plain", "1", ["3"], 2),
  node("3", "StaticText", "Plain", "2", [], 3),
  node("4", "paragraph", "", "1", ["5"], 4),
  node("5", "StaticText", "One.", "4", [], 5),
  node("6", "button", "Act", "1", ["7"], 6),
  node("7", "StaticText", "Act", "6", [], 7),
  node("8", "paragraph", "", "1", ["9"], 8),
  node("9", "StaticText", "Last.", "8", [], 9),
];

describe("cursor v2 line grouping (P42)", () => {
  test("text under an ignored ancestor joins its line container's line", () => {
    const flat = flattenAxTree(markerTree);
    const marker = flat.findIndex((n) => n.id === "7");
    expect(lineAtV2(markerTree, marker).map((i) => flat[i]?.id)).toEqual(["5", "7", "8"]);
  });

  test("v1 separates the same marker into a line of its own", () => {
    const flat = flattenAxTree(markerTree);
    expect(lineAt(flat, flat.findIndex((n) => n.id === "7")).map((i) => flat[i]?.id)).toEqual(["7"]);
  });
});

describe("cursor v2 position identity (P42)", () => {
  test("a node without a backend id has a position that resolves back to it", () => {
    const flat = flattenAxTree(generatedTree);
    const note = flat.findIndex((n) => n.id === "6");
    expect(indexOfPosition(generatedTree, positionAt(generatedTree, note))).toBe(note);
  });

  test("the position resolves in a fresh read of the same tree, not by object identity", () => {
    const flat = flattenAxTree(generatedTree);
    const position = positionAt(generatedTree, flat.findIndex((n) => n.id === "6"));
    const reread = structuredClone(generatedTree);
    expect(flattenAxTree(reread)[indexOfPosition(reread, position)]?.name).toBe("Note: ");
  });

  test("a position that cannot be resolved is reported as -1", () => {
    expect(indexOfPosition(plainTree, { anchor: { backendId: 99, ordinal: 0 } })).toBe(-1);
  });

  test("generated text no longer stalls the cursor", () => {
    expect(replayV2(generatedTree, 6).names).toEqual([["Top", "Top"], ["Note: "], ["Check the panel."], ["After"]]);
  });

  test("v1 stalls on the same generated text", () => {
    expect(replayV1(generatedTree, 4)).toEqual([["Top", "Top"], ["Note: "], ["Note: "], ["Note: "]]);
  });
});

describe("cursor v2 on the M8 development tree (P42 development acceptance)", () => {
  test("v1 repeats the bullet, as the M8 replay recorded", () => {
    expect(replayV1(ownedTree, 12).slice(5)).toEqual(Array.from({ length: 7 }, () => ["• "]));
  });

  test("v2 reaches Chosen Alpha within 12 steps and never repeats a line", () => {
    const { names, ids } = replayV2(ownedTree, 12);
    const reached = names.findIndex((line) => line.some((n) => n === "Chosen Alpha"));
    expect(reached).toBeGreaterThanOrEqual(0);
    expect(reached).toBeLessThan(12);
    for (let k = 1; k <= reached; k++) expect(ids[k]).not.toEqual(ids[k - 1]);
  });

  test("v1 and v2 read the same lines before the option, and v2's option line includes its bullet", () => {
    const v1 = replayV1(ownedTree, 5);
    const v2 = replayV2(ownedTree, 5).names;
    expect(v2.slice(0, 4)).toEqual(v1.slice(0, 4));
    expect(v1[4]).toEqual(["Alpha", "Alpha"]);
    expect(v2[4]).toEqual(["Alpha", "• ", "Alpha"]);
  });
});

describe("cursor v2 without ignored ancestry or generated text", () => {
  test("its lines equal v1's", () => {
    expect(replayV2(plainTree, 4).names).toEqual(replayV1(plainTree, 4));
  });

  test("at the end it stays on the last line", () => {
    const flat = flattenAxTree(plainTree);
    const last = positionAt(plainTree, flat.findIndex((n) => n.id === "9"));
    expect(browseV2(plainTree, last, "BROWSE_NEXT")).toBeNull();
  });

  test("quick navigation is unchanged from v1", () => {
    const flat = flattenAxTree(plainTree);
    const r = browseV2(plainTree, null, "NEXT_BUTTON");
    expect(r?.line.map((n) => n.id)).toEqual([flat[nextIndex(flat, -1, "NEXT_BUTTON") ?? -1]?.id]);
  });
});

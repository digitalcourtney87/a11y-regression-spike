/**
 * Simulated virtual cursor v2, for the P42 registered evaluation only (DR-0120). v1 (virtualCursor.ts) is
 * unchanged and stays the default; v2 runs only when a P42 calibration case selects it, never for corpus items.
 *
 * Two corrections to v1, both found on the M8 owned feedback tree (docs/reports/M8-calibration.md):
 *
 * - Ignored ancestry. Line grouping walks parents through the full tree, ignored nodes included, so text under
 *   an ignored node (a CSS list marker, a role="none" span) joins its line container's line. An ignored node is
 *   never itself a line container.
 * - Identity. A position on a node without a DOM backend (generated text) is kept as its nearest
 *   backend-carrying ancestor and its ordinal among that ancestor's unbacked nodes, so the next step starts
 *   after it. v1 keeps the previous backend id instead, and finds the same node again.
 *
 * Quick navigation, the role sets and what counts as being on a line are v1's.
 */
import { flattenAxTree } from "./axTree.ts";
import type { AxNode } from "./axTree.ts";
import { CONTROL_ROLES, LINE_ROLES, indexOfBackend, isHeading, nextIndex, onLine } from "./virtualCursor.ts";
import type { BrowseStrategy } from "./virtualCursor.ts";

/** A cursor position: a backend id, or an anchor and ordinal for a node without one, or (no anchor at all) its AX id. */
export interface CursorPosition {
  backendId?: number;
  anchor?: { backendId: number; ordinal: number };
  axId?: string;
}

interface Prepared {
  byId: ReadonlyMap<string, AxNode>;
  flat: AxNode[];
  keys: string[];
}

function lineKey(byId: ReadonlyMap<string, AxNode>, node: AxNode): string {
  let current: AxNode | undefined = node;
  for (let guard = 0; current !== undefined && guard < 200; guard++) {
    if (current.ignored !== true && (LINE_ROLES.has(current.role) || isHeading(current) || (CONTROL_ROLES.has(current.role) && current !== node))) return current.id;
    current = current.parent === undefined ? undefined : byId.get(current.parent);
  }
  return node.id;
}

function prepare(all: readonly AxNode[]): Prepared {
  const byId = new Map(all.map((n) => [n.id, n]));
  const flat = flattenAxTree(all);
  return { byId, flat, keys: flat.map((n) => lineKey(byId, n)) };
}

/** The backend id of the node's nearest ancestor that has one, ignored ancestors included. */
function anchorOf(byId: ReadonlyMap<string, AxNode>, node: AxNode): number | undefined {
  let current = node.parent === undefined ? undefined : byId.get(node.parent);
  for (let guard = 0; current !== undefined && guard < 200; guard++) {
    if (current.backendId !== undefined) return current.backendId;
    current = current.parent === undefined ? undefined : byId.get(current.parent);
  }
  return undefined;
}

function lineIndices(p: Prepared, i: number): number[] {
  const key = p.keys[i];
  const out: number[] = [];
  for (let j = 0; j < p.flat.length; j++) if (p.keys[j] === key && onLine(p.flat[j] as AxNode)) out.push(j);
  return out.length > 0 ? out : [i];
}

/** The flat indices of the nodes on the line that contains flat index i. */
export function lineAtV2(all: readonly AxNode[], i: number): number[] {
  return lineIndices(prepare(all), i);
}

function positionIn(p: Prepared, i: number): CursorPosition {
  const n = p.flat[i];
  if (n === undefined) return {};
  if (n.backendId !== undefined) return { backendId: n.backendId };
  const anchor = anchorOf(p.byId, n);
  if (anchor === undefined) return { axId: n.id };
  let ordinal = 0;
  for (let j = 0; j < i; j++) {
    const m = p.flat[j] as AxNode;
    if (m.backendId === undefined && anchorOf(p.byId, m) === anchor) ordinal++;
  }
  return { anchor: { backendId: anchor, ordinal }, axId: n.id };
}

/** The position of flat index i. */
export function positionAt(all: readonly AxNode[], i: number): CursorPosition {
  return positionIn(prepare(all), i);
}

function indexIn(p: Prepared, position: CursorPosition): number {
  if (position.backendId !== undefined) return indexOfBackend(p.flat, position.backendId);
  if (position.anchor !== undefined) {
    let seen = 0;
    for (let j = 0; j < p.flat.length; j++) {
      const m = p.flat[j] as AxNode;
      if (m.backendId !== undefined || anchorOf(p.byId, m) !== position.anchor.backendId) continue;
      if (seen === position.anchor.ordinal) return j;
      seen++;
    }
    return -1;
  }
  if (position.axId !== undefined) return p.flat.findIndex((n) => n.id === position.axId);
  return -1;
}

/** The flat index a position resolves to in this tree, or -1. */
export function indexOfPosition(all: readonly AxNode[], position: CursorPosition): number {
  return indexIn(prepare(all), position);
}

/**
 * One browse key press. `start` null is the top of the document (DOCUMENT_TOP or a fresh page). When `start`
 * does not resolve, `fallback` (the focused node, as in v1) is tried. Returns null when there is nothing
 * further, so the caller keeps its position and line (DR-0085).
 */
export function browseV2(all: readonly AxNode[], start: CursorPosition | null, strategy: BrowseStrategy, fallback?: CursorPosition): { index: number; position: CursorPosition; line: AxNode[] } | null {
  const p = prepare(all);
  let from = start === null ? -1 : indexIn(p, start);
  if (from < 0 && start !== null && fallback !== undefined) from = indexIn(p, fallback);
  let idx: number | null;
  if (strategy === "BROWSE_NEXT" || strategy === "READ_CURRENT") {
    const currentKey = from >= 0 && from < p.flat.length ? p.keys[from] : null;
    if (strategy === "READ_CURRENT" && currentKey !== null) idx = lineIndices(p, from)[0] ?? from;
    else {
      idx = null;
      for (let i = from + 1; i < p.flat.length; i++) {
        const n = p.flat[i];
        if (n === undefined || !onLine(n)) continue;
        if (strategy === "READ_CURRENT" || currentKey === null || p.keys[i] !== currentKey) {
          idx = i;
          break;
        }
      }
    }
  } else idx = nextIndex(p.flat, from, strategy);
  if (idx === null) return null;
  const line = strategy === "BROWSE_NEXT" || strategy === "READ_CURRENT" ? lineIndices(p, idx).map((i) => p.flat[i] as AxNode) : [p.flat[idx] as AxNode];
  return { index: idx, position: positionIn(p, idx), line };
}

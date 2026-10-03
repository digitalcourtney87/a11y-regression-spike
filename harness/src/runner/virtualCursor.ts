/**
 * The simulated virtual cursor of the NVDA-absent leg (P23; DR-0066,
 * DR-0067). Browse strategies move it over Chrome's accessibility tree in
 * document order (axTree.ts), with the quick-navigation role sets of NVDA
 * release-2026.2 (`source/virtualBuffers/gecko_ia2.py`,
 * `_searchableAttribsForNodeType`, and `source/aria.py` `landmarkRoles`),
 * mapped to Chrome's accessibility roles:
 *
 * - NEXT_HEADING (h): headings.
 * - NEXT_BUTTON (b): push buttons, menu buttons and toggle buttons.
 * - NEXT_FORM_FIELD (f): buttons, menu buttons, check boxes, combo boxes,
 *   lists, trees, radio buttons, tabs and toggle buttons that are not read
 *   only; and editable fields.
 * - NEXT_LANDMARK (d): banner, complementary, contentinfo, main, navigation,
 *   search and form landmarks, and regions with a name.
 * - BROWSE_NEXT (down arrow): the next line. A line is a control, a heading,
 *   or the run of nodes inside one list item, paragraph, cell, option or menu
 *   item, as NVDA reads "bullet Ana graphic busy" as one line; text outside
 *   such containers is a line of its own.
 * - READ_CURRENT (NVDA+Up): the current line; with no position yet (after a
 *   page load), the first line, where NVDA's cursor starts.
 *
 * Like NVDA's browse cursor, the simulated cursor follows focus: after TAB or
 * SHIFT_TAB it is placed on the focused node. Each step is one key press, so
 * a step that finds nothing leaves the cursor where it was and returns null.
 * This is a model, and its limits are those of the role mapping above.
 */
import type { AxNode } from "./axTree.ts";

export type BrowseStrategy = "NEXT_HEADING" | "NEXT_BUTTON" | "NEXT_FORM_FIELD" | "NEXT_LANDMARK" | "BROWSE_NEXT" | "READ_CURRENT";

const BUTTON_ROLES: ReadonlySet<string> = new Set(["button", "togglebutton", "ToggleButton", "PopUpButton"]);
const FORM_FIELD_ROLES: ReadonlySet<string> = new Set([
  ...BUTTON_ROLES, "checkbox", "switch", "combobox", "listbox", "tree", "radio", "tab", "menuitemcheckbox",
]);
const LANDMARK_ROLES: ReadonlySet<string> = new Set(["banner", "complementary", "contentinfo", "main", "navigation", "search"]);
const CONTROL_ROLES: ReadonlySet<string> = new Set([
  ...FORM_FIELD_ROLES, "link", "textbox", "searchbox", "spinbutton", "slider", "menuitem", "menuitemradio", "option", "treeitem", "img", "image",
]);
const TEXT_ROLES: ReadonlySet<string> = new Set(["StaticText", "staticText"]);

function isEditable(n: AxNode): boolean {
  return n.props.editable !== undefined && n.props.editable !== "" && n.props.readonly !== true;
}

export function isHeading(n: AxNode): boolean {
  return n.role === "heading";
}

export function isButton(n: AxNode): boolean {
  return BUTTON_ROLES.has(n.role);
}

export function isFormField(n: AxNode): boolean {
  return (FORM_FIELD_ROLES.has(n.role) && n.props.readonly !== true) || isEditable(n) || n.role === "textbox" || n.role === "searchbox";
}

export function isLandmark(n: AxNode): boolean {
  return LANDMARK_ROLES.has(n.role) || ((n.role === "region" || n.role === "form") && n.name.trim() !== "");
}

const MATCHERS: Record<Exclude<BrowseStrategy, "BROWSE_NEXT" | "READ_CURRENT">, (n: AxNode) => boolean> = {
  NEXT_HEADING: isHeading,
  NEXT_BUTTON: isButton,
  NEXT_FORM_FIELD: isFormField,
  NEXT_LANDMARK: isLandmark,
};

/** Containers whose content NVDA reads as one line. */
const LINE_ROLES: ReadonlySet<string> = new Set(["listitem", "paragraph", "cell", "gridcell", "rowheader", "columnheader", "option", "menuitem", "menuitemcheckbox", "menuitemradio", "treeitem"]);

/** The line a node belongs to: the nearest line container (a heading or control counts as its own line), or the node itself. */
function lineKey(flat: readonly AxNode[], byId: ReadonlyMap<string, AxNode>, i: number): string {
  const node = flat[i];
  if (node === undefined) return "";
  let current: AxNode | undefined = node;
  for (let guard = 0; current !== undefined && guard < 200; guard++) {
    if (LINE_ROLES.has(current.role) || isHeading(current) || (CONTROL_ROLES.has(current.role) && current !== node)) return current.id;
    current = current.parent === undefined ? undefined : byId.get(current.parent);
  }
  return node.id;
}

/** Whether a node starts or carries content on a line (not an empty structural node). */
function onLine(n: AxNode): boolean {
  return CONTROL_ROLES.has(n.role) || isHeading(n) || (TEXT_ROLES.has(n.role) && n.name.trim() !== "");
}

/** The indices of the nodes on the line that contains index i. */
export function lineAt(flat: readonly AxNode[], i: number): number[] {
  const byId = new Map(flat.map((n) => [n.id, n]));
  const key = lineKey(flat, byId, i);
  const out: number[] = [];
  for (let j = 0; j < flat.length; j++) if (lineKey(flat, byId, j) === key && onLine(flat[j] as AxNode)) out.push(j);
  return out.length > 0 ? out : [i];
}

/**
 * The index of the next node for a browse strategy after `from` (-1 before
 * the first node), or null when there is none. For BROWSE_NEXT and
 * READ_CURRENT it is the first node of the line; `lineAt` gives the rest.
 */
export function nextIndex(flat: readonly AxNode[], from: number, strategy: BrowseStrategy): number | null {
  const byId = new Map(flat.map((n) => [n.id, n]));
  const firstLine = (after: number, currentKey: string | null): number | null => {
    for (let i = after + 1; i < flat.length; i++) {
      const n = flat[i];
      if (n === undefined || !onLine(n)) continue;
      if (currentKey === null || lineKey(flat, byId, i) !== currentKey) return i;
    }
    return null;
  };
  if (strategy === "READ_CURRENT") {
    if (from >= 0 && from < flat.length) return lineAt(flat, from)[0] ?? from;
    return firstLine(-1, null);
  }
  if (strategy === "BROWSE_NEXT") return firstLine(from, from >= 0 ? lineKey(flat, byId, from) : null);
  const match = MATCHERS[strategy];
  for (let i = from + 1; i < flat.length; i++) {
    const n = flat[i];
    if (n !== undefined && match(n)) return i;
  }
  return null;
}

/** The cursor position after focus moves: the focused node's index, or -1 when it is not in the tree. */
export function indexOfBackend(flat: readonly AxNode[], backendId: number | undefined): number {
  if (backendId === undefined) return -1;
  return flat.findIndex((n) => n.backendId === backendId);
}

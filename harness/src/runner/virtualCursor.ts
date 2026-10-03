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
 * - BROWSE_NEXT (down arrow): the next line item, modelled as the next
 *   control, or the next text run that is not inside a control.
 * - READ_CURRENT: no movement.
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

/** The index of the next node for a browse strategy after `from` (-1 before the first node), or null when there is none. */
export function nextIndex(flat: readonly AxNode[], from: number, strategy: BrowseStrategy): number | null {
  if (strategy === "READ_CURRENT") return from >= 0 && from < flat.length ? from : null;
  if (strategy === "BROWSE_NEXT") {
    const byId = new Map(flat.map((n) => [n.id, n]));
    // A text run inside a control or heading is part of that item's line, not a line of its own.
    const insideControl = (i: number): boolean => {
      const node = flat[i];
      if (node === undefined) return false;
      let parentId = node.parent;
      for (let guard = 0; parentId !== undefined && guard < 200; guard++) {
        const parent = byId.get(parentId);
        if (parent === undefined) return false;
        if (CONTROL_ROLES.has(parent.role) || isHeading(parent)) return true;
        parentId = parent.parent;
      }
      return false;
    };
    for (let i = from + 1; i < flat.length; i++) {
      const n = flat[i];
      if (n === undefined) continue;
      if (CONTROL_ROLES.has(n.role) || isHeading(n)) return i;
      if (TEXT_ROLES.has(n.role) && n.name.trim() !== "" && !insideControl(i)) return i;
    }
    return null;
  }
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

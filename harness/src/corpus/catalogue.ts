/**
 * The M3 regression and benign catalogues (P16, approved by the owner
 * 2026-10-03, DR-0057; `docs/research/2026-10-03-m3-corpus-plan.md` §4–§5).
 * Each operator names one mechanism: a regression operator maps to the
 * primary-analysis symptom it should produce (the scored unit, R2; the
 * mechanism is metadata), a benign operator to its BenignType. Contexts are
 * where a pattern can be built: the SPA (Atomic CRM) or a mined open-source
 * pair; Prompt to Page exports are set aside for now (P18).
 */
import type { BenignType, Symptom } from "../schema/index.ts";

export type Context = "spa" | "oss";

export interface RegressionOperator {
  id: string;
  kind: "regression";
  symptom: Symptom;
  mechanism: string;
  contexts: readonly Context[];
  /** True for the creation-time family of DR-0013 (kept: the K6a rule was not triggered). */
  creationTime?: boolean;
}

export interface BenignOperator {
  id: string;
  kind: "benign";
  benignType: BenignType;
  mechanism: string;
}

export type Operator = RegressionOperator | BenignOperator;

const r = (id: string, symptom: Symptom, mechanism: string, contexts: readonly Context[], creationTime = false): RegressionOperator => ({
  id,
  kind: "regression",
  symptom,
  mechanism,
  contexts,
  ...(creationTime ? { creationTime } : {}),
});

const b = (id: string, benignType: BenignType, mechanism: string): BenignOperator => ({ id, kind: "benign", benignType, mechanism });

export const REGRESSION_OPERATORS: readonly RegressionOperator[] = [
  r("icon-button-label-removed", "NAME_NOT_CONVEYED", "Icon-only button loses its aria-label", ["spa", "oss"]),
  r("field-label-disassociated", "NAME_NOT_CONVEYED", "Field label disassociated (htmlFor or id mismatch)", ["spa"]),
  r("dialog-labelledby-removed", "NAME_NOT_CONVEYED", "Dialog loses aria-labelledby (its title no longer names it)", ["spa", "oss"]),
  r("image-alt-removed", "NAME_NOT_CONVEYED", "Image or avatar loses its alt text", ["spa"]),
  r("button-to-div", "ROLE_NOT_CONVEYED", "Button replaced by a clickable div", ["spa"]),
  r("tab-roles-removed", "ROLE_NOT_CONVEYED", "Tabs lose role=tab/tablist", ["spa", "oss"]),
  r("heading-to-div", "ROLE_NOT_CONVEYED", "Heading replaced by a styled div", ["spa"]),
  r("combobox-role-removed", "ROLE_NOT_CONVEYED", "Combobox trigger loses its role", ["spa", "oss"]),
  r("expanded-not-updated", "STATE_NOT_CONVEYED", "aria-expanded not updated on a menu or disclosure trigger", ["spa", "oss"]),
  r("checked-stale", "STATE_NOT_CONVEYED", "aria-checked or aria-pressed stale on a checkbox, switch or toggle", ["spa", "oss"]),
  r("invalid-missing", "STATE_NOT_CONVEYED", "aria-invalid missing on a field with a validation error", ["spa"]),
  r("selected-stale", "STATE_NOT_CONVEYED", "aria-selected stale on a tab or option", ["spa", "oss"]),
  r("toast-region-created-populated", "ANNOUNCEMENT_MISSING", "Toast region rendered only when populated", ["spa", "oss"], true),
  r("live-region-removed", "ANNOUNCEMENT_MISSING", "aria-live or role=status removed from the notification region", ["spa"]),
  r("busy-left-true", "ANNOUNCEMENT_MISSING", "aria-busy left true on a region", ["spa"]),
  r("live-region-hidden-ancestor", "ANNOUNCEMENT_MISSING", "aria-hidden or inert on an ancestor of the live region", ["spa"]),
  r("error-not-announced", "ANNOUNCEMENT_MISSING", "Validation error text no longer in a live region or associated with its field", ["spa"]),
  r("toast-duplicated", "ANNOUNCEMENT_DUPLICATED", "Two notification regions both announce the same toast", ["spa", "oss"]),
  r("live-update-repeated", "ANNOUNCEMENT_DUPLICATED", "A live region is updated twice with the same text", ["spa"]),
  r("dialog-initial-focus-removed", "FOCUS_NOT_MOVED", "Dialog opens without moving focus into it", ["spa", "oss"]),
  r("route-focus-removed", "FOCUS_NOT_MOVED", "Route change no longer moves focus to the new heading", ["spa"]),
  r("focus-left-on-removed", "FOCUS_NOT_MOVED", "After an inline create, focus is left on a removed element", ["spa"]),
  r("dialog-focus-not-restored", "FOCUS_NOT_RESTORED", "Closing a dialog does not return focus to its trigger", ["spa", "oss"]),
  r("menu-focus-not-restored", "FOCUS_NOT_RESTORED", "Closing a menu or popover does not return focus", ["spa", "oss"]),
  r("dialog-containment-removed", "FOCUS_ESCAPES_DIALOG", "Modal dialog loses its focus containment", ["spa", "oss"]),
  r("aria-modal-removed", "FOCUS_ESCAPES_DIALOG", "aria-modal removed, and the background is no longer inert", ["spa", "oss"]),
  r("tab-swallowed", "KEYBOARD_TRAP", "A component swallows Tab", ["spa"]),
  r("escape-not-closing", "KEYBOARD_TRAP", "Escape no longer closes a popover that captures focus", ["spa", "oss"]),
  r("action-tabindex-removed", "NAV_TARGET_UNREACHABLE", "Primary action given tabindex=-1", ["spa"]),
  r("landmark-or-heading-removed", "NAV_TARGET_UNREACHABLE", "Landmark or heading removed, so a declared strategy cannot reach the target", ["spa"]),
  r("navigation-hidden", "NAV_TARGET_UNREACHABLE", "Navigation hidden with aria-hidden", ["spa"]),
  r("pointer-only-activation", "INTERACTION_FAILS_UNDER_AT", "Activation bound to mousedown or pointerdown only", ["spa", "oss"]),
  r("drag-only-reorder", "INTERACTION_FAILS_UNDER_AT", "Drag-only reordering with no keyboard path", ["spa"]),
  r("combobox-keyboard-broken", "INTERACTION_FAILS_UNDER_AT", "Combobox options not selectable from the keyboard", ["spa", "oss"]),
  r("route-change-silent", "ROUTE_CHANGE_SILENT", "Route change no longer conveyed (no focus move, announcement or title change)", ["spa"]),
  r("submit-pointer-only", "JOURNEY_BLOCKED", "Submit requires a pointer-only control", ["spa"]),
  r("required-field-unnamed", "JOURNEY_BLOCKED", "A required field has no accessible name, so a goal-based step cannot find it", ["spa"]),
];

export const BENIGN_OPERATORS: readonly BenignOperator[] = [
  b("wrapper-added", "WRAPPER_ELEMENT", "Wrap a control or region in a non-semantic div or span"),
  b("class-rename", "CLASS_RENAME", "Rename Tailwind or component classes with no visual or semantic change"),
  b("css-only", "CSS_ONLY", "Change colour, spacing or layout only"),
  b("copy-edit", "COPY_EDIT", "Edit visible text that no journey expectation asserts"),
  b("a11y-improvement", "A11Y_IMPROVEMENT", "Add a missing description, label a landmark, or associate an error"),
  b("equivalent-refactor", "EQUIVALENT_REFACTOR", "Replace a component with equivalent markup and behaviour"),
  b("timing-within-tolerance", "TIMING_WITHIN_TOLERANCE", "Delay a toast or a focus move by less than the declared tolerance"),
];

export const OPERATORS: readonly Operator[] = [...REGRESSION_OPERATORS, ...BENIGN_OPERATORS];

export function operatorById(id: string): Operator | undefined {
  return OPERATORS.find((o) => o.id === id);
}

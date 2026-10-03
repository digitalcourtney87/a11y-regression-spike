/**
 * Goal-based steps (P24; DR-0066, DR-0067). An AT step with `until` repeats
 * its strategy up to `maxAttempts` and checks the goal after each attempt:
 *
 * - NVDA-absent leg: the accessibility-tree node at the focus (TAB,
 *   SHIFT_TAB) or at the simulated virtual cursor (browse strategies), by
 *   `nodeMatchesGoal`.
 * - NVDA-present leg: the MSAA focus read for TAB and SHIFT_TAB, by
 *   `nodeMatchesGoal` on its name and role; NVDA's queued speech for browse
 *   strategies, by `speechMatchesGoal`.
 *
 * Names are compared as NVDA's speech is in P11: lower-cased letters and
 * digits, by containment (`speechKey`). The outcome of a step that reaches
 * its goal is REACHED at the base side's most common attempt count in the
 * same leg, and PATH_CHANGED at any other count; a step that does not is
 * UNREACHABLE, and the journey stops there (hard rule 8).
 */
import { speechKey } from "./outcome.ts";

export interface Goal {
  name?: string;
  role?: string;
  maxAttempts: number;
}

/** Goal roles that accept more than one Chrome accessibility role. */
const ROLE_ALIASES: Record<string, readonly string[]> = {
  button: ["button", "togglebutton", "ToggleButton", "PopUpButton"],
  combobox: ["combobox", "PopUpButton"],
  textbox: ["textbox", "searchbox"],
  image: ["img", "image"],
  img: ["img", "image"],
  text: ["StaticText", "staticText"],
};

/** MSAA role names (as the Windows helper reads them) for goal roles. */
const MSAA_ROLES: Record<string, readonly string[]> = {
  button: ["push button", "button", "menu button", "toggle button"],
  link: ["link"],
  checkbox: ["check box", "checkbox"],
  textbox: ["editable text", "text"],
  combobox: ["combo box", "combobox"],
  tab: ["page tab", "tab"],
  menuitem: ["menu item"],
  radio: ["radio button"],
  listbox: ["list"],
  option: ["list item"],
  heading: ["heading"],
  dialog: ["dialog"],
};

export function roleMatches(goalRole: string, role: string): boolean {
  const accepted = ROLE_ALIASES[goalRole] ?? [goalRole];
  if (accepted.includes(role)) return true;
  return (MSAA_ROLES[goalRole] ?? []).includes(role.toLowerCase());
}

export function nameMatches(goalName: string, name: string): boolean {
  const wanted = speechKey(goalName);
  return wanted === "" || speechKey(name).includes(wanted);
}

/** Whether a node (accessibility-tree node or MSAA focus read) meets the goal. */
export function nodeMatchesGoal(node: { name: string; role: string }, goal: Goal): boolean {
  return (goal.name === undefined || nameMatches(goal.name, node.name)) && (goal.role === undefined || roleMatches(goal.role, node.role));
}

/** NVDA's spoken role words (en-GB) for goal roles. */
export const NVDA_ROLE_WORDS: Record<string, string> = {
  heading: "heading",
  button: "button",
  link: "link",
  checkbox: "check box",
  textbox: "edit",
  combobox: "combo box",
  tab: "tab",
  tablist: "tab control",
  navigation: "navigation landmark",
  main: "main landmark",
  banner: "banner landmark",
  contentinfo: "content info landmark",
  complementary: "complementary landmark",
  search: "search landmark",
  form: "form landmark",
  region: "region",
  dialog: "dialog",
  menu: "menu",
  menuitem: "menu item",
  listbox: "list",
  option: "",
  radio: "radio button",
  switch: "switch",
};

/**
 * Whether NVDA's speech after one key press meets the goal: an utterance
 * contains the name, and when a role is given, the role's spoken word occurs
 * in the speech of that press.
 */
export function speechMatchesGoal(utterances: readonly string[], goal: Goal): boolean {
  const named = goal.name === undefined ? utterances.length > 0 : utterances.some((u) => nameMatches(goal.name ?? "", u));
  if (!named) return false;
  if (goal.role === undefined) return true;
  const word = NVDA_ROLE_WORDS[goal.role] ?? goal.role;
  return word === "" || utterances.some((u) => speechKey(u).includes(speechKey(word)));
}

/** The base side's most common attempt count; ties go to the smaller count. Null when the base never reached the goal. */
export function modalCount(counts: readonly (number | null)[]): number | null {
  const tally = new Map<number, number>();
  for (const c of counts) if (c !== null) tally.set(c, (tally.get(c) ?? 0) + 1);
  let best: number | null = null;
  let bestN = 0;
  for (const [c, n] of [...tally.entries()].sort((a, b) => a[0] - b[0])) {
    if (n > bestN) {
      best = c;
      bestN = n;
    }
  }
  return best;
}

export type GoalOutcome = "REACHED" | "PATH_CHANGED" | "UNREACHABLE";

/**
 * A goal-based step's outcome from the attempt count that reached the goal
 * (null when it was not reached) and the base side's most common count.
 * When the base never reached the goal there is no path to compare, so a
 * reach is REACHED.
 */
export function goalOutcome(reachedAt: number | null, baseModal: number | null): GoalOutcome {
  if (reachedAt === null) return "UNREACHABLE";
  return baseModal === null || reachedAt === baseModal ? "REACHED" : "PATH_CHANGED";
}

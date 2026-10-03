/**
 * Judging one journey expectation in one attempt, from one family of
 * evidence (M5). The families are:
 *
 * | Family | Leg | Evidence | Judges |
 * |---|---|---|---|
 * | B | NVDA-absent | accessibility tree at the step's end (and the settled tree, DR-0079) | focusOn, stateIs, announcementContains (a live region holding the text) |
 * | B2 | NVDA-absent | platform events, with the tree for the text | announcementContains (alert and live-region events) |
 * | NVDA | NVDA-present | queued speech (relay tap) | focusOn, stateIs, announcementContains |
 *
 * Arm A (axe) judges no expectation; its rule is per step (`axe.ts`).
 *
 * An evaluation is `met`, `unmet` with the class of failure, or `na` when
 * the family cannot judge that expectation in that attempt (missing
 * evidence). The classes become symptoms in `compare.ts`.
 */
import type { Expectation } from "../schema/index.ts";
import type { BlockAttempt, BlockStep, ListenerEvent, NodeRef } from "./evidence.ts";
import { within } from "./evidence.ts";
import type { OracleRules } from "./rules.ts";
import { roleSpoken, spokenContains, stateSpoken } from "./speech.ts";
import { matchesName, matchesRole, stateValue, textContains, Tree } from "./tree.ts";
import type { AxNode } from "../runner/axTree.ts";

export type Family = "A" | "B" | "B2" | "NVDA";
export type FailClass = "name" | "role" | "state" | "focus" | "absent";

export interface Evaluation {
  status: "met" | "unmet" | "na";
  cls?: FailClass;
  /** announcementContains: how many announcements carried the text. */
  count?: number;
  /** What the evidence showed, for the report. */
  seen?: string;
}

const BROWSE = new Set(["NEXT_HEADING", "NEXT_FORM_FIELD", "NEXT_BUTTON", "NEXT_LANDMARK", "BROWSE_NEXT", "READ_CURRENT"]);

export interface Target {
  role: string;
  /** An accessible name, `*` for any, or `#id` for a DOM id. */
  name: string;
  state?: { key: string; value: string };
}

export function parseTarget(e: Expectation): Target | null {
  if (e.type !== "focusOn" && e.type !== "stateIs") return null;
  const [role = "", name = "", state] = e.value.split("|");
  if (state === undefined) return { role, name };
  const [key = "", value = ""] = state.split("=");
  return { role, name, state: { key, value } };
}

// ---------------------------------------------------------------------------
// Family B: the accessibility tree
// ---------------------------------------------------------------------------

/** The nodes a step ends on: the focused node's scope, or for a browse step the line under the simulated cursor. */
/**
 * Where a step ends: the focused node, or for a browse step the line under the
 * simulated cursor. `nodes` is the scope an expectation may match ("on that
 * element or inside it"); `self` is the element itself, which alone decides
 * whether a failure is a lost name or a lost role.
 */
function landing(step: BlockStep, tree: Tree): { nodes: (AxNode | NodeRef)[]; self: (AxNode | NodeRef)[]; seen: string } | null {
  if (step.strategy !== undefined && BROWSE.has(step.strategy)) {
    const line = step.cursorAtEnd ?? step.goalTrace?.at(-1)?.line;
    if (line === undefined) return null;
    const resolved = line.map((r) => ({ r, n: tree.byBackendId(r.backendId) }));
    const nodes = resolved.flatMap(({ r, n }) => (n === undefined ? [r] : tree.focusScope(n)));
    const self = resolved.flatMap(({ r, n }) => (n === undefined ? [r] : tree.self(n)));
    return { nodes, self, seen: line.map((r) => `${r.role}|${r.name}`).join(" ") };
  }
  const f = tree.focused();
  if (f === undefined) return { nodes: [], self: [], seen: "(no focus)" };
  return { nodes: tree.focusScope(f), self: tree.self(f), seen: `${f.role}|${f.name}` };
}

function classify(nodes: readonly { role: string; name: string }[], t: Target): FailClass {
  if (nodes.some((n) => matchesRole(t.role, n))) return "name";
  if (t.name !== "*" && !t.name.startsWith("#") && nodes.some((n) => matchesName(t.name, n))) return "role";
  return "focus";
}

export function treeFocusOn(step: BlockStep, t: Target): Evaluation {
  if (step.axTree === undefined) return { status: "na" };
  const tree = new Tree(step.axTree);
  const land = landing(step, tree);
  if (land === null) return { status: "na" };
  if (t.name.startsWith("#")) {
    const id = step.targets?.find((x) => x.id === t.name.slice(1));
    if (id === undefined) return { status: "na" };
    const node = tree.byBackendId(id.backendId ?? undefined);
    const on = node !== undefined && land.nodes.some((n) => "id" in n && n.id === node.id);
    if (on && matchesRole(t.role, node)) return { status: "met", seen: land.seen };
    return { status: "unmet", cls: on ? "role" : "focus", seen: land.seen };
  }
  if (land.nodes.some((n) => matchesRole(t.role, n) && matchesName(t.name, n))) return { status: "met", seen: land.seen };
  return { status: "unmet", cls: classify(land.self, t), seen: land.seen };
}

function stateTarget(step: BlockStep, tree: Tree, t: Target): { node?: AxNode; cls?: FailClass; na?: true } {
  if (t.name.startsWith("#")) {
    const id = step.targets?.find((x) => x.id === t.name.slice(1));
    if (id === undefined) return { na: true };
    const node = tree.byBackendId(id.backendId ?? undefined);
    if (node === undefined || node.ignored === true) return { cls: "focus" };
    return matchesRole(t.role, node) ? { node } : { cls: "role" };
  }
  const land = landing(step, tree);
  const scope = (land?.nodes ?? []).flatMap((n) => ("id" in n ? [n] : []));
  const inScope = scope.find((n) => matchesRole(t.role, n) && matchesName(t.name, n));
  if (inScope !== undefined) return { node: inScope };
  if (t.name !== "*") {
    const anywhere = tree.accessible().find((n) => matchesRole(t.role, n) && matchesName(t.name, n));
    if (anywhere !== undefined) return { node: anywhere };
  }
  // Not found: the element the step ends on tells a lost name from a lost role; elsewhere, a node with the name but another role is a lost role.
  const self = (land?.self ?? []).flatMap((n) => ("id" in n ? [n] : []));
  if (t.name !== "*" && tree.accessible().some((n) => matchesName(t.name, n) && !matchesRole(t.role, n) && n.role !== "StaticText")) return { cls: classify(self, t) === "name" ? "name" : "role" };
  return { cls: classify(self, t) };
}

export function treeStateIs(step: BlockStep, t: Target): Evaluation {
  if (step.axTree === undefined || t.state === undefined) return { status: "na" };
  const tree = new Tree(step.axTree);
  const found = stateTarget(step, tree, t);
  if (found.na === true) return { status: "na" };
  if (found.node === undefined) return { status: "unmet", cls: found.cls ?? "focus", seen: "(target not found)" };
  const v = stateValue(found.node, t.state.key);
  const seen = `${found.node.role}|${found.node.name} ${t.state.key}=${v}`;
  return v === t.state.value ? { status: "met", seen } : { status: "unmet", cls: "state", seen };
}

/** Live-region roots (not ignored) in a tree. */
export function liveRoots(tree: Tree, rules: OracleRules): AxNode[] {
  return tree.accessible().filter((n) => rules.liveRoles.has(n.role) || n.props.live === "polite" || n.props.live === "assertive");
}

/** The innermost live regions whose text contains the expected text. */
export function regionsHolding(tree: Tree, text: string, rules: OracleRules): AxNode[] {
  const holding = liveRoots(tree, rules).filter((r) => textContains(tree.text(r), text));
  return holding.filter((r) => !holding.some((o) => o !== r && tree.ancestors(o).includes(r)));
}

function snapshots(step: BlockStep): Tree[] {
  return [step.settled?.axTree, step.axTree].flatMap((t) => (t === undefined ? [] : [new Tree(t)]));
}

/** B: an announcement is inferred when a live region holds the text in the settled or end tree; the count is the number of such regions. */
export function treeAnnouncement(step: BlockStep, text: string, rules: OracleRules): Evaluation {
  const trees = snapshots(step);
  if (trees.length === 0) return { status: "na" };
  const count = Math.max(...trees.map((t) => regionsHolding(t, text, rules).length));
  return count > 0 ? { status: "met", count, seen: `${String(count)} live region(s)` } : { status: "unmet", cls: "absent", count: 0, seen: "no live region holds it" };
}

// ---------------------------------------------------------------------------
// Family B2: platform events
// ---------------------------------------------------------------------------

const ANNOUNCING = new Set(["EVENT_SYSTEM_ALERT", "EVENT_OBJECT_LIVEREGIONCHANGED"]);

function eventKind(e: ListenerEvent): string {
  return (e.ariaRole ?? e.role ?? "").toLowerCase();
}

/**
 * B2: the alert and live-region-changed events in the step whose region holds
 * the text. An event is tied to a region holding the text (from the tree) by
 * role (alert, status, log…) or by live setting (assertive, polite).
 */
export function eventAnnouncement(step: BlockStep, attempt: BlockAttempt, text: string, rules: OracleRules): Evaluation {
  if (attempt.b2Evidence !== "complete" || step.startedAt === undefined || step.endedAt === undefined) return { status: "na" };
  const trees = snapshots(step);
  if (trees.length === 0) return { status: "na" };
  const regions = trees.flatMap((t) => regionsHolding(t, text, rules));
  const roles = new Set(regions.map((r) => r.role.toLowerCase()));
  const lives = new Set(regions.flatMap((r) => (typeof r.props.live === "string" ? [r.props.live] : [])));
  const events = within(attempt.listenerEvents, (e) => e.t, step.startedAt, step.endedAt).filter((e) => ANNOUNCING.has(e.event));
  const tied = events.filter((e) => roles.has(eventKind(e)) || (e.liveSetting !== undefined && lives.has(e.liveSetting)));
  const count = tied.length;
  const seen = `${String(events.length)} announcing event(s), ${String(count)} tied to the text`;
  return count > 0 ? { status: "met", count, seen } : { status: "unmet", cls: "absent", count: 0, seen };
}

// ---------------------------------------------------------------------------
// Family NVDA: queued speech
// ---------------------------------------------------------------------------

/** The window of a step's own speech: from its last goal attempt's action (or its start) to the end of its observation window. */
export function speechWindow(step: BlockStep): { from: number; to: number } | null {
  if (step.startedAt === undefined || step.endedAt === undefined) return null;
  const last = step.goalTrace?.at(-1);
  if (last?.t !== undefined) return { from: last.t, to: step.endedAt };
  // M4 blocks lack attempt times; a goal step's last attempt began at most one settle period before its window opened.
  if (last !== undefined && step.observeFrom !== undefined) return { from: step.observeFrom - 1_100_000_000, to: step.endedAt };
  return { from: step.startedAt, to: step.endedAt };
}

export function stepSpeech(step: BlockStep, attempt: BlockAttempt): string[] | null {
  const w = speechWindow(step);
  if (w === null || attempt.speechEvents === undefined) return null;
  return within(attempt.speechEvents, (e) => e.t, w.from, w.to).flatMap((e) => (e.kind === "speak" && e.text !== undefined && e.text.trim() !== "" ? [e.text] : []));
}

export function speechFocusOn(step: BlockStep, attempt: BlockAttempt, t: Target, rules: OracleRules): Evaluation {
  const u = stepSpeech(step, attempt);
  if (u === null) return { status: "na" };
  const seen = u.join(" | ") || "(silence)";
  const byName = t.name === "*" || t.name.startsWith("#") ? true : u.some((x) => spokenContains(x, t.name, rules));
  const byRole = roleSpoken(u, t.role);
  if (byName && byRole) return { status: "met", seen };
  const cls: FailClass = byRole ? "name" : byName && t.name !== "*" && !t.name.startsWith("#") ? "role" : "focus";
  return { status: "unmet", cls, seen };
}

export function speechStateIs(step: BlockStep, attempt: BlockAttempt, t: Target, rules: OracleRules): Evaluation {
  if (t.state === undefined) return { status: "na" };
  const u = stepSpeech(step, attempt);
  if (u === null) return { status: "na" };
  const conveyed = stateSpoken(u, t.state.key, t.state.value, rules);
  if (conveyed === null) return { status: "na" };
  const seen = u.join(" | ") || "(silence)";
  return conveyed ? { status: "met", seen } : { status: "unmet", cls: "state", seen };
}

export function speechAnnouncement(step: BlockStep, attempt: BlockAttempt, text: string, rules: OracleRules): Evaluation {
  const u = stepSpeech(step, attempt);
  if (u === null) return { status: "na" };
  const count = u.filter((x) => spokenContains(x, text, rules)).length;
  const seen = `${String(count)} utterance(s)`;
  return count > 0 ? { status: "met", count, seen } : { status: "unmet", cls: "absent", count: 0, seen };
}

/** One expectation, one attempt, one family. */
export function evaluate(family: Family, e: Expectation, step: BlockStep, attempt: BlockAttempt, rules: OracleRules): Evaluation {
  if (e.type === "orderBefore") return { status: "na" };
  if (e.type === "announcementContains") {
    if (family === "B") return treeAnnouncement(step, e.value, rules);
    if (family === "B2") return eventAnnouncement(step, attempt, e.value, rules);
    if (family === "NVDA") return speechAnnouncement(step, attempt, e.value, rules);
    return { status: "na" };
  }
  const t = parseTarget(e);
  if (t === null) return { status: "na" };
  if (family === "B") return e.type === "focusOn" ? treeFocusOn(step, t) : treeStateIs(step, t);
  if (family === "NVDA") return e.type === "focusOn" ? speechFocusOn(step, attempt, t, rules) : speechStateIs(step, attempt, t, rules);
  return { status: "na" };
}

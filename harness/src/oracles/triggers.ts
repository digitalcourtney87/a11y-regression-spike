/**
 * Arm D's trigger rules v1 (`protocol/triggers.v1.json`; HANDOFF R5; PRD
 * §14), applied to the NVDA-absent leg's B2 evidence of each AT step. A step
 * is triggered for an item when any trigger fires on it in any valid
 * NVDA-absent attempt, on either side; Arm D then takes NVDA evidence for that
 * step only (DR-0020, DR-0031). The definitions were written before any Arm D
 * result was scored (DR-0079) and were approved by the owner (P34, DR-0081).
 */
import type { AtStep, Journey } from "../schema/index.ts";
import type { Block, BlockAttempt, BlockStep, TimelineRecord } from "./evidence.ts";
import { stepOf, within } from "./evidence.ts";
import { Tree } from "./tree.ts";

export type TriggerId = "T1-live-region" | "T2-role-status" | "T3-role-alert" | "T4-dialog-opening" | "T5-route-transition" | "T6-programmatic-focus" | "T7-active-descendant";

export const TRIGGER_IDS: readonly TriggerId[] = ["T1-live-region", "T2-role-status", "T3-role-alert", "T4-dialog-opening", "T5-route-transition", "T6-programmatic-focus", "T7-active-descendant"];

const MOVES_ITSELF = new Set(["TAB", "SHIFT_TAB", "NEXT_HEADING", "NEXT_FORM_FIELD", "NEXT_BUTTON", "NEXT_LANDMARK", "BROWSE_NEXT", "READ_CURRENT"]);
const DIALOG_ROLES = new Set(["dialog", "alertdialog"]);

/** The ARIA role in a timeline node descriptor ("div#id[status]"). */
export function descriptorRole(d: string | undefined): string | undefined {
  return d === undefined ? undefined : /\[([^\]]+)\]$/.exec(d)?.[1];
}

function hasRole(r: TimelineRecord, role: string): boolean {
  return descriptorRole(r.target) === role || descriptorRole(r.liveRoot) === role;
}

/** The triggers that fire on one step of one attempt. */
export function stepTriggers(step: AtStep, s: BlockStep, previous: BlockStep | undefined, attempt: BlockAttempt): Set<TriggerId> {
  const fired = new Set<TriggerId>();
  if (s.startedAt === undefined || s.endedAt === undefined) return fired;
  const records = within(attempt.timeline, (r) => r.tQpc, s.startedAt, s.endedAt);
  const events = within(attempt.listenerEvents, (e) => e.t, s.startedAt, s.endedAt);
  const ariaRole = (e: { ariaRole?: string; role?: string }): string => (e.ariaRole ?? "").toLowerCase();
  if (records.some((r) => r.inLive === true || r.liveWithContent === true) || events.some((e) => e.event === "EVENT_OBJECT_LIVEREGIONCHANGED")) fired.add("T1-live-region");
  if (records.some((r) => hasRole(r, "status")) || events.some((e) => ariaRole(e) === "status")) fired.add("T2-role-status");
  if (records.some((r) => hasRole(r, "alert")) || events.some((e) => e.event === "EVENT_SYSTEM_ALERT" || ariaRole(e) === "alert")) fired.add("T3-role-alert");
  const dialogShown = events.some((e) => e.event === "EVENT_OBJECT_SHOW" && (DIALOG_ROLES.has(ariaRole(e)) || DIALOG_ROLES.has((e.role ?? "").toLowerCase())));
  const dialogRecord = records.some((r) => (r.kind === "insert" || r.kind === "attr") && DIALOG_ROLES.has(descriptorRole(r.target) ?? ""));
  let dialogNew = false;
  if (s.axTree !== undefined && previous?.axTree !== undefined) {
    const before = new Set(new Tree(previous.axTree).accessible().filter((n) => DIALOG_ROLES.has(n.role)).map((n) => n.backendId ?? n.id));
    dialogNew = new Tree(s.axTree).accessible().some((n) => DIALOG_ROLES.has(n.role) && !before.has(n.backendId ?? n.id));
  }
  if (dialogShown || dialogRecord || dialogNew) fired.add("T4-dialog-opening");
  const priorDoc = (attempt.timeline ?? []).filter((r) => r.tQpc !== undefined && r.tQpc < (s.startedAt ?? 0)).at(-1)?.doc;
  const newDocument = records.some((r) => r.doc !== undefined && priorDoc !== undefined && r.doc !== priorDoc);
  if (records.some((r) => r.kind === "history" || r.kind === "title") || newDocument) fired.add("T5-route-transition");
  if (!MOVES_ITSELF.has(step.strategy) && (records.some((r) => r.kind === "focusin") || events.some((e) => e.event === "EVENT_OBJECT_FOCUS"))) fired.add("T6-programmatic-focus");
  const focused = s.axTree === undefined ? undefined : new Tree(s.axTree).focused();
  if ((focused !== undefined && focused.props.activedescendant !== undefined) || records.some((r) => r.kind === "attr" && r.detail === "aria-activedescendant")) fired.add("T7-active-descendant");
  return fired;
}

export interface StepTriggering {
  stepId: string;
  triggered: boolean;
  fired: TriggerId[];
}

/** Which AT steps of the journey are triggered for this item, from its NVDA-absent block (null when that block is missing or INCONCLUSIVE). */
export function triggeredSteps(journey: Journey, absent: Block | null): StepTriggering[] | null {
  if (absent === null || absent.validity.result !== "VALID") return null;
  const steps = journey.steps.filter((s): s is AtStep => s.kind === "at");
  return steps.map((step, i) => {
    const fired = new Set<TriggerId>();
    for (const a of absent.attempts) {
      const s = stepOf(a, step.id);
      if (s === undefined) continue;
      const prev = i > 0 ? stepOf(a, steps[i - 1]?.id ?? "") : undefined;
      for (const t of stepTriggers(step, s, prev, a)) fired.add(t);
    }
    const manual = step.manualTriggers ?? [];
    return { stepId: step.id, triggered: fired.size > 0 || manual.length > 0, fired: TRIGGER_IDS.filter((t) => fired.has(t)) };
  });
}

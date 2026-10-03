/**
 * B2's route-change rule (M5): ROUTE_CHANGE_SILENT is "route change conveyed
 * (focus or announcement) in base, nothing conveyed in candidate" (HANDOFF
 * §6); the M3 catalogue counts a title change as conveying too. At a step
 * where every attempt on both sides changes route (a history record or a new
 * document in the DOM timeline), the route change is conveyed when, at or
 * after it, a platform focus event or an alert or live-region event fires, or
 * the title changes. The base must convey it in k of n attempts and the
 * candidate in none (FAIL), or in fewer than k (REVIEW). A step that declares
 * the announcement it expects (announcementContains) is judged by that
 * expectation instead, so a missing toast after a save is ANNOUNCEMENT_MISSING.
 */
import type { BlockAttempt } from "./evidence.ts";
import { stepOf, within } from "./evidence.ts";
import type { Finding } from "./compare.ts";

const CONVEYING_EVENTS = new Set(["EVENT_OBJECT_FOCUS", "EVENT_SYSTEM_ALERT", "EVENT_OBJECT_LIVEREGIONCHANGED"]);

/** The QPC time of the step's first route change in this attempt, or null. */
export function routeChangeAt(a: BlockAttempt, stepId: string): number | null {
  const s = stepOf(a, stepId);
  if (s?.startedAt === undefined || s.endedAt === undefined) return null;
  const prior = (a.timeline ?? []).filter((r) => r.tQpc !== undefined && r.tQpc < (s.startedAt ?? 0)).at(-1)?.doc;
  const change = within(a.timeline, (r) => r.tQpc, s.startedAt, s.endedAt).find((r) => r.kind === "history" || (r.doc !== undefined && prior !== undefined && r.doc !== prior));
  return change?.tQpc ?? null;
}

export function routeConveyed(a: BlockAttempt, stepId: string, from: number): boolean {
  const s = stepOf(a, stepId);
  if (s?.endedAt === undefined) return false;
  if (within(a.listenerEvents, (e) => e.t, from, s.endedAt).some((e) => CONVEYING_EVENTS.has(e.event))) return true;
  return within(a.timeline, (r) => r.tQpc, from, s.endedAt).some((r) => r.kind === "title");
}

export function routeFindings(stepId: string, base: readonly BlockAttempt[], cand: readonly BlockAttempt[], k: number): Omit<Finding, "family" | "stepIndex" | "stepId" | "order">[] {
  if ([...base, ...cand].some((a) => a.b2Evidence !== "complete")) return [];
  const at = (a: BlockAttempt): number | null => routeChangeAt(a, stepId);
  if ([...base, ...cand].some((a) => at(a) === null)) return [];
  const conveyed = (a: BlockAttempt): boolean => routeConveyed(a, stepId, at(a) ?? 0);
  if (base.filter(conveyed).length < k) return [];
  const silent = cand.filter((a) => !conveyed(a)).length;
  if (silent >= k) return [{ verdict: "FAIL", symptom: "ROUTE_CHANGE_SILENT", rule: "route-silent", detail: `route change conveyed in every base attempt, in no candidate attempt` }];
  if (silent > 0) return [{ verdict: "REVIEW", rule: "route-silent-partial", detail: `route change not conveyed in ${String(silent)} of ${String(cand.length)} candidate attempts` }];
  return [];
}

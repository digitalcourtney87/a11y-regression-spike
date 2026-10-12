/** M8 exploratory calibration isolation and read-only observations (P40, DR-0114), reused by the P42 registered evaluation (DR-0120). */
import { z } from "zod";

import type { AxNode } from "./axTree.ts";
import type { CorpusItem, Leg } from "../schema/types.ts";
import rawCases from "./calibration-cases.json" with { type: "json" };

const LEGS = ["nvda-absent", "nvda-present"] as const;
// M8 cases keep their P40 label, v1 cursor, both legs and no full-tree focus read by default.
const CaseSchema = z.strictObject({
  id: z.string().min(1),
  app: z.string().min(1),
  baseRef: z.string().min(1),
  fixture: z.string().min(1),
  journeys: z.array(z.string().min(1)).min(1),
  approval: z.string().min(1).default("P40/DR-0114"),
  cursor: z.enum(["v1", "v2"]).default("v1"),
  legs: z.array(z.enum(LEGS)).min(1).default([...LEGS]),
  fullTreeFocusName: z.boolean().default(false),
});
export const CALIBRATION_CASES = z.array(CaseSchema).parse(rawCases);
export type CalibrationCase = z.infer<typeof CaseSchema>;

export interface CalibrationRequest {
  caseId: string;
  app: string;
  journeys: string;
  split: string;
  sides: string;
  items: string;
  reps: string;
  shard: string;
  /** The running leg; a case refuses a leg it does not declare. */
  leg?: string;
}

/** Refuses corpus execution, candidates or requests outside the approved calibration manifest. */
export function calibrationCaseFor(request: CalibrationRequest): CalibrationCase | null {
  if (request.caseId === "") return null;
  const selected = CALIBRATION_CASES.find((c) => c.id === request.caseId);
  if (selected === undefined) throw new Error(`unknown calibration case ${request.caseId}`);
  if (request.split !== "dev" || request.sides !== "base" || request.items !== "" || request.reps !== "3") throw new Error("calibration requires dev, base only, no item ids and exactly three repetitions");
  if (request.shard !== "1/1") throw new Error("calibration requires all declared journeys in shard 1/1");
  if (request.app !== selected.app || request.journeys !== selected.journeys.join(",")) throw new Error("calibration app/journeys must match the approved case manifest");
  if (request.leg !== undefined && !(selected.legs as readonly string[]).includes(request.leg)) throw new Error(`calibration case ${selected.id} does not run in ${request.leg}`);
  return selected;
}

/** These pseudo-items require no corpus registry or assigned item to be loaded. */
export function calibrationItems(selected: CalibrationCase): CorpusItem[] {
  return selected.journeys.map((journeyId) => ({
    id: `m8-${journeyId}`,
    patternId: "m8-calibration",
    split: "dev",
    source: "seeded",
    app: selected.app,
    journeyId,
    base: { ref: selected.baseRef },
    candidate: {},
    expected: { kind: "unchanged" },
    repetitions: 3,
    provenance: { origin: selected.approval === "P40/DR-0114" ? "P40 approved exploratory calibration, working build only; not an assigned corpus item" : `${selected.approval} registered evaluation, owned controls only; not an assigned corpus item` },
  }));
}

export interface CalibrationGoal {
  attempt: number;
  node?: { name: string; role: string } | null;
  line?: { name: string; role: string }[];
  speech?: string[];
}

export interface FocusIdentity {
  tag: string;
  id: string;
  role: string | null;
  ariaLabel: string | null;
  labels: string[];
  value: string | null;
  text: string;
  ancestors: { tag: string; role: string | null; ariaLabel: string | null }[];
}

/** The focused node as one full-tree read sees it (P42). A focused node absent from the tree has null name and role. */
export interface FullTreeFocus {
  backendId: number;
  name: string | null;
  role: string | null;
}

/** Looks the focused backend node up in one full accessibility tree read. */
export function focusFromFullTree(all: readonly AxNode[], backendId: number): FullTreeFocus {
  const node = all.find((n) => n.backendId === backendId);
  return { backendId, name: node?.name ?? null, role: node?.role ?? null };
}

export interface CalibrationPoint {
  phase: "goal-check" | "observation-end";
  startedQpcNs: number;
  endedQpcNs: number;
  goal: CalibrationGoal | null;
  domFocus: FocusIdentity | null;
  error?: string;
  goalError?: string;
  /** P42 only: the same-instant full-tree read of the focused node. */
  fullTreeFocus?: FullTreeFocus | null;
  fullTreeError?: string;
  internalMode: { available: false; reason: string };
}

/** Diagnostic read errors stay explicit. This returns no outcome and never sends input. */
export async function captureCalibrationPoint(phase: CalibrationPoint["phase"], leg: Leg, goal: CalibrationGoal | null | (() => Promise<CalibrationGoal>), readFocus: () => Promise<FocusIdentity>, qpc: () => number, readFullTreeFocus?: () => Promise<FullTreeFocus>): Promise<CalibrationPoint> {
  const startedQpcNs = qpc();
  let observedGoal: CalibrationGoal | null = null;
  let goalError: string | undefined;
  try {
    observedGoal = typeof goal === "function" ? await goal() : goal;
  } catch (e) {
    goalError = e instanceof Error ? e.message : String(e);
  }
  let domFocus: FocusIdentity | null = null;
  let error: string | undefined;
  try {
    domFocus = await readFocus();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }
  let fullTree: { fullTreeFocus: FullTreeFocus | null; fullTreeError?: string } | undefined;
  if (readFullTreeFocus !== undefined) {
    try {
      fullTree = { fullTreeFocus: await readFullTreeFocus() };
    } catch (e) {
      fullTree = { fullTreeFocus: null, fullTreeError: e instanceof Error ? e.message : String(e) };
    }
  }
  return { phase, startedQpcNs, endedQpcNs: qpc(), goal: observedGoal, domFocus, ...(goalError === undefined ? {} : { goalError }), ...(error === undefined ? {} : { error }), ...(fullTree ?? {}), internalMode: { available: false, reason: leg === "nvda-present" ? "The receive-only speech relay does not expose NVDA internal browse/focus mode; use recorded speech and page effects as observations, not proof of mode." : "NVDA is absent; the simulated virtual cursor has no NVDA internal mode." } };
}

/** Read-only browser script: deep active element identity and labelled/role ancestors. */
export const CALIBRATION_FOCUS_SCRIPT = `(() => {
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  const ancestors = [];
  for (let parent = el?.parentElement; parent; parent = parent.parentElement) {
    if (parent.hasAttribute("role") || parent.hasAttribute("aria-label")) ancestors.push({ tag: parent.tagName, role: parent.getAttribute("role"), ariaLabel: parent.getAttribute("aria-label") });
  }
  return { tag: el?.tagName ?? "", id: el?.id ?? "", role: el?.getAttribute("role") ?? null, ariaLabel: el?.getAttribute("aria-label") ?? null, labels: Array.from(el?.labels ?? []).map(l => l.textContent?.trim() ?? ""), value: typeof el?.value === "string" ? el.value : null, text: el?.textContent?.trim().slice(0, 300) ?? "", ancestors };
})()`;

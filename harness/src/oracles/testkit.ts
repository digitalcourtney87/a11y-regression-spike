/**
 * Builders for synthetic item blocks, for the oracle tests. Times are QPC ns;
 * each step gets a one-second window starting at its index.
 */
import type { AxNode } from "../runner/axTree.ts";
import type { AtStep, CorpusItem, Journey, Symptom } from "../schema/index.ts";
import type { Block, BlockAttempt, BlockStep, ListenerEvent, Side, SpeechEvent, TimelineRecord } from "./evidence.ts";

let nextId = 1;

export interface NodeSpec {
  role: string;
  name?: string;
  props?: AxNode["props"];
  ignored?: true;
  kids?: NodeSpec[];
}

/** A tree from a nested spec; the first node is the root. */
export function axTree(spec: NodeSpec): AxNode[] {
  const out: AxNode[] = [];
  const visit = (s: NodeSpec, parent?: string): string => {
    const id = String(nextId++);
    const node: AxNode = { id, role: s.role, name: s.name ?? "", props: s.props ?? {}, children: [], backendId: Number(id), ...(parent === undefined ? {} : { parent }), ...(s.ignored === true ? { ignored: true as const } : {}) };
    out.push(node);
    node.children = (s.kids ?? []).map((k) => visit(k, id));
    return id;
  };
  visit(spec);
  return out;
}

export const SEC = 1_000_000_000;

export function at(id: string, strategy: AtStep["strategy"], expectations: AtStep["expectations"] = [], extra: Partial<AtStep> = {}): AtStep {
  return { kind: "at", id, strategy, observeMs: 1000, expectations, ...extra };
}

export function journey(steps: AtStep[]): Journey {
  return { id: "j", version: "1", app: "a", entryUrl: "/", anchor: "#anchor", steps };
}

export function item(kind: "regression" | "benign" | "unchanged", symptom: Symptom = "NAME_NOT_CONVEYED"): CorpusItem {
  const expected = kind === "regression" ? { kind, symptom, mechanism: "m" } : kind === "benign" ? { kind, benignType: "CSS_ONLY" as const } : { kind };
  return { id: `i-${kind}`, patternId: "p1", split: "dev", source: "seeded", app: "a", journeyId: "j", base: { ref: "b" }, candidate: { patch: "x.patch" }, expected, provenance: { origin: "test" } };
}

export interface StepSpec {
  outcome?: BlockStep["outcome"];
  tree?: AxNode[];
  settled?: AxNode[];
  goalLine?: { name: string; role: string }[];
  targets?: BlockStep["targets"];
}

export function steps(j: Journey, specs: Record<string, StepSpec>): BlockStep[] {
  return j.steps.flatMap((s, i) => {
    if (s.kind !== "at") return [];
    const spec = specs[s.id] ?? {};
    const startedAt = (i + 1) * 10 * SEC;
    return [
      {
        stepId: s.id,
        kind: "at" as const,
        strategy: s.strategy,
        startedAt,
        observeFrom: startedAt + SEC / 2,
        endedAt: startedAt + SEC,
        outcome: spec.outcome ?? "REACHED",
        ...(spec.goalLine === undefined ? {} : { goalTrace: [{ attempt: 1, t: startedAt, line: spec.goalLine }] }),
        ...(spec.tree === undefined ? {} : { axTree: spec.tree }),
        ...(spec.settled === undefined ? {} : { settled: { at: startedAt + SEC / 2, axTree: spec.settled } }),
        ...(spec.targets === undefined ? {} : { targets: spec.targets }),
      },
    ];
  });
}

/** Speech at a step: utterances placed inside that step's window. */
export function speechAt(j: Journey, stepId: string, utterances: string[]): SpeechEvent[] {
  const i = j.steps.findIndex((s) => s.id === stepId);
  const t0 = (i + 1) * 10 * SEC + SEC / 10;
  return utterances.map((text, k) => ({ kind: "speak" as const, t: t0 + k * 1000, text, priority: "NORMAL" }));
}

export function eventsAt(j: Journey, stepId: string, events: Omit<ListenerEvent, "t" | "channel">[]): ListenerEvent[] {
  const i = j.steps.findIndex((s) => s.id === stepId);
  const t0 = (i + 1) * 10 * SEC + SEC / 10;
  return events.map((e, k) => ({ t: t0 + k * 1000, channel: "MSAA", ...e }));
}

export function recordsAt(j: Journey, stepId: string, records: Omit<TimelineRecord, "tQpc">[]): TimelineRecord[] {
  const i = j.steps.findIndex((s) => s.id === stepId);
  const t0 = (i + 1) * 10 * SEC + SEC / 10;
  return records.map((r, k) => ({ doc: 0, ...r, tQpc: t0 + k * 1000 }));
}

export function attempt(side: Side, stepList: BlockStep[], extra: Partial<BlockAttempt> = {}): BlockAttempt {
  return { side, orderIndex: 0, repetition: 1, reasons: [], steps: stepList, anchor: { selector: "#anchor", name: "Anchor" }, b2Evidence: "complete", ...extra };
}

/** A block with n attempts per side, from a factory per side. */
export function block(it: CorpusItem, leg: Block["leg"], n: number, make: (side: Side, rep: number) => BlockAttempt): Block {
  const attempts: BlockAttempt[] = [];
  for (let r = 1; r <= n; r++) for (const side of ["base", "candidate"] as const) attempts.push({ ...make(side, r), side, repetition: r });
  return { item: it, journeyId: "j", leg, n, validity: { result: "VALID", inconclusive: [], candidateFindings: [] }, attempts };
}

/**
 * G2 report aggregation (HANDOFF §9 M2 and the G2 report; DR-0021 D12,
 * DR-0038, DR-0036, DR-0037 with P9). Pure: it turns attempt records into the
 * B2 numbers. The G2 rule reads B2 signature matches for K1–K5 in the
 * NVDA-absent leg; the NVDA-present attempts run with the listener are the
 * on/off diagnostic and never feed the rule (DR-0020). Every result is
 * EXPLORATORY.
 *
 * B2 outcomes are re-scored here from each attempt's raw evidence (every
 * listener event and the whole DOM timeline) with the current signature code,
 * and compared with the outcome the runner recorded at run time, so a change
 * to the definitions is visible and the evidence never needs re-running.
 */
import type { MappedTimelineEntry } from "../collectors/mutationTimeline.ts";
import { evaluateGatingB2, evaluateRecordB2, gatingComponents, SAME_FRAME_MS } from "../runner/b2Signature.ts";
import type { B2Component, B2GatingOutcome, B2RecordOutcome, DelayGrade, SignatureEvent } from "../runner/b2Signature.ts";
import { specByItemId } from "../runner/canaries.ts";
import { gateResult } from "../runner/validity.ts";
import type { CanaryTally, GateResult } from "../runner/validity.ts";
import { GATING_CANARIES } from "../schema/types.ts";
import type { GatingCanaryId } from "../schema/types.ts";
import { quantile } from "./report.ts";
import type { AttemptRecord } from "./report.ts";
import { wilsonInterval } from "./wilson.ts";
import type { WilsonInterval } from "./wilson.ts";

type B2Outcome = B2GatingOutcome | B2RecordOutcome;

/** The B2 fields of an attempt record. */
export interface B2AttemptFields {
  diagnostic?: string;
  focusReads?: number;
  timelineVersion?: number;
  listenerFailure?: string;
  b2?: B2Outcome | null;
  clock?: AttemptRecord["clock"] & { nativeByCollector?: { winhelper?: number; listener?: number | null } };
  listener?: { events: SignatureEvent[]; malformed: number; uia: string | null };
  timeline?: MappedTimelineEntry[];
  outcome?: AttemptRecord["outcome"];
  package?: { steps: { startedAt: number; endedAt?: number; speechCancels?: { t: number }[] }[] };
}

export type B2Attempt = AttemptRecord & B2AttemptFields;

export interface ComponentRate {
  name: string;
  required: boolean;
  found: number;
  of: number;
  interval: WilsonInterval | null;
  /** Identity paths of the first matches. */
  via: Record<string, number>;
}

export interface LatencySummary {
  n: number;
  medianMs: number | null;
  p90Ms: number | null;
  maxMs: number | null;
}

export interface B2GatingRow {
  canary: GatingCanaryId;
  attempts: number;
  valid: number;
  failures: number;
  passInterval: WilsonInterval | null;
  components: ComponentRate[];
  /** First DOM component to first required platform component (ms): the DOM-to-WinEvent latency. */
  domToPlatform: LatencySummary;
}

export interface B2RecordRow {
  itemId: string;
  valid: number;
  /** Valid attempts with no B2 trace (listener failure, malformed lines or an error after activation). */
  missing: number;
  grades: Partial<Record<DelayGrade, number>>;
  delayMs: { median: number | null; min: number | null; max: number | null };
  separateUpdate: number;
  separateUpdateInterval: WilsonInterval | null;
  /** How many attempts had each platform event attributed to the region. */
  regionEvents: Record<string, number>;
  /** Region SHOW and first text event, ms after the DOM insertion (medians and ranges). */
  timing: { show: LatencySummary & { minMs: number | null }; textInserted: LatencySummary & { minMs: number | null } } | null;
  domTextBeforeFocus: number | null;
  platformTextBeforeFocus: number | null;
  platformLiveRegionBeforeFocus: number | null;
}

export interface OnOffRow {
  canary: GatingCanaryId;
  absent: { valid: number; pass: number; interval: WilsonInterval | null; domToPlatform: LatencySummary };
  present: { valid: number; pass: number; interval: WilsonInterval | null; domToPlatform: LatencySummary; speechPass: number };
}

/** An event type on one element, present in most attempts of one leg and few of the other. */
export interface SystematicDifference {
  canary: GatingCanaryId;
  event: string;
  element: string;
  absent: { attempts: number; of: number };
  present: { attempts: number; of: number };
}

export interface ClockStat {
  medianMs: number | null;
  p95Ms: number | null;
  maxMs: number | null;
}

export interface G2Report {
  label: "EXPLORATORY";
  /** True when the directory holds on/off diagnostic attempts: the G2 rule is then not evaluated. */
  diagnosticRun: boolean;
  gate: GateResult;
  gating: B2GatingRow[];
  recordOnly: B2RecordRow[];
  inconclusive: { itemId: string; attempts: number; inconclusive: number; interval: WilsonInterval | null; reasons: Record<string, number> }[];
  inconclusiveReasons: Record<string, number>;
  errors: number;
  listenerFailures: number;
  invalidPackages: number;
  onOff: OnOffRow[];
  systematicDifferences: SystematicDifference[];
  /** Runtime B2 verdicts against those re-scored from raw evidence with the current code. */
  rescore: { gatingAttempts: number; agree: number; changed: string[]; recordAttempts: number; recordChanged: string[] };
  clock: {
    native: ClockStat;
    nativeListener: ClockStat;
    nativeHelper: ClockStat;
    mapping: ClockStat;
    drift: ClockStat;
    rafGap: ClockStat;
    lowResolution: number;
  };
  listener: { attempts: number; withoutEvents: number; eventsPerAttempt: { min: number | null; max: number | null }; malformedLines: number; uia: Record<string, number>; identityErrors: number };
  focusReads: { attempts: number; retried: number; maxReads: number | null };
}

function interval(successes: number, n: number): WilsonInterval | null {
  return n > 0 ? wilsonInterval(successes, n) : null;
}

function finite(values: readonly (number | null | undefined)[]): number[] {
  return values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
}

function max(values: (number | null | undefined)[]): number | null {
  const f = finite(values);
  return f.length === 0 ? null : Math.max(...f);
}

function min(values: (number | null | undefined)[]): number | null {
  const f = finite(values);
  return f.length === 0 ? null : Math.min(...f);
}

function summary(values: readonly number[]): LatencySummary {
  return { n: values.length, medianMs: quantile(values, 0.5), p90Ms: quantile(values, 0.9), maxMs: max([...values]) };
}

function clockStat(values: (number | null | undefined)[]): ClockStat {
  const f = finite(values);
  return { medianMs: quantile(f, 0.5), p95Ms: quantile(f, 0.95), maxMs: max(f) };
}

/**
 * Re-scores an attempt's B2 outcome from its raw evidence. Attempts whose
 * listener failed or wrote malformed lines, or that recorded no B2 outcome at
 * run time, stay null (a failure for gating canaries; counted as missing for
 * record-only canaries).
 */
export function rescoreB2(a: B2Attempt): B2Outcome | null {
  if (a.b2 === null || a.b2 === undefined || a.listenerFailure !== undefined || a.listener === undefined || a.timeline === undefined) return null;
  // A trace with malformed listener lines lost events and never passes (P13, DR-0055).
  if (a.listener.malformed > 0) return null;
  const step = a.package?.steps[0];
  const spec = specByItemId(a.itemId);
  if (step?.endedAt === undefined || spec === undefined) return null;
  const w = { activationT: step.startedAt, endT: step.endedAt };
  return spec.gating ? evaluateGatingB2(spec.canary, a.listener.events, a.timeline, w) : evaluateRecordB2(spec, a.listener.events, a.timeline, w, { timelineVersion: a.timelineVersion ?? 1 });
}

/**
 * Component rates over every valid attempt. A valid attempt with no B2
 * outcome counts as "not found" for every component, so an instrument
 * failure lowers the rates rather than leaving the denominator.
 */
function componentRates(canary: string, outcomes: readonly (B2GatingOutcome | null)[]): ComponentRate[] {
  const expected = gatingComponents(canary, [], [], { activationT: 0, endT: 0 });
  return expected.map(({ name, required }) => {
    const comps = outcomes.map((o) => (o === null ? null : (o.components.find((c) => c.name === name) ?? null)));
    const found = comps.filter((c): c is B2Component => c?.found === true);
    const via: Record<string, number> = {};
    for (const c of found) if (c.via !== undefined) via[c.via] = (via[c.via] ?? 0) + 1;
    return { name, required, found: found.length, of: comps.length, interval: interval(found.length, comps.length), via };
  });
}

function domToPlatformMs(o: B2GatingOutcome | null): number | null {
  if (o?.verdict !== "PASS") return null;
  const domAt = o.components.filter((c) => c.channel === "dom" && c.found && c.atMs !== undefined).map((c) => c.atMs as number);
  const platformAt = o.components.filter((c) => c.channel === "platform" && c.required && c.found && c.atMs !== undefined).map((c) => c.atMs as number);
  if (domAt.length === 0 || platformAt.length === 0) return null;
  return Math.min(...platformAt) - Math.min(...domAt);
}

interface Scored {
  a: B2Attempt;
  b2: B2Outcome | null;
}

function gatingOf(s: Scored): B2GatingOutcome | null {
  return s.b2?.kind === "b2-gating" ? s.b2 : null;
}

function legCounts(rows: readonly Scored[]): { valid: number; pass: number; interval: WilsonInterval | null; domToPlatform: LatencySummary } {
  // Every attempt here ran the listener, so a missing outcome is a failure.
  const valid = rows.filter((s) => s.a.valid === true);
  const pass = valid.filter((s) => gatingOf(s)?.verdict === "PASS").length;
  return { valid: valid.length, pass, interval: interval(pass, valid.length), domToPlatform: summary(finite(valid.map((s) => domToPlatformMs(gatingOf(s))))) };
}

function elementOf(e: SignatureEvent): string {
  return e.automationId ?? (e.name === undefined ? `(${e.role ?? "no identity"})` : `"${e.name}"`);
}

/** Event types per element present in at least 90% of one leg's valid attempts and at most 10% of the other's. */
function systematicDifferences(absent: readonly Scored[], present: readonly Scored[]): SystematicDifference[] {
  const out: SystematicDifference[] = [];
  for (const canary of GATING_CANARIES) {
    const sets = (rows: readonly Scored[]): Set<string>[] =>
      rows
        .filter((s) => s.a.itemId === canary && s.a.valid === true && s.a.listener !== undefined)
        .map((s) => {
          const step = s.a.package?.steps[0];
          const from = step?.startedAt ?? 0;
          const to = step?.endedAt ?? Number.POSITIVE_INFINITY;
          return new Set((s.a.listener?.events ?? []).filter((e) => e.t >= from && e.t <= to && e.hwndClass !== "Chrome_WidgetWin_1").map((e) => `${e.event}\u0000${elementOf(e)}`));
        });
    const a = sets(absent);
    const p = sets(present);
    if (a.length === 0 || p.length === 0) continue;
    const keys = new Set([...a.flatMap((s) => [...s]), ...p.flatMap((s) => [...s])]);
    for (const key of [...keys].sort()) {
      const inA = a.filter((s) => s.has(key)).length;
      const inP = p.filter((s) => s.has(key)).length;
      const ra = inA / a.length;
      const rp = inP / p.length;
      if ((ra >= 0.9 && rp <= 0.1) || (rp >= 0.9 && ra <= 0.1)) {
        const [event = "", element = ""] = key.split("\u0000");
        out.push({ canary, event, element, absent: { attempts: inA, of: a.length }, present: { attempts: inP, of: p.length } });
      }
    }
  }
  return out;
}

function sameVerdict(x: B2Outcome | null | undefined, y: B2Outcome | null): boolean {
  const vx = x?.kind === "b2-gating" ? x.verdict : null;
  const vy = y?.kind === "b2-gating" ? y.verdict : null;
  return vx === vy;
}

/**
 * Whether a re-scored record-only outcome agrees with the run-time one: the K6
 * grade and separate-update flag, or every K7 order field the run-time outcome
 * carries (runs before the gate review did not record the live-region order).
 */
function recordAgrees(runtime: B2Outcome | null | undefined, rescored: B2Outcome | null): boolean {
  const a = runtime?.kind === "b2-record" ? runtime : null;
  const b = rescored?.kind === "b2-record" ? rescored : null;
  if (a === null || b === null) return a === b;
  if (a.region !== undefined || b.region !== undefined) return a.region?.grade === b.region?.grade && a.region?.separateUpdate === b.region?.separateUpdate;
  const x = a.order;
  const y = b.order;
  if (x === undefined || y === undefined) return x === y;
  const live = (x as { platformLiveRegionBeforeFocus?: boolean | null }).platformLiveRegionBeforeFocus;
  return x.domTextBeforeFocus === y.domTextBeforeFocus && x.platformTextBeforeFocus === y.platformTextBeforeFocus && (live === undefined || live === y.platformLiveRegionBeforeFocus);
}

function recordKey(o: B2Outcome | null | undefined): string {
  if (o?.kind !== "b2-record") return "null";
  if (o.region !== undefined) return `${o.region.grade}/${String(o.region.separateUpdate)}`;
  return `${String(o.order?.domTextBeforeFocus)}/${String(o.order?.platformTextBeforeFocus)}/${String(o.order?.platformLiveRegionBeforeFocus)}`;
}

/** Aggregates the NVDA-absent leg for G2, and the on/off diagnostic. */
export function buildG2Report(attempts: readonly B2Attempt[]): G2Report {
  const scored: Scored[] = attempts.map((a) => ({ a, b2: rescoreB2(a) }));
  const absent = scored.filter((s) => s.a.leg === "nvda-absent");
  const diagnostic = scored.filter((s) => s.a.leg === "nvda-present" && s.a.diagnostic === "b2-onoff");

  const gating: B2GatingRow[] = GATING_CANARIES.map((canary) => {
    const rows = absent.filter((s) => s.a.itemId === canary);
    const valid = rows.filter((s) => s.a.valid === true);
    // A valid attempt without a B2 outcome (listener failure or error) counts as a failure, never as INCONCLUSIVE.
    const failures = valid.filter((s) => gatingOf(s)?.verdict !== "PASS");
    return {
      canary,
      attempts: rows.length,
      valid: valid.length,
      failures: failures.length,
      passInterval: interval(valid.length - failures.length, valid.length),
      components: componentRates(canary, valid.map(gatingOf)),
      domToPlatform: summary(finite(valid.map((s) => domToPlatformMs(gatingOf(s))))),
    };
  });
  const tallies: CanaryTally[] = gating.filter((g) => g.attempts > 0).map((g) => ({ canary: g.canary, attempts: g.attempts, valid: g.valid, failures: g.failures }));

  const recordIds = [...new Set(absent.filter((s) => !s.a.gating).map((s) => s.a.itemId))].sort();
  const recordOnly: B2RecordRow[] = recordIds.map((itemId) => {
    const valid = absent.filter((s) => s.a.itemId === itemId && s.a.valid === true);
    const all = valid.map((s) => (s.b2?.kind === "b2-record" ? s.b2 : null));
    const records = all.filter((r) => r !== null);
    const regions = records.map((r) => r.region).filter((r) => r !== undefined);
    const grades: Partial<Record<DelayGrade, number>> = {};
    for (const r of regions) grades[r.grade] = (grades[r.grade] ?? 0) + 1;
    const delays = finite(regions.map((r) => r.delayMs));
    const regionEvents: Record<string, number> = {};
    for (const r of regions) for (const name of new Set(r.platform.map((p) => p.event))) regionEvents[name] = (regionEvents[name] ?? 0) + 1;
    const shows = finite(regions.map((r) => r.platform.find((p) => p.event === "EVENT_OBJECT_SHOW")?.atMs));
    const texts = finite(regions.map((r) => r.platform.find((p) => p.event === "IA2_EVENT_TEXT_INSERTED")?.atMs));
    const orders = records.map((r) => r.order).filter((o) => o !== undefined);
    const separate = regions.filter((r) => r.separateUpdate).length;
    return {
      itemId,
      valid: valid.length,
      missing: all.length - records.length,
      grades,
      delayMs: { median: quantile(delays, 0.5), min: min(delays), max: max(delays) },
      separateUpdate: separate,
      separateUpdateInterval: regions.length === 0 ? null : interval(separate, regions.length),
      regionEvents,
      timing: regions.length === 0 ? null : { show: { ...summary(shows), minMs: min(shows) }, textInserted: { ...summary(texts), minMs: min(texts) } },
      domTextBeforeFocus: orders.length === 0 ? null : orders.filter((o) => o.domTextBeforeFocus === true).length,
      platformTextBeforeFocus: orders.length === 0 ? null : orders.filter((o) => o.platformTextBeforeFocus === true).length,
      platformLiveRegionBeforeFocus: orders.length === 0 ? null : orders.filter((o) => o.platformLiveRegionBeforeFocus === true).length,
    };
  });

  const inconclusiveReasons: Record<string, number> = {};
  for (const s of absent) for (const r of s.a.inconclusiveReasons ?? []) inconclusiveReasons[r] = (inconclusiveReasons[r] ?? 0) + 1;
  const withListener = absent.filter((s) => s.a.listener !== undefined);
  const uia: Record<string, number> = {};
  for (const s of withListener) {
    const key = (s.a.listener?.uia ?? "unknown").split(":")[0] ?? "unknown";
    uia[key] = (uia[key] ?? 0) + 1;
  }
  const reads = finite(absent.map((s) => s.a.focusReads));
  const gatingScored = scored.filter((s) => s.a.gating && s.a.listener !== undefined);
  const recordScored = scored.filter((s) => !s.a.gating && s.a.listener !== undefined);

  return {
    label: "EXPLORATORY",
    diagnosticRun: diagnostic.length > 0,
    gate: gateResult(tallies),
    gating,
    recordOnly,
    inconclusive: [...new Set(absent.map((s) => s.a.itemId))].sort().map((itemId) => {
      const rows = absent.filter((s) => s.a.itemId === itemId);
      const bad = rows.filter((s) => s.a.valid !== true);
      const reasons: Record<string, number> = {};
      for (const s of bad) for (const r of s.a.inconclusiveReasons ?? []) reasons[r] = (reasons[r] ?? 0) + 1;
      return { itemId, attempts: rows.length, inconclusive: bad.length, interval: interval(bad.length, rows.length), reasons };
    }),
    inconclusiveReasons,
    errors: absent.filter((s) => s.a.error !== undefined).length,
    listenerFailures: absent.filter((s) => s.a.listenerFailure !== undefined).length,
    invalidPackages: absent.filter((s) => s.a.packageValid === false).length,
    onOff: GATING_CANARIES.map((canary) => ({
      canary,
      absent: legCounts(absent.filter((s) => s.a.itemId === canary)),
      present: {
        ...legCounts(diagnostic.filter((s) => s.a.itemId === canary)),
        speechPass: diagnostic.filter((s) => s.a.itemId === canary && s.a.valid === true && s.a.outcome?.verdict === "PASS").length,
      },
    })),
    systematicDifferences: diagnostic.length === 0 ? [] : systematicDifferences(absent, diagnostic),
    rescore: {
      gatingAttempts: gatingScored.length,
      agree: gatingScored.filter((s) => sameVerdict(s.a.b2, s.b2)).length,
      changed: gatingScored.filter((s) => !sameVerdict(s.a.b2, s.b2)).map((s) => `${s.a.jobId}/${s.a.itemId}`),
      recordAttempts: recordScored.length,
      recordChanged: recordScored.filter((s) => !recordAgrees(s.a.b2, s.b2)).map((s) => `${s.a.jobId}/${s.a.itemId}: ${recordKey(s.a.b2)} -> ${recordKey(s.b2)}`),
    },
    clock: {
      native: clockStat(absent.map((s) => s.a.clock?.native)),
      nativeListener: clockStat(absent.map((s) => s.a.clock?.nativeByCollector?.listener)),
      nativeHelper: clockStat(absent.map((s) => s.a.clock?.nativeByCollector?.winhelper)),
      mapping: clockStat(absent.map((s) => s.a.clock?.mappingUncertaintyMs)),
      drift: clockStat(absent.map((s) => s.a.clock?.driftMs)),
      rafGap: clockStat(absent.map((s) => s.a.clock?.raf?.maxGapMs)),
      lowResolution: absent.filter((s) => s.a.clock?.highResolution === false).length,
    },
    listener: {
      attempts: withListener.length,
      withoutEvents: withListener.filter((s) => (s.a.listener?.events.length ?? 0) === 0).length,
      eventsPerAttempt: { min: min(withListener.map((s) => s.a.listener?.events.length)), max: max(withListener.map((s) => s.a.listener?.events.length)) },
      malformedLines: withListener.reduce((n, s) => n + (s.a.listener?.malformed ?? 0), 0),
      uia,
      identityErrors: withListener.reduce((n, s) => n + (s.a.listener?.events.filter((e) => (e as { error?: string }).error !== undefined).length ?? 0), 0),
    },
    focusReads: { attempts: reads.length, retried: reads.filter((r) => r > 1).length, maxReads: max(reads) },
  };
}

function pct(i: WilsonInterval | null): string {
  if (i === null) return "–";
  const f = (x: number): string => (x * 100).toFixed(1);
  return `${f(i.point)}% (${f(i.lower)}–${f(i.upper)})`;
}

function ms(v: number | null): string {
  return v === null ? "–" : `${v.toFixed(1)} ms`;
}

function stat(s: ClockStat): string {
  const f = (v: number | null): string => (v === null ? "–" : String(Math.round(v * 10000) / 10000));
  return `median ${f(s.medianMs)}, 95th percentile ${f(s.p95Ms)}, maximum ${f(s.maxMs)} ms`;
}

/** Renders the G2 report as Markdown. */
export function renderG2Report(report: G2Report): string {
  const lines: string[] = [];
  lines.push("# Phase 0 B2 report, NVDA-absent leg (EXPLORATORY)", "");
  if (report.diagnosticRun) {
    lines.push("**G2 rule (D12, B2 signature matches):** not evaluated (this directory holds the on/off diagnostic, which never feeds the G2 rule; DR-0020)", "");
  } else {
    lines.push(`**G2 rule (D12, B2 signature matches):** ${report.gate.pass ? "PASS" : "FAIL"}${report.gate.reasons.length > 0 ? ` (${report.gate.reasons.map((r) => r.code).join(", ")})` : ""}`, "");
  }
  lines.push("| Canary | Attempts | Valid | Failures | Match rate among valid (Wilson 95%) | INCONCLUSIVE rate | DOM to WinEvent (median / p90 / max) |", "|---|---|---|---|---|---|---|");
  for (const g of report.gating) {
    const inc = report.gate.perCanary.find((p) => p.canary === g.canary);
    const rate = inc?.inconclusiveRate;
    const d = g.domToPlatform;
    lines.push(`| ${g.canary} | ${String(g.attempts)} | ${String(g.valid)} | ${String(g.failures)} | ${pct(g.passInterval)} | ${rate === null || rate === undefined ? "–" : `${(rate * 100).toFixed(1)}%${inc?.flagged === true ? " (flag > 10%)" : ""}`} | ${ms(d.medianMs)} / ${ms(d.p90Ms)} / ${ms(d.maxMs)} |`);
  }
  const pooled = report.gate.pooled;
  lines.push("", `Pooled: ${String(pooled.attempts)} attempts, ${String(pooled.valid)} valid, ${String(pooled.failures)} failures, INCONCLUSIVE ${pooled.inconclusiveRate === null ? "–" : `${(pooled.inconclusiveRate * 100).toFixed(1)}%`} (limit 5%).`, "");
  const r = report.rescore;
  lines.push(`Re-scored from raw evidence with the current signature code: gating verdicts ${String(r.agree)} of ${String(r.gatingAttempts)} agree with those recorded at run time${r.changed.length > 0 ? ` (changed: ${r.changed.join(", ")})` : ""}; record-only grades and order changed in ${String(r.recordChanged.length)} of ${String(r.recordAttempts)}${r.recordChanged.length > 0 ? ` (${r.recordChanged.slice(0, 10).join("; ")}${r.recordChanged.length > 10 ? "; …" : ""})` : ""}.`, "");
  lines.push("## Signature components (valid attempts)", "", "| Canary | Component | Required | Found (Wilson 95%) | Identity of first match |", "|---|---|---|---|---|");
  for (const g of report.gating) {
    for (const c of g.components) lines.push(`| ${g.canary} | ${c.name} | ${c.required ? "yes" : "no"} | ${String(c.found)}/${String(c.of)}: ${pct(c.interval)} | ${Object.entries(c.via).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"} |`);
  }
  lines.push("");
  if (report.recordOnly.length > 0) {
    lines.push(
      `## Record-only B2 signatures (DR-0036; K6 graded by insertion-to-content delay, DR-0037 with P9; one frame = ${SAME_FRAME_MS.toFixed(1)} ms)`,
      "",
      "| Item | Valid | No B2 trace | Grades | DOM delay (median, range) | Separate update on the region (Wilson 95%) | Platform events on the region (attempts) | Region SHOW after DOM insertion (median, range) | TEXT_INSERTED after DOM insertion (median, range) | Before focus: DOM / IA2 text / LIVEREGIONCHANGED |",
      "|---|---|---|---|---|---|---|---|---|---|",
    );
    for (const row of report.recordOnly) {
      const grades = Object.entries(row.grades).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–";
      const delay = row.delayMs.median === null ? "–" : `${row.delayMs.median.toFixed(1)} (${String(row.delayMs.min)}–${String(row.delayMs.max)}) ms`;
      const events = Object.entries(row.regionEvents).map(([k, v]) => `${k.replace(/^EVENT_OBJECT_|^IA2_EVENT_/, "")} ${String(v)}`).join(", ") || "–";
      const timing = (s: (LatencySummary & { minMs: number | null }) | undefined): string => (s === undefined || s.n === 0 ? "–" : `${ms(s.medianMs)} (${ms(s.minMs)}–${ms(s.maxMs)})`);
      const order = row.domTextBeforeFocus === null ? "–" : `${String(row.domTextBeforeFocus)} / ${String(row.platformTextBeforeFocus)} / ${String(row.platformLiveRegionBeforeFocus)}`;
      lines.push(`| ${row.itemId} | ${String(row.valid)} | ${String(row.missing)} | ${grades} | ${delay} | ${row.separateUpdateInterval === null ? "–" : `${String(row.separateUpdate)}: ${pct(row.separateUpdateInterval)}`} | ${events} | ${timing(row.timing?.show)} | ${timing(row.timing?.textInserted)} | ${order} |`);
    }
    lines.push("");
  }
  if (report.diagnosticRun) {
    lines.push("## NVDA on/off diagnostic (not a G2 criterion; DR-0020)", "", "| Canary | NVDA absent: match (Wilson 95%) | NVDA present: match (Wilson 95%) | DOM to WinEvent median, absent / present | Speech conveyed, NVDA present |", "|---|---|---|---|---|");
    for (const o of report.onOff) lines.push(`| ${o.canary} | ${String(o.absent.pass)}/${String(o.absent.valid)}: ${pct(o.absent.interval)} | ${String(o.present.pass)}/${String(o.present.valid)}: ${pct(o.present.interval)} | ${ms(o.absent.domToPlatform.medianMs)} / ${ms(o.present.domToPlatform.medianMs)} | ${String(o.present.speechPass)}/${String(o.present.valid)} |`);
    lines.push("", "Systematic differences (an event on one element in at least 90% of one leg's valid attempts and at most 10% of the other's; browser UI excluded):", "");
    if (report.systematicDifferences.length === 0) lines.push("- none");
    for (const d of report.systematicDifferences) lines.push(`- ${d.canary}: ${d.event} on ${d.element}: NVDA absent ${String(d.absent.attempts)}/${String(d.absent.of)}, NVDA present ${String(d.present.attempts)}/${String(d.present.of)}`);
    lines.push("");
  }
  lines.push("## INCONCLUSIVE per item (Wilson 95%; flag above 10%, DR-0038)", "", "| Item | Attempts | INCONCLUSIVE | Rate (Wilson 95%) | Reasons |", "|---|---|---|---|---|");
  for (const row of report.inconclusive) {
    lines.push(`| ${row.itemId} | ${String(row.attempts)} | ${String(row.inconclusive)} | ${pct(row.interval)}${row.interval !== null && row.interval.point > 0.1 ? " (flag)" : ""} | ${Object.entries(row.reasons).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"} |`);
  }
  lines.push("", "## Validity and instruments (NVDA-absent leg)", "");
  lines.push(`- INCONCLUSIVE reasons: ${Object.entries(report.inconclusiveReasons).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "none"}`);
  lines.push(`- Errors: ${String(report.errors)}; listener failures: ${String(report.listenerFailures)}; invalid evidence packages: ${String(report.invalidPackages)}`);
  const l = report.listener;
  lines.push(`- Listener: ${String(l.attempts)} attempts, ${String(l.withoutEvents)} without events, ${String(l.eventsPerAttempt.min)}–${String(l.eventsPerAttempt.max)} events per attempt, ${String(l.malformedLines)} malformed lines, ${String(l.identityErrors)} events whose identity read failed; UIA status ${Object.entries(l.uia).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"}`);
  const f = report.focusReads;
  lines.push(`- Handover focus reads (P10): ${String(f.retried)} of ${String(f.attempts)} attempts needed a retry; most reads ${String(f.maxReads)}`);
  const c = report.clock;
  lines.push(`- Native self-test disagreement: ${stat(c.native)} (listener: ${stat(c.nativeListener)}; helper: ${stat(c.nativeHelper)})`);
  lines.push(`- Page-mapping uncertainty: ${stat(c.mapping)}`);
  lines.push(`- Segment drift: ${stat(c.drift)}`);
  lines.push(`- rAF gap: ${stat(c.rafGap)}`);
  lines.push(`- Low-resolution TimeTicks: ${String(c.lowResolution)} attempts`);
  return `${lines.join("\n")}\n`;
}

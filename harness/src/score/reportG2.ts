/**
 * G2 report aggregation (HANDOFF §9 M2 and the G2 report; DR-0021 D12,
 * DR-0038, DR-0036, DR-0037 with P9). Pure: it turns attempt records into the
 * B2 numbers. The G2 rule reads B2 signature matches for K1–K5 in the
 * NVDA-absent leg; the NVDA-present attempts run with the listener are the
 * on/off diagnostic and never feed the rule (DR-0020). Every result is
 * EXPLORATORY.
 */
import type { B2Component, DelayGrade } from "../runner/b2Signature.ts";
import { gateResult } from "../runner/validity.ts";
import type { CanaryTally, GateResult } from "../runner/validity.ts";
import { GATING_CANARIES } from "../schema/types.ts";
import type { GatingCanaryId } from "../schema/types.ts";
import { quantile } from "./report.ts";
import type { AttemptRecord } from "./report.ts";
import { wilsonInterval } from "./wilson.ts";
import type { WilsonInterval } from "./wilson.ts";

/** The B2 fields of an attempt record. */
export interface B2AttemptFields {
  diagnostic?: string;
  focusReads?: number;
  b2?:
    | { kind: "b2-gating"; verdict: "PASS" | "FAIL"; components: B2Component[] }
    | {
        kind: "b2-record";
        region?: { target: string | null; populated: boolean; delayMs: number | null; grade: DelayGrade; platform: { event: string; atMs: number; via: string }[]; separateUpdate: boolean };
        order?: { domTextBeforeFocus: boolean | null; platformTextBeforeFocus: boolean | null };
      }
    | null;
  clock?: AttemptRecord["clock"] & { nativeByCollector?: { winhelper?: number; listener?: number | null } };
  listener?: { events: { event: string }[]; malformed: number; uia: string | null };
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

export interface B2GatingRow {
  canary: GatingCanaryId;
  attempts: number;
  valid: number;
  failures: number;
  passInterval: WilsonInterval | null;
  components: ComponentRate[];
  /** First DOM component to first required platform component (ms): the DOM-to-WinEvent latency. */
  domToPlatform: { n: number; medianMs: number | null; p90Ms: number | null; maxMs: number | null };
}

export interface B2RecordRow {
  itemId: string;
  valid: number;
  grades: Partial<Record<DelayGrade, number>>;
  delayMs: { median: number | null; min: number | null; max: number | null };
  separateUpdate: number;
  separateUpdateInterval: WilsonInterval | null;
  /** How many attempts had each platform event attributed to the region. */
  regionEvents: Record<string, number>;
  domTextBeforeFocus: number | null;
  platformTextBeforeFocus: number | null;
}

export interface OnOffRow {
  canary: GatingCanaryId;
  absent: { valid: number; pass: number; interval: WilsonInterval | null };
  present: { valid: number; pass: number; interval: WilsonInterval | null };
}

export interface G2Report {
  label: "EXPLORATORY";
  gate: GateResult;
  gating: B2GatingRow[];
  recordOnly: B2RecordRow[];
  inconclusive: { itemId: string; attempts: number; inconclusive: number; interval: WilsonInterval | null; reasons: Record<string, number> }[];
  inconclusiveReasons: Record<string, number>;
  errors: number;
  invalidPackages: number;
  onOff: OnOffRow[];
  clock: { maxNativeMs: number | null; maxNativeListenerMs: number | null; maxNativeHelperMs: number | null; maxMappingMs: number | null; maxDriftMs: number | null; maxRafGapMs: number | null; lowResolution: number };
  listener: { attempts: number; withoutEvents: number; malformedLines: number; uia: Record<string, number> };
  focusReads: { attempts: number; retried: number; maxReads: number | null };
}

function interval(successes: number, n: number): WilsonInterval | null {
  return n > 0 ? wilsonInterval(successes, n) : null;
}

function max(values: (number | null | undefined)[]): number | null {
  const finite = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return finite.length === 0 ? null : Math.max(...finite);
}

function gatingB2(a: B2Attempt): { verdict: "PASS" | "FAIL"; components: B2Component[] } | null {
  return a.b2?.kind === "b2-gating" ? a.b2 : null;
}

function componentRates(valid: readonly B2Attempt[]): ComponentRate[] {
  const names = [...new Set(valid.flatMap((a) => gatingB2(a)?.components.map((c) => c.name) ?? []))];
  return names.map((name) => {
    const comps = valid.map((a) => gatingB2(a)?.components.find((c) => c.name === name)).filter((c): c is B2Component => c !== undefined);
    const found = comps.filter((c) => c.found);
    const via: Record<string, number> = {};
    for (const c of found) if (c.via !== undefined) via[c.via] = (via[c.via] ?? 0) + 1;
    return { name, required: comps[0]?.required ?? false, found: found.length, of: comps.length, interval: interval(found.length, comps.length), via };
  });
}

function domToPlatformMs(a: B2Attempt): number | null {
  const comps = gatingB2(a)?.components ?? [];
  const domAt = comps.filter((c) => c.channel === "dom" && c.found && c.atMs !== undefined).map((c) => c.atMs as number);
  const platformAt = comps.filter((c) => c.channel === "platform" && c.required && c.found && c.atMs !== undefined).map((c) => c.atMs as number);
  if (domAt.length === 0 || platformAt.length === 0) return null;
  return Math.min(...platformAt) - Math.min(...domAt);
}

function passCounts(rows: readonly B2Attempt[]): { valid: number; pass: number; interval: WilsonInterval | null } {
  const valid = rows.filter((a) => a.valid === true && gatingB2(a) !== null);
  const pass = valid.filter((a) => gatingB2(a)?.verdict === "PASS").length;
  return { valid: valid.length, pass, interval: interval(pass, valid.length) };
}

/** Aggregates the NVDA-absent leg for G2, and the on/off diagnostic. */
export function buildG2Report(attempts: readonly B2Attempt[]): G2Report {
  const absent = attempts.filter((a) => a.leg === "nvda-absent");
  const diagnostic = attempts.filter((a) => a.leg === "nvda-present" && a.diagnostic === "b2-onoff");

  const gating: B2GatingRow[] = GATING_CANARIES.map((canary) => {
    const rows = absent.filter((a) => a.itemId === canary);
    const valid = rows.filter((a) => a.valid === true);
    // A valid attempt without a B2 outcome (no listener output) counts as a failure, never as INCONCLUSIVE.
    const failures = valid.filter((a) => gatingB2(a)?.verdict !== "PASS");
    const latencies = valid.filter((a) => gatingB2(a)?.verdict === "PASS").map(domToPlatformMs).filter((v): v is number => v !== null);
    return {
      canary,
      attempts: rows.length,
      valid: valid.length,
      failures: failures.length,
      passInterval: interval(valid.length - failures.length, valid.length),
      components: componentRates(valid),
      domToPlatform: { n: latencies.length, medianMs: quantile(latencies, 0.5), p90Ms: quantile(latencies, 0.9), maxMs: max(latencies) },
    };
  });
  const tallies: CanaryTally[] = gating.filter((g) => g.attempts > 0).map((g) => ({ canary: g.canary, attempts: g.attempts, valid: g.valid, failures: g.failures }));

  const recordIds = [...new Set(absent.filter((a) => !a.gating).map((a) => a.itemId))].sort();
  const recordOnly: B2RecordRow[] = recordIds.map((itemId) => {
    const valid = absent.filter((a) => a.itemId === itemId && a.valid === true);
    const records = valid.map((a) => (a.b2?.kind === "b2-record" ? a.b2 : null)).filter((r) => r !== null);
    const regions = records.map((r) => r.region).filter((r) => r !== undefined);
    const grades: Partial<Record<DelayGrade, number>> = {};
    for (const r of regions) grades[r.grade] = (grades[r.grade] ?? 0) + 1;
    const delays = regions.map((r) => r.delayMs).filter((d): d is number => d !== null);
    const regionEvents: Record<string, number> = {};
    for (const r of regions) for (const name of new Set(r.platform.map((p) => p.event))) regionEvents[name] = (regionEvents[name] ?? 0) + 1;
    const orders = records.map((r) => r.order).filter((o) => o !== undefined);
    const separate = regions.filter((r) => r.separateUpdate).length;
    return {
      itemId,
      valid: valid.length,
      grades,
      delayMs: { median: quantile(delays, 0.5), min: delays.length === 0 ? null : Math.min(...delays), max: max(delays) },
      separateUpdate: separate,
      separateUpdateInterval: regions.length === 0 ? null : interval(separate, regions.length),
      regionEvents,
      domTextBeforeFocus: orders.length === 0 ? null : orders.filter((o) => o.domTextBeforeFocus === true).length,
      platformTextBeforeFocus: orders.length === 0 ? null : orders.filter((o) => o.platformTextBeforeFocus === true).length,
    };
  });

  const inconclusiveReasons: Record<string, number> = {};
  for (const a of absent) for (const r of a.inconclusiveReasons ?? []) inconclusiveReasons[r] = (inconclusiveReasons[r] ?? 0) + 1;
  const withListener = absent.filter((a) => a.listener !== undefined);
  const uia: Record<string, number> = {};
  for (const a of withListener) {
    const key = (a.listener?.uia ?? "unknown").split(":")[0] ?? "unknown";
    uia[key] = (uia[key] ?? 0) + 1;
  }
  const reads = absent.map((a) => a.focusReads).filter((r): r is number => typeof r === "number");

  return {
    label: "EXPLORATORY",
    gate: gateResult(tallies),
    gating,
    recordOnly,
    inconclusive: [...new Set(absent.map((a) => a.itemId))].sort().map((itemId) => {
      const rows = absent.filter((a) => a.itemId === itemId);
      const bad = rows.filter((a) => a.valid !== true);
      const reasons: Record<string, number> = {};
      for (const a of bad) for (const r of a.inconclusiveReasons ?? []) reasons[r] = (reasons[r] ?? 0) + 1;
      return { itemId, attempts: rows.length, inconclusive: bad.length, interval: interval(bad.length, rows.length), reasons };
    }),
    inconclusiveReasons,
    errors: absent.filter((a) => a.error !== undefined).length,
    invalidPackages: absent.filter((a) => a.packageValid === false).length,
    onOff: GATING_CANARIES.map((canary) => ({
      canary,
      absent: passCounts(absent.filter((a) => a.itemId === canary)),
      present: passCounts(diagnostic.filter((a) => a.itemId === canary)),
    })),
    clock: {
      maxNativeMs: max(absent.map((a) => a.clock?.native)),
      maxNativeListenerMs: max(absent.map((a) => a.clock?.nativeByCollector?.listener)),
      maxNativeHelperMs: max(absent.map((a) => a.clock?.nativeByCollector?.winhelper)),
      maxMappingMs: max(absent.map((a) => a.clock?.mappingUncertaintyMs)),
      maxDriftMs: max(absent.map((a) => a.clock?.driftMs)),
      maxRafGapMs: max(absent.map((a) => a.clock?.raf?.maxGapMs)),
      lowResolution: absent.filter((a) => a.clock?.highResolution === false).length,
    },
    listener: {
      attempts: withListener.length,
      withoutEvents: withListener.filter((a) => (a.listener?.events.length ?? 0) === 0).length,
      malformedLines: withListener.reduce((n, a) => n + (a.listener?.malformed ?? 0), 0),
      uia,
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

/** Renders the G2 report as Markdown. */
export function renderG2Report(report: G2Report): string {
  const lines: string[] = [];
  lines.push("# Phase 0 B2 report, NVDA-absent leg (EXPLORATORY)", "");
  lines.push(`**G2 rule (D12, B2 signature matches):** ${report.gate.pass ? "PASS" : "FAIL"}${report.gate.reasons.length > 0 ? ` (${report.gate.reasons.map((r) => r.code).join(", ")})` : ""}`, "");
  lines.push("| Canary | Attempts | Valid | Failures | Match rate among valid (Wilson 95%) | INCONCLUSIVE rate | DOM to WinEvent (median / p90 / max) |", "|---|---|---|---|---|---|---|");
  for (const g of report.gating) {
    const inc = report.gate.perCanary.find((p) => p.canary === g.canary);
    const rate = inc?.inconclusiveRate;
    const d = g.domToPlatform;
    lines.push(`| ${g.canary} | ${String(g.attempts)} | ${String(g.valid)} | ${String(g.failures)} | ${pct(g.passInterval)} | ${rate === null || rate === undefined ? "–" : `${(rate * 100).toFixed(1)}%${inc?.flagged === true ? " (flag > 10%)" : ""}`} | ${ms(d.medianMs)} / ${ms(d.p90Ms)} / ${ms(d.maxMs)} |`);
  }
  const pooled = report.gate.pooled;
  lines.push("", `Pooled: ${String(pooled.attempts)} attempts, ${String(pooled.valid)} valid, ${String(pooled.failures)} failures, INCONCLUSIVE ${pooled.inconclusiveRate === null ? "–" : `${(pooled.inconclusiveRate * 100).toFixed(1)}%`} (limit 5%).`, "");
  lines.push("## Signature components (valid attempts)", "", "| Canary | Component | Required | Found (Wilson 95%) | Identity of first match |", "|---|---|---|---|---|");
  for (const g of report.gating) {
    for (const c of g.components) lines.push(`| ${g.canary} | ${c.name} | ${c.required ? "yes" : "no"} | ${String(c.found)}/${String(c.of)}: ${pct(c.interval)} | ${Object.entries(c.via).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"} |`);
  }
  lines.push("");
  if (report.recordOnly.length > 0) {
    lines.push("## Record-only B2 signatures (DR-0036; K6 graded by insertion-to-content delay, DR-0037 with P9)", "", "| Item | Valid | Grades | DOM delay (median, range) | Separate update on the region (Wilson 95%) | Platform events on the region (attempts) | Text before focus: DOM / platform |", "|---|---|---|---|---|---|---|");
    for (const r of report.recordOnly) {
      const grades = Object.entries(r.grades).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–";
      const delay = r.delayMs.median === null ? "–" : `${r.delayMs.median.toFixed(1)} (${String(r.delayMs.min)}–${String(r.delayMs.max)}) ms`;
      const events = Object.entries(r.regionEvents).map(([k, v]) => `${k.replace(/^EVENT_OBJECT_|^IA2_EVENT_/, "")} ${String(v)}`).join(", ") || "–";
      const order = r.domTextBeforeFocus === null ? "–" : `${String(r.domTextBeforeFocus)} / ${String(r.platformTextBeforeFocus)}`;
      lines.push(`| ${r.itemId} | ${String(r.valid)} | ${grades} | ${delay} | ${r.separateUpdateInterval === null ? "–" : `${String(r.separateUpdate)}: ${pct(r.separateUpdateInterval)}`} | ${events} | ${order} |`);
    }
    lines.push("");
  }
  if (report.onOff.some((o) => o.present.valid > 0)) {
    lines.push("## NVDA on/off diagnostic (not a G2 criterion; DR-0020)", "", "| Canary | NVDA absent: match (Wilson 95%) | NVDA present: match (Wilson 95%) |", "|---|---|---|");
    for (const o of report.onOff) lines.push(`| ${o.canary} | ${String(o.absent.pass)}/${String(o.absent.valid)}: ${pct(o.absent.interval)} | ${String(o.present.pass)}/${String(o.present.valid)}: ${pct(o.present.interval)} |`);
    lines.push("");
  }
  lines.push("## INCONCLUSIVE per item (Wilson 95%; flag above 10%, DR-0038)", "", "| Item | Attempts | INCONCLUSIVE | Rate (Wilson 95%) | Reasons |", "|---|---|---|---|---|");
  for (const r of report.inconclusive) {
    lines.push(`| ${r.itemId} | ${String(r.attempts)} | ${String(r.inconclusive)} | ${pct(r.interval)}${r.interval !== null && r.interval.point > 0.1 ? " (flag)" : ""} | ${Object.entries(r.reasons).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"} |`);
  }
  lines.push("", "## Validity and instruments", "");
  lines.push(`- INCONCLUSIVE reasons: ${Object.entries(report.inconclusiveReasons).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "none"}`);
  lines.push(`- Errors: ${String(report.errors)}; invalid evidence packages: ${String(report.invalidPackages)}`);
  const l = report.listener;
  lines.push(`- Listener: ${String(l.attempts)} attempts, ${String(l.withoutEvents)} without events, ${String(l.malformedLines)} malformed lines; UIA status ${Object.entries(l.uia).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"}`);
  const f = report.focusReads;
  lines.push(`- Handover focus reads (P10): ${String(f.retried)} of ${String(f.attempts)} attempts needed a retry; most reads ${String(f.maxReads)}`);
  const c = report.clock;
  lines.push(`- Clock maxima: native self-test ${String(c.maxNativeMs)} ms (listener ${String(c.maxNativeListenerMs)}, helper ${String(c.maxNativeHelperMs)}); page mapping ${String(c.maxMappingMs)} ms; segment drift ${String(c.maxDriftMs)} ms; rAF gap ${String(c.maxRafGapMs)} ms; low-resolution TimeTicks ${String(c.lowResolution)}`);
  return `${lines.join("\n")}\n`;
}

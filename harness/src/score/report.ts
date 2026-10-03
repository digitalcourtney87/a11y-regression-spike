/**
 * Phase 0 report aggregation (`npm run report:phase0`; HANDOFF §9 G1 report).
 * Pure: it turns attempt records and job summaries into the G1 numbers. Every
 * result is EXPLORATORY.
 */
import { gateResult } from "../runner/validity.ts";
import type { CanaryTally, GateResult } from "../runner/validity.ts";
import { GATING_CANARIES } from "../schema/types.ts";
import type { GatingCanaryId } from "../schema/types.ts";
import { wilsonInterval } from "./wilson.ts";
import type { WilsonInterval } from "./wilson.ts";

/** The fields of an attempt record (one JSON line from the canary runner) that the report reads. */
export interface AttemptRecord {
  jobId: string;
  itemId: string;
  canary: string;
  leg: string;
  gating: boolean;
  /** Set on NVDA-present attempts run with the listener for the on/off diagnostic (never G1 evidence). */
  diagnostic?: string;
  /** The canary's own DOM change, ms after activation, from the mutation timeline (from M2). */
  domChangeAtMs?: number | null;
  valid?: boolean;
  inconclusiveReasons?: string[];
  error?: string;
  packageValid?: boolean;
  outcome?: {
    kind: "gating" | "record";
    verdict?: "PASS" | "FAIL";
    late?: boolean;
    announced?: boolean;
    priority?: string | null;
    firstAtMs?: number | null;
    cancelsAfterUpdate?: number;
    politeBeforeFocus?: boolean | null;
  } | null;
  clock?: { native?: number; mappingUncertaintyMs?: number; driftMs?: number; highResolution?: boolean | null; raf?: { maxGapMs?: number | null } };
  page?: { activatedAt?: number | null; log?: { t: number; what: string }[] } | null;
  package?: { steps: { startedAt: number; speechCancels?: { t: number }[] }[] };
}

export interface JobSummary {
  jobId: string;
  parity?: { tapSpeakMessages: number; logSpeakingEntries: number; difference: number };
  segmentParity?: { segments: number; tap: number; log: number; mismatched: unknown[] };
  fatal?: string;
  synthOk?: boolean | null;
}

export interface GatingRow {
  canary: GatingCanaryId;
  attempts: number;
  valid: number;
  failures: number;
  late: number;
  notActivated: number;
  passInterval: WilsonInterval | null;
}

export interface RecordRow {
  itemId: string;
  valid: number;
  announced: number;
  announcedInterval: WilsonInterval | null;
  priorities: Record<string, number>;
  cancelsAfterUpdate: number;
  politeBeforeFocus: number | null;
}

export interface LatencyRow {
  canary: GatingCanaryId;
  n: number;
  medianMs: number | null;
  p90Ms: number | null;
  maxMs: number | null;
}

export interface InconclusiveRow {
  itemId: string;
  attempts: number;
  inconclusive: number;
  interval: WilsonInterval | null;
}

export interface Phase0Report {
  label: "EXPLORATORY";
  gate: GateResult;
  gating: GatingRow[];
  recordOnly: RecordRow[];
  inconclusiveReasons: Record<string, number>;
  errors: number;
  invalidPackages: number;
  k6aRule: { variant: string; valid: number; announced: number; triggers: boolean }[];
  parity: { jobId: string; tap: number; log: number; difference: number }[];
  segmentParity: { segments: number; tap: number; log: number; mismatchedSegments: number } | null;
  clock: { maxNativeMs: number | null; maxMappingMs: number | null; maxDriftMs: number | null; maxRafGapMs: number | null; lowResolution: number };
  /**
   * Capture latency upper bounds for valid passing gating attempts: tap receipt
   * after the harness's key dispatch, minus the page's own delay from
   * activation to the update. Key delivery through NVDA and Chrome is not
   * measured separately, so it is included (an upper bound).
   */
  latency: LatencyRow[];
  /**
   * P4's capture latency (DR-0046): tap receipt minus the canary's DOM change,
   * both on QPC, for valid passing attempts that carry the mutation timeline.
   */
  domToTap: LatencyRow[];
  /** INCONCLUSIVE per item, gating and record-only, with Wilson intervals (DR-0038). */
  inconclusive: InconclusiveRow[];
  /** The activation key's global cancel, after the key dispatch (ms). */
  activationCancel: { n: number; medianMs: number | null };
  fatalJobs: string[];
}

function interval(successes: number, n: number): WilsonInterval | null {
  return n > 0 ? wilsonInterval(successes, n) : null;
}

/** Quantile by linear interpolation between order statistics (type 7). */
export function quantile(values: readonly number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const k = (sorted.length - 1) * p;
  const i = Math.floor(k);
  const lo = sorted[i] ?? 0;
  const hi = sorted[Math.min(i + 1, sorted.length - 1)] ?? lo;
  return lo + (hi - lo) * (k - i);
}

function pageDelayMs(a: AttemptRecord): number | null {
  const log = a.page?.log ?? [];
  const activated = log.find((e) => e.what === "activated");
  const done = log.find((e) => e.what === "done");
  return activated === undefined || done === undefined ? null : done.t - activated.t;
}

function max(values: (number | null | undefined)[]): number | null {
  const finite = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return finite.length === 0 ? null : Math.max(...finite);
}

/**
 * Aggregates NVDA-present attempts for G1 (DR-0021 D12; DR-0038). Attempts of
 * the on/off diagnostic ran with the listener and are excluded (P4).
 */
export function buildReport(attempts: readonly AttemptRecord[], summaries: readonly JobSummary[]): Phase0Report {
  const present = attempts.filter((a) => a.leg === "nvda-present" && a.diagnostic === undefined);
  const gating: GatingRow[] = GATING_CANARIES.map((canary) => {
    const rows = present.filter((a) => a.itemId === canary);
    const valid = rows.filter((a) => a.valid === true);
    const failures = valid.filter((a) => a.outcome?.verdict !== "PASS");
    return {
      canary,
      attempts: rows.length,
      valid: valid.length,
      failures: failures.length,
      late: failures.filter((a) => a.outcome?.late === true).length,
      notActivated: rows.filter((a) => a.page !== undefined && a.page !== null && a.page.activatedAt === null).length,
      passInterval: interval(valid.length - failures.length, valid.length),
    };
  });
  const tallies: CanaryTally[] = gating.filter((g) => g.attempts > 0).map((g) => ({ canary: g.canary, attempts: g.attempts, valid: g.valid, failures: g.failures }));

  const recordIds = [...new Set(present.filter((a) => !a.gating).map((a) => a.itemId))].sort();
  const recordOnly: RecordRow[] = recordIds.map((itemId) => {
    const valid = present.filter((a) => a.itemId === itemId && a.valid === true);
    const announced = valid.filter((a) => a.outcome?.announced === true);
    const priorities: Record<string, number> = {};
    for (const a of announced) {
      const key = a.outcome?.priority ?? "unknown";
      priorities[key] = (priorities[key] ?? 0) + 1;
    }
    const isK7 = itemId.startsWith("K7");
    return {
      itemId,
      valid: valid.length,
      announced: announced.length,
      announcedInterval: interval(announced.length, valid.length),
      priorities,
      cancelsAfterUpdate: valid.filter((a) => (a.outcome?.cancelsAfterUpdate ?? 0) > 0).length,
      politeBeforeFocus: isK7 ? valid.filter((a) => a.outcome?.politeBeforeFocus === true).length : null,
    };
  });

  const inconclusiveReasons: Record<string, number> = {};
  for (const a of present) for (const r of a.inconclusiveReasons ?? []) inconclusiveReasons[r] = (inconclusiveReasons[r] ?? 0) + 1;

  // Pre-registered K6a rule (DR-0013, DR-0036): read on the NVDA-present leg.
  const k6aRule = recordOnly
    .filter((r) => r.itemId.startsWith("K6a:"))
    .map((r) => ({ variant: r.itemId.slice(4), valid: r.valid, announced: r.announced, triggers: r.announced > 1 }));

  return {
    label: "EXPLORATORY",
    gate: gateResult(tallies),
    gating,
    recordOnly,
    inconclusiveReasons,
    errors: present.filter((a) => a.error !== undefined).length,
    invalidPackages: present.filter((a) => a.packageValid === false).length,
    k6aRule,
    parity: summaries.filter((s) => s.parity !== undefined).map((s) => ({ jobId: s.jobId, tap: s.parity?.tapSpeakMessages ?? 0, log: s.parity?.logSpeakingEntries ?? 0, difference: s.parity?.difference ?? 0 })),
    segmentParity: summaries.some((s) => s.segmentParity !== undefined)
      ? summaries.reduce(
          (acc, s) => ({
            segments: acc.segments + (s.segmentParity?.segments ?? 0),
            tap: acc.tap + (s.segmentParity?.tap ?? 0),
            log: acc.log + (s.segmentParity?.log ?? 0),
            mismatchedSegments: acc.mismatchedSegments + (s.segmentParity?.mismatched.length ?? 0),
          }),
          { segments: 0, tap: 0, log: 0, mismatchedSegments: 0 },
        )
      : null,
    clock: {
      maxNativeMs: max(present.map((a) => a.clock?.native)),
      maxMappingMs: max(present.map((a) => a.clock?.mappingUncertaintyMs)),
      maxDriftMs: max(present.map((a) => a.clock?.driftMs)),
      maxRafGapMs: max(present.map((a) => a.clock?.raf?.maxGapMs)),
      lowResolution: present.filter((a) => a.clock?.highResolution === false).length,
    },
    fatalJobs: summaries.filter((s) => s.fatal !== undefined).map((s) => `${s.jobId}: ${s.fatal ?? ""}`),
    latency: GATING_CANARIES.map((canary) => {
      const values = present
        .filter((a) => a.itemId === canary && a.valid === true && a.outcome?.verdict === "PASS")
        .map((a) => {
          const delay = pageDelayMs(a);
          const at = (a.outcome as { matched?: { atMs?: number } } | null | undefined)?.matched?.atMs;
          return delay === null || at === undefined ? null : at - delay;
        })
        .filter((v): v is number => v !== null);
      return { canary, n: values.length, medianMs: quantile(values, 0.5), p90Ms: quantile(values, 0.9), maxMs: values.length === 0 ? null : Math.max(...values) };
    }),
    domToTap: GATING_CANARIES.map((canary) => {
      const values = present
        .filter((a) => a.itemId === canary && a.valid === true && a.outcome?.verdict === "PASS" && typeof a.domChangeAtMs === "number")
        .map((a) => {
          const at = (a.outcome as { matched?: { atMs?: number } } | null | undefined)?.matched?.atMs;
          return at === undefined ? null : at - (a.domChangeAtMs as number);
        })
        .filter((v): v is number => v !== null);
      return { canary, n: values.length, medianMs: quantile(values, 0.5), p90Ms: quantile(values, 0.9), maxMs: values.length === 0 ? null : Math.max(...values) };
    }),
    inconclusive: [...new Set(present.map((a) => a.itemId))].sort().map((itemId) => {
      const rows = present.filter((a) => a.itemId === itemId);
      const inconclusive = rows.filter((a) => a.valid !== true).length;
      return { itemId, attempts: rows.length, inconclusive, interval: interval(inconclusive, rows.length) };
    }),
    activationCancel: (() => {
      const values = present
        .map((a) => {
          const step = a.package?.steps[0];
          const first = step?.speechCancels?.[0];
          return step === undefined || first === undefined ? null : (first.t - step.startedAt) / 1e6;
        })
        .filter((v): v is number => v !== null);
      return { n: values.length, medianMs: quantile(values, 0.5) };
    })(),
  };
}

function pct(i: WilsonInterval | null): string {
  if (i === null) return "–";
  const f = (x: number): string => (x * 100).toFixed(1);
  return `${f(i.point)}% (${f(i.lower)}–${f(i.upper)})`;
}

/** Renders the report as Markdown (tables; exploratory label). */
export function renderReport(report: Phase0Report): string {
  const lines: string[] = [];
  lines.push("# Phase 0 canary report (EXPLORATORY)", "");
  lines.push(`**G1 rule (D12):** ${report.gate.pass ? "PASS" : "FAIL"}${report.gate.reasons.length > 0 ? ` (${report.gate.reasons.map((r) => r.code).join(", ")})` : ""}`, "");
  lines.push("| Canary | Attempts | Valid | Failures | Late | Not activated | Pass rate among valid (Wilson 95%) | INCONCLUSIVE rate |", "|---|---|---|---|---|---|---|---|");
  for (const g of report.gating) {
    const inc = report.gate.perCanary.find((p) => p.canary === g.canary);
    const rate = inc?.inconclusiveRate;
    lines.push(`| ${g.canary} | ${String(g.attempts)} | ${String(g.valid)} | ${String(g.failures)} | ${String(g.late)} | ${String(g.notActivated)} | ${pct(g.passInterval)} | ${rate === null || rate === undefined ? "–" : `${(rate * 100).toFixed(1)}%${inc?.flagged === true ? " (flag > 10%)" : ""}`} |`);
  }
  const pooled = report.gate.pooled;
  lines.push("", `Pooled: ${String(pooled.attempts)} attempts, ${String(pooled.valid)} valid, ${String(pooled.failures)} failures, INCONCLUSIVE ${pooled.inconclusiveRate === null ? "–" : `${(pooled.inconclusiveRate * 100).toFixed(1)}%`} (limit 5%).`, "");
  if (report.recordOnly.length > 0) {
    lines.push("## Record-only canaries (D4)", "", "| Item | Valid | Announced (Wilson 95%) | Priorities | Cancels after update | Polite before focus |", "|---|---|---|---|---|---|");
    for (const r of report.recordOnly) {
      lines.push(`| ${r.itemId} | ${String(r.valid)} | ${String(r.announced)}: ${pct(r.announcedInterval)} | ${Object.entries(r.priorities).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "–"} | ${String(r.cancelsAfterUpdate)} | ${r.politeBeforeFocus === null ? "–" : String(r.politeBeforeFocus)} |`);
    }
    lines.push("");
    if (report.k6aRule.length > 0) {
      lines.push(`**Pre-registered K6a rule:** ${report.k6aRule.some((k) => k.triggers) ? "TRIGGERED" : "not triggered"} (${report.k6aRule.map((k) => `${k.variant} ${String(k.announced)}/${String(k.valid)}`).join("; ")}).`, "");
    }
  }
  lines.push("## Capture latency (upper bound: key dispatch to tap receipt, minus the page's activation-to-update delay)", "", "| Canary | n | Median | 90th percentile | Maximum |", "|---|---|---|---|---|");
  const ms = (v: number | null): string => (v === null ? "–" : `${v.toFixed(1)} ms`);
  for (const l of report.latency) lines.push(`| ${l.canary} | ${String(l.n)} | ${ms(l.medianMs)} | ${ms(l.p90Ms)} | ${ms(l.maxMs)} |`);
  lines.push("", `Activation key's global cancel after the key dispatch: median ${ms(report.activationCancel.medianMs)} (n ${String(report.activationCancel.n)}).`, "");
  if (report.domToTap.some((l) => l.n > 0)) {
    lines.push("## Capture latency, DOM change to tap receipt (P4 method; QPC on both sides)", "", "| Canary | n | Median | 90th percentile | Maximum |", "|---|---|---|---|---|");
    for (const l of report.domToTap) lines.push(`| ${l.canary} | ${String(l.n)} | ${ms(l.medianMs)} | ${ms(l.p90Ms)} | ${ms(l.maxMs)} |`);
    lines.push("");
  }
  lines.push("## INCONCLUSIVE per item (Wilson 95%; flag above 10%, DR-0038)", "", "| Item | Attempts | INCONCLUSIVE | Rate (Wilson 95%) |", "|---|---|---|---|");
  for (const r of report.inconclusive) lines.push(`| ${r.itemId} | ${String(r.attempts)} | ${String(r.inconclusive)} | ${pct(r.interval)}${r.interval !== null && r.interval.point > 0.1 ? " (flag)" : ""} |`);
  lines.push("");
  lines.push("## Validity and instruments", "");
  lines.push(`- INCONCLUSIVE reasons: ${Object.entries(report.inconclusiveReasons).map(([k, v]) => `${k} ${String(v)}`).join(", ") || "none"}`);
  lines.push(`- Errors: ${String(report.errors)}; invalid evidence packages: ${String(report.invalidPackages)}`);
  const sp = report.segmentParity;
  if (sp !== null) lines.push(`- Tap-versus-log parity per segment: ${String(sp.segments)} segments, tap ${String(sp.tap)} / log ${String(sp.log)}, ${String(sp.mismatchedSegments)} mismatched`);
  lines.push(`- Tap-versus-log parity per NVDA run: ${report.parity.map((p) => `${p.jobId} tap ${String(p.tap)} / log ${String(p.log)} (diff ${String(p.difference)})`).join("; ") || "–"}`);
  const c = report.clock;
  lines.push(`- Clock maxima: native self-test ${String(c.maxNativeMs)} ms; page mapping ${String(c.maxMappingMs)} ms; segment drift ${String(c.maxDriftMs)} ms; rAF gap ${String(c.maxRafGapMs)} ms; low-resolution TimeTicks ${String(c.lowResolution)}`);
  if (report.fatalJobs.length > 0) lines.push(`- Fatal jobs: ${report.fatalJobs.join("; ")}`);
  return `${lines.join("\n")}\n`;
}

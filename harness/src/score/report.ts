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
  page?: { activatedAt?: number | null } | null;
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
  fatalJobs: string[];
}

function interval(successes: number, n: number): WilsonInterval | null {
  return n > 0 ? wilsonInterval(successes, n) : null;
}

function max(values: (number | null | undefined)[]): number | null {
  const finite = values.filter((v): v is number => typeof v === "number" && Number.isFinite(v));
  return finite.length === 0 ? null : Math.max(...finite);
}

/** Aggregates NVDA-present attempts for G1 (DR-0021 D12; DR-0038). */
export function buildReport(attempts: readonly AttemptRecord[], summaries: readonly JobSummary[]): Phase0Report {
  const present = attempts.filter((a) => a.leg === "nvda-present");
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

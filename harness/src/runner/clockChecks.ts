/**
 * Per-attempt clock checks (DR-0010 D1; the computations were approved by the
 * owner on 2026-10-03, P6, DR-0049). Every collector stamps QPC nanoseconds;
 * these checks bound how well the clocks agree.
 *
 * | Check | Computation |
 * |---|---|
 * | Native self-test disagreement (approved, DR-0030) | Ping-pong between Node and a native process, both stamping QPC; the largest distance by which a reading falls outside its bracket |
 * | Page-mapping uncertainty | How far CDP `Timestamp` falls outside an `hrtime` bracket around `Performance.getMetrics` (minimum-RTT sample), plus Blink's 100 µs clamp |
 * | Segment drift | Change in the `NavigationStart + performance.now()` mapping offset between the start and the end of a segment |
 * | Low-resolution TimeTicks | Modal `performance.now()` step of 1 ms or more |
 * | rAF gap | Largest gap in an in-page `requestAnimationFrame` heartbeat during the segment |
 */
import type { Page } from "playwright";

import { minRttEstimate, stepSummary, ticksToNs } from "../probes/analysis.ts";
import type { BracketSample } from "../probes/analysis.ts";
import { qpcNowNs } from "../clock/qpc.ts";

/** Blink's `performance.now()` clamp in a non-isolated page (ms). */
export const PAGE_CLAMP_MS = 0.1;

/** How far a bracketed reading falls outside its bracket (ns); 0 inside. */
export function outsideBracketNs(sample: BracketSample): number {
  if (sample.value < sample.t0) return sample.t0 - sample.value;
  if (sample.value > sample.t1) return sample.value - sample.t1;
  return 0;
}

/** Native self-test disagreement (ms): the largest outside-bracket distance over all pings. */
export function nativeDisagreementMs(samples: readonly BracketSample[]): number {
  if (samples.length === 0) throw new RangeError("at least one sample is required");
  return Math.max(...samples.map(outsideBracketNs)) / 1e6;
}

/** Page-mapping uncertainty (ms): the minimum-RTT sample's outside-bracket distance plus the clamp. */
export function pageMappingUncertaintyMs(samples: readonly BracketSample[]): number {
  const best = minRttEstimate(samples);
  const sample = samples[best.index];
  if (sample === undefined) throw new RangeError("unreachable");
  return outsideBracketNs(sample) / 1e6 + PAGE_CLAMP_MS;
}

/** A native collector that answers QPC pings (the Windows helper or the B2 listener). */
export interface QpcSource {
  qpc(): Promise<{ ticks: number; frequency: number }>;
}

export async function nativeSelfTest(helper: QpcSource, pings: number): Promise<{ disagreementMs: number; samples: BracketSample[] }> {
  const samples: BracketSample[] = [];
  for (let i = 0; i < pings; i++) {
    const t0 = qpcNowNs();
    const reading = await helper.qpc();
    const t1 = qpcNowNs();
    samples.push({ t0, t1, value: ticksToNs(reading.ticks, reading.frequency) });
  }
  return { disagreementMs: nativeDisagreementMs(samples), samples };
}

interface Metric {
  name: string;
  value: number;
}

function metric(metrics: Metric[], name: string): number {
  const found = metrics.find((m) => m.name === name);
  if (found === undefined) throw new Error(`Performance.getMetrics has no ${name}`);
  return found.value;
}

export interface PageClock {
  navigationStartS: number;
  uncertaintyMs: number;
  /** Minimum-RTT offset of the NavigationStart + performance.now() mapping (ns). */
  mappingOffsetNs: number;
  /** Half the minimum RTT of the mapping samples (ns): the applied mapping's own uncertainty, a diagnostic. */
  mappingHalfRttNs: number;
  highResolution: boolean | null;
}

/** Page-time checks for the current document (DR-0010). */
export async function pageClock(page: Page, pings: number, withSteps: boolean): Promise<PageClock> {
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send("Performance.enable");
    const stamps: BracketSample[] = [];
    let navigationStartS = Number.NaN;
    for (let i = 0; i < pings; i++) {
      const t0 = qpcNowNs();
      const { metrics } = await cdp.send("Performance.getMetrics");
      const t1 = qpcNowNs();
      navigationStartS = metric(metrics, "NavigationStart");
      stamps.push({ t0, t1, value: Math.round(metric(metrics, "Timestamp") * 1e9) });
    }
    const mapping = minRttEstimate(await mappingSamples(page, navigationStartS, pings));
    const steps = withSteps ? stepSummary(await page.evaluate<number[]>(STEPS_SCRIPT)) : null;
    return {
      navigationStartS,
      uncertaintyMs: pageMappingUncertaintyMs(stamps),
      mappingOffsetNs: mapping.offsetNs,
      mappingHalfRttNs: mapping.uncertaintyNs,
      highResolution: steps?.highResolution ?? null,
    };
  } finally {
    await cdp.detach();
  }
}

async function mappingSamples(page: Page, navigationStartS: number, pings: number): Promise<BracketSample[]> {
  const samples: BracketSample[] = [];
  for (let i = 0; i < pings; i++) {
    const t0 = qpcNowNs();
    const now = await page.evaluate<number>("performance.now()");
    const t1 = qpcNowNs();
    samples.push({ t0, t1, value: Math.round(navigationStartS * 1e9 + now * 1e6) });
  }
  return samples;
}

/**
 * Maps a page `performance.now()` time (ms) to QPC nanoseconds through the
 * minimum-RTT mapping (D1, HANDOFF §7.3): the mapping samples are
 * NavigationStart + performance.now(), so QPC ≈ that sum minus the offset.
 */
export function pageToQpcNs(tMs: number, clock: Pick<PageClock, "navigationStartS" | "mappingOffsetNs">): number {
  return Math.round(clock.navigationStartS * 1e9 + tMs * 1e6 - clock.mappingOffsetNs);
}

/** Re-measures the mapping offset at the end of a segment and returns the drift (ms). */
export async function segmentDriftMs(page: Page, start: PageClock, pings: number): Promise<number> {
  const end = minRttEstimate(await mappingSamples(page, start.navigationStartS, pings)).offsetNs;
  return Math.abs(end - start.mappingOffsetNs) / 1e6;
}

const STEPS_SCRIPT = `(() => {
  const out = []; let last = performance.now(); const end = last + 100;
  while (out.length < 2000) { const v = performance.now(); if (v !== last) { out.push(v - last); last = v; } if (v > end) break; }
  return out;
})()`;

/** Starts an in-page rAF heartbeat that records the largest gap until read. */
export const RAF_START_SCRIPT = `(() => {
  const state = { max: 0, last: null, frames: 0, running: true };
  const frame = (t) => { if (state.last !== null) state.max = Math.max(state.max, t - state.last); state.last = t; state.frames++; if (state.running) requestAnimationFrame(frame); };
  window.__rafHeartbeat = state; requestAnimationFrame(frame); return true;
})()`;

/** Returns the heartbeat's largest gap so far (ms) and frame count, without stopping it; null when none runs. */
export const RAF_PEEK_SCRIPT = `(() => {
  const s = window.__rafHeartbeat; if (!s) return null;
  return { maxGapMs: s.max, frames: s.frames };
})()`;

/** Stops the heartbeat and returns its largest gap (ms) and frame count. */
export const RAF_READ_SCRIPT = `(() => {
  const s = window.__rafHeartbeat; if (!s) return { maxGapMs: null, frames: 0 };
  s.running = false; return { maxGapMs: s.max, frames: s.frames };
})()`;

/**
 * Pure analysis for the M1a runner probes (DR-0025; HANDOFF §9 M1a). Kept free
 * of Windows and browser dependencies so it is unit-tested on Linux CI.
 */

/** Converts QPC ticks to nanoseconds exactly. */
export function ticksToNs(ticks: number, frequency: number): number {
  if (!Number.isSafeInteger(ticks) || !Number.isSafeInteger(frequency) || frequency <= 0) {
    throw new RangeError("ticks and frequency must be safe integers, frequency positive");
  }
  return Number((BigInt(ticks) * 1_000_000_000n) / BigInt(frequency));
}

/** One bracketed reading of another clock: local QPC before and after, and the remote value. */
export interface BracketSample {
  /** Local QPC nanoseconds just before the request. */
  t0: number;
  /** Local QPC nanoseconds just after the response. */
  t1: number;
  /** The remote reading, already on a nanosecond scale. */
  value: number;
}

export interface MinRttEstimate {
  /** value minus the bracket midpoint, for the minimum-RTT sample (ns). */
  offsetNs: number;
  /** Half the minimum round trip: the bound on |offset| error (ns). */
  uncertaintyNs: number;
  /** The minimum round trip (ns). */
  rttNs: number;
  /** Index of the minimum-RTT sample. */
  index: number;
  /** Whether the minimum-RTT reading lies inside its bracket (same timebase, no step). */
  withinBracket: boolean;
  /** Number of samples used. */
  samples: number;
}

/**
 * Cristian-style estimate from the minimum-RTT sample (D1 verification against
 * a 16-ping minimum-RTT estimate; DR-0010).
 */
export function minRttEstimate(samples: readonly BracketSample[]): MinRttEstimate {
  if (samples.length === 0) throw new RangeError("at least one sample is required");
  let best = 0;
  for (let i = 1; i < samples.length; i++) {
    const s = samples[i];
    const b = samples[best];
    if (s !== undefined && b !== undefined && s.t1 - s.t0 < b.t1 - b.t0) best = i;
  }
  const s = samples[best];
  if (s === undefined) throw new RangeError("unreachable");
  if (s.t1 < s.t0) throw new RangeError("a bracket ends before it starts");
  const rttNs = s.t1 - s.t0;
  return {
    offsetNs: s.value - (s.t0 + s.t1) / 2,
    uncertaintyNs: rttNs / 2,
    rttNs,
    index: best,
    withinBracket: s.value >= s.t0 && s.value <= s.t1,
    samples: samples.length,
  };
}

export interface StepSummary {
  /** Number of positive steps observed. */
  steps: number;
  /** Smallest positive step (ms). */
  minStepMs: number | null;
  /** Most common positive step, rounded to 1 µs (ms). */
  modalStepMs: number | null;
  /**
   * False when the modal step is 1 ms or more, the D1 "low-resolution
   * TimeTicks" signature; about 0.1 ms steps mean QPC with Blink's clamp.
   */
  highResolution: boolean | null;
}

/** Summarises consecutive positive `performance.now()` steps (D1 TimeTicks check; DR-0010). */
export function stepSummary(stepsMs: readonly number[]): StepSummary {
  const positive = stepsMs.filter((s) => s > 0 && Number.isFinite(s));
  if (positive.length === 0) return { steps: 0, minStepMs: null, modalStepMs: null, highResolution: null };
  const counts = new Map<number, number>();
  let min = Infinity;
  for (const step of positive) {
    min = Math.min(min, step);
    const key = Math.round(step * 1000) / 1000;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let modal = 0;
  let modalCount = -1;
  for (const [key, count] of counts) {
    if (count > modalCount || (count === modalCount && key < modal)) {
      modal = key;
      modalCount = count;
    }
  }
  return { steps: positive.length, minStepMs: min, modalStepMs: modal, highResolution: modal < 1 };
}

export interface NvdaLogScan {
  /** "Buffer load took" messages: virtual buffers NVDA rendered (D8 injection marker, second half). */
  bufferLoads: number;
  /** Synth drivers NVDA reported loading, in order. */
  synthsLoaded: string[];
  /** Lines that look like audio-device failures. */
  audioErrors: string[];
  /** "Speaking" messages (IO level). */
  speaking: number;
  /** Speaking messages that mention an infobar or alert (CfT infobar check). */
  infobarSpeech: string[];
  /** Log lines that mention Chrome's render widget window, for the NVDA channel record (D8). */
  chromiumChannelLines: string[];
  /** ERROR and CRITICAL entries. */
  errors: number;
}

const MAX_EXCERPTS = 20;
const NVDA_LOG_HEADER = /^[A-Z]+ - \S+ \(\d{2}:\d{2}:\d{2}\.\d{3}\)/;

/** Scans NVDA log text for the M1a markers. Diagnostic only; never used for latency, ordering or validity (DR-0039). */
export function scanNvdaLog(text: string): NvdaLogScan {
  const lines = text.split(/\r?\n/);
  const scan: NvdaLogScan = {
    bufferLoads: 0,
    synthsLoaded: [],
    audioErrors: [],
    speaking: 0,
    infobarSpeech: [],
    chromiumChannelLines: [],
    errors: 0,
  };
  for (const line of lines) {
    if (/^(ERROR|CRITICAL) - /.test(line)) scan.errors++;
    // NVDA writes a header line ("LEVEL - module.function (time) - thread (id):")
    // before each message; markers are read from message lines only.
    if (NVDA_LOG_HEADER.test(line)) continue;
    if (line.includes("Buffer load took")) scan.bufferLoads++;
    const synth = /Loaded synthDriver (\S+)/.exec(line);
    if (synth?.[1] !== undefined) scan.synthsLoaded.push(synth[1]);
    if (/audio device|WasapiWavePlayer|nvwave/i.test(line) && /error|fail|couldn't|could not|unable/i.test(line)) {
      if (scan.audioErrors.length < MAX_EXCERPTS) scan.audioErrors.push(line.trim());
    }
    if (/^Speaking \[/.test(line.trim())) {
      scan.speaking++;
      if (/infobar|alert/i.test(line) && scan.infobarSpeech.length < MAX_EXCERPTS) scan.infobarSpeech.push(line.trim());
    }
    if (line.includes("Chrome_RenderWidgetHostHWND") && scan.chromiumChannelLines.length < MAX_EXCERPTS) {
      scan.chromiumChannelLines.push(line.trim());
    }
  }
  return scan;
}

export interface EspeakSettings {
  synth: string | null;
  espeakSectionPresent: boolean;
  rate: number | null;
  rateBoost: boolean | null;
}

/**
 * Reads `[speech] synth` and the `[[espeak]]` rate and rate boost from an
 * nvda.ini (DR-0041). Sections nest by bracket depth, as NVDA writes them.
 */
export function readEspeakSettings(ini: string): EspeakSettings {
  const result: EspeakSettings = { synth: null, espeakSectionPresent: false, rate: null, rateBoost: null };
  const path: string[] = [];
  for (const raw of ini.split(/\r?\n/)) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const header = /^(\[+)([^\]]+)(\]+)$/.exec(line);
    if (header?.[1] !== undefined && header[2] !== undefined) {
      const depth = header[1].length;
      path.length = depth - 1;
      path[depth - 1] = header[2].trim();
      continue;
    }
    const kv = /^([^=]+?)\s*=\s*(.*)$/.exec(line);
    if (kv?.[1] === undefined || kv[2] === undefined) continue;
    const key = kv[1];
    const value = kv[2].replace(/^"(.*)"$/, "$1");
    const where = path.join(".");
    if (where === "speech" && key === "synth") result.synth = value;
    if (where === "speech.espeak") {
      result.espeakSectionPresent = true;
      if (key === "rate") result.rate = Number(value);
      if (key === "rateBoost") result.rateBoost = value === "True";
    }
  }
  if (path.length === 0 && /^\s*\[\[espeak\]\]\s*$/m.test(ini)) result.espeakSectionPresent = true;
  return result;
}

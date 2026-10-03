import { describe, expect, test } from "vitest";

import { minRttEstimate, readEspeakSettings, scanNvdaLog, stepSummary, ticksToNs } from "./analysis.ts";

describe("ticksToNs", () => {
  test("converts exactly at the usual 10 MHz QPC frequency", () => {
    expect(ticksToNs(123_456_789, 10_000_000)).toBe(12_345_678_900);
  });
  test("rejects a zero frequency and unsafe values", () => {
    expect(() => ticksToNs(1, 0)).toThrow(RangeError);
    expect(() => ticksToNs(2 ** 53, 10_000_000)).toThrow(RangeError);
  });
});

describe("minRttEstimate", () => {
  test("uses the sample with the smallest round trip", () => {
    const estimate = minRttEstimate([
      { t0: 0, t1: 1_000_000, value: 600_000 },
      { t0: 2_000_000, t1: 2_100_000, value: 2_060_000 },
      { t0: 3_000_000, t1: 3_400_000, value: 3_000_000 },
    ]);
    expect(estimate).toEqual({ offsetNs: 10_000, uncertaintyNs: 50_000, rttNs: 100_000, index: 1, withinBracket: true, samples: 3 });
  });
  test("flags a reading outside its bracket", () => {
    expect(minRttEstimate([{ t0: 100, t1: 200, value: 50 }]).withinBracket).toBe(false);
  });
  test("rejects empty input and inverted brackets", () => {
    expect(() => minRttEstimate([])).toThrow(RangeError);
    expect(() => minRttEstimate([{ t0: 10, t1: 5, value: 7 }])).toThrow(RangeError);
  });
});

describe("stepSummary", () => {
  test("recognises Blink's 100 µs clamp as high resolution", () => {
    const summary = stepSummary([0, 0.1, 0.1, 0.1, 0.2, 0, 0.1]);
    expect(summary).toMatchObject({ steps: 5, minStepMs: 0.1, modalStepMs: 0.1, highResolution: true });
  });
  test("recognises coarse steps as low resolution", () => {
    expect(stepSummary([15.6, 15.6, 1, 15.6]).highResolution).toBe(false);
  });
  test("returns nulls when nothing moved", () => {
    expect(stepSummary([0, 0])).toEqual({ steps: 0, minStepMs: null, modalStepMs: null, highResolution: null });
  });
});

describe("scanNvdaLog", () => {
  const log = [
    "INFO - synthDriverHandler.setSynth (10:00:00.100) - MainThread (1):",
    "Loaded synthDriver espeak",
    "DEBUG - virtualBuffers.VirtualBuffer._loadBufferDone (10:00:01.200) - MainThread (1):",
    "Buffer load took 0.05 sec, 120 chars",
    "IO - speech.speech.speak (10:00:01.300) - MainThread (1):",
    "Speaking ['Infobar', 'alert', 'Alt plus Shift plus A']",
    "IO - speech.speech.speak (10:00:01.400) - MainThread (1):",
    "Speaking ['Probe anchor', 'button']",
    "ERROR - nvwave.WasapiWavePlayer.open (10:00:01.500) - MainThread (1):",
    "Couldn't open specified or default audio device",
    "DEBUGWARNING - UIAHandler (10:00:01.600) - MainThread (1):",
    "Chrome_RenderWidgetHostHWND treated as non-UIA",
  ].join("\r\n");

  test("finds the M1a markers", () => {
    const scan = scanNvdaLog(log);
    expect(scan.bufferLoads).toBe(1);
    expect(scan.synthsLoaded).toEqual(["espeak"]);
    expect(scan.speaking).toBe(2);
    expect(scan.infobarSpeech).toEqual(["Speaking ['Infobar', 'alert', 'Alt plus Shift plus A']"]);
    expect(scan.audioErrors).toEqual(["Couldn't open specified or default audio device"]);
    expect(scan.chromiumChannelLines).toEqual(["Chrome_RenderWidgetHostHWND treated as non-UIA"]);
    expect(scan.errors).toBe(1);
  });
});

describe("readEspeakSettings", () => {
  test("reads the effective eSpeak rate that NVDA saved on exit", () => {
    const ini = ["schemaVersion = 22", "[speech]", "\tsynth = espeak", "\t[[oneCore]]", "\t\trate = 100", "\t[[espeak]]", "\t\trate = 30", "\t\trateBoost = False", "[braille]"].join("\n");
    expect(readEspeakSettings(ini)).toEqual({ synth: "espeak", espeakSectionPresent: true, rate: 30, rateBoost: false });
  });
  test("reports an absent eSpeak section", () => {
    expect(readEspeakSettings("[speech]\n\tsynth = oneCore\n\t[[oneCore]]\n\t\trate = 100\n")).toEqual({
      synth: "oneCore",
      espeakSectionPresent: false,
      rate: null,
      rateBoost: null,
    });
  });
});

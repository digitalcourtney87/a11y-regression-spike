import { describe, expect, test } from "vitest";

import { NVDA_SETTINGS, probeSettings } from "./nvda-settings.ts";
import type { NvdaIniSection } from "./nvda-settings.ts";

function section(tree: NvdaIniSection, key: string): NvdaIniSection {
  const value = tree[key];
  if (typeof value !== "object") throw new Error(`missing section ${key}`);
  return value;
}

describe("NVDA_SETTINGS (D8, DR-0041)", () => {
  test("pins the D8 channel, synth and presentation settings", () => {
    expect(section(NVDA_SETTINGS, "UIA").allowInChromium).toBe(3);
    expect(section(NVDA_SETTINGS, "speech").synth).toBe("espeak");
    expect(section(NVDA_SETTINGS, "virtualBuffers").autoSayAllOnPageLoad).toBe(false);
    expect(section(NVDA_SETTINGS, "speechViewer").showSpeechViewerAtStartup).toBe(false);
  });

  test("never creates an eSpeak section, so NVDA keeps the driver's default rate of 30 (DR-0041)", () => {
    expect(Object.keys(section(NVDA_SETTINGS, "speech"))).toEqual(["synth"]);
    expect(JSON.stringify(NVDA_SETTINGS)).not.toMatch(/espeak"\s*:\s*\{/i);
    expect(JSON.stringify(NVDA_SETTINGS)).not.toMatch(/rate/i);
  });

  test("logs at DEBUG with the D2 categories", () => {
    expect(section(NVDA_SETTINGS, "general").loggingLevel).toBe("DEBUG");
    expect(section(NVDA_SETTINGS, "debugLog")).toEqual({ speech: true, speechManager: true, events: true, UIA: true, synthDriver: true });
  });

  test("the probe settings only add saveConfigurationOnExit", () => {
    const probe = probeSettings();
    expect(section(probe, "general")).toEqual({ loggingLevel: "DEBUG", saveConfigurationOnExit: true });
    expect({ ...probe, general: NVDA_SETTINGS.general }).toEqual(NVDA_SETTINGS);
    expect(section(NVDA_SETTINGS, "general").saveConfigurationOnExit).toBeUndefined();
  });
});

/**
 * NVDA configuration for Phase 0 (DR-0017 D8 NVDA channel and voice, as
 * amended by DR-0041 eSpeak NG at NVDA's default rate; DR-0011 D2 for the
 * DEBUG log). Passed to Guidepup as `nvda.start({ capture: false, settings })`,
 * which deep-merges it into the session copy of the pinned build's nvda.ini.
 *
 * | Setting | Value | Record |
 * |---|---|---|
 * | `[UIA] allowInChromium` | 3 ("no": IA2 for Chromium) | D8 |
 * | `[speech] synth` | `espeak` (eSpeak NG bundled with NVDA) | D8 |
 * | eSpeak rate and rate boost | not set (see below) | DR-0041 |
 * | `[virtualBuffers] autoSayAllOnPageLoad` | False | D8 |
 * | `[speechViewer] showSpeechViewerAtStartup` | False | D8 |
 * | `[general] loggingLevel` | DEBUG | D2 |
 * | `[debugLog]` speech, speechManager, events, UIA, synthDriver | True | D2 |
 * | `[vision] [[NVDAHighlighter]] enabled` | False | Decided by Claude under DR-0045: a visual overlay that can only perturb foreground handling |
 *
 * NVDA's default eSpeak NG rate is 30, but only on a fresh configuration: the
 * driver sets `rate = 30` in its constructor, and `SynthDriver.initSettings`
 * keeps those values only on the first load of the synth's config section
 * (NVDA release-2026.2 `synthDrivers/espeak.py:216`,
 * `synthDriverHandler.py:365-385`). If the settings created a
 * `[speech] [[espeak]]` section at all, even with only `rateBoost`, the first
 * load would be skipped and the rate would come from the generic driver-setting
 * default of 50. So this module must never contain an `espeak` section; rate
 * boost is off by the driver's own default (`espeak.py:388`).
 */

/** An nvda.ini section tree, as Guidepup's `settings` option expects. */
export interface NvdaIniSection {
  [key: string]: string | number | boolean | NvdaIniSection;
}

/** The Phase 0 NVDA settings (D8, DR-0041, D2). */
export const NVDA_SETTINGS: NvdaIniSection = {
  general: { loggingLevel: "DEBUG" },
  UIA: { allowInChromium: 3 },
  speech: { synth: "espeak" },
  virtualBuffers: { autoSayAllOnPageLoad: false },
  speechViewer: { showSpeechViewerAtStartup: false },
  vision: { NVDAHighlighter: { enabled: false } },
  debugLog: { speech: true, speechManager: true, events: true, UIA: true, synthDriver: true },
};

/**
 * Settings for the M1a probe only: the Phase 0 settings plus
 * `saveConfigurationOnExit`, so that NVDA writes the effective eSpeak rate to
 * the session nvda.ini when it quits (DR-0041; LAB_NOTEBOOK question 12).
 * Never used for canary or gate runs.
 */
export function probeSettings(): NvdaIniSection {
  return { ...NVDA_SETTINGS, general: { ...(NVDA_SETTINGS.general as NvdaIniSection), saveConfigurationOnExit: true } };
}

import { describe, expect, test } from "vitest";

import { itemValidity } from "./itemValidity.ts";
import type { SidedAttempt } from "./itemValidity.ts";

const ok = (side: SidedAttempt["side"]): SidedAttempt => ({ side, reasons: [] });

describe("side-aware item validity (R9, DR-0035)", () => {
  test("is valid when no check fails on either side", () => {
    expect(itemValidity([ok("base"), ok("candidate"), ok("candidate"), ok("base")])).toEqual({ result: "VALID", inconclusive: [], candidateFindings: [] });
  });
  test("a check failing on both sides makes the item INCONCLUSIVE", () => {
    const v = itemValidity([{ side: "base", reasons: ["FOREGROUND_HWND"] }, ok("candidate"), { side: "candidate", reasons: ["FOREGROUND_HWND"] }, ok("base")]);
    expect(v).toEqual({ result: "INCONCLUSIVE", inconclusive: [{ reason: "FOREGROUND_HWND", on: "both" }], candidateFindings: [] });
  });
  test("a check failing on the base only makes the item INCONCLUSIVE", () => {
    const v = itemValidity([{ side: "base", reasons: ["CLOCK_RAF_GAP"] }, ok("candidate")]);
    expect(v).toEqual({ result: "INCONCLUSIVE", inconclusive: [{ reason: "CLOCK_RAF_GAP", on: "base" }], candidateFindings: [] });
  });
  test("a check failing on the candidate only is a finding, not INCONCLUSIVE", () => {
    const v = itemValidity([ok("base"), { side: "candidate", reasons: ["NVDA_INJECTION_MARKER", "CLOCK_RAF_GAP"] }, ok("candidate"), ok("base")]);
    expect(v).toEqual({ result: "VALID", inconclusive: [], candidateFindings: ["NVDA_INJECTION_MARKER", "CLOCK_RAF_GAP"] });
  });
  test("a setup error before activation counts for its side (P13, DR-0066)", () => {
    expect(itemValidity([ok("base"), { side: "candidate", reasons: ["ENV_FAILURE"] }]).candidateFindings).toEqual(["ENV_FAILURE"]);
    expect(itemValidity([{ side: "base", reasons: ["ENV_FAILURE"] }, ok("candidate")]).inconclusive).toEqual([{ reason: "ENV_FAILURE", on: "base" }]);
  });
  test("the manifest covers both sides at once, and the pre-block canary covers the block", () => {
    expect(itemValidity([ok("base"), { side: "candidate", reasons: ["MANIFEST_INVALID"] }]).inconclusive).toEqual([{ reason: "MANIFEST_INVALID", on: "both" }]);
    expect(itemValidity([ok("base"), { side: "candidate", reasons: ["PRE_CANARY"] }]).inconclusive).toEqual([{ reason: "PRE_CANARY", on: "block" }]);
  });
  test("mixes causes: base-only and candidate-only checks together", () => {
    const v = itemValidity([{ side: "base", reasons: ["AUDIO"] }, { side: "candidate", reasons: ["SYNTH_FALLBACK"] }]);
    expect(v).toEqual({ result: "INCONCLUSIVE", inconclusive: [{ reason: "AUDIO", on: "base" }], candidateFindings: ["SYNTH_FALLBACK"] });
  });
});

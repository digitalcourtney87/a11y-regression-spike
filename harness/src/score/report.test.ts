import { describe, expect, test } from "vitest";

import { buildReport, quantile, renderReport } from "./report.ts";
import type { AttemptRecord } from "./report.ts";

function gating(itemId: string, verdict: "PASS" | "FAIL", valid = true): AttemptRecord {
  return {
    jobId: "nvda-present-1of1",
    itemId,
    canary: itemId,
    leg: "nvda-present",
    gating: true,
    valid,
    inconclusiveReasons: valid ? [] : ["FOREGROUND_HWND"],
    packageValid: true,
    outcome: { kind: "gating", verdict, late: false },
    clock: { native: 0, mappingUncertaintyMs: 0.1, driftMs: 0.2, highResolution: true, raf: { maxGapMs: 16 } },
    page: { activatedAt: 12 },
  };
}

function record(itemId: string, announced: boolean, priority: string | null = null): AttemptRecord {
  return { jobId: "j", itemId, canary: itemId.split(":")[0] ?? itemId, leg: "nvda-present", gating: false, valid: true, outcome: { kind: "record", announced, priority, cancelsAfterUpdate: 0, politeBeforeFocus: null } };
}

describe("buildReport", () => {
  test("tallies gating canaries into the D12 gate with Wilson intervals", () => {
    const attempts = ["K1", "K2", "K3", "K4", "K5"].flatMap((id) => Array.from({ length: 50 }, () => gating(id, "PASS")));
    attempts.push(gating("K1", "FAIL"), gating("K2", "PASS", false));
    const report = buildReport(attempts, [{ jobId: "nvda-present-1of1", parity: { tapSpeakMessages: 10, logSpeakingEntries: 10, difference: 0 } }]);
    expect(report.gate.pass).toBe(true);
    expect(report.gating.find((g) => g.canary === "K1")).toMatchObject({ attempts: 51, valid: 51, failures: 1 });
    expect(report.gating.find((g) => g.canary === "K2")).toMatchObject({ attempts: 51, valid: 50 });
    expect(report.inconclusiveReasons).toEqual({ FOREGROUND_HWND: 1 });
    expect(report.parity).toEqual([{ jobId: "nvda-present-1of1", tap: 10, log: 10, difference: 0 }]);
    expect(renderReport(report)).toContain("**G1 rule (D12):** PASS");
  });

  test("evaluates the pre-registered K6a rule per variant (more than 1 of 20)", () => {
    const attempts = [record("K6a:polite", true), record("K6a:polite", false), record("K6a:status", true), record("K6a:status", true, "NORMAL")];
    const report = buildReport(attempts, []);
    expect(report.k6aRule).toEqual([
      { variant: "polite", valid: 2, announced: 1, triggers: false },
      { variant: "status", valid: 2, announced: 2, triggers: true },
    ]);
    expect(renderReport(report)).toContain("TRIGGERED");
  });

  test("ignores the NVDA-absent leg for G1", () => {
    const report = buildReport([{ ...gating("K1", "FAIL"), leg: "nvda-absent" }], []);
    expect(report.gating.find((g) => g.canary === "K1")?.attempts).toBe(0);
  });
});

describe("latency, INCONCLUSIVE intervals and cancel timing", () => {
  test("quantile interpolates linearly", () => {
    expect(quantile([1, 2, 3, 4], 0.5)).toBe(2.5);
    expect(quantile([10, 20], 0.9)).toBeCloseTo(19, 9);
    expect(quantile([], 0.5)).toBeNull();
  });
  test("latency subtracts the page's activation-to-update delay", () => {
    const a: AttemptRecord = { ...gating("K1", "PASS"), outcome: { kind: "gating", verdict: "PASS", late: false, matched: { atMs: 570 } } as AttemptRecord["outcome"], page: { activatedAt: 10, log: [{ t: 10, what: "activated" }, { t: 512, what: "done" }] } };
    const report = buildReport([a], []);
    expect(report.latency.find((l) => l.canary === "K1")).toMatchObject({ n: 1, medianMs: 68 });
  });
  test("reports INCONCLUSIVE per item with Wilson intervals and the activation cancel", () => {
    const valid = { ...gating("K2", "PASS"), package: { steps: [{ startedAt: 1_000_000_000, speechCancels: [{ t: 1_005_000_000 }] }] } };
    const report = buildReport([valid, gating("K2", "PASS", false)], []);
    expect(report.inconclusive.find((r) => r.itemId === "K2")).toMatchObject({ attempts: 2, inconclusive: 1 });
    expect(report.activationCancel).toEqual({ n: 1, medianMs: 5 });
  });
});

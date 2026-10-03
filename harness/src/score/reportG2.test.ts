import { describe, expect, test } from "vitest";

import type { B2Component } from "../runner/b2Signature.ts";
import { buildReport } from "./report.ts";
import { buildG2Report, renderG2Report } from "./reportG2.ts";
import type { B2Attempt } from "./reportG2.ts";

function components(found: boolean): B2Component[] {
  return [
    { name: "dom-focusin", channel: "dom", required: true, found: true, count: 1, atMs: 500 },
    { name: "focus", channel: "platform", required: true, found, count: found ? 1 : 0, ...(found ? { atMs: 512, via: "name" } : {}) },
  ];
}

function absent(itemId: string, pass: boolean, valid = true): B2Attempt {
  return {
    jobId: "nvda-absent-1of1",
    itemId,
    canary: itemId,
    leg: "nvda-absent",
    gating: true,
    valid,
    inconclusiveReasons: valid ? [] : ["FOREGROUND_HWND"],
    packageValid: true,
    outcome: null,
    b2: { kind: "b2-gating", verdict: pass ? "PASS" : "FAIL", components: components(pass) },
    clock: { native: 0.01, nativeByCollector: { winhelper: 0.01, listener: 0 }, mappingUncertaintyMs: 0.1, driftMs: 0.2, highResolution: true, raf: { maxGapMs: 17 } },
    listener: { events: [{ event: "EVENT_OBJECT_FOCUS" }], malformed: 0, uia: "validated" },
    focusReads: 1,
  };
}

describe("buildG2Report", () => {
  test("applies the D12 rule to B2 matches in the NVDA-absent leg", () => {
    const attempts = ["K1", "K2", "K3", "K4", "K5"].flatMap((id) => Array.from({ length: 50 }, () => absent(id, true)));
    attempts.push(absent("K3", false), absent("K4", true, false));
    const report = buildG2Report(attempts);
    expect(report.gate.pass).toBe(true);
    expect(report.gating.find((g) => g.canary === "K3")).toMatchObject({ attempts: 51, valid: 51, failures: 1 });
    expect(report.gating.find((g) => g.canary === "K3")?.components.find((c) => c.name === "focus")).toMatchObject({ found: 50, of: 51, via: { name: 50 } });
    expect(report.gating.find((g) => g.canary === "K3")?.domToPlatform).toMatchObject({ n: 50, medianMs: 12 });
    expect(report.inconclusive.find((r) => r.itemId === "K4")).toMatchObject({ inconclusive: 1, reasons: { FOREGROUND_HWND: 1 } });
    expect(renderG2Report(report)).toContain("**G2 rule (D12, B2 signature matches):** PASS");
  });

  test("counts a valid attempt with no B2 outcome as a failure, never INCONCLUSIVE", () => {
    const report = buildG2Report([{ ...absent("K1", true), b2: null }]);
    expect(report.gating.find((g) => g.canary === "K1")).toMatchObject({ valid: 1, failures: 1 });
  });

  test("keeps the on/off diagnostic out of G1 and out of the G2 rule", () => {
    const diag: B2Attempt = { ...absent("K1", false), leg: "nvda-present", diagnostic: "b2-onoff", outcome: { kind: "gating", verdict: "FAIL" } };
    const g2 = buildG2Report([absent("K1", true), diag]);
    expect(g2.gating.find((g) => g.canary === "K1")).toMatchObject({ attempts: 1, failures: 0 });
    expect(g2.onOff.find((o) => o.canary === "K1")).toMatchObject({ absent: { valid: 1, pass: 1 }, present: { valid: 1, pass: 0 } });
    expect(buildReport([diag], []).gating.find((g) => g.canary === "K1")?.attempts).toBe(0);
  });

  test("summarises K6 grades, separate updates and region events", () => {
    const k6 = (delayMs: number | null, populated: boolean, separate: boolean): B2Attempt => ({
      ...absent("K6e:50", true),
      itemId: "K6e:50",
      canary: "K6e",
      gating: false,
      b2: { kind: "b2-record", region: { target: "div#region", populated, delayMs, grade: populated ? "populated-insertion" : "separate-update", platform: separate ? [{ event: "EVENT_OBJECT_LIVEREGIONCHANGED", atMs: 55, via: "automationId" }] : [], separateUpdate: separate } },
    });
    const report = buildG2Report([k6(50.4, false, true), k6(51, false, true), k6(null, true, false)]);
    expect(report.recordOnly[0]).toMatchObject({ itemId: "K6e:50", valid: 3, grades: { "separate-update": 2, "populated-insertion": 1 }, separateUpdate: 2, regionEvents: { EVENT_OBJECT_LIVEREGIONCHANGED: 2 } });
    expect(report.recordOnly[0]?.delayMs).toMatchObject({ min: 50.4, max: 51 });
  });
});

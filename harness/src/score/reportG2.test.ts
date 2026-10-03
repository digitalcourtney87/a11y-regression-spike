import { describe, expect, test } from "vitest";

import type { MappedTimelineEntry } from "../collectors/mutationTimeline.ts";
import type { SignatureEvent } from "../runner/b2Signature.ts";
import { evaluateGatingB2 } from "../runner/b2Signature.ts";
import { buildReport, renderReport } from "./report.ts";
import { buildG2Report, renderG2Report, rescoreB2 } from "./reportG2.ts";
import type { B2Attempt } from "./reportG2.ts";

const MS = 1e6;
const A = 1_000_000 * MS;

function ev(atMs: number, event: string, automationId: string): SignatureEvent {
  return { t: A + atMs * MS, event, hwndClass: "Chrome_RenderWidgetHostHWND", automationId };
}

function dom(atMs: number, fields: Omit<MappedTimelineEntry, "t" | "tQpc">): MappedTimelineEntry {
  return { t: 10_000 + atMs, tQpc: A + atMs * MS, ...fields };
}

/** Raw evidence that matches each gating canary's signature; `pass` false drops the platform evidence. */
function evidence(canary: string, pass: boolean): { events: SignatureEvent[]; timeline: MappedTimelineEntry[] } {
  const byCanary: Record<string, { events: SignatureEvent[]; timeline: MappedTimelineEntry[] }> = {
    K1: { events: [ev(510, "IA2_EVENT_TEXT_INSERTED", "live")], timeline: [dom(500, { kind: "insert", target: "#text", parent: "div#live", liveRoot: "div#live", inLive: true })] },
    K2: { events: [ev(510, "EVENT_OBJECT_LIVEREGIONCHANGED", "alert"), ev(510, "IA2_EVENT_TEXT_INSERTED", "alert")], timeline: [] },
    K3: { events: [ev(512, "EVENT_OBJECT_FOCUS", "target")], timeline: [dom(500, { kind: "focusin", target: "button#target" })] },
    K4: {
      events: [ev(510, "EVENT_OBJECT_SHOW", "dialog"), ev(511, "EVENT_OBJECT_FOCUS", "dialog-first")],
      timeline: [dom(500, { kind: "attr", target: "div#dialog[dialog]", detail: "hidden" }), dom(500, { kind: "focusin", target: "button#dialog-first" })],
    },
    K5: {
      events: [ev(512, "EVENT_OBJECT_FOCUS", "route-heading")],
      timeline: [dom(500, { kind: "history", target: "history", detail: "pushState" }), dom(501, { kind: "focusin", target: "h1#route-heading" })],
    },
  };
  const e = byCanary[canary];
  if (e === undefined) throw new Error(canary);
  return { events: pass ? e.events : [], timeline: e.timeline };
}

function absent(itemId: string, pass: boolean, valid = true): B2Attempt {
  const { events, timeline } = evidence(itemId, pass);
  const w = { activationT: A, endT: A + 4000 * MS };
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
    b2: evaluateGatingB2(itemId, events, timeline, w),
    timeline,
    timelineVersion: 2,
    package: { steps: [{ startedAt: w.activationT, endedAt: w.endT }] },
    clock: { native: 0.01, nativeByCollector: { winhelper: 0.01, listener: 0 }, mappingUncertaintyMs: 0.1, driftMs: 0.2, highResolution: true, raf: { maxGapMs: 17 } },
    listener: { events, malformed: 0, uia: "validated" },
    focusReads: 1,
  };
}

describe("buildG2Report", () => {
  test("applies the D12 rule to B2 matches in the NVDA-absent leg", () => {
    const attempts = ["K1", "K2", "K3", "K4", "K5"].flatMap((id) => Array.from({ length: 50 }, () => absent(id, true)));
    attempts.push(absent("K3", false), absent("K4", true, false));
    const report = buildG2Report(attempts);
    expect(report.gate.pass).toBe(true);
    expect(report.diagnosticRun).toBe(false);
    expect(report.gating.find((g) => g.canary === "K3")).toMatchObject({ attempts: 51, valid: 51, failures: 1 });
    expect(report.gating.find((g) => g.canary === "K3")?.components.find((c) => c.name === "focus")).toMatchObject({ found: 50, of: 51, via: { automationId: 50 } });
    expect(report.gating.find((g) => g.canary === "K3")?.domToPlatform).toMatchObject({ n: 50, medianMs: 12 });
    expect(report.inconclusive.find((r) => r.itemId === "K4")).toMatchObject({ inconclusive: 1, reasons: { FOREGROUND_HWND: 1 } });
    expect(report.rescore).toMatchObject({ gatingAttempts: 252, agree: 252, changed: [] });
    expect(renderG2Report(report)).toContain("**G2 rule (D12, B2 signature matches):** PASS");
  });

  test("re-scores from raw evidence and reports a changed verdict", () => {
    const stale: B2Attempt = { ...absent("K3", false), b2: { kind: "b2-gating", verdict: "PASS", components: [] } };
    expect(rescoreB2(stale)).toMatchObject({ verdict: "FAIL" });
    const report = buildG2Report([stale]);
    expect(report.rescore).toMatchObject({ gatingAttempts: 1, agree: 0, changed: ["nvda-absent-1of1/K3"] });
    expect(report.gating.find((g) => g.canary === "K3")).toMatchObject({ failures: 1 });
  });

  test("counts a listener failure or a missing B2 outcome as a failure, never INCONCLUSIVE", () => {
    const report = buildG2Report([{ ...absent("K1", true), b2: null }, { ...absent("K2", true), listenerFailure: "stop: timed out" }]);
    expect(report.gating.find((g) => g.canary === "K1")).toMatchObject({ valid: 1, failures: 1 });
    expect(report.gating.find((g) => g.canary === "K2")).toMatchObject({ valid: 1, failures: 1 });
    expect(report.listenerFailures).toBe(1);
  });

  test("keeps the on/off diagnostic out of G1 and does not evaluate the G2 rule on it", () => {
    const diag: B2Attempt = { ...absent("K1", false), leg: "nvda-present", diagnostic: "b2-onoff", outcome: { kind: "gating", verdict: "PASS" } };
    const g2 = buildG2Report([absent("K1", true), diag]);
    expect(g2.diagnosticRun).toBe(true);
    expect(g2.onOff.find((o) => o.canary === "K1")).toMatchObject({ absent: { valid: 1, pass: 1 }, present: { valid: 1, pass: 0, speechPass: 1 } });
    expect(renderG2Report(g2)).toContain("not evaluated");
    expect(buildReport([diag], []).gating.find((g) => g.canary === "K1")?.attempts).toBe(0);
    expect(renderReport(buildReport([diag], []))).toContain("**G1 rule (D12):** not applicable");
  });

  test("finds systematic event differences between the legs", () => {
    const withExtra = (a: B2Attempt): B2Attempt => ({ ...a, listener: { events: [...(a.listener?.events ?? []), ev(45, "EVENT_OBJECT_STATECHANGE", "start")], malformed: 0, uia: "validated" } });
    const diag = (a: B2Attempt): B2Attempt => ({ ...a, leg: "nvda-present", diagnostic: "b2-onoff" });
    const attempts = [...Array.from({ length: 10 }, () => withExtra(absent("K3", true))), ...Array.from({ length: 10 }, () => diag(absent("K3", true)))];
    expect(buildG2Report(attempts).systematicDifferences).toEqual([{ canary: "K3", event: "EVENT_OBJECT_STATECHANGE", element: "start", absent: { attempts: 10, of: 10 }, present: { attempts: 0, of: 10 } }]);
  });

  test("summarises K6 grades, separate updates, region events and timing", () => {
    const k6 = (fillAt: number | null): B2Attempt => {
      const timeline = [
        dom(500, { kind: "insert", target: "div#region", parent: "div#stage", liveWithContent: fillAt === null, inLive: false }),
        ...(fillAt === null ? [] : [dom(500 + fillAt, { kind: "insert", target: "#text", parent: "div#region", liveRoot: "div#region", inLive: true })]),
      ];
      const events = [ev(509, "EVENT_OBJECT_SHOW", "region"), ...(fillAt === null ? [] : [ev(665, "IA2_EVENT_TEXT_INSERTED", "region"), ev(665, "EVENT_OBJECT_LIVEREGIONCHANGED", "region")])];
      return { ...absent("K3", true), itemId: "K6e:50", canary: "K6e", gating: false, b2: { kind: "b2-record" }, timeline, listener: { events, malformed: 0, uia: "validated" } };
    };
    const report = buildG2Report([k6(50), k6(51), k6(null)]);
    expect(report.recordOnly[0]).toMatchObject({ itemId: "K6e:50", valid: 3, grades: { "separate-update": 2, "populated-insertion": 1 }, separateUpdate: 2, regionEvents: { EVENT_OBJECT_LIVEREGIONCHANGED: 2 } });
    expect(report.recordOnly[0]?.delayMs).toMatchObject({ min: 50, max: 51 });
    expect(report.recordOnly[0]?.timing?.textInserted).toMatchObject({ n: 2, medianMs: 165 });
  });
});

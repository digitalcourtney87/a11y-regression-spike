import { describe, expect, test } from "vitest";

import type { MappedTimelineEntry } from "../collectors/mutationTimeline.ts";
import { evaluateGatingB2, evaluateRecordB2, gradeDelay, identityVia, isBrowserUi, SAME_FRAME_MS } from "./b2Signature.ts";
import type { SignatureEvent } from "./b2Signature.ts";
import { specByItemId } from "./canaries.ts";

const MS = 1e6;
const A = 1_000_000 * MS; // activation, QPC ns
const W = { activationT: A, endT: A + 4000 * MS };

function ev(atMs: number, event: string, fields: Partial<SignatureEvent> = {}): SignatureEvent {
  return { t: A + atMs * MS, event, hwndClass: "Chrome_RenderWidgetHostHWND", ...fields };
}

function dom(atMs: number, fields: Omit<MappedTimelineEntry, "t" | "tQpc">): MappedTimelineEntry {
  return { t: 10_000 + atMs, tQpc: A + atMs * MS, ...fields };
}

function spec(itemId: string) {
  const found = specByItemId(itemId);
  if (found === undefined) throw new Error(itemId);
  return found;
}

describe("identityVia", () => {
  const identity = { ids: ["live"], names: ["n"], ariaRoles: ["alert"], roles: ["alert"] };
  test("prefers AutomationId, then name, AriaRole and MSAA role", () => {
    expect(identityVia({ t: 0, event: "x", automationId: "live", name: "n" }, identity)).toBe("automationId");
    expect(identityVia({ t: 0, event: "x", name: "n" }, identity)).toBe("name");
    expect(identityVia({ t: 0, event: "x", ariaRole: "alert" }, identity)).toBe("ariaRole");
    expect(identityVia({ t: 0, event: "x", role: "alert" }, identity)).toBe("role");
  });
  test("an event with another element's AutomationId never matches by a fallback", () => {
    // The K4 heading carries the dialog's name but its own id.
    expect(identityVia({ t: 0, event: "x", automationId: "dialog-title", name: "K4 settings dialog" }, { ids: ["dialog"], names: ["K4 settings dialog"] })).toBeNull();
    expect(identityVia({ t: 0, event: "x", automationId: "other", role: "alert" }, identity)).toBeNull();
  });
  test("LiveSetting is not an identity: a text leaf inside a polite region is not the region", () => {
    expect(identityVia({ t: 0, event: "EVENT_OBJECT_SHOW", role: "text", name: "K6e filled after 50", liveSetting: "polite" }, { ids: ["region"] })).toBeNull();
  });
  test("browser UI is recognised by the frame window class (P3)", () => {
    expect(isBrowserUi({ t: 0, event: "EVENT_SYSTEM_ALERT", hwndClass: "Chrome_WidgetWin_1" })).toBe(true);
    expect(isBrowserUi({ t: 0, event: "EVENT_OBJECT_FOCUS", hwndClass: "Chrome_RenderWidgetHostHWND" })).toBe(false);
  });
});

describe("gating signatures (HANDOFF §9.1)", () => {
  test("K1 needs the DOM text change in the region and a live-region or text event on it", () => {
    const timeline = [dom(500, { kind: "insert", target: "#text", parent: "div#live", inLive: true })];
    const pass = evaluateGatingB2("K1", [ev(520, "IA2_EVENT_TEXT_INSERTED", { automationId: "live" })], timeline, W);
    expect(pass.verdict).toBe("PASS");
    expect(pass.components.find((c) => c.name === "live-region-or-text-event")).toMatchObject({ found: true, atMs: 520, via: "automationId" });
    expect(evaluateGatingB2("K1", [ev(520, "IA2_EVENT_TEXT_INSERTED", { automationId: "elsewhere" })], timeline, W).verdict).toBe("FAIL");
    expect(evaluateGatingB2("K1", [ev(520, "EVENT_OBJECT_LIVEREGIONCHANGED", { liveSetting: "polite" })], timeline, W).verdict).toBe("FAIL");
    expect(evaluateGatingB2("K1", [ev(520, "IA2_EVENT_TEXT_INSERTED", { automationId: "live", hwndClass: "Chrome_WidgetWin_1" })], timeline, W).verdict).toBe("FAIL");
  });
  test("K2 needs both LIVEREGIONCHANGED and TEXT_INSERTED on the alert; EVENT_SYSTEM_ALERT is recorded, not required", () => {
    const both = [ev(510, "EVENT_OBJECT_LIVEREGIONCHANGED", { automationId: "alert" }), ev(511, "IA2_EVENT_TEXT_INSERTED", { ariaRole: "alert" })];
    expect(evaluateGatingB2("K2", both, [], W).verdict).toBe("PASS");
    expect(evaluateGatingB2("K2", both.slice(0, 1), [], W).verdict).toBe("FAIL");
    const withAlert = evaluateGatingB2("K2", [...both, ev(512, "EVENT_SYSTEM_ALERT", { role: "alert" })], [], W);
    expect(withAlert.components.find((c) => c.name === "system-alert")).toMatchObject({ required: false, found: true });
  });
  test("K3 needs focusin and a focus WinEvent on the named button", () => {
    const timeline = [dom(500, { kind: "focusin", target: "button#target" })];
    expect(evaluateGatingB2("K3", [ev(505, "EVENT_OBJECT_FOCUS", { name: "K3 target button" })], timeline, W).verdict).toBe("PASS");
    expect(evaluateGatingB2("K3", [ev(505, "EVENT_OBJECT_FOCUS", { name: "Start canary" })], timeline, W).verdict).toBe("FAIL");
  });
  test("K4 needs the dialog shown in the DOM and focus events on its first control", () => {
    const timeline = [dom(500, { kind: "attr", target: "div#dialog[dialog]", detail: "hidden" }), dom(500, { kind: "focusin", target: "button#dialog-first" })];
    const events = [ev(505, "EVENT_OBJECT_SHOW", { automationId: "dialog" }), ev(506, "EVENT_OBJECT_FOCUS", { name: "First control" })];
    expect(evaluateGatingB2("K4", events, timeline, W).verdict).toBe("PASS");
    expect(evaluateGatingB2("K4", events, timeline.slice(1), W).verdict).toBe("FAIL");
    expect(evaluateGatingB2("K4", events.slice(1), timeline, W).verdict).toBe("FAIL");
  });
  test("K5 needs pushState, focusin on the heading and a focus WinEvent, with no title dependency", () => {
    const timeline = [dom(500, { kind: "history", target: "history", detail: "pushState" }), dom(501, { kind: "focusin", target: "h1#route-heading" })];
    const result = evaluateGatingB2("K5", [ev(510, "EVENT_OBJECT_FOCUS", { automationId: "route-heading" })], timeline, W);
    expect(result.verdict).toBe("PASS");
    expect(result.components.map((c) => c.name)).not.toContain("title");
  });
  test("ignores evidence outside the observation window", () => {
    const timeline = [dom(500, { kind: "focusin", target: "button#target" })];
    expect(evaluateGatingB2("K3", [ev(-5, "EVENT_OBJECT_FOCUS", { name: "K3 target button" })], timeline, W).verdict).toBe("FAIL");
  });
});

describe("K6 grading (DR-0037 with P9)", () => {
  test("polite regions after load use the observed boundary", () => {
    const polite = { populated: false, politeAfterLoad: true, loaded: true };
    expect(gradeDelay(null, { ...polite, populated: true })).toBe("populated-insertion");
    expect(gradeDelay(SAME_FRAME_MS, polite)).toBe("populated-insertion");
    expect(gradeDelay(30, polite)).toBe("review");
    expect(gradeDelay(50, polite)).toBe("separate-update");
    expect(gradeDelay(null, polite)).toBe("never-filled");
  });
  test("with rAF tagging (timeline version 2) only a one-rAF fill counts as the same frame", () => {
    const polite = { populated: false, politeAfterLoad: true, loaded: true };
    expect(gradeDelay(8, { ...polite, fillInRaf: true })).toBe("populated-insertion");
    expect(gradeDelay(8, { ...polite, fillInRaf: false })).toBe("review");
    expect(gradeDelay(20, { ...polite, fillInRaf: true })).toBe("review");
    expect(gradeDelay(8, { ...polite, fillInRaf: null })).toBe("populated-insertion");
  });
  test("other roles keep DR-0037's windows", () => {
    expect(gradeDelay(100, { populated: false, politeAfterLoad: false, loaded: true })).toBe("possibly-indistinguishable");
    expect(gradeDelay(200, { populated: false, politeAfterLoad: false, loaded: true })).toBe("separate-update");
    expect(gradeDelay(300, { populated: false, politeAfterLoad: false, loaded: false })).toBe("possibly-indistinguishable");
  });
  test("traces a K6e region from its DOM insertion to its fill and platform events", () => {
    const timeline = [
      dom(500, { kind: "insert", target: "div#region", parent: "div#stage", liveWithContent: false, inLive: false }),
      dom(550, { kind: "insert", target: "#text", parent: "div#region", inLive: true }),
    ];
    const events = [
      ev(505, "EVENT_OBJECT_SHOW", { automationId: "region" }),
      ev(560, "EVENT_OBJECT_LIVEREGIONCHANGED", { automationId: "region" }),
      ev(561, "EVENT_OBJECT_SHOW", { role: "text", liveSetting: "polite" }),
    ];
    const out = evaluateRecordB2(spec("K6e:50"), events, timeline, W);
    expect(out.region).toMatchObject({ target: "div#region", populated: false, delayMs: 50, fillInRaf: null, grade: "separate-update", separateUpdate: true });
    expect(out.region?.platform).toEqual([
      { event: "EVENT_OBJECT_SHOW", atMs: 5, via: "automationId" },
      { event: "EVENT_OBJECT_LIVEREGIONCHANGED", atMs: 60, via: "automationId" },
    ]);
  });
  test("a K6a region inserted populated is graded as a populated insertion", () => {
    const timeline = [dom(500, { kind: "insert", target: "div#region[status]", parent: "div#stage", liveWithContent: true, inLive: false })];
    const out = evaluateRecordB2(spec("K6a:status"), [ev(505, "EVENT_OBJECT_SHOW", { ariaRole: "status" })], timeline, W);
    expect(out.region).toMatchObject({ populated: true, delayMs: null, grade: "populated-insertion", separateUpdate: false });
  });
});

describe("K7 order", () => {
  test("orders the DOM by timeline position and the platform by QPC", () => {
    const timeline = [dom(500, { kind: "insert", target: "#text", parent: "div#live", inLive: true }), dom(500, { kind: "focusin", target: "button#target" })];
    const events = [ev(510, "EVENT_OBJECT_LIVEREGIONCHANGED", { automationId: "live" }), ev(512, "EVENT_OBJECT_FOCUS", { name: "K7a target button" })];
    expect(evaluateRecordB2(spec("K7a"), events, timeline, W).order).toEqual({ domTextBeforeFocus: true, platformTextBeforeFocus: null, platformLiveRegionBeforeFocus: true });
    const split = [ev(510, "IA2_EVENT_TEXT_INSERTED", { automationId: "live" }), ev(510.3, "EVENT_OBJECT_FOCUS", { name: "K7a target button" }), ev(510.5, "EVENT_OBJECT_LIVEREGIONCHANGED", { automationId: "live" })];
    expect(evaluateRecordB2(spec("K7a"), split, timeline, W).order).toEqual({ domTextBeforeFocus: true, platformTextBeforeFocus: true, platformLiveRegionBeforeFocus: false });
    expect(evaluateRecordB2(spec("K7b"), [], [], W).order).toEqual({ domTextBeforeFocus: null, platformTextBeforeFocus: null, platformLiveRegionBeforeFocus: null });
  });
});

describe("timeline version 2", () => {
  test("a rAF fill is graded as the same frame and a timer fill under 50 ms as REVIEW", () => {
    const insert = dom(500, { kind: "insert", target: "div#region", parent: "div#stage", liveWithContent: false, inLive: false });
    const rafFill = dom(508, { kind: "insert", target: "#text", parent: "div#region", liveRoot: "div#region", inLive: true, inRaf: true });
    const timerFill = dom(508, { kind: "insert", target: "#text", parent: "div#region", liveRoot: "div#region", inLive: true });
    expect(evaluateRecordB2(spec("K6e:raf"), [], [insert, rafFill], W, { timelineVersion: 2 }).region).toMatchObject({ fillInRaf: true, grade: "populated-insertion" });
    expect(evaluateRecordB2(spec("K6e:raf"), [], [insert, timerFill], W, { timelineVersion: 2 }).region).toMatchObject({ fillInRaf: false, grade: "review" });
  });
  test("a text change in a nested child counts for its live region", () => {
    const timeline = [dom(500, { kind: "text", target: "p", liveRoot: "div#live", inLive: true })];
    expect(evaluateGatingB2("K1", [ev(510, "IA2_EVENT_TEXT_INSERTED", { automationId: "live" })], timeline, W).verdict).toBe("PASS");
  });
});

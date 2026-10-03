/**
 * Arm B2 signatures for the canaries (HANDOFF §9.1 "Expected B2 signature";
 * DR-0019 D10, DR-0020 D11, DR-0036, DR-0037 with P9 of DR-0052). Scored on
 * the NVDA-absent leg for G2; the same evaluation runs in the NVDA-present leg
 * only for the 20-run on/off diagnostic (DR-0020, P4).
 *
 * Evidence is the listener's WinEvents (QPC on callback entry) and the DOM
 * mutation timeline (page times mapped to QPC), both inside the observation
 * window. UIA events are never part of a signature (DR-0019), and events on
 * the browser frame window (`Chrome_WidgetWin_1`, browser UI) are excluded by
 * window class (P3). A platform event is attributed to a canary element
 * through its identity: UIA AutomationId (Chrome exposes the DOM id) and, only
 * for an event with no AutomationId, MSAA name, UIA AriaRole or MSAA role, in
 * that order; the path used is recorded per component. UIA LiveSetting is not
 * an identity: Chrome reports it on every descendant of a live region (gate
 * review of G2).
 *
 * Gating canaries pass when every required component is found. Record-only
 * canaries are described, not scored. Every Phase 0 result is EXPLORATORY.
 */
import { changedRegion } from "../collectors/mutationTimeline.ts";
import type { MappedTimelineEntry } from "../collectors/mutationTimeline.ts";
import type { CanarySpec } from "./canaries.ts";

/** The fields of a platform event a signature reads. */
export interface SignatureEvent {
  t: number;
  event: string;
  hwndClass?: string;
  role?: string;
  name?: string;
  automationId?: string;
  liveSetting?: string;
  ariaRole?: string;
}

/** How a canary element is recognised in platform events. */
export interface Identity {
  ids?: readonly string[];
  names?: readonly string[];
  ariaRoles?: readonly string[];
  roles?: readonly string[];
}

/**
 * The identity path that matched, or null. An event that carries an
 * AutomationId is that element: it matches only by AutomationId, never by a
 * fallback, so another element with the same name or role is not attributed.
 */
export function identityVia(e: SignatureEvent, identity: Identity): string | null {
  if (e.automationId !== undefined) return identity.ids?.includes(e.automationId) === true ? "automationId" : null;
  if (e.name !== undefined && identity.names?.includes(e.name) === true) return "name";
  if (e.ariaRole !== undefined && identity.ariaRoles?.includes(e.ariaRole) === true) return "ariaRole";
  if (e.role !== undefined && identity.roles?.includes(e.role) === true) return "role";
  return null;
}

/** IA2 text events (the "text events" of HANDOFF §9.1). */
export const TEXT_EVENTS: readonly string[] = ["IA2_EVENT_TEXT_INSERTED", "IA2_EVENT_TEXT_UPDATED", "IA2_EVENT_TEXT_CHANGED"];
export const LIVE_REGION_CHANGED = "EVENT_OBJECT_LIVEREGIONCHANGED";
export const FOCUS = "EVENT_OBJECT_FOCUS";

/**
 * P3 (DR-0019, DR-0052): events raised on the browser frame window
 * (`Chrome_WidgetWin_1`: tab strip, address bar, browser-UI alerts) are
 * browser UI and never part of a signature; web content is raised on
 * `Chrome_RenderWidgetHostHWND`.
 */
export function isBrowserUi(e: SignatureEvent): boolean {
  return e.hwndClass === "Chrome_WidgetWin_1";
}

export interface B2Component {
  name: string;
  channel: "platform" | "dom";
  required: boolean;
  found: boolean;
  /** Matching items in the window. */
  count: number;
  /** First match, ms after activation. */
  atMs?: number;
  /** Platform components: the identity path of the first match. */
  via?: string;
}

export interface B2GatingOutcome {
  kind: "b2-gating";
  verdict: "PASS" | "FAIL";
  components: B2Component[];
}

/** K6 grading (DR-0037, amended by P9 of DR-0052). */
export type DelayGrade = "populated-insertion" | "possibly-indistinguishable" | "review" | "separate-update" | "never-filled";

/** One frame at 60 Hz (ms): the longest delay a one-rAF fill can have and still count as the same frame (P9). */
export const SAME_FRAME_MS = 1000 / 60;
/** P9: a polite fill at least this long after insertion is graded as a separate update (ms). */
export const P9_SEPARATE_MS = 50;
/** DR-0037: Chrome's serialisation windows after and before load (ms). */
export const WINDOW_AFTER_LOAD_MS = 150;
export const WINDOW_BEFORE_LOAD_MS = 350;

/**
 * Grades a live region's insertion-to-content delay. `delayMs` is null when
 * the region was inserted already populated (`populated` true) or never
 * filled. Polite regions filled after load use P9's observed boundary: the
 * same task (populated) or one rAF is the same frame; 50 ms or more is a
 * separate update; anything between routes to REVIEW. `fillInRaf` says whether
 * the fill was made in a requestAnimationFrame callback (timeline version 2);
 * when it is unknown (version 1 records, as in the G2 runs) a fill within one
 * frame counts as the same frame, as pre-registered in DR-0053. Other roles,
 * and any region before load, keep DR-0037's windows until tested.
 */
export function gradeDelay(delayMs: number | null, options: { populated: boolean; politeAfterLoad: boolean; loaded: boolean; fillInRaf?: boolean | null }): DelayGrade {
  if (options.populated) return "populated-insertion";
  if (delayMs === null) return "never-filled";
  if (options.politeAfterLoad) {
    const sameFrameFill = options.fillInRaf === undefined || options.fillInRaf === null ? delayMs <= SAME_FRAME_MS : options.fillInRaf && delayMs <= SAME_FRAME_MS;
    if (sameFrameFill) return "populated-insertion";
    if (delayMs >= P9_SEPARATE_MS) return "separate-update";
    return "review";
  }
  return delayMs <= (options.loaded ? WINDOW_AFTER_LOAD_MS : WINDOW_BEFORE_LOAD_MS) ? "possibly-indistinguishable" : "separate-update";
}

interface Window_ {
  activationT: number;
  endT: number;
}

function inWindow(t: number, w: Window_): boolean {
  return t >= w.activationT && t <= w.endT;
}

function relMs(t: number, w: Window_): number {
  return Math.round(((t - w.activationT) / 1e6) * 10) / 10;
}

function platform(name: string, required: boolean, events: readonly SignatureEvent[], w: Window_, types: readonly string[], identity: Identity): B2Component {
  const matches = events
    .filter((e) => inWindow(e.t, w) && types.includes(e.event) && !isBrowserUi(e))
    .map((e) => ({ e, via: identityVia(e, identity) }))
    .filter((m): m is { e: SignatureEvent; via: string } => m.via !== null)
    .sort((a, b) => a.e.t - b.e.t);
  const first = matches[0];
  return { name, channel: "platform", required, found: first !== undefined, count: matches.length, ...(first === undefined ? {} : { atMs: relMs(first.e.t, w), via: first.via }) };
}

function dom(name: string, required: boolean, timeline: readonly MappedTimelineEntry[], w: Window_, predicate: (entry: MappedTimelineEntry) => boolean): B2Component {
  const matches = timeline.filter((entry) => inWindow(entry.tQpc, w) && predicate(entry)).sort((a, b) => a.tQpc - b.tQpc);
  const first = matches[0];
  return { name, channel: "dom", required, found: first !== undefined, count: matches.length, ...(first === undefined ? {} : { atMs: relMs(first.tQpc, w) }) };
}

const K1_REGION: Identity = { ids: ["live"] };
const K2_ALERT: Identity = { ids: ["alert"], ariaRoles: ["alert"], roles: ["alert"] };
const K3_BUTTON: Identity = { ids: ["target"], names: ["K3 target button"] };
const K4_DIALOG: Identity = { ids: ["dialog"], names: ["K4 settings dialog"], ariaRoles: ["dialog"], roles: ["dialog"] };
const K4_FIRST: Identity = { ids: ["dialog-first"], names: ["First control"] };
const K5_HEADING: Identity = { ids: ["route-heading"], names: ["K5 route heading"] };

/** The B2 signature components of each gating canary (HANDOFF §9.1). */
export function gatingComponents(canary: string, events: readonly SignatureEvent[], timeline: readonly MappedTimelineEntry[], w: Window_): B2Component[] {
  switch (canary) {
    case "K1":
      // Text mutation inside the live region; live-region or text events.
      return [
        dom("dom-text-in-region", true, timeline, w, (e) => changedRegion(e) === "div#live"),
        platform("live-region-or-text-event", true, events, w, [LIVE_REGION_CHANGED, ...TEXT_EVENTS], K1_REGION),
      ];
    case "K2":
      // EVENT_OBJECT_LIVEREGIONCHANGED plus IA2 TEXT_INSERTED on the alert (not EVENT_SYSTEM_ALERT).
      return [
        platform("live-region-changed", true, events, w, [LIVE_REGION_CHANGED], K2_ALERT),
        platform("text-inserted", true, events, w, ["IA2_EVENT_TEXT_INSERTED"], K2_ALERT),
        platform("system-alert", false, events, w, ["EVENT_SYSTEM_ALERT"], K2_ALERT),
        dom("dom-text-in-region", false, timeline, w, (e) => changedRegion(e) === "div#alert[alert]"),
      ];
    case "K3":
      // focusin; focus WinEvent.
      return [dom("dom-focusin", true, timeline, w, (e) => e.kind === "focusin" && e.target === "button#target"), platform("focus", true, events, w, [FOCUS], K3_BUTTON)];
    case "K4":
      // Dialog inserted or shown (in the DOM and as EVENT_OBJECT_SHOW on the dialog); focus events.
      return [
        dom("dom-dialog-shown", true, timeline, w, (e) => (e.kind === "attr" && e.detail === "hidden" && e.target === "div#dialog[dialog]") || (e.kind === "insert" && e.target === "div#dialog[dialog]")),
        platform("dialog-shown", true, events, w, ["EVENT_OBJECT_SHOW"], K4_DIALOG),
        dom("dom-focusin", true, timeline, w, (e) => e.kind === "focusin" && e.target === "button#dialog-first"),
        platform("focus", true, events, w, [FOCUS], K4_FIRST),
      ];
    case "K5":
      // History event; focus events. No title dependency.
      return [
        dom("dom-history", true, timeline, w, (e) => e.kind === "history" && e.detail === "pushState"),
        dom("dom-focusin", true, timeline, w, (e) => e.kind === "focusin" && e.target === "h1#route-heading"),
        platform("focus", true, events, w, [FOCUS], K5_HEADING),
      ];
    default:
      throw new Error(`${canary} is not a gating canary`);
  }
}

export function evaluateGatingB2(canary: string, events: readonly SignatureEvent[], timeline: readonly MappedTimelineEntry[], w: Window_): B2GatingOutcome {
  const components = gatingComponents(canary, events, timeline, w);
  return { kind: "b2-gating", verdict: components.every((c) => !c.required || c.found) ? "PASS" : "FAIL", components };
}

export interface RegionTrace {
  /** DOM descriptor of the region, e.g. "div#region[status]". */
  target: string | null;
  /** The region already had text when its insertion was recorded. */
  populated: boolean;
  /** Insertion-to-content delay in page ms; null if populated or never filled. */
  delayMs: number | null;
  /** Whether the fill was made in a rAF callback; null when unknown (timeline version 1) or not filled. */
  fillInRaf: boolean | null;
  grade: DelayGrade;
  /** Platform events attributed to the region: name and ms after the DOM insertion. */
  platform: { event: string; atMs: number; via: string }[];
  /** A live-region or text event attributed to the region, after its insertion. */
  separateUpdate: boolean;
}

export interface B2RecordOutcome {
  kind: "b2-record";
  region?: RegionTrace;
  /**
   * K7: whether the polite update precedes the focus move. In the DOM the
   * canary sets the text before calling focus() in one task, so that order is
   * fixed by construction; on the platform it is read per event type.
   */
  order?: { domTextBeforeFocus: boolean | null; platformTextBeforeFocus: boolean | null; platformLiveRegionBeforeFocus: boolean | null };
}

/** Options for record-only evaluation. */
export interface RecordOptions {
  /** The attempt's timeline format; version 2 records rAF fills and live-region roots. */
  timelineVersion?: number;
}

function regionTrace(spec: CanarySpec, events: readonly SignatureEvent[], timeline: readonly MappedTimelineEntry[], w: Window_, options: RecordOptions): RegionTrace {
  const insert = timeline.filter((e) => inWindow(e.tQpc, w) && e.kind === "insert" && e.target.startsWith("div#region")).sort((a, b) => a.tQpc - b.tQpc)[0];
  const target = insert?.target ?? null;
  const populated = insert?.liveWithContent === true;
  const fill = insert === undefined || populated ? undefined : timeline.filter((e) => e.tQpc >= insert.tQpc && e !== insert && changedRegion(e) === target).sort((a, b) => a.tQpc - b.tQpc)[0];
  const delayMs = fill === undefined || insert === undefined ? null : Math.round((fill.t - insert.t) * 100) / 100;
  const fillInRaf = fill === undefined || (options.timelineVersion ?? 1) < 2 ? null : fill.inRaf === true;
  const role = spec.canary === "K6a" ? spec.variant : spec.canary === "K6b" ? "alert" : "polite";
  const identity: Identity = { ids: ["region"], ...(role === "alert" || role === "status" ? { ariaRoles: [role], roles: [role] } : {}) };
  const from = insert?.tQpc ?? w.activationT;
  const attributed = events
    .filter((e) => inWindow(e.t, w) && !isBrowserUi(e))
    .map((e) => ({ e, via: identityVia(e, identity) }))
    .filter((m): m is { e: SignatureEvent; via: string } => m.via !== null)
    .sort((a, b) => a.e.t - b.e.t);
  return {
    target,
    populated,
    delayMs,
    fillInRaf,
    // Canary regions are inserted after load; only polite regions take P9's boundary.
    grade: insert === undefined ? "never-filled" : gradeDelay(delayMs, { populated, politeAfterLoad: role === "polite", loaded: true, fillInRaf }),
    platform: attributed.map((m) => ({ event: m.e.event, atMs: Math.round(((m.e.t - from) / 1e6) * 10) / 10, via: m.via })),
    separateUpdate: attributed.some((m) => m.e.t >= from && (m.e.event === LIVE_REGION_CHANGED || TEXT_EVENTS.includes(m.e.event))),
  };
}

function firstT<T>(items: readonly T[], t: (item: T) => number): number | null {
  const times = items.map(t).sort((a, b) => a - b);
  return times[0] ?? null;
}

function firstIndex<T>(items: readonly T[], predicate: (item: T) => boolean): number | null {
  const index = items.findIndex(predicate);
  return index < 0 ? null : index;
}

function before(a: number | null, b: number | null): boolean | null {
  return a === null || b === null ? null : a < b;
}

export function evaluateRecordB2(spec: CanarySpec, events: readonly SignatureEvent[], timeline: readonly MappedTimelineEntry[], w: Window_, options: RecordOptions = {}): B2RecordOutcome {
  if (spec.canary === "K6a" || spec.canary === "K6b" || spec.canary === "K6e") return { kind: "b2-record", region: regionTrace(spec, events, timeline, w, options) };
  if (spec.canary === "K7a" || spec.canary === "K7b") {
    const focusTarget = spec.canary === "K7a" ? "button#target" : "input#field";
    const focusIdentity: Identity = spec.canary === "K7a" ? { ids: ["target"], names: ["K7a target button"] } : { ids: ["field"], names: ["K7b text field"] };
    // DOM order by position: the timeline keeps causal order (takeRecords before
    // focusin), while records flushed together share one time.
    const domText = firstIndex(timeline, (e) => inWindow(e.tQpc, w) && changedRegion(e) === "div#live");
    const domFocus = firstIndex(timeline, (e) => inWindow(e.tQpc, w) && e.kind === "focusin" && e.target === focusTarget);
    const inW = events.filter((e) => inWindow(e.t, w) && !isBrowserUi(e));
    const platformText = firstT(inW.filter((e) => TEXT_EVENTS.includes(e.event) && identityVia(e, K1_REGION) !== null), (e) => e.t);
    const platformLive = firstT(inW.filter((e) => e.event === LIVE_REGION_CHANGED && identityVia(e, K1_REGION) !== null), (e) => e.t);
    const platformFocus = firstT(inW.filter((e) => e.event === FOCUS && identityVia(e, focusIdentity) !== null), (e) => e.t);
    return {
      kind: "b2-record",
      order: { domTextBeforeFocus: before(domText, domFocus), platformTextBeforeFocus: before(platformText, platformFocus), platformLiveRegionBeforeFocus: before(platformLive, platformFocus) },
    };
  }
  throw new Error(`${spec.canary} is not a record-only canary`);
}

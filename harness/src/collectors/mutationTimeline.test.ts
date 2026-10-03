import vm, { Script } from "node:vm";

import { describe, expect, test } from "vitest";

import { changedRegion, insertionToContentMs, TIMELINE_DRAIN_SCRIPT, TIMELINE_INIT_SCRIPT } from "./mutationTimeline.ts";
import type { TimelineEntry } from "./mutationTimeline.ts";

describe("timeline scripts", () => {
  test("are syntactically valid classic scripts", () => {
    expect(() => new Script(TIMELINE_INIT_SCRIPT)).not.toThrow();
    expect(() => new Script(TIMELINE_DRAIN_SCRIPT)).not.toThrow();
  });
  test("read performance.now() only, never the wall clock (D1)", () => {
    expect(TIMELINE_INIT_SCRIPT).not.toMatch(/Date\.now|new Date|timeOrigin/);
  });
});

describe("insertionToContentMs (DR-0037)", () => {
  test("measures from insertion of an empty region to its first text change", () => {
    const entries: TimelineEntry[] = [
      { t: 100, kind: "insert", target: "div#region", liveWithContent: false, inLive: false },
      { t: 150, kind: "text", target: "div#region", inLive: true },
    ];
    expect(insertionToContentMs(entries, "div#region")).toBe(50);
  });
  test("is null for a region inserted already populated", () => {
    expect(insertionToContentMs([{ t: 100, kind: "insert", target: "div#region", liveWithContent: true }], "div#region")).toBeNull();
  });
  test("is null when the region is never filled", () => {
    expect(insertionToContentMs([{ t: 100, kind: "insert", target: "div#region", liveWithContent: false }], "div#region")).toBeNull();
  });
});

describe("changedRegion", () => {
  test("is the target of a text change and the parent of an insertion inside a live region", () => {
    expect(changedRegion({ t: 0, kind: "text", target: "div#live", inLive: true })).toBe("div#live");
    expect(changedRegion({ t: 0, kind: "insert", target: "#text", parent: "div#live", inLive: true })).toBe("div#live");
    expect(changedRegion({ t: 0, kind: "insert", target: "div#region", parent: "div#stage", inLive: false })).toBeNull();
    expect(changedRegion({ t: 0, kind: "focusin", target: "button#target" })).toBeNull();
  });
});

/** A minimal fake DOM, enough to run the init script in a vm context. */
function fakePage() {
  const handlers: Record<string, ((e: unknown) => void)[]> = {};
  let pending: unknown[] = [];
  let clock = 0;
  const el = (tag: string, attrs: Record<string, string> = {}, parent: unknown = null) => ({
    nodeType: 1,
    nodeName: tag.toUpperCase(),
    tagName: tag.toUpperCase(),
    id: attrs.id ?? "",
    parentElement: parent,
    textContent: "",
    hasAttribute: (n: string) => n in attrs,
    getAttribute: (n: string) => attrs[n] ?? null,
    querySelectorAll: () => [],
  });
  const context: Record<string, unknown> = {
    performance: { now: () => ++clock },
    MutationObserver: class {
      observe(): void {}
      takeRecords(): unknown[] {
        const out = pending;
        pending = [];
        return out;
      }
    },
    Element: { prototype: { attachShadow: () => ({}) } },
    history: { pushState: () => undefined, replaceState: () => undefined },
    document: {},
    addEventListener: (type: string, fn: (e: unknown) => void) => {
      (handlers[type] ??= []).push(fn);
    },
    requestAnimationFrame: (fn: (t: number) => void) => {
      fn(16);
      return 1;
    },
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(TIMELINE_INIT_SCRIPT, context);
  return {
    el,
    out: () => context.__a11yTimeline as TimelineEntry[],
    fire: (type: string, e: unknown) => {
      for (const fn of handlers[type] ?? []) fn(e);
    },
    queue: (record: unknown) => pending.push(record),
    raf: (fn: () => void) => (context.window as { requestAnimationFrame: (f: () => void) => number }).requestAnimationFrame(fn),
  };
}

describe("init script (version 3)", () => {
  test("names the focused element inside an open shadow root, with its host", () => {
    const page = fakePage();
    const host = page.el("my-dialog", { id: "dlg" });
    const inner = page.el("button", { id: "confirm" });
    page.fire("focusin", { target: host, composedPath: () => [inner, host] });
    page.fire("focusin", { target: inner, composedPath: () => [inner] });
    expect(page.out()).toMatchObject([
      { kind: "focusin", target: "button#confirm", host: "my-dialog#dlg" },
      { kind: "focusin", target: "button#confirm" },
    ]);
    expect(page.out()[1]).not.toHaveProperty("host");
  });
  test("tags records flushed at the end of a rAF callback and records the live root", () => {
    const page = fakePage();
    const region = page.el("div", { id: "region", "aria-live": "polite" });
    const text = { nodeType: 3, nodeName: "#text", parentElement: region };
    page.raf(() => page.queue({ type: "childList", target: region, addedNodes: [text], removedNodes: [] }));
    expect(page.out()).toMatchObject([{ kind: "insert", target: "#text", parent: "div#region", liveRoot: "div#region", inLive: true, inRaf: true }]);
  });
});

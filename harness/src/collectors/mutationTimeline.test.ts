import { Script } from "node:vm";

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

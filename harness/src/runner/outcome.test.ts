import { describe, expect, test } from "vitest";

import type { TapEvent } from "../adapters/relayTap.ts";
import { buildPlan, GATING_SPECS, mulberry32, RECORD_ONLY_SPECS, shardOf, specByItemId } from "./canaries.ts";
import type { CanarySpec } from "./canaries.ts";
import { evaluateAttempt, normaliseSpeech } from "./outcome.ts";

const T0 = 1_000_000_000;
const ms = (n: number): number => T0 + n * 1e6;
const speak = (atMs: number, text: string, priority: "NORMAL" | "NEXT" | "NOW" | null = "NORMAL"): TapEvent => ({ kind: "speak", t: ms(atMs), text, priority, commands: [] });
const cancel = (atMs: number): TapEvent => ({ kind: "cancel", t: ms(atMs) });

function gating(id: string): CanarySpec {
  const s = specByItemId(id);
  if (s === undefined) throw new Error(id);
  return s;
}

describe("gating canaries", () => {
  test("K1 passes when the update is queued within 3 s of insertion", () => {
    const outcome = evaluateAttempt(gating("K1"), [cancel(5), speak(620, "K1 polite update arrived")], T0);
    expect(outcome).toMatchObject({ kind: "gating", verdict: "PASS", late: false });
  });
  test("K1 fails when the update arrives after the deadline, and says it was late", () => {
    expect(evaluateAttempt(gating("K1"), [speak(3600, "K1 polite update arrived")], T0)).toMatchObject({ verdict: "FAIL", late: true });
  });
  test("K1 fails when nothing matching is queued", () => {
    expect(evaluateAttempt(gating("K1"), [speak(600, "Start canary button")], T0)).toMatchObject({ verdict: "FAIL", matched: null, late: false });
  });
  test("K3 needs the name followed by the role", () => {
    expect(evaluateAttempt(gating("K3"), [speak(600, "K3 target button  button")], T0)).toMatchObject({ verdict: "PASS" });
    expect(evaluateAttempt(gating("K3"), [speak(600, "K3 target button")], T0)).toMatchObject({ verdict: "FAIL" });
  });
  test("K4 and K5 match their names", () => {
    expect(evaluateAttempt(gating("K4"), [speak(700, "K4 settings dialog  dialog  First control  button")], T0)).toMatchObject({ verdict: "PASS" });
    expect(evaluateAttempt(gating("K5"), [speak(700, "K5 route heading  heading  level 1")], T0)).toMatchObject({ verdict: "PASS" });
  });
  test("speech before activation never counts", () => {
    expect(evaluateAttempt(gating("K2"), [speak(-50, "K2 alert update arrived")], T0)).toMatchObject({ verdict: "FAIL" });
  });
});

describe("record-only canaries", () => {
  test("K6b records announcement and priority", () => {
    const k6b = RECORD_ONLY_SPECS.find((r) => r.spec.canary === "K6b")?.spec;
    if (k6b === undefined) throw new Error("K6b");
    expect(evaluateAttempt(k6b, [speak(560, "K6b alert inserted populated", "NOW")], T0)).toMatchObject({ kind: "record", announced: true, priority: "NOW" });
  });
  test("K7a records polite-before-focus and excludes the activation key's cancel", () => {
    const k7a = specByItemId("K7a");
    if (k7a === undefined) throw new Error("K7a");
    const outcome = evaluateAttempt(k7a, [cancel(2), speak(560, "K7a polite update"), speak(600, "K7a target button  button")], T0);
    expect(outcome).toMatchObject({ announced: true, cancelsAfterUpdate: 0, politeBeforeFocus: true, focusSpeech: "K7a target button  button" });
  });
  test("K7b records a cancel after the update", () => {
    const k7b = specByItemId("K7b");
    if (k7b === undefined) throw new Error("K7b");
    expect(evaluateAttempt(k7b, [cancel(1), cancel(540), speak(560, "K7b text field  edit")], T0)).toMatchObject({ announced: false, cancelsAfterUpdate: 1 });
  });
});

describe("plans", () => {
  test("G1-sized plan: 50 runs per gating canary plus the D4 record-only counts", () => {
    const plan = buildPlan({ gatingRuns: 50, recordOnly: true, seed: 7 });
    const count = (id: string): number => plan.filter((a) => a.spec.itemId === id).length;
    expect(GATING_SPECS.map((s) => count(s.itemId))).toEqual([50, 50, 50, 50, 50]);
    expect(count("K6a:polite") + count("K6a:status") + count("K6a:assertive")).toBe(60);
    expect(plan.filter((a) => a.spec.canary === "K6e").length).toBe(70);
    expect(plan.length).toBe(250 + 190);
  });
  test("the order is reproducible from the seed and shards partition the plan", () => {
    const a = buildPlan({ gatingRuns: 3, recordOnly: false, seed: 42 });
    const b = buildPlan({ gatingRuns: 3, recordOnly: false, seed: 42 });
    expect(a.map((x) => x.spec.itemId)).toEqual(b.map((x) => x.spec.itemId));
    const shards = [1, 2, 3].map((s) => shardOf(a, s, 3));
    expect(shards.flat().map((x) => x.index).sort((x, y) => x - y)).toEqual(a.map((x) => x.index));
    expect(() => shardOf(a, 0, 3)).toThrow(RangeError);
  });
  test("only restricts by canary or item id", () => {
    expect(new Set(buildPlan({ gatingRuns: 2, recordOnly: true, only: ["K1", "K6a:status"], seed: 1 }).map((a) => a.spec.itemId))).toEqual(new Set(["K1", "K6a:status"]));
  });
  test("mulberry32 is deterministic", () => {
    const r = mulberry32(5);
    const s = mulberry32(5);
    expect([r(), r()]).toEqual([s(), s()]);
  });
  test("normaliseSpeech lower-cases and collapses whitespace", () => {
    expect(normaliseSpeech("  K1   Polite\tUpdate ")).toBe("k1 polite update");
  });
});

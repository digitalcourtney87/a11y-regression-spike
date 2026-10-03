import { describe, expect, test } from "vitest";

import { completed, renderReport, summariseBlock } from "./m4Report.ts";
import type { Block, BlockAttempt } from "./m4Report.ts";

const attempt = (side: BlockAttempt["side"], outcomes: BlockAttempt["steps"][number]["outcome"][], extra: Partial<BlockAttempt> = {}): BlockAttempt => ({
  side,
  reasons: [],
  steps: outcomes.map((o, i) => ({ stepId: `s${String(i + 1)}`, kind: "at", outcome: o })),
  ...extra,
});

describe("M4 report", () => {
  test("a journey completes only when every AT step was reached and none was left unrun", () => {
    expect(completed(attempt("base", ["REACHED", "PATH_CHANGED"]))).toBe(true);
    expect(completed(attempt("base", ["REACHED", "UNREACHABLE"], { notRun: ["s3"] }))).toBe(false);
    expect(completed(attempt("base", ["ENV_FAILURE"]))).toBe(false);
    expect(completed(attempt("base", ["REACHED"], { error: "boom" }))).toBe(false);
    expect(completed({ side: "base", reasons: ["ENV_FAILURE"], steps: [] })).toBe(false);
  });
  test("summarises a block per side and renders it", () => {
    const block: Block = {
      item: { id: "x", expected: { kind: "regression", symptom: "NAV_TARGET_UNREACHABLE" } },
      journeyId: "j",
      leg: "nvda-absent",
      n: 2,
      pre: { ok: true },
      post: { ok: false },
      validity: { result: "VALID", inconclusive: [], candidateFindings: ["CLOCK_RAF_GAP"] },
      attempts: [attempt("base", ["REACHED", "REACHED"]), attempt("candidate", ["REACHED", "UNREACHABLE"], { b2Evidence: "missing" }), attempt("candidate", ["REACHED", "UNREACHABLE"]), attempt("base", ["REACHED", "PATH_CHANGED"], { pageErrors: ["e"] })],
      packageErrors: [null, ["no evidence package: the attempt failed before its preflight"], ["steps.0: bad"], null],
    };
    const s = summariseBlock(block);
    expect(s).toMatchObject({ itemId: "x", expected: "regression:NAV_TARGET_UNREACHABLE", pre: true, post: false, pageErrors: 1, invalidPackages: 2 });
    expect(s.base).toEqual({ attempts: 2, completed: 2, b2Missing: 0, steps: { s1: { REACHED: 2 }, s2: { REACHED: 1, PATH_CHANGED: 1 } } });
    expect(s.candidate.b2Missing).toBe(1);
    expect(s.candidate.completed).toBe(0);
    const md = renderReport([s]);
    expect(md).toMatch(/\| x \| regression:NAV_TARGET_UNREACHABLE \| 2 \| pre ok, post FAIL \| VALID \(findings: CLOCK_RAF_GAP\) \| 2\/2 \| 0\/2 \| 1 \| 2 \|/);
    expect(md).toMatch(/s2: R1 P1 \/ U2/);
  });
});

import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { at, attempt, axTree, block, item, journey, steps } from "../oracles/testkit.ts";
import { scoreRuns } from "./scoreRuns.ts";

describe("scoreRuns", () => {
  let root: string;
  const out: string[] = [];
  const err: string[] = [];
  const io = { out: (l: string) => out.push(l), err: (l: string) => err.push(l) };

  beforeEach(() => {
    out.length = 0;
    err.length = 0;
    root = mkdtempSync(join(tmpdir(), "score-runs-"));
    const j = journey([at("reach", "TAB", [{ type: "focusOn", value: "button|Save" }], { until: { role: "button", maxAttempts: 3 } })]);
    mkdirSync(join(root, "journeys"));
    writeFileSync(join(root, "journeys/j.json"), JSON.stringify(j));
    mkdirSync(join(root, "corpus/items"), { recursive: true });
    const a = { ...item("regression"), id: "a", patternId: "pa" };
    const b = { ...item("benign"), id: "b", patternId: "pa" };
    const t = { ...item("regression"), id: "t", patternId: "pt", split: "test" as const };
    for (const it of [a, b, t]) writeFileSync(join(root, `corpus/items/${it.id}.json`), JSON.stringify(it));
    writeFileSync(join(root, "corpus/split.json"), JSON.stringify({ method: "x", batches: [], assignments: { pa: "dev", pt: "test" } }));
    writeFileSync(join(root, "corpus/patterns.json"), JSON.stringify({ patterns: [{ id: "pt", stratum: "regression:NAME_NOT_CONVEYED", status: "planned" }] }));
    // A block for item "a" only, in one leg; "b" (dev) is missing, "t" (test) is another split's and must be ignored.
    const tree = (name: string) => axTree({ role: "RootWebArea", kids: [{ role: "button", name, props: { focused: true } }] });
    const blk = block(a, "nvda-absent", 3, (side) => attempt(side, steps(j, { reach: { tree: tree(side === "base" ? "Save" : "") } })));
    mkdirSync(join(root, "run/x/blocks"), { recursive: true });
    writeFileSync(join(root, "run/x/blocks/a.json.gz"), gzipSync(JSON.stringify(blk)));
    const other = block(t, "nvda-absent", 3, (side) => attempt(side, steps(j, {})));
    writeFileSync(join(root, "run/x/blocks/t.json.gz"), gzipSync(JSON.stringify({ ...other, journeyId: "absent-journey", item: { ...t, journeyId: "absent-journey" } })));
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  test("refuses when an item of the split has no block, and ignores other splits' blocks", () => {
    expect(scoreRuns({ split: "dev", runs: [join(root, "run")] }, io, root)).toBe(2);
    expect(err.join("\n")).toMatch(/1 dev-split item\(s\) have no block: b/);
  });

  test("with --allow-missing, scores the missing item INCONCLUSIVE and says so in the report", () => {
    const report = join(root, "r.md");
    expect(scoreRuns({ split: "dev", runs: [join(root, "run")], allowMissing: true, out: report, json: join(root, "r.json") }, io, root)).toBe(0);
    const text = readFileSync(report, "utf8");
    expect(text).toMatch(/Incomplete evidence:\*\* 1 item\(s\) .* b\./);
    const json = JSON.parse(readFileSync(join(root, "r.json"), "utf8")) as { scores: { itemId: string; arms: { B: { verdict: string } } }[] };
    expect(json.scores.find((s) => s.itemId === "b")?.arms.B.verdict).toBe("INCONCLUSIVE");
  });
});

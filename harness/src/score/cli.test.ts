import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { EXIT_NOT_IMPLEMENTED, EXIT_REFUSED, EXIT_USAGE, REPO_ROOT, runScoreCli } from "./cli.ts";
import type { FreezeGuardDeps } from "./freezeGuard.ts";

const H = "c".repeat(64);

function capture(): { io: { out(l: string): void; err(l: string): void }; out: string[]; err: string[] } {
  const out: string[] = [];
  const err: string[] = [];
  return { io: { out: (l) => out.push(l), err: (l) => err.push(l) }, out, err };
}

const frozen: FreezeGuardDeps = {
  listFreezeTags: () => ["protocol-freeze-v1"],
  readTagMessage: () => `protocol-sha256: ${H}`,
  computeHash: () => H,
};
const unfrozen: FreezeGuardDeps = { ...frozen, listFreezeTags: () => [] };

describe("runScoreCli", () => {
  test.each([
    ["missing split", []],
    ["unknown split", ["--split", "holdout"]],
    ["unknown option", ["--split", "dev", "--force"]],
    ["positional argument", ["dev"]],
    ["empty split", ["--split="]],
  ])("%s exits 2", (_label, argv) => {
    const c = capture();
    expect(runScoreCli(argv, frozen, c.io)).toBe(EXIT_USAGE);
    expect(c.err.join("\n")).toMatch(/usage/);
  });

  test("dev is allowed and reports the scorer is not implemented (exit 3)", () => {
    const c = capture();
    expect(runScoreCli(["--split", "dev"], unfrozen, c.io)).toBe(EXIT_NOT_IMPLEMENTED);
    expect(c.out).toEqual(["Scorer not implemented until M5."]);
  });

  test("test without a matching freeze tag is refused (exit 1)", () => {
    const c = capture();
    expect(runScoreCli(["--split=test"], unfrozen, c.io)).toBe(EXIT_REFUSED);
    expect(c.err.join("\n")).toMatch(/Refusing to score the test split/);
    expect(c.out).toEqual([]);
  });

  test("test with a matching freeze tag reaches the stub (exit 3)", () => {
    const c = capture();
    expect(runScoreCli(["--split", "test"], frozen, c.io)).toBe(EXIT_NOT_IMPLEMENTED);
  });
});

describe("score CLI process", () => {
  const cli = resolve(REPO_ROOT, "harness/src/score/cli.ts");

  function run(args: string[]): ReturnType<typeof spawnSync> {
    return spawnSync(process.execPath, [cli, ...args], { cwd: REPO_ROOT, encoding: "utf8", timeout: 30_000 });
  }

  test("refuses the test split in this repository (no freeze tag yet)", () => {
    const result = run(["--split", "test"]);
    expect(result.error).toBeUndefined();
    expect(result.status).not.toBe(0);
    expect(result.status).not.toBeNull();
  });

  test("exits 2 without a split", () => {
    expect(run([]).status).toBe(EXIT_USAGE);
  });
});

import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { EXIT_REFUSED, EXIT_USAGE, REPO_ROOT, runScoreCli } from "./cli.ts";
import type { FreezeGuardDeps } from "./freezeGuard.ts";
import { computeProtocolHash } from "./protocolHash.ts";

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

  test("dev is allowed without a freeze, but needs runs (exit 2)", () => {
    const c = capture();
    expect(runScoreCli(["--split", "dev"], unfrozen, c.io)).toBe(EXIT_USAGE);
    expect(c.err.join("\n")).toMatch(/missing --runs/);
  });

  test("--allow-missing is passed through", () => {
    const c = capture();
    expect(runScoreCli(["--split", "dev", "--runs", "a", "--allow-missing"], unfrozen, c.io)).toEqual({ split: "dev", runs: ["a"], allowMissing: true });
  });

  test("dev with runs returns the scoring request", () => {
    const c = capture();
    expect(runScoreCli(["--split", "dev", "--runs", "artefacts/1, artefacts/2", "--out", "r.md"], unfrozen, c.io)).toEqual({ split: "dev", runs: ["artefacts/1", "artefacts/2"], out: "r.md" });
    expect(c.err).toEqual([]);
  });

  test("test without a matching freeze tag is refused (exit 1)", () => {
    const c = capture();
    expect(runScoreCli(["--split=test"], unfrozen, c.io)).toBe(EXIT_REFUSED);
    expect(c.err.join("\n")).toMatch(/Refusing to score the test split/);
    expect(c.out).toEqual([]);
  });

  test("test with a matching freeze tag passes the guard and returns the request", () => {
    const c = capture();
    expect(runScoreCli(["--split", "test", "--runs", "artefacts/9"], frozen, c.io)).toEqual({ split: "test", runs: ["artefacts/9"] });
  });

  test("test without runs is refused before runs are checked when unfrozen (exit 1)", () => {
    const c = capture();
    expect(runScoreCli(["--split", "test"], unfrozen, c.io)).toBe(EXIT_REFUSED);
  });
});

const CLI = "harness/src/score/cli.ts";

/**
 * The repository files the scorer CLI loads: `cli.ts` and its relative
 * imports, followed transitively. The process tests copy them into a
 * temporary repository, so the copy locates that repository as its root
 * (REPO_ROOT is resolved from the file, not the working directory).
 */
function scorerFiles(): string[] {
  const seen = new Set<string>();
  const pending = [CLI];
  for (let rel = pending.pop(); rel !== undefined; rel = pending.pop()) {
    if (seen.has(rel)) continue;
    seen.add(rel);
    const text = readFileSync(join(REPO_ROOT, rel), "utf8");
    for (const [, specifier = ""] of text.matchAll(/^(?:import|export)\b[^;]*?\bfrom\s+"([^"]+)";?$/gm)) {
      if (specifier.startsWith("node:")) continue;
      if (!specifier.startsWith(".")) {
        throw new Error(`${rel} imports the package "${specifier}"; the score CLI process tests copy only the scorer's own files`);
      }
      pending.push(posix.join(posix.dirname(rel), specifier));
    }
  }
  return [...seen].sort();
}

/**
 * The scorer as a process, run in a temporary git repository holding a copy of
 * the scorer and a committed frozen-paths list. No test spawns the scorer
 * against this repository, so none computes this repository's frozen hash.
 */
describe("score CLI process", () => {
  let base: string;
  let repo: string;
  let env: NodeJS.ProcessEnv;

  function git(args: string[]): string {
    return execFileSync("git", ["-c", "tag.gpgSign=false", "-c", "commit.gpgSign=false", ...args], {
      cwd: repo,
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  }

  function put(rel: string, content: string): void {
    mkdirSync(dirname(join(repo, rel)), { recursive: true });
    writeFileSync(join(repo, rel), content);
  }

  function commitAll(message: string): void {
    git(["add", "-A"]);
    git(["commit", "-q", "-m", message]);
  }

  function run(args: string[]): ReturnType<typeof spawnSync> {
    return spawnSync(process.execPath, [join(repo, CLI), ...args], { cwd: repo, env, encoding: "utf8", timeout: 30_000 });
  }

  beforeEach(() => {
    base = mkdtempSync(join(tmpdir(), "score-cli-"));
    repo = join(base, "repo");
    mkdirSync(repo);
    const emptyConfig = join(base, "gitconfig");
    writeFileSync(emptyConfig, "");
    env = {
      ...process.env,
      GIT_CONFIG_GLOBAL: emptyConfig,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_AUTHOR_NAME: "Score Test",
      GIT_AUTHOR_EMAIL: "score@example.invalid",
      GIT_COMMITTER_NAME: "Score Test",
      GIT_COMMITTER_EMAIL: "score@example.invalid",
    };
    delete env.GIT_DIR;
    delete env.GIT_WORK_TREE;
    delete env.GIT_INDEX_FILE;
    git(["init", "-q"]);
    for (const rel of scorerFiles()) put(rel, readFileSync(join(REPO_ROOT, rel), "utf8"));
    put("package.json", '{ "type": "module" }\n');
    put("protocol/frozen-paths.txt", "protocol/\nharness/src/\n");
    commitAll("frozen set");
  });

  afterEach(() => {
    rmSync(base, { recursive: true, force: true });
  });

  test("copies the scorer and its relative imports", () => {
    expect(scorerFiles()).toEqual(expect.arrayContaining([CLI, "harness/src/score/freezeGuard.ts", "harness/src/score/protocolHash.ts"]));
  });

  test("refuses the test split when no freeze tag exists (exit 1)", () => {
    expect(git(["tag", "--list"])).toBe("");
    const result = run(["--split", "test"]);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(EXIT_REFUSED);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/^Refusing to score the test split: no protocol freeze tag \(protocol-freeze-v<N>\) exists/);
  });

  test("allows the dev split without a freeze and asks for runs (exit 2)", () => {
    const result = run(["--split", "dev"]);
    expect(result.status).toBe(EXIT_USAGE);
    expect(result.stderr).toMatch(/^missing --runs/);
  });

  test("passes the guard for the test split once a freeze tag records the frozen set's hash (asks for runs, exit 2), and refuses after a later frozen-set commit (exit 1)", () => {
    git(["tag", "-a", "protocol-freeze-v1", "-m", `Protocol freeze 1\n\nprotocol-sha256: ${computeProtocolHash(repo)}`]);
    const allowed = run(["--split", "test"]);
    expect(allowed.status).toBe(EXIT_USAGE);
    expect(allowed.stderr).toMatch(/^missing --runs/);

    put("harness/src/oracle.ts", "export const rule = 1;\n");
    commitAll("change the frozen set after the freeze");
    const refused = run(["--split", "test"]);
    expect(refused.status).toBe(EXIT_REFUSED);
    expect(refused.stderr).toMatch(/^Refusing to score the test split: protocol hash [0-9a-f]{64} of the frozen set does not match/);
  });

  test("exits 2 without a split", () => {
    const result = run([]);
    expect(result.status).toBe(EXIT_USAGE);
    expect(result.stderr).toMatch(/usage/);
  });
});

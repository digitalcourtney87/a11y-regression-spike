/**
 * This repository's frozen-paths list, protocol/frozen-paths.txt (DR-0033,
 * additions DR-0045), names every path the owner asked to freeze and only
 * paths that exist.
 *
 * The test reads the list from the working tree and the tracked file names
 * from the index (`git ls-files`). It never computes the frozen hash, which
 * refuses a dirty frozen set, so it stays valid in a dirty working tree.
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { FROZEN_PATHS_FILE, parseFrozenPaths } from "../../src/score/protocolHash.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");

/** Owner minimum (owner review 2026-10-02, DR-0033). */
const OWNER_MINIMUM: readonly string[] = [
  "protocol/",
  "corpus/",
  "journeys/",
  "harness/src/",
  "listener/",
  "env/env.lock.json",
  "package-lock.json",
];

/** Each can change a verdict (Decided by Claude under DR-0045, 2026-10-03). */
const DR_0045_ADDITIONS: readonly string[] = ["fixtures/", "package.json", ".nvmrc", ".github/workflows/"];

function gitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;
  delete env.GIT_INDEX_FILE;
  return env;
}

/** Tracked paths in the index, as repository-relative POSIX paths. */
function trackedPaths(): string[] {
  return execFileSync("git", ["ls-files", "-z"], { cwd: repoRoot, encoding: "utf8", env: gitEnv(), maxBuffer: 64 * 1024 * 1024 })
    .split("\0")
    .filter((path) => path !== "");
}

const entries = parseFrozenPaths(readFileSync(join(repoRoot, FROZEN_PATHS_FILE), "utf8"));
const tracked = trackedPaths();

describe("protocol/frozen-paths.txt", () => {
  test("lists the owner minimum (DR-0033)", () => {
    expect(entries).toEqual(expect.arrayContaining([...OWNER_MINIMUM]));
  });

  test("lists the DR-0045 additions", () => {
    expect(entries).toEqual(expect.arrayContaining([...DR_0045_ADDITIONS]));
  });

  test.each(entries)("%s matches at least one tracked file", (entry) => {
    const matches = entry.endsWith("/") ? tracked.some((path) => path.startsWith(entry)) : tracked.includes(entry);
    expect(matches, `${entry} matches no file in git ls-files`).toBe(true);
  });
});

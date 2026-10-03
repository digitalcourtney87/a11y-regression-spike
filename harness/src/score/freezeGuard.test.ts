import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, test } from "vitest";

import {
  assertSplitAllowed,
  evaluateSplit,
  FreezeGuardRefusal,
  freezeTagNumber,
  gitFreezeDeps,
  latestFreezeTag,
  parseRecordedHash,
  repositoryFreezeDeps,
} from "./freezeGuard.ts";
import type { FreezeGuardDeps } from "./freezeGuard.ts";
import { computeProtocolHash } from "./protocolHash.ts";

const H1 = "a".repeat(64);
const H2 = "b".repeat(64);

function deps(tags: Record<string, string>, hash: string): FreezeGuardDeps {
  return {
    listFreezeTags: () => Object.keys(tags),
    readTagMessage: (tag) => {
      const message = tags[tag];
      if (message === undefined) throw new Error(`no tag ${tag}`);
      return message;
    },
    computeHash: () => hash,
  };
}

function throwing(): never {
  throw new Error("must not be called");
}

describe("freeze tag parsing", () => {
  test("freezeTagNumber accepts protocol-freeze-v<N> only", () => {
    expect(freezeTagNumber("protocol-freeze-v1")).toBe(1);
    expect(freezeTagNumber("protocol-freeze-v0")).toBe(0);
    expect(freezeTagNumber("protocol-freeze-v12")).toBe(12);
    for (const bad of ["protocol-freeze-v", "protocol-freeze-v01", "protocol-freeze-v1-rc", "protocol-freeze-1", "x-protocol-freeze-v1"]) {
      expect(freezeTagNumber(bad), bad).toBeNull();
    }
  });

  test("latestFreezeTag compares N numerically", () => {
    expect(latestFreezeTag(["protocol-freeze-v9", "protocol-freeze-v10", "protocol-freeze-v2"])).toBe("protocol-freeze-v10");
    expect(latestFreezeTag(["v1.0.0", "protocol-freeze-v3-draft"])).toBeNull();
    expect(latestFreezeTag([])).toBeNull();
  });

  test("parseRecordedHash finds exactly one lowercase hash line", () => {
    expect(parseRecordedHash(`Protocol freeze 1\n\nprotocol-sha256: ${H1}\n`)).toBe(H1);
    expect(parseRecordedHash(`protocol-sha256: ${H1}  \r\n`)).toBe(H1);
    expect(parseRecordedHash(`protocol-sha256: ${H1}\nprotocol-sha256: ${H1}\n`)).toBe(H1);
    expect(parseRecordedHash(`protocol-sha256: ${H1}\nprotocol-sha256: ${H2}\n`)).toBeNull();
    expect(parseRecordedHash(`protocol-sha256: ${H1.toUpperCase()}`)).toBeNull();
    expect(parseRecordedHash(`protocol-sha256: ${H1.slice(1)}`)).toBeNull();
    expect(parseRecordedHash(`  protocol-sha256: ${H1}`)).toBeNull();
    expect(parseRecordedHash("no hash here")).toBeNull();
  });
});

describe("evaluateSplit with injected deps", () => {
  test("dev is always allowed without consulting git or the hash", () => {
    const d: FreezeGuardDeps = { listFreezeTags: throwing, readTagMessage: throwing, computeHash: throwing };
    expect(evaluateSplit("dev", d)).toEqual({ allowed: true, split: "dev" });
  });

  test("test is refused when no freeze tag exists", () => {
    const decision = evaluateSplit("test", deps({ "v1.0.0": "release" }, H1));
    expect(decision.allowed).toBe(false);
    expect(!decision.allowed && decision.reason).toMatch(/no protocol freeze tag/);
  });

  test("without a freeze tag the live hash is never computed (DR-0033)", () => {
    const d: FreezeGuardDeps = { listFreezeTags: () => ["v1.0.0"], readTagMessage: throwing, computeHash: throwing };
    const decision = evaluateSplit("test", d);
    expect(!decision.allowed && decision.reason).toMatch(/no protocol freeze tag/);
  });

  test("a freeze tag without a parseable hash refuses before the live hash is computed", () => {
    const d: FreezeGuardDeps = { ...deps({ "protocol-freeze-v1": "frozen, hash to follow" }, H1), computeHash: throwing };
    const decision = evaluateSplit("test", d);
    expect(!decision.allowed && decision.reason).toMatch(/does not record exactly one parseable/);
  });

  test("test is allowed when the latest tag records the current hash", () => {
    expect(evaluateSplit("test", deps({ "protocol-freeze-v1": `protocol-sha256: ${H1}` }, H1))).toEqual({
      allowed: true,
      split: "test",
      tag: "protocol-freeze-v1",
      protocolSha256: H1,
    });
  });

  test("test is refused on a hash mismatch", () => {
    const decision = evaluateSplit("test", deps({ "protocol-freeze-v1": `protocol-sha256: ${H1}` }, H2));
    expect(!decision.allowed && decision.reason).toMatch(/does not match/);
  });

  test("only the latest tag counts, even if an older tag matches", () => {
    const tags = { "protocol-freeze-v2": `protocol-sha256: ${H2}`, "protocol-freeze-v10": `protocol-sha256: ${H1}` };
    expect(evaluateSplit("test", deps(tags, H1)).allowed).toBe(true);
    expect(evaluateSplit("test", deps(tags, H2)).allowed).toBe(false);
  });

  test("test is refused when the latest tag has no parseable hash", () => {
    const tags = { "protocol-freeze-v1": `protocol-sha256: ${H1}`, "protocol-freeze-v2": "frozen, hash to follow" };
    const decision = evaluateSplit("test", deps(tags, H1));
    expect(!decision.allowed && decision.reason).toMatch(/protocol-freeze-v2 does not record/);
  });

  test("dependency failures refuse rather than throw", () => {
    const list: FreezeGuardDeps = { listFreezeTags: throwing, readTagMessage: throwing, computeHash: throwing };
    expect(evaluateSplit("test", list).allowed).toBe(false);
    const read: FreezeGuardDeps = { listFreezeTags: () => ["protocol-freeze-v1"], readTagMessage: throwing, computeHash: throwing };
    expect(evaluateSplit("test", read).allowed).toBe(false);
    const hash: FreezeGuardDeps = { ...deps({ "protocol-freeze-v1": `protocol-sha256: ${H1}` }, H1), computeHash: throwing };
    expect(evaluateSplit("test", hash).allowed).toBe(false);
    expect(evaluateSplit("test", deps({ "protocol-freeze-v1": `protocol-sha256: ${H1}` }, "not-a-hash")).allowed).toBe(false);
  });
});

describe("assertSplitAllowed", () => {
  test("throws FreezeGuardRefusal with the reason", () => {
    expect(() => assertSplitAllowed("test", deps({}, H1))).toThrow(FreezeGuardRefusal);
    expect(() => assertSplitAllowed("test", deps({}, H1))).toThrow(/no protocol freeze tag/);
  });

  test("returns the decision when allowed", () => {
    expect(assertSplitAllowed("dev", deps({}, H1))).toEqual({ allowed: true, split: "dev" });
    expect(assertSplitAllowed("test", deps({ "protocol-freeze-v3": `protocol-sha256: ${H1}` }, H1)).tag).toBe("protocol-freeze-v3");
  });
});

describe("gitFreezeDeps against a temporary repository", () => {
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

  beforeAll(() => {
    base = mkdtempSync(join(tmpdir(), "freeze-guard-"));
    repo = join(base, "repo");
    mkdirSync(repo);
    const emptyConfig = join(base, "gitconfig");
    writeFileSync(emptyConfig, "");
    env = {
      ...process.env,
      GIT_CONFIG_GLOBAL: emptyConfig,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_AUTHOR_NAME: "Freeze Test",
      GIT_AUTHOR_EMAIL: "freeze@example.invalid",
      GIT_COMMITTER_NAME: "Freeze Test",
      GIT_COMMITTER_EMAIL: "freeze@example.invalid",
    };
    delete env.GIT_DIR;
    delete env.GIT_WORK_TREE;
    delete env.GIT_INDEX_FILE;
    git(["init", "-q"]);
    mkdirSync(join(repo, "protocol", "oracles"), { recursive: true });
    mkdirSync(join(repo, "harness", "src"), { recursive: true });
    writeFileSync(join(repo, "protocol", "frozen-paths.txt"), "protocol/\nharness/src/\n");
    writeFileSync(join(repo, "protocol", "PROTOCOL.md"), "# Frozen protocol\n");
    writeFileSync(join(repo, "protocol", "oracles", ".gitkeep"), "");
    writeFileSync(join(repo, "harness", "src", "oracle.ts"), "export const rule = 1;\n");
    writeFileSync(join(repo, "README.md"), "not frozen\n");
    git(["add", "-A"]);
    git(["commit", "-q", "-m", "protocol"]);
  });

  afterAll(() => {
    rmSync(base, { recursive: true, force: true });
  });

  const hashNow = (): string => computeProtocolHash(repo);

  test("no tag: refused", () => {
    const decision = evaluateSplit("test", gitFreezeDeps(repo, hashNow));
    expect(!decision.allowed && decision.reason).toMatch(/no protocol freeze tag/);
  });

  test("a lightweight freeze tag is refused", () => {
    git(["tag", "protocol-freeze-v1"]);
    const decision = evaluateSplit("test", gitFreezeDeps(repo, hashNow));
    expect(!decision.allowed && decision.reason).toMatch(/annotated/);
  });

  test("an annotated tag recording the current hash allows the test split", () => {
    git(["tag", "-a", "protocol-freeze-v2", "-m", `Protocol freeze 2\n\nprotocol-sha256: ${hashNow()}`]);
    const decision = assertSplitAllowed("test", gitFreezeDeps(repo, hashNow));
    expect(decision).toEqual({ allowed: true, split: "test", tag: "protocol-freeze-v2", protocolSha256: hashNow() });
  });

  test("repositoryFreezeDeps hashes the repository's frozen set", () => {
    expect(assertSplitAllowed("test", repositoryFreezeDeps(repo)).tag).toBe("protocol-freeze-v2");
  });

  test("a committed change outside the frozen set keeps the test split allowed", () => {
    writeFileSync(join(repo, "README.md"), "edited after freeze\n");
    git(["commit", "-q", "-am", "edit README after freeze"]);
    expect(evaluateSplit("test", gitFreezeDeps(repo, hashNow)).allowed).toBe(true);
  });

  test("an uncommitted edit to a frozen path outside protocol/ refuses the test split", () => {
    writeFileSync(join(repo, "harness", "src", "oracle.ts"), "export const rule = 2;\n");
    const decision = evaluateSplit("test", gitFreezeDeps(repo, hashNow));
    expect(!decision.allowed && decision.reason).toMatch(/could not compute the protocol hash: .*uncommitted or untracked changes/);
    git(["checkout", "--", "harness/src/oracle.ts"]);
    expect(evaluateSplit("test", gitFreezeDeps(repo, hashNow)).allowed).toBe(true);
  });

  test("an uncommitted edit to protocol/ after the freeze refuses the test split", () => {
    writeFileSync(join(repo, "protocol", "PROTOCOL.md"), "# Edited after freeze\n");
    const decision = evaluateSplit("test", gitFreezeDeps(repo, hashNow));
    expect(!decision.allowed && decision.reason).toMatch(/could not compute the protocol hash: .*uncommitted or untracked changes/);
  });

  test("a committed edit to protocol/ after the freeze refuses the test split", () => {
    git(["commit", "-q", "-am", "edit protocol after freeze"]);
    const decision = evaluateSplit("test", gitFreezeDeps(repo, hashNow));
    expect(!decision.allowed && decision.reason).toMatch(/does not match/);
  });

  test("a committed edit to a frozen path outside protocol/ refuses the test split (DR-0033)", () => {
    git(["tag", "-a", "protocol-freeze-v3", "-m", `Protocol freeze 3\n\nprotocol-sha256: ${hashNow()}`]);
    expect(evaluateSplit("test", gitFreezeDeps(repo, hashNow)).allowed).toBe(true);
    writeFileSync(join(repo, "harness", "src", "oracle.ts"), "export const rule = 3;\n");
    git(["commit", "-q", "-am", "edit scoring code after freeze"]);
    const decision = evaluateSplit("test", gitFreezeDeps(repo, hashNow));
    expect(!decision.allowed && decision.reason).toMatch(/does not match/);
  });
});

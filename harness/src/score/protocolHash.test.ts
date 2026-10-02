import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { computeProtocolHash, listProtocolFiles } from "./protocolHash.ts";

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

let base: string;
let repo: string;
let protocol: string;
let env: NodeJS.ProcessEnv;

function git(args: string[], cwd = repo): string {
  return execFileSync("git", ["-c", "commit.gpgSign=false", ...args], { cwd, env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

function initRepo(dir: string): void {
  mkdirSync(dir, { recursive: true });
  git(["init", "-q"], dir);
}

/** Writes a file under the temporary repository (path relative to the repository root). */
function put(rel: string, content: string, root = repo): void {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content);
}

function commitAll(cwd = repo): void {
  git(["add", "-A"], cwd);
  git(["commit", "-q", "--allow-empty", "-m", "protocol"], cwd);
}

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "protocol-hash-"));
  repo = join(base, "repo");
  protocol = join(repo, "protocol");
  const emptyConfig = join(base, "gitconfig");
  writeFileSync(emptyConfig, "");
  env = {
    ...process.env,
    GIT_CONFIG_GLOBAL: emptyConfig,
    GIT_CONFIG_NOSYSTEM: "1",
    GIT_AUTHOR_NAME: "Hash Test",
    GIT_AUTHOR_EMAIL: "hash@example.invalid",
    GIT_COMMITTER_NAME: "Hash Test",
    GIT_COMMITTER_EMAIL: "hash@example.invalid",
  };
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;
  delete env.GIT_INDEX_FILE;
  initRepo(repo);
  mkdirSync(protocol);
});

afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

describe("computeProtocolHash", () => {
  test("matches an independent computation of the documented construction", () => {
    put("protocol/PROTOCOL.md", "# Protocol\n");
    put("protocol/oracles/b2.json", "{}\n");
    put("protocol/triggers.v1.json", "[]\n");
    put("outside.md", "not part of the protocol\n");
    commitAll();
    const expected = sha256(
      `PROTOCOL.md\n${sha256("# Protocol\n")}\n` + `oracles/b2.json\n${sha256("{}\n")}\n` + `triggers.v1.json\n${sha256("[]\n")}\n`,
    );
    expect(listProtocolFiles(protocol)).toEqual(["PROTOCOL.md", "oracles/b2.json", "triggers.v1.json"]);
    expect(computeProtocolHash(protocol)).toBe(expected);
  });

  test("an empty protocol hashes the empty string", () => {
    put("protocol/.gitkeep", "");
    commitAll();
    expect(computeProtocolHash(protocol)).toBe(sha256(""));
  });

  test("excludes .gitkeep at any depth", () => {
    put("protocol/AMENDMENTS.md", "none\n");
    commitAll();
    const before = computeProtocolHash(protocol);
    put("protocol/.gitkeep", "");
    put("protocol/oracles/.gitkeep", "");
    commitAll();
    expect(computeProtocolHash(protocol)).toBe(before);
    expect(listProtocolFiles(protocol)).toEqual(["AMENDMENTS.md"]);
  });

  test("changes when content changes, a file is added or a file is renamed", () => {
    put("protocol/a.md", "one\n");
    commitAll();
    const h1 = computeProtocolHash(protocol);
    put("protocol/a.md", "two\n");
    commitAll();
    const h2 = computeProtocolHash(protocol);
    put("protocol/b.md", "two\n");
    commitAll();
    const h3 = computeProtocolHash(protocol);
    git(["rm", "-q", "protocol/a.md", "protocol/b.md"]);
    put("protocol/c.md", "two\n");
    commitAll();
    const h4 = computeProtocolHash(protocol);
    expect(new Set([h1, h2, h3, h4]).size).toBe(4);
    expect(h4).not.toBe(h2);
  });

  test("is independent of creation order and location", () => {
    put("protocol/z.md", "z");
    put("protocol/a/b.md", "b");
    commitAll();
    const other = join(base, "elsewhere", "nested");
    initRepo(other);
    put("spec/a/b.md", "b", other);
    put("spec/z.md", "z", other);
    commitAll(other);
    expect(computeProtocolHash(join(other, "spec"))).toBe(computeProtocolHash(protocol));
  });

  test("ignores git-ignored files such as .DS_Store", () => {
    put(".gitignore", ".DS_Store\n");
    put("protocol/AMENDMENTS.md", "none\n");
    commitAll();
    const before = computeProtocolHash(protocol);
    put("protocol/.DS_Store", "\0\0\0\u0001Bud1");
    put("protocol/oracles/.DS_Store", "\0\0\0\u0001Bud1");
    expect(computeProtocolHash(protocol)).toBe(before);
  });

  test("hashes committed bytes, so a CRLF checkout (core.autocrlf=true) matches an LF one", () => {
    put("protocol/AMENDMENTS.md", "line one\nline two\n");
    commitAll();
    const lf = computeProtocolHash(protocol);
    git(["config", "core.autocrlf", "true"]);
    rmSync(join(protocol, "AMENDMENTS.md"));
    git(["checkout", "--", "protocol/AMENDMENTS.md"]);
    expect(readFileSync(join(protocol, "AMENDMENTS.md"), "utf8")).toBe("line one\r\nline two\r\n");
    expect(computeProtocolHash(protocol)).toBe(lf);
  });

  test.each<[string, () => void]>([
    [
      "an untracked file",
      () => {
        put("protocol/draft.md", "draft\n");
      },
    ],
    [
      "an unstaged edit",
      () => {
        put("protocol/AMENDMENTS.md", "edited\n");
      },
    ],
    [
      "a staged edit",
      () => {
        put("protocol/AMENDMENTS.md", "edited\n");
        git(["add", "protocol/AMENDMENTS.md"]);
      },
    ],
    [
      "a deleted file",
      () => {
        rmSync(join(protocol, "AMENDMENTS.md"));
      },
    ],
  ])("refuses a protocol directory with %s", (_label, change) => {
    put("protocol/AMENDMENTS.md", "none\n");
    commitAll();
    change();
    expect(() => computeProtocolHash(protocol)).toThrow(/uncommitted or untracked changes/);
  });

  test("throws for a missing directory", () => {
    expect(() => computeProtocolHash(join(protocol, "missing"))).toThrow();
  });

  test("throws outside a git repository", () => {
    const loose = join(base, "loose");
    mkdirSync(loose);
    writeFileSync(join(loose, "PROTOCOL.md"), "x");
    expect(() => computeProtocolHash(loose)).toThrow();
  });

  test("refuses symbolic links", () => {
    put("protocol/real.md", "x");
    symlinkSync("real.md", join(protocol, "link.md"));
    commitAll();
    expect(() => computeProtocolHash(protocol)).toThrow(/non-regular/);
  });
});

describe("protocolHash.ts as a script", () => {
  test("prints the freeze-tag line, or explains why it cannot", () => {
    const script = resolve(import.meta.dirname, "protocolHash.ts");
    const result = spawnSync(process.execPath, [script], { encoding: "utf8", timeout: 30_000 });
    expect(result.error).toBeUndefined();
    if (result.status === 0) {
      expect(result.stdout).toMatch(/^protocol-sha256: [0-9a-f]{64}\n$/);
    } else {
      expect(result.status).toBe(1);
      expect(result.stderr).not.toBe("");
    }
  });
});

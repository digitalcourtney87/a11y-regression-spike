/**
 * Protocol hash over the frozen set (DR-0028, DR-0033). Every test builds its
 * own temporary git repository: no test computes this repository's real
 * frozen hash, so the suite passes in a dirty working tree.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vitest";

import { computeProtocolHash, FROZEN_PATHS_FILE, listFrozenFiles, parseFrozenPaths } from "./protocolHash.ts";

function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

let base: string;
let repo: string;
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

/** Writes protocol/frozen-paths.txt with one entry per line. */
function putList(lines: readonly string[], root = repo): string {
  const text = `${lines.join("\n")}\n`;
  put(FROZEN_PATHS_FILE, text, root);
  return text;
}

function commitAll(cwd = repo): void {
  git(["add", "-A"], cwd);
  git(["commit", "-q", "--allow-empty", "-m", "frozen set"], cwd);
}

/** A small committed repository: protocol/, harness/src/ and env/env.lock.json are frozen. */
function standardRepo(): void {
  putList(["# frozen set", "protocol/", "harness/src/", "env/env.lock.json"]);
  put("protocol/AMENDMENTS.md", "none\n");
  put("harness/src/oracle.ts", "export const rule = 1;\n");
  put("env/env.lock.json", "{}\n");
  put("README.md", "not frozen\n");
  commitAll();
}

beforeEach(() => {
  base = mkdtempSync(join(tmpdir(), "protocol-hash-"));
  repo = join(base, "repo");
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
});

afterEach(() => {
  rmSync(base, { recursive: true, force: true });
});

describe("parseFrozenPaths", () => {
  test("ignores comments and blank lines, trims whitespace and keeps file order", () => {
    expect(parseFrozenPaths("# header\n\n  protocol/  \r\ncorpus/\n# note\nenv/env.lock.json\n")).toEqual([
      "protocol/",
      "corpus/",
      "env/env.lock.json",
    ]);
  });

  test.each<[string, string, RegExp]>([
    ["no protocol/ entry", "corpus/\n", /must list "protocol\/"/],
    ["an empty list", "# nothing\n", /must list "protocol\/"/],
    ["a '..' segment", "protocol/\ncorpus/../secrets/\n", /line 2: .*"\.\." segment/],
    ["a leading '..'", "protocol/\n../outside.txt\n", /"\.\." segment/],
    ["an absolute path", "protocol/\n/etc/passwd\n", /absolute path/],
    ["a drive-letter path", "protocol/\nC:/frozen/\n", /absolute path/],
    ["a backslash", "protocol/\nharness\\src\\\n", /backslash/],
    ["a duplicate entry", "protocol/\ncorpus/\nprotocol/\n", /line 3: duplicate entry "protocol\/"/],
    ["an empty segment", "protocol/\nharness//src/\n", /not a normalised path/],
    ["a '.' segment", "protocol/\n./corpus/\n", /not a normalised path/],
    ["a bare '/'", "protocol/\n/\n", /absolute path/],
  ])("rejects %s", (_label, text, message) => {
    expect(() => parseFrozenPaths(text)).toThrow(message);
  });
});

describe("computeProtocolHash", () => {
  test("matches an independent computation of the documented construction", () => {
    const list = putList(["protocol/", "harness/src/", "env/env.lock.json"]);
    put("protocol/PROTOCOL.md", "# Protocol\n");
    put("protocol/oracles/b2.json", "{}\n");
    put("harness/src/score.ts", "export {};\n");
    put("env/env.lock.json", "[]\n");
    put("env/other.json", "not listed\n");
    put("outside.md", "not part of the frozen set\n");
    commitAll();
    const expectedFiles = ["env/env.lock.json", "harness/src/score.ts", "protocol/PROTOCOL.md", "protocol/frozen-paths.txt", "protocol/oracles/b2.json"];
    const contents: Record<string, string> = {
      "env/env.lock.json": "[]\n",
      "harness/src/score.ts": "export {};\n",
      "protocol/PROTOCOL.md": "# Protocol\n",
      "protocol/frozen-paths.txt": list,
      "protocol/oracles/b2.json": "{}\n",
    };
    const expected = sha256(expectedFiles.map((path) => `${path}\n${sha256(contents[path] ?? "")}\n`).join(""));
    expect(listFrozenFiles(repo)).toEqual(expectedFiles);
    expect(computeProtocolHash(repo)).toBe(expected);
  });

  test("changing the list changes the hash, even a comment", () => {
    standardRepo();
    put("corpus/items/item-0001.json", "{}\n");
    commitAll();
    const before = computeProtocolHash(repo);
    putList(["# frozen set", "protocol/", "harness/src/", "env/env.lock.json", "corpus/"]);
    commitAll();
    const added = computeProtocolHash(repo);
    expect(listFrozenFiles(repo)).toContain("corpus/items/item-0001.json");
    putList(["# frozen set, reworded", "protocol/", "harness/src/", "env/env.lock.json", "corpus/"]);
    commitAll();
    const reworded = computeProtocolHash(repo);
    expect(new Set([before, added, reworded]).size).toBe(3);
  });

  test("a committed change to a file outside the frozen set does not change the hash", () => {
    standardRepo();
    const before = computeProtocolHash(repo);
    put("README.md", "edited\n");
    put("docs/notes.md", "new\n");
    put("env/unlisted.json", "{}\n");
    commitAll();
    expect(computeProtocolHash(repo)).toBe(before);
  });

  test("a committed change to any listed path changes the hash", () => {
    standardRepo();
    const hashes = [computeProtocolHash(repo)];
    for (const [rel, content] of [
      ["protocol/AMENDMENTS.md", "amended\n"],
      ["harness/src/oracle.ts", "export const rule = 2;\n"],
      ["harness/src/new/collector.ts", "export {};\n"],
      ["env/env.lock.json", '{"lockVersion":1}\n'],
    ] as const) {
      put(rel, content);
      commitAll();
      hashes.push(computeProtocolHash(repo));
    }
    expect(new Set(hashes).size).toBe(hashes.length);
  });

  test("a rename inside the frozen set changes the hash", () => {
    standardRepo();
    const before = computeProtocolHash(repo);
    git(["mv", "harness/src/oracle.ts", "harness/src/oracle2.ts"]);
    commitAll();
    expect(computeProtocolHash(repo)).not.toBe(before);
  });

  test("excludes .gitkeep at any depth", () => {
    standardRepo();
    const before = computeProtocolHash(repo);
    put("protocol/.gitkeep", "");
    put("harness/src/adapters/.gitkeep", "");
    commitAll();
    expect(computeProtocolHash(repo)).toBe(before);
    expect(listFrozenFiles(repo)).not.toContain("harness/src/adapters/.gitkeep");
  });

  test("a directory holding only .gitkeep is a valid entry that contributes no files", () => {
    putList(["protocol/", "listener/"]);
    put("listener/.gitkeep", "");
    commitAll();
    expect(listFrozenFiles(repo)).toEqual(["protocol/frozen-paths.txt"]);
  });

  test("overlapping entries are de-duplicated", () => {
    putList(["protocol/", "harness/", "harness/src/"]);
    put("harness/src/a.ts", "a\n");
    put("harness/test/b.ts", "b\n");
    commitAll();
    expect(listFrozenFiles(repo)).toEqual(["harness/src/a.ts", "harness/test/b.ts", "protocol/frozen-paths.txt"]);
  });

  test("is independent of creation order and location", () => {
    putList(["protocol/", "corpus/"]);
    put("corpus/z.json", "z");
    put("corpus/a/b.json", "b");
    commitAll();
    const other = join(base, "elsewhere", "nested");
    initRepo(other);
    put("corpus/a/b.json", "b", other);
    put("corpus/z.json", "z", other);
    putList(["protocol/", "corpus/"], other);
    commitAll(other);
    expect(computeProtocolHash(other)).toBe(computeProtocolHash(repo));
  });

  test("ignores git-ignored files such as .DS_Store", () => {
    put(".gitignore", ".DS_Store\n");
    standardRepo();
    const before = computeProtocolHash(repo);
    put("protocol/.DS_Store", "\0\0\0\u0001Bud1");
    put("harness/src/.DS_Store", "\0\0\0\u0001Bud1");
    expect(computeProtocolHash(repo)).toBe(before);
  });

  test("hashes committed bytes, so a CRLF checkout (core.autocrlf=true) matches an LF one", () => {
    standardRepo();
    put("harness/src/oracle.ts", "line one\nline two\n");
    commitAll();
    const lf = computeProtocolHash(repo);
    git(["config", "core.autocrlf", "true"]);
    rmSync(join(repo, "harness/src/oracle.ts"));
    rmSync(join(repo, FROZEN_PATHS_FILE));
    git(["checkout", "--", "harness/src/oracle.ts", FROZEN_PATHS_FILE]);
    expect(readFileSync(join(repo, "harness/src/oracle.ts"), "utf8")).toBe("line one\r\nline two\r\n");
    expect(computeProtocolHash(repo)).toBe(lf);
  });

  const dirtyCases: Array<[string, () => void]> = [
    ["an untracked file in protocol/", () => { put("protocol/draft.md", "draft\n"); }],
    ["an unstaged edit in protocol/", () => { put("protocol/AMENDMENTS.md", "edited\n"); }],
    ["a staged edit in protocol/", () => { put("protocol/AMENDMENTS.md", "edited\n"); git(["add", "protocol/AMENDMENTS.md"]); }],
    ["a deleted file in protocol/", () => { rmSync(join(repo, "protocol/AMENDMENTS.md")); }],
    ["an unstaged edit to the list", () => { put(FROZEN_PATHS_FILE, "protocol/\n"); }],
    ["an untracked file in harness/src/", () => { put("harness/src/draft.ts", "export {};\n"); }],
    ["an unstaged edit in harness/src/", () => { put("harness/src/oracle.ts", "export const rule = 3;\n"); }],
    ["a staged edit to a listed file", () => { put("env/env.lock.json", "[1]\n"); git(["add", "env/env.lock.json"]); }],
  ];

  test.each(dirtyCases)("refuses a frozen set with %s", (_label, change) => {
    standardRepo();
    change();
    expect(() => computeProtocolHash(repo)).toThrow(/uncommitted or untracked changes/);
  });

  /** `git status --porcelain` for the listed paths: empty when git status sees no change. */
  function statusOf(...paths: string[]): string {
    return git(["status", "--porcelain", "--untracked-files=all", "--", ...paths]);
  }

  describe("refuses changes that git status does not report", () => {
    const hiddenFlagCases: Array<[string, () => void]> = [
      [
        "an assume-unchanged file in protocol/ with an edit",
        () => {
          git(["update-index", "--assume-unchanged", "protocol/AMENDMENTS.md"]);
          put("protocol/AMENDMENTS.md", "edited\n");
        },
      ],
      [
        "an assume-unchanged file in harness/src/ without an edit",
        () => {
          git(["update-index", "--assume-unchanged", "harness/src/oracle.ts"]);
        },
      ],
      [
        "a skip-worktree file in harness/src/ with an edit",
        () => {
          git(["update-index", "--skip-worktree", "harness/src/oracle.ts"]);
          put("harness/src/oracle.ts", "export const rule = 4;\n");
        },
      ],
      [
        "a skip-worktree listed file removed from the working tree",
        () => {
          git(["update-index", "--skip-worktree", "env/env.lock.json"]);
          rmSync(join(repo, "env/env.lock.json"));
        },
      ],
    ];

    test.each(hiddenFlagCases)("%s", (_label, change) => {
      standardRepo();
      change();
      expect(statusOf("protocol/", "harness/src/", "env/env.lock.json")).toBe("");
      expect(() => computeProtocolHash(repo)).toThrow(/flagged assume-unchanged or skip-worktree/);
    });

    test("a working-tree file that differs from the index while the stat cache says unchanged", () => {
      // Record an old mtime in the index, so the entry is not racily clean;
      // then change the content without changing the size or the whole-second
      // mtime. With ctime ignored and minimal stat checks, git status trusts
      // the stat cache and reports nothing.
      git(["config", "core.trustctime", "false"]);
      git(["config", "core.checkStat", "minimal"]);
      const oracle = join(repo, "harness/src/oracle.ts");
      const old = 1_000_000_000;
      putList(["protocol/", "harness/src/"]);
      put("harness/src/oracle.ts", "export const rule = 1;\n");
      utimesSync(oracle, old, old);
      commitAll();
      const before = computeProtocolHash(repo);
      put("harness/src/oracle.ts", "export const rule = 9;\n");
      utimesSync(oracle, old, old);
      expect(statusOf("harness/src/")).toBe("");
      expect(() => computeProtocolHash(repo)).toThrow(/content differs from the index although git status reports no change.*harness\/src\/oracle\.ts/);
      put("harness/src/oracle.ts", "export const rule = 1;\n");
      utimesSync(oracle, old, old);
      expect(computeProtocolHash(repo)).toBe(before);
    });
  });

  test.each<[string, string]>([
    ["a tab", "protocol/tab\tname.md"],
    ["a newline", "protocol/new\nline.md"],
    ["DEL (U+007F)", "harness/src/del\u007f.ts"],
  ])("refuses a tracked frozen file whose name contains %s", (_label, rel) => {
    standardRepo();
    put(rel, "named badly\n");
    commitAll();
    expect(git(["ls-files", "-z", "--", rel]).split("\0")).toContain(rel);
    expect(() => computeProtocolHash(repo)).toThrow(/control character in its name/);
  });

  describe("git-ignored files under a listed path", () => {
    /** protocol/, harness/src/ and listener/ are frozen; *.log, bin/ and obj/ are ignored. */
    function ignoringRepo(): void {
      put(".gitignore", "*.log\nbin/\nobj/\n.DS_Store\n");
      putList(["protocol/", "harness/src/", "listener/"]);
      put("harness/src/oracle.ts", "export const rule = 1;\n");
      put("listener/Listener/Program.cs", "class Program {}\n");
      commitAll();
    }

    test.each([
      "harness/src/debug.log",
      "protocol/notes.log",
      "listener/trace.log",
      "harness/src/bin/tool.js",
      "protocol/obj/cache.json",
    ])("refuses %s, which is not allowlisted", (rel) => {
      ignoringRepo();
      put(rel, "ignored\n");
      expect(statusOf("protocol/", "harness/src/", "listener/")).toBe("");
      expect(() => computeProtocolHash(repo)).toThrow(/git-ignored files that are neither operating-system noise nor listener build output/);
    });

    test.each([
      "listener/Listener/bin/Debug/net10.0/listener.txt",
      "listener/Listener/obj/project.assets.json",
      "listener/bin/Release/out.txt",
      "protocol/.DS_Store",
      "docs/debug.log",
    ])("allows %s (listener build output, operating-system noise or outside the frozen set)", (rel) => {
      ignoringRepo();
      const before = computeProtocolHash(repo);
      put(rel, "ignored\n");
      expect(computeProtocolHash(repo)).toBe(before);
    });
  });

  test("a dirty file outside the frozen set does not refuse", () => {
    standardRepo();
    const before = computeProtocolHash(repo);
    put("README.md", "edited, not committed\n");
    put("scratch.txt", "untracked\n");
    expect(computeProtocolHash(repo)).toBe(before);
  });

  test("throws when the list is not committed", () => {
    put("protocol/AMENDMENTS.md", "none\n");
    commitAll();
    putList(["protocol/"]);
    expect(() => computeProtocolHash(repo)).toThrow(/frozen-paths\.txt is not committed at HEAD/);
  });

  test("throws when the committed list omits protocol/", () => {
    putList(["corpus/"]);
    put("corpus/a.json", "{}\n");
    commitAll();
    expect(() => computeProtocolHash(repo)).toThrow(/must list "protocol\/"/);
  });

  test("throws when the committed list contains '..'", () => {
    putList(["protocol/", "../outside/"]);
    commitAll();
    expect(() => computeProtocolHash(repo)).toThrow(/"\.\." segment/);
  });

  test("throws when a listed path matches no tracked file", () => {
    putList(["protocol/", "env/env.lock.jsn"]);
    put("env/env.lock.json", "{}\n");
    commitAll();
    expect(() => computeProtocolHash(repo)).toThrow(/match no tracked file: env\/env\.lock\.jsn/);
  });

  test("throws when a directory is listed without a trailing '/'", () => {
    putList(["protocol/", "corpus"]);
    put("corpus/a.json", "{}\n");
    commitAll();
    expect(() => computeProtocolHash(repo)).toThrow(/lists "corpus" as a file, but it is a directory/);
  });

  test("throws unless given the top level of the working tree", () => {
    standardRepo();
    expect(() => computeProtocolHash(join(repo, "protocol"))).toThrow(/not the top level/);
  });

  test("throws for a missing directory", () => {
    expect(() => computeProtocolHash(join(repo, "missing"))).toThrow();
  });

  test("throws outside a git repository", () => {
    const loose = join(base, "loose");
    mkdirSync(join(loose, "protocol"), { recursive: true });
    writeFileSync(join(loose, FROZEN_PATHS_FILE), "protocol/\n");
    expect(() => computeProtocolHash(loose)).toThrow();
  });

  test("refuses symbolic links", () => {
    standardRepo();
    symlinkSync("oracle.ts", join(repo, "harness/src/link.ts"));
    commitAll();
    expect(() => computeProtocolHash(repo)).toThrow(/non-regular/);
  });
});

describe("protocolHash.ts as a script", () => {
  const script = resolve(import.meta.dirname, "protocolHash.ts");

  function run(args: string[]): ReturnType<typeof spawnSync> {
    return spawnSync(process.execPath, [script, ...args], { env, encoding: "utf8", timeout: 30_000 });
  }

  test("prints the freeze-tag line for the given repository", () => {
    standardRepo();
    const result = run([repo]);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout).toBe(`protocol-sha256: ${computeProtocolHash(repo)}\n`);
  });

  test("explains why it cannot hash a dirty frozen set", () => {
    standardRepo();
    put("harness/src/oracle.ts", "edited\n");
    const result = run([repo]);
    expect(result.status).toBe(1);
    expect(result.stdout).toBe("");
    expect(result.stderr).toMatch(/uncommitted or untracked changes/);
  });

  test("rejects more than one argument", () => {
    const result = run([repo, repo]);
    expect(result.status).toBe(2);
    expect(result.stderr).toMatch(/usage/);
  });
});

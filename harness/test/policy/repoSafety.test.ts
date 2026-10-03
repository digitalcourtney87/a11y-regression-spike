/**
 * Repository safety over the files git would commit
 * (`git ls-files --cached --others --exclude-standard`).
 *
 * - DR-0014 D5: the full PRD stays out of the repository.
 * - DR-0015 D6: no NVDA binaries (nothing under nvda/, no *.nvda-addon,
 *   nvda*.exe or *.dll).
 * - HANDOFF §4 hard rule 1: no secrets and no .env files.
 * - DR-0014 D5: commercial-content tripwire. Commercial content stays out of
 *   this repository. The tripwire phrases are commercial content too, so only
 *   their SHA-256 digests are committed (harness/src/policy/tripwire.ts
 *   explains the matching); the owner keeps the plain-text list privately.
 *   Every committable text file is scanned, this one included.
 *
 * Binary files are skipped for content checks.
 */
import { execFileSync } from "node:child_process";
import { lstatSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, test } from "vitest";

import { findTripwireDigests, normaliseWords, tripwireDigest } from "../../src/policy/tripwire.ts";

const repoRoot = resolve(import.meta.dirname, "../../..");
const SELF = "harness/test/policy/repoSafety.test.ts";

/**
 * Commercial-content tripwire digests: `tripwireDigest(phrase)` of each
 * phrase in the owner's private list. To add a phrase, append its digest
 * here, never the phrase.
 */
const TRIPWIRE_DIGESTS: ReadonlySet<string> = new Set([
  "c7496aa7e52b9a8765ff78f29f64380e9e4e40500f708a3f71b5117ed06d8763",
  "2b312acd1e4a5d916089df6a91d37d1c435ee060dfc17402c80b832328ad0aff",
  "915a4bc359f7964c361c24c9463c78e5e74a82fe7cd6d847b18e044a55083737",
  "7dcf5bd992b0949a27c67ad6fc9f79142a7cf57d0233b3fcaa57d97cab6fbfca",
  "5b7931223c5ba525bbd0f613020b5a7cd8bdf8156753ac5c1680da0558ab986d",
  "5dd58d8fce3e29ca2c72b32fd00140ec5742d316a2e640f48119f480bd16318b",
  "a0ba6953290a48736556a3a488f0c38ec79fae46c9f63eb9a18d4fe7034475b2",
]);

/**
 * Secret patterns. Token prefixes are matched only when followed by a token
 * body, so documentation can name a prefix without tripping the check.
 */
const SECRET_PATTERNS: ReadonlyArray<{ label: string; regex: RegExp }> = [
  { label: "GitHub personal access token (classic)", regex: /\bghp_[A-Za-z0-9]{20,}/ },
  { label: "GitHub OAuth token", regex: /\bgho_[A-Za-z0-9]{20,}/ },
  { label: "GitHub fine-grained token", regex: /\bgithub_pat_[A-Za-z0-9_]{20,}/ },
  // Owner approval 2026-10-03 (DR-0046): the remaining GitHub token families.
  { label: "GitHub App installation token", regex: /\bghs_[A-Za-z0-9]{20,}/ },
  { label: "GitHub user-to-server token", regex: /\bghu_[A-Za-z0-9]{20,}/ },
  { label: "GitHub refresh token", regex: /\bghr_[A-Za-z0-9]{20,}/ },
  { label: "AWS access key ID", regex: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: "private key block", regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
];

/** Returns why a path must not be committed, or null. */
function forbiddenPathReason(rel: string): string | null {
  if (rel === "docs/PRD-v0.3.md") return "the full PRD stays out of the repository (D5)";
  const segments = rel.split("/");
  const base = (segments.pop() ?? "").toLowerCase();
  if (segments.some((s) => s.toLowerCase() === "nvda")) return "nothing under nvda/ may be committed (D6)";
  if (base.endsWith(".nvda-addon")) return "NVDA add-on packages are never committed (D6)";
  if (base.startsWith("nvda") && base.endsWith(".exe")) return "NVDA executables are never committed (D6)";
  if (base.endsWith(".dll")) return "DLLs are never committed (D6)";
  if (/^\.env(\..*)?$/.test(base)) return ".env files are never committed";
  return null;
}

function isBinary(content: Buffer): boolean {
  return content.subarray(0, 8000).includes(0);
}

function findSecrets(text: string): string[] {
  return SECRET_PATTERNS.filter(({ regex }) => regex.test(text)).map(({ label }) => label);
}

function gitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;
  delete env.GIT_INDEX_FILE;
  return env;
}

function committableFiles(): string[] {
  const out = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
    cwd: repoRoot,
    encoding: "utf8",
    env: gitEnv(),
    maxBuffer: 64 * 1024 * 1024,
  });
  return out.split("\0").filter((p) => p !== "");
}

interface TextFile {
  rel: string;
  text: string;
}

function readTextFiles(files: readonly string[]): TextFile[] {
  const result: TextFile[] = [];
  for (const rel of files) {
    const full = join(repoRoot, rel);
    let isFile: boolean;
    try {
      isFile = lstatSync(full).isFile();
    } catch {
      continue; // listed by git but deleted in the working tree
    }
    if (!isFile) continue;
    const content = readFileSync(full);
    if (!isBinary(content)) result.push({ rel, text: content.toString("utf8") });
  }
  return result;
}

const files = committableFiles();
const textFiles = readTextFiles(files);

describe("files git would commit", () => {
  test("the list is the repository's", () => {
    expect(files).toContain("package.json");
    expect(files).toContain(SELF);
    expect(textFiles.length).toBeGreaterThan(0);
  });

  test("docs/PRD-v0.3.md is not committable", () => {
    expect(files).not.toContain("docs/PRD-v0.3.md");
  });

  test("no forbidden paths (NVDA binaries, DLLs, .env files, the full PRD)", () => {
    const offenders = files.flatMap((rel) => {
      const reason = forbiddenPathReason(rel);
      return reason === null ? [] : [`${rel}: ${reason}`];
    });
    expect(offenders).toEqual([]);
  });

  test("no text file contains a secret", () => {
    const offenders = textFiles.flatMap(({ rel, text }) => findSecrets(text).map((label) => `${rel}: ${label}`));
    expect(offenders).toEqual([]);
  });

  test("no file contains commercial content (tripwire digests; this file included)", () => {
    const offenders = textFiles.flatMap(({ rel, text }) =>
      findTripwireDigests(text, TRIPWIRE_DIGESTS).map(({ line, digest }) => `${rel}:${String(line)}: tripwire digest ${digest}`),
    );
    expect(offenders).toEqual([]);
  });
});

describe("repository safety detectors", () => {
  test("forbidden paths", () => {
    const blocked = [
      "docs/PRD-v0.3.md",
      "nvda/nvda.exe",
      "tools/nvda/portable/readme.txt",
      "NVDA/x.txt",
      "adapters/nvda-addon/build/speechLog.nvda-addon",
      "bin/nvda_2026.2.exe",
      "NVDA-launcher.EXE",
      "listener/Listener/bin/Release/Listener.dll",
      "lib/helper.DLL",
      ".env",
      "harness/.env.local",
    ];
    for (const rel of blocked) expect(forbiddenPathReason(rel), rel).not.toBeNull();
    const allowed = [
      "docs/PRD-v0.3-technical-extract.md",
      "harness/src/adapters/nvdaRelay.ts",
      "adapters/nvda-addon/README.md",
      "listener/Listener/Program.cs",
      "docs/env.md",
      "tools/setup.exe",
      ".envrc.example.md",
    ];
    for (const rel of allowed) expect(forbiddenPathReason(rel), rel).toBeNull();
  });

  test("secret patterns catch token-shaped values only", () => {
    const body = "A1b2C3d4E5f6G7h8I9j0K1l2M3n4O5p6Q7r8";
    const samples = [
      `token = "${"gh" + "p_"}${body}"`,
      `${"gh" + "o_"}${body}`,
      `${"github" + "_pat_"}11ABCDEFG0123456789_abcdefghijklmnopqrstuvwxyz`,
      `${"gh" + "s_"}${body}`,
      `${"gh" + "u_"}${body}`,
      `${"gh" + "r_"}${body}`,
      `aws_access_key_id = ${"AK" + "IA"}ABCDEFGHIJ234567`,
      `${"-----BEGIN" + " RSA PRIVATE"} KEY-----\nMIIE...`,
      `${"-----BEGIN" + " PRIVATE"} KEY-----`,
    ];
    for (const sample of samples) expect(findSecrets(sample), sample).toHaveLength(1);
    const prose = `Classic tokens start with ${"gh" + "p_"}, app tokens with ${"gh" + "s_"} and fine-grained ones with ${"github" + "_pat_"}.`;
    expect(findSecrets(prose)).toEqual([]);
    expect(findSecrets(`${"-----BEGIN" + " PUBLIC"} KEY-----`)).toEqual([]);
  });

  test("the tripwire digest list is well formed", () => {
    expect(TRIPWIRE_DIGESTS.size).toBe(7);
    for (const digest of TRIPWIRE_DIGESTS) expect(digest).toMatch(/^[0-9a-f]{64}$/);
  });

  describe("tripwire matching, with made-up phrases", () => {
    const two = tripwireDigest("alpha bravo");
    const three = tripwireDigest("charlie delta echo");
    const four = tripwireDigest("foxtrot golf hotel india");
    const digests: ReadonlySet<string> = new Set([two, three, four]);
    const find = (text: string): string[] => findTripwireDigests(text, digests).map(({ line, digest }) => `${String(line)}:${digest}`);

    test("normalises case, punctuation, Markdown and whitespace in the phrase itself", () => {
      expect(normaliseWords("  **Alpha**-BRAVO!\n")).toEqual(["alpha", "bravo"]);
      expect(tripwireDigest("ALPHA,  bravo")).toBe(two);
      expect(() => tripwireDigest("alpha")).toThrow(RangeError);
      expect(() => tripwireDigest("a b c d e")).toThrow(RangeError);
    });

    test.each([
      ["lower case", "intro alpha bravo outro", two],
      ["upper case", "INTRO ALPHA BRAVO", two],
      ["a line wrap", "Intro ALPHA\n   bravo outro", two],
      ["punctuation and Markdown", "**Alpha**-bravo.", two],
      ["a plural", "two alpha bravos", two],
      ["three words across lines", "Charlie\ndelta\necho", three],
      ["four words", "the Foxtrot golf, hotel; India.", four],
    ])("matches with %s, reporting the digest and the starting line", (_label, text, digest) => {
      expect(find(text)).toEqual([`1:${digest}`]);
    });

    test("reports each matching line once", () => {
      expect(find("x\ny\nalpha bravo alpha bravo\n\nalpha\nbravo")).toEqual([`3:${two}`, `5:${two}`]);
    });

    test("does not match other word sequences", () => {
      expect(find("alpha charlie bravo")).toEqual([]);
      expect(find("alphabravo")).toEqual([]);
      expect(find("commercial content is out of scope")).toEqual([]);
      expect(find("")).toEqual([]);
    });

    test("never reports the phrase itself", () => {
      expect(find("alpha bravo").join(" ")).not.toMatch(/alpha|bravo/);
    });
  });

  test("binary files are recognised", () => {
    expect(isBinary(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x00, 0x01]))).toBe(true);
    expect(isBinary(Buffer.from("plain text\n"))).toBe(false);
  });
});

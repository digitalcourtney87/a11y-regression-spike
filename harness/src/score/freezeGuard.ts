/**
 * Protocol freeze guard (DR-0028; HANDOFF §4 hard rule 5 and §10.3).
 *
 * The scorer may score the test split only after the protocol freeze. The
 * freeze is an annotated git tag named `protocol-freeze-v<N>` whose message
 * contains a line `protocol-sha256: <64 lowercase hex>`. The test split is
 * allowed only if at least one freeze tag exists, the latest one (highest N,
 * compared numerically) records a parseable hash, and that hash equals the
 * hash of `protocol/` now. That hash covers the committed protocol and cannot
 * be computed while `protocol/` has uncommitted or untracked changes
 * (protocolHash.ts), so such changes also refuse. The dev split is always
 * allowed.
 */

import { execFileSync } from "node:child_process";

export type Split = "dev" | "test";

export const SPLITS: readonly Split[] = ["dev", "test"];

export function isSplit(value: string): value is Split {
  return (SPLITS as readonly string[]).includes(value);
}

/** Injectable dependencies, so the guard can be tested without git. */
export interface FreezeGuardDeps {
  /** Names of tags that may be freeze tags (non-matching names are ignored). */
  listFreezeTags(): string[];
  /** The full message of an annotated tag; throws if the tag is not annotated. */
  readTagMessage(tag: string): string;
  /** The current protocol hash (see protocolHash.ts). */
  computeHash(): string;
}

export type SplitDecision =
  | { allowed: true; split: Split; tag?: string; protocolSha256?: string }
  | { allowed: false; split: Split; reason: string };

export class FreezeGuardRefusal extends Error {
  readonly split: Split;
  constructor(split: Split, reason: string) {
    super(reason);
    this.name = "FreezeGuardRefusal";
    this.split = split;
  }
}

const TAG_PATTERN = /^protocol-freeze-v(0|[1-9]\d*)$/;
const HASH_LINE = /^protocol-sha256: ([0-9a-f]{64})$/;
const HEX64 = /^[0-9a-f]{64}$/;

/** Parses the freeze number N from a tag name, or returns null if the name is not a freeze tag. */
export function freezeTagNumber(tag: string): number | null {
  const match = TAG_PATTERN.exec(tag);
  if (match?.[1] === undefined) return null;
  const n = Number(match[1]);
  return Number.isSafeInteger(n) ? n : null;
}

/** Returns the freeze tag with the highest N, or null if there is none. */
export function latestFreezeTag(tags: readonly string[]): string | null {
  let best: { tag: string; n: number } | null = null;
  for (const tag of tags) {
    const n = freezeTagNumber(tag);
    if (n !== null && (best === null || n > best.n)) best = { tag, n };
  }
  return best?.tag ?? null;
}

/**
 * Extracts the recorded protocol hash from a tag message. Returns null if no
 * line records one, or if several lines record different hashes.
 */
export function parseRecordedHash(message: string): string | null {
  const hashes = new Set<string>();
  for (const raw of message.split("\n")) {
    const match = HASH_LINE.exec(raw.replace(/\s+$/, ""));
    if (match?.[1] !== undefined) hashes.add(match[1]);
  }
  if (hashes.size !== 1) return null;
  const [only] = hashes;
  return only ?? null;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** Decides whether a split may be scored. Never throws; dependency failures refuse. */
export function evaluateSplit(split: Split, deps: FreezeGuardDeps): SplitDecision {
  if (split === "dev") return { allowed: true, split };

  const refuse = (reason: string): SplitDecision => ({ allowed: false, split, reason });

  let tags: string[];
  try {
    tags = deps.listFreezeTags();
  } catch (error) {
    return refuse(`could not list freeze tags: ${describeError(error)}`);
  }
  const tag = latestFreezeTag(tags);
  if (tag === null) {
    return refuse("no protocol freeze tag (protocol-freeze-v<N>) exists; the test split is locked until the M6 freeze");
  }

  let message: string;
  try {
    message = deps.readTagMessage(tag);
  } catch (error) {
    return refuse(`could not read freeze tag ${tag}: ${describeError(error)}`);
  }
  const recorded = parseRecordedHash(message);
  if (recorded === null) {
    return refuse(`latest freeze tag ${tag} does not record exactly one parseable "protocol-sha256: <64 lowercase hex>" line`);
  }

  let current: string;
  try {
    current = deps.computeHash();
  } catch (error) {
    return refuse(`could not compute the protocol hash: ${describeError(error)}`);
  }
  if (!HEX64.test(current)) {
    return refuse(`computed protocol hash is malformed: ${current}`);
  }
  if (current !== recorded) {
    return refuse(`protocol/ hash ${current} does not match ${recorded} recorded in freeze tag ${tag}`);
  }
  return { allowed: true, split, tag, protocolSha256: current };
}

/**
 * Throws FreezeGuardRefusal unless the split may be scored. Returns the
 * decision (with the freeze tag and hash for the test split) when allowed.
 */
export function assertSplitAllowed(split: Split, deps: FreezeGuardDeps): Extract<SplitDecision, { allowed: true }> {
  const decision = evaluateSplit(split, deps);
  if (!decision.allowed) throw new FreezeGuardRefusal(split, decision.reason);
  return decision;
}

/** Environment for git subprocesses: never inherit a redirected repository. */
function gitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;
  delete env.GIT_INDEX_FILE;
  return env;
}

function git(cwd: string, args: string[]): string {
  return execFileSync("git", args, { cwd, encoding: "utf8", env: gitEnv(), stdio: ["ignore", "pipe", "pipe"] });
}

/** Freeze-guard dependencies backed by read-only git commands in `repoDir`. */
export function gitFreezeDeps(repoDir: string, computeHash: () => string): FreezeGuardDeps {
  return {
    listFreezeTags: () =>
      git(repoDir, ["tag", "--list", "protocol-freeze-v*"])
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== ""),
    readTagMessage: (tag: string) => {
      const ref = `refs/tags/${tag}`;
      const type = git(repoDir, ["cat-file", "-t", ref]).trim();
      if (type !== "tag") throw new Error(`${tag} is a lightweight tag; the freeze tag must be annotated`);
      return git(repoDir, ["for-each-ref", "--format=%(contents)", ref]);
    },
    computeHash,
  };
}

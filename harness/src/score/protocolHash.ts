/**
 * Protocol hash for the freeze guard (DR-0028; HANDOFF §9 M6 and §10.3).
 *
 * The hash covers the protocol as committed, so that the owner's machine, CI
 * and a Windows checkout all compute the same value:
 *
 * | Aspect | Rule |
 * |---|---|
 * | Files | The regular files git tracks under the protocol directory (`git ls-files`), excluding `.gitkeep`. Untracked and git-ignored files (for example macOS's `.DS_Store`) are not part of the protocol |
 * | Bytes | Each file's blob as stored in git, so a checkout with `core.autocrlf=true` (CRLF in the working tree, the Git for Windows default) hashes the same as a macOS or Linux one |
 * | Clean tree | Computing the hash throws if the protocol directory has any staged, unstaged or untracked change (`git status`). The scorer reads the working tree, so the working tree must be the committed protocol for the hash to describe what is scored |
 * | Construction | SHA-256 over the files sorted by POSIX path relative to the protocol directory (code-unit order), feeding for each file `path + "\n" + sha256hex(blob) + "\n"` |
 *
 * Symbolic links and submodules are refused. The construction does not depend
 * on where the repository lives or on file timestamps.
 *
 * Proposed by Claude (not yet owner-approved): hashing the committed blobs of
 * tracked files and requiring a clean protocol directory, in place of hashing
 * every file on disk (DR-0028).
 *
 * Run `node harness/src/score/protocolHash.ts` to print the
 * `protocol-sha256: <hex>` line for the freeze tag message.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const EXCLUDED_NAMES: ReadonlySet<string> = new Set([".gitkeep"]);
const REGULAR_MODES: ReadonlySet<string> = new Set(["100644", "100755"]);
/** One `git ls-files --stage -z` record: mode, object id (SHA-1 or SHA-256), stage, path. */
const STAGE_RECORD = /^(\d{6}) ([0-9a-f]{40}|[0-9a-f]{64}) (\d)\t([\s\S]+)$/;

interface TrackedFile {
  /** POSIX path relative to the protocol directory. */
  path: string;
  /** Blob object id in the index. */
  object: string;
}

function sha256Hex(data: string | Buffer): string {
  return createHash("sha256").update(data).digest("hex");
}

/** Environment for git subprocesses: never inherit a redirected repository. */
function gitEnv(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  delete env.GIT_DIR;
  delete env.GIT_WORK_TREE;
  delete env.GIT_INDEX_FILE;
  return env;
}

function git(cwd: string, args: string[]): Buffer {
  return execFileSync("git", args, { cwd, env: gitEnv(), stdio: ["ignore", "pipe", "pipe"], maxBuffer: 256 * 1024 * 1024 });
}

function nulSeparated(output: Buffer): string[] {
  return output
    .toString("utf8")
    .split("\0")
    .filter((record) => record !== "");
}

function baseName(path: string): string {
  return path.slice(path.lastIndexOf("/") + 1);
}

/** Throws unless the protocol directory matches the index and HEAD, with no untracked files. */
function assertClean(rootDir: string): void {
  const changes = nulSeparated(git(rootDir, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", "."]));
  if (changes.length > 0) {
    const shown = changes.slice(0, 5).join("; ");
    throw new Error(
      `the protocol directory has uncommitted or untracked changes (${shown}${changes.length > 5 ? "; …" : ""}); commit or remove them before hashing`,
    );
  }
}

function trackedFiles(rootDir: string): TrackedFile[] {
  const files: TrackedFile[] = [];
  for (const record of nulSeparated(git(rootDir, ["ls-files", "-z", "--stage", "--", "."]))) {
    const match = STAGE_RECORD.exec(record);
    const [, mode, object, stage, path] = match ?? [];
    if (mode === undefined || object === undefined || stage === undefined || path === undefined) {
      throw new Error(`unexpected git ls-files record: ${JSON.stringify(record)}`);
    }
    if (stage !== "0") throw new Error(`protocol file "${path}" has an unresolved merge conflict`);
    if (EXCLUDED_NAMES.has(baseName(path))) continue;
    if (!REGULAR_MODES.has(mode)) {
      throw new Error(`protocol hash refuses non-regular entry "${path}" (git mode ${mode}: symbolic link or submodule)`);
    }
    files.push({ path, object });
  }
  return files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/**
 * Lists the files the protocol hash covers: tracked regular files under
 * `rootDir`, as sorted POSIX paths relative to it. Throws outside a git
 * repository.
 */
export function listProtocolFiles(rootDir = "protocol"): string[] {
  return trackedFiles(rootDir).map((file) => file.path);
}

/**
 * Computes the protocol hash (64 lowercase hex characters) of the committed
 * protocol. Throws if `rootDir` does not exist, is not in a git repository, or
 * has uncommitted or untracked changes.
 */
export function computeProtocolHash(rootDir = "protocol"): string {
  assertClean(rootDir);
  const hash = createHash("sha256");
  for (const file of trackedFiles(rootDir)) {
    hash.update(`${file.path}\n${sha256Hex(git(rootDir, ["cat-file", "blob", file.object]))}\n`);
  }
  return hash.digest("hex");
}

if (import.meta.main) {
  try {
    const hash = computeProtocolHash(resolve(import.meta.dirname, "../../../protocol"));
    process.stdout.write(`protocol-sha256: ${hash}\n`);
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}

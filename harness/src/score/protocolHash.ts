/**
 * Protocol hash for the freeze guard (DR-0028, scope amended by DR-0033;
 * HANDOFF §9 M6 and §10.3).
 *
 * The hash covers the frozen set: every path listed in
 * `protocol/frozen-paths.txt`, the list of paths that can change a verdict
 * (DR-0033). The list lives in `protocol/`, which it must name, so changing
 * the list changes the hash. The hash describes the frozen set as committed,
 * so that the owner's machine, CI and a Windows checkout all compute the same
 * value:
 *
 * | Aspect | Rule |
 * |---|---|
 * | List | `protocol/frozen-paths.txt` is read from the blob committed at HEAD. One repository-relative POSIX path per line; a trailing `/` marks a directory, any other entry is a single file; `#` comments and blank lines are ignored. It must list `protocol/`, and it rejects absolute paths, `..`, `.` and empty segments, backslashes and duplicate entries. Every entry must match at least one tracked file (a `.gitkeep` counts), so a mistyped entry cannot silently freeze nothing |
 * | Files | The regular files git tracks under the listed paths (`git ls-files`), excluding `.gitkeep`, de-duplicated. Untracked and git-ignored files are not part of the frozen set (the clean-tree rule below refuses them, apart from the allowed ignored files) |
 * | Names | A frozen file's path must not contain a control character (U+0000 to U+001F, U+007F). Without newlines in paths, each `path + "\n" + hex + "\n"` record parses one way, so two different frozen sets cannot feed the same bytes |
 * | Bytes | Each file's blob as stored in git, so a checkout with `core.autocrlf=true` (CRLF in the working tree, the Git for Windows default) hashes the same as a macOS or Linux one |
 * | Clean tree | Computing the hash throws if any listed path has a staged, unstaged or untracked change (`git status`); if an index entry under a listed path is flagged assume-unchanged or skip-worktree (flags that hide working-tree edits from `git status`); if a frozen file's working-tree content matches its index blob neither byte for byte nor after git's clean filters (`git hash-object`); or if a listed path holds a git-ignored file other than operating-system noise (`.DS_Store`, `Thumbs.db`) and listener build output (any `bin/` or `obj/` directory under `listener/`). The harness reads the working tree, so the working tree must be the committed frozen set for the hash to describe what runs |
 * | Construction | SHA-256 over the files sorted by repository-relative POSIX path (code-unit order), feeding for each file `path + "\n" + sha256hex(blob) + "\n"` |
 *
 * Symbolic links and submodules are refused. The construction does not depend
 * on where the repository lives or on file timestamps.
 *
 * Hashing the committed blobs of tracked files and requiring a clean frozen
 * set was approved by the owner 2026-10-02 (DR-0030); the scope (the frozen
 * set in place of `protocol/` alone) is DR-0033. The checks for hidden index
 * flags, working-tree content and ignored files enforce that clean-set rule,
 * and the control-character rule keeps the construction injective. These four
 * checks came from internal review during the owner-directed implementation
 * of DR-0033 (owner review 2026-10-02); they are not auto-fixes (DR-0044).
 *
 * The freeze guard computes this hash only once a freeze tag exists
 * (freezeGuard.ts), so a dirty working tree does not affect `npm test` or a
 * refused `npm run score -- --split test`.
 *
 * Run `node harness/src/score/protocolHash.ts [repository root]` (or
 * `npm run protocol:hash`) to print the `protocol-sha256: <hex>` line for the
 * freeze tag message. The root defaults to the repository containing this
 * file.
 */

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

/** The frozen-paths list, relative to the repository root (DR-0033). */
export const FROZEN_PATHS_FILE = "protocol/frozen-paths.txt";

/** The entry the frozen-paths list must contain, so that the list hashes itself. */
export const REQUIRED_FROZEN_ENTRY = "protocol/";

const EXCLUDED_NAMES: ReadonlySet<string> = new Set([".gitkeep"]);
const REGULAR_MODES: ReadonlySet<string> = new Set(["100644", "100755"]);
/** One `git ls-files --stage -z` record: mode, object id (SHA-1 or SHA-256), stage, path. */
const STAGE_RECORD = /^(\d{6}) ([0-9a-f]{40}|[0-9a-f]{64}) (\d)\t([\s\S]+)$/;
/**
 * One `git ls-files -v -z` record whose tag hides working-tree edits from
 * `git status`: a lowercase tag is assume-unchanged, `S` is skip-worktree.
 */
const HIDDEN_FLAG_RECORD = /^([a-z]|S) ([\s\S]+)$/;
/** Git-ignored names allowed under a listed path: operating-system noise. */
const ALLOWED_IGNORED_NAMES: ReadonlySet<string> = new Set([".DS_Store", "Thumbs.db"]);
/** Listener build output, also skipped by the clock policy (clockPolicy.isSkippedDir). */
const ALLOWED_IGNORED_PATH = /^listener\/(?:.+\/)?(?:bin|obj)\//;
/** One object id per line, as `git hash-object` prints it. */
const OBJECT_ID = /^(?:[0-9a-f]{40}|[0-9a-f]{64})$/;
/** One `git cat-file --batch` header: object id, type, size. */
const BATCH_HEADER = /^([0-9a-f]{40}|[0-9a-f]{64}) blob (\d+)$/;
const MAX_BUFFER = 512 * 1024 * 1024;

interface TrackedFile {
  /** Repository-relative POSIX path. */
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

/**
 * Runs a read-only git command. Pathspecs are literal (no globs or magic), and
 * optional index locks are skipped so that hashing never writes to the index.
 */
function git(cwd: string, args: string[], input?: string): Buffer {
  return execFileSync("git", ["--literal-pathspecs", "--no-optional-locks", ...args], {
    cwd,
    env: gitEnv(),
    input,
    stdio: ["pipe", "pipe", "pipe"],
    maxBuffer: MAX_BUFFER,
  });
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

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** The stderr of a failed git command, falling back to the error message. */
function gitFailure(error: unknown): string {
  const stderr: unknown = error instanceof Error && "stderr" in error ? error.stderr : undefined;
  const text = Buffer.isBuffer(stderr) ? stderr.toString("utf8") : typeof stderr === "string" ? stderr : "";
  return text.trim() === "" ? describeError(error).trim() : text.trim();
}

function isDirectoryEntry(entry: string): boolean {
  return entry.endsWith("/");
}

/**
 * True if `path` contains a control character (U+0000 to U+001F, U+007F). A
 * frozen file's path must not: a newline would make the hash records
 * ambiguous.
 */
function hasControlCharacter(path: string): boolean {
  for (let index = 0; index < path.length; index += 1) {
    const code = path.charCodeAt(index);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

/** Throws unless `entry` is a normalised repository-relative POSIX path. */
function validateEntry(entry: string, lineNumber: number): void {
  const where = `${FROZEN_PATHS_FILE} line ${String(lineNumber)}`;
  if (entry.includes("\\")) throw new Error(`${where}: "${entry}" contains a backslash; use "/" separators`);
  if (entry.startsWith("/") || /^[A-Za-z]:/.test(entry)) throw new Error(`${where}: "${entry}" is an absolute path`);
  const body = isDirectoryEntry(entry) ? entry.slice(0, -1) : entry;
  for (const segment of body.split("/")) {
    if (segment === "..") throw new Error(`${where}: "${entry}" contains a ".." segment`);
    if (segment === "" || segment === ".") throw new Error(`${where}: "${entry}" is not a normalised path (empty or "." segment)`);
  }
}

/**
 * Parses and validates the text of `protocol/frozen-paths.txt` (DR-0033).
 * Returns the entries in file order; directory entries keep their trailing
 * `/`. Throws on an absolute path, a `..`, `.` or empty segment, a backslash,
 * a duplicate entry, or a list without `protocol/`.
 */
export function parseFrozenPaths(text: string): string[] {
  const entries: string[] = [];
  const seen = new Set<string>();
  text.split("\n").forEach((raw, index) => {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) return;
    validateEntry(line, index + 1);
    if (seen.has(line)) throw new Error(`${FROZEN_PATHS_FILE} line ${String(index + 1)}: duplicate entry "${line}"`);
    seen.add(line);
    entries.push(line);
  });
  if (!seen.has(REQUIRED_FROZEN_ENTRY)) {
    throw new Error(`${FROZEN_PATHS_FILE} must list "${REQUIRED_FROZEN_ENTRY}", so that changing the list changes the hash`);
  }
  return entries;
}

/** Throws unless `repoRoot` is the top level of a git working tree. */
function assertRepositoryRoot(repoRoot: string): void {
  const prefix = git(repoRoot, ["rev-parse", "--show-prefix"]).toString("utf8").trim();
  if (prefix !== "") {
    throw new Error(`${repoRoot} is not the top level of its git working tree (it is "${prefix}" inside it)`);
  }
}

/** Reads and validates the frozen-paths list committed at HEAD. */
function readFrozenEntries(repoRoot: string): string[] {
  let text: string;
  try {
    text = git(repoRoot, ["cat-file", "blob", `HEAD:${FROZEN_PATHS_FILE}`]).toString("utf8");
  } catch (error) {
    throw new Error(`${FROZEN_PATHS_FILE} is not committed at HEAD; commit it before hashing (${gitFailure(error)})`, {
      cause: error,
    });
  }
  return parseFrozenPaths(text);
}

/** At most five items, joined for an error message. */
function sample(items: readonly string[]): string {
  return `${items.slice(0, 5).join("; ")}${items.length > 5 ? "; …" : ""}`;
}

function isAllowedIgnored(path: string): boolean {
  return ALLOWED_IGNORED_NAMES.has(baseName(path)) || ALLOWED_IGNORED_PATH.test(path);
}

/**
 * Throws unless every listed path matches the index and HEAD, with no
 * untracked files, no index entries whose flags hide working-tree edits from
 * `git status`, and no git-ignored files beyond the allowed ones.
 */
function assertClean(repoRoot: string, entries: readonly string[]): void {
  const changes = nulSeparated(git(repoRoot, ["status", "--porcelain=v1", "-z", "--untracked-files=all", "--", ...entries]));
  if (changes.length > 0) {
    throw new Error(
      `the frozen set (${FROZEN_PATHS_FILE}) has uncommitted or untracked changes (${sample(changes)}); commit or remove them before hashing`,
    );
  }

  const hidden = nulSeparated(git(repoRoot, ["ls-files", "-z", "-v", "--", ...entries]))
    .map((record) => HIDDEN_FLAG_RECORD.exec(record)?.[2])
    .filter((path) => path !== undefined);
  if (hidden.length > 0) {
    throw new Error(
      `the frozen set (${FROZEN_PATHS_FILE}) has index entries flagged assume-unchanged or skip-worktree, which hide working-tree edits from git status (${sample(hidden)}); clear the flags with "git update-index --no-assume-unchanged --no-skip-worktree -- <path>" (and leave any sparse checkout) before hashing`,
    );
  }

  const ignored = nulSeparated(git(repoRoot, ["ls-files", "-z", "--others", "--ignored", "--exclude-standard", "--", ...entries])).filter(
    (path) => !isAllowedIgnored(path),
  );
  if (ignored.length > 0) {
    throw new Error(
      `the frozen set (${FROZEN_PATHS_FILE}) has git-ignored files that are neither operating-system noise nor listener build output (${sample(ignored)}); remove them before hashing, or commit them if they can change a verdict`,
    );
  }
}

/**
 * A path as a `git hash-object --stdin-paths` line. Git C-unquotes a line that
 * starts with `"`, so such a path is quoted; paths never hold control
 * characters (trackedFiles refuses them).
 */
function stdinPath(path: string): string {
  return path.startsWith('"') ? `"${path.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"` : path;
}

/**
 * Throws unless each frozen file's working-tree content matches its index
 * blob, byte for byte or after git's clean filters (for example CRLF to LF
 * under `core.autocrlf=true`). This catches edits that `git status` misses,
 * such as a stale stat cache or file-system monitor.
 */
function assertWorkingTreeMatchesIndex(repoRoot: string, files: readonly TrackedFile[]): void {
  const mismatched = (candidates: readonly TrackedFile[], filters: boolean): TrackedFile[] => {
    if (candidates.length === 0) return [];
    let ids: string[];
    try {
      const args = ["hash-object", ...(filters ? [] : ["--no-filters"]), "--stdin-paths"];
      ids = git(repoRoot, args, `${candidates.map((file) => stdinPath(file.path)).join("\n")}\n`)
        .toString("utf8")
        .split("\n")
        .filter((line) => line !== "");
    } catch (error) {
      throw new Error(`cannot read the frozen set's working-tree files (${gitFailure(error)})`, { cause: error });
    }
    if (ids.length !== candidates.length || !ids.every((id) => OBJECT_ID.test(id))) {
      throw new Error(`unexpected git hash-object output for the frozen set (${String(ids.length)} ids for ${String(candidates.length)} files)`);
    }
    return candidates.filter((file, index) => ids[index] !== file.object);
  };
  const changed = mismatched(mismatched(files, false), true);
  if (changed.length > 0) {
    throw new Error(
      `the frozen set (${FROZEN_PATHS_FILE}) has working-tree files whose content differs from the index although git status reports no change (${sample(changed.map((file) => file.path))}); restore or commit them before hashing`,
    );
  }
}

function trackedFiles(repoRoot: string, entries: readonly string[]): TrackedFile[] {
  const matched = new Set<string>();
  const files = new Map<string, TrackedFile>();
  for (const record of nulSeparated(git(repoRoot, ["ls-files", "-z", "--stage", "--", ...entries]))) {
    const match = STAGE_RECORD.exec(record);
    const [, mode, object, stage, path] = match ?? [];
    if (mode === undefined || object === undefined || stage === undefined || path === undefined) {
      throw new Error(`unexpected git ls-files record: ${JSON.stringify(record)}`);
    }
    if (hasControlCharacter(path)) {
      throw new Error(`frozen file ${JSON.stringify(path)} has a control character in its name; rename it`);
    }
    if (stage !== "0") throw new Error(`frozen file "${path}" has an unresolved merge conflict`);

    const owners = entries.filter((entry) => (isDirectoryEntry(entry) ? path.startsWith(entry) : path === entry));
    if (owners.length === 0) {
      const asDirectory = entries.find((entry) => !isDirectoryEntry(entry) && path.startsWith(`${entry}/`));
      if (asDirectory !== undefined) {
        throw new Error(`${FROZEN_PATHS_FILE} lists "${asDirectory}" as a file, but it is a directory; add a trailing "/"`);
      }
      throw new Error(`${FROZEN_PATHS_FILE}: tracked entry "${path}" (git mode ${mode}) does not match any listed path as written`);
    }
    for (const owner of owners) matched.add(owner);

    if (EXCLUDED_NAMES.has(baseName(path))) continue;
    if (!REGULAR_MODES.has(mode)) {
      throw new Error(`protocol hash refuses non-regular entry "${path}" (git mode ${mode}: symbolic link or submodule)`);
    }
    files.set(path, { path, object });
  }

  const unmatched = entries.filter((entry) => !matched.has(entry));
  if (unmatched.length > 0) {
    throw new Error(`${FROZEN_PATHS_FILE} lists paths that match no tracked file: ${unmatched.join(", ")}`);
  }
  return [...files.values()].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
}

/** Reads blobs in one `git cat-file --batch` call, in the order given. */
function readBlobs(repoRoot: string, objects: readonly string[]): Buffer[] {
  if (objects.length === 0) return [];
  const output = git(repoRoot, ["cat-file", "--batch"], `${objects.join("\n")}\n`);
  const blobs: Buffer[] = [];
  let offset = 0;
  for (const object of objects) {
    const headerEnd = output.indexOf(0x0a, offset);
    if (headerEnd < 0) throw new Error(`git cat-file returned no header for ${object}`);
    const header = output.toString("utf8", offset, headerEnd);
    const [, id, size] = BATCH_HEADER.exec(header) ?? [];
    if (id !== object || size === undefined) {
      throw new Error(`unexpected git cat-file header for ${object}: ${JSON.stringify(header)}`);
    }
    const start = headerEnd + 1;
    const end = start + Number(size);
    if (end >= output.length || output[end] !== 0x0a) throw new Error(`git cat-file output for ${object} is truncated`);
    blobs.push(output.subarray(start, end));
    offset = end + 1;
  }
  if (offset !== output.length) throw new Error("git cat-file returned more output than requested");
  return blobs;
}

/**
 * Lists the files the protocol hash covers: tracked regular files under the
 * paths in `protocol/frozen-paths.txt`, as sorted repository-relative POSIX
 * paths. Reads the list committed at HEAD; does not check that the tree is
 * clean. Throws outside a git repository or if the list is missing or
 * invalid.
 */
export function listFrozenFiles(repoRoot: string): string[] {
  assertRepositoryRoot(repoRoot);
  return trackedFiles(repoRoot, readFrozenEntries(repoRoot)).map((file) => file.path);
}

/**
 * Computes the protocol hash (64 lowercase hex characters) of the committed
 * frozen set (DR-0033). `repoRoot` must be the top level of a git working
 * tree. Throws if the list is missing or invalid, or if the working tree is
 * not the committed frozen set (see the clean-tree rule above).
 */
export function computeProtocolHash(repoRoot: string): string {
  assertRepositoryRoot(repoRoot);
  const entries = readFrozenEntries(repoRoot);
  assertClean(repoRoot, entries);
  const files = trackedFiles(repoRoot, entries);
  assertWorkingTreeMatchesIndex(repoRoot, files);
  const blobs = readBlobs(repoRoot, files.map((file) => file.object));
  const hash = createHash("sha256");
  files.forEach((file, index) => {
    const blob = blobs[index];
    if (blob === undefined) throw new Error(`no blob read for ${file.path}`);
    hash.update(`${file.path}\n${sha256Hex(blob)}\n`);
  });
  return hash.digest("hex");
}

if (import.meta.main) {
  const args = process.argv.slice(2);
  if (args.length > 1) {
    process.stderr.write("usage: node harness/src/score/protocolHash.ts [repository root]\n");
    process.exitCode = 2;
  } else {
    try {
      const repoRoot = resolve(args[0] ?? resolve(import.meta.dirname, "../../.."));
      process.stdout.write(`protocol-sha256: ${computeProtocolHash(repoRoot)}\n`);
    } catch (error) {
      process.stderr.write(`${describeError(error)}\n`);
      process.exitCode = 1;
    }
  }
}

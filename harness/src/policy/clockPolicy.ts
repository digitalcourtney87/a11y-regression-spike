/**
 * Collector clock rule enforcement (DR-0027, implementing DR-0010 D1).
 *
 * QPC is the only timebase. Collectors, adapters, the runner, the clock module
 * and the listener must not read the wall clock, except in the one allowlisted
 * anchor file per runtime. This is a source tripwire: it matches text, so a
 * forbidden call is caught in comments and strings too. It is not exhaustive;
 * it covers the reads named in the owner's decision and their common
 * equivalents across the harness languages.
 */

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

export interface ForbiddenPattern {
  /** The read as written in the policy (for messages). */
  label: string;
  /** Whitespace-tolerant matcher for the read. */
  regex: RegExp;
}

/** Forbidden wall-clock reads (DR-0027). */
export const FORBIDDEN_PATTERNS: readonly ForbiddenPattern[] = [
  { label: "Date.now(", regex: /\bDate\s*\.\s*now\s*\(/ },
  { label: "performance.timeOrigin", regex: /\bperformance\s*\.\s*timeOrigin\b/ },
  { label: "new Date(", regex: /\bnew\s+Date\s*\(/ },
  { label: "time.time(", regex: /\btime\s*\.\s*time\s*\(/ },
  { label: "time.time_ns(", regex: /\btime\s*\.\s*time_ns\s*\(/ },
  { label: "DateTime.Now", regex: /\bDateTime\s*\.\s*Now\b/ },
  { label: "DateTime.UtcNow", regex: /\bDateTime\s*\.\s*UtcNow\b/ },
  { label: "DateTimeOffset.Now", regex: /\bDateTimeOffset\s*\.\s*Now\b/ },
  { label: "DateTimeOffset.UtcNow", regex: /\bDateTimeOffset\s*\.\s*UtcNow\b/ },
];

/** Directories scanned, relative to the repository root (POSIX). */
export const SCAN_ROOTS: readonly string[] = [
  "harness/src/collectors",
  "harness/src/adapters",
  "harness/src/runner",
  "harness/src/clock",
  "listener",
];

/** File extensions scanned. */
export const SCANNED_EXTENSIONS: readonly string[] = [".ts", ".js", ".mjs", ".cs", ".py"];

/**
 * True for directories the scan never descends into. These mirror the
 * .gitignore rules, so every committable file under a scan root is scanned:
 * `node_modules` anywhere, and .NET build output (`bin`, `obj`) only under
 * `listener/` (`listener/**\/bin/`, `listener/**\/obj/`).
 */
export function isSkippedDir(relDir: string): boolean {
  if (relDir === "node_modules" || relDir.endsWith("/node_modules")) return true;
  return /^listener\/(?:.+\/)?(?:bin|obj)$/.test(relDir);
}

export interface ClockViolation {
  /** Repository-relative POSIX path. */
  file: string;
  /** 1-based line number. */
  line: number;
  /** The forbidden read that matched. */
  pattern: string;
  /** The offending source line, trimmed. */
  text: string;
}

/**
 * True for the only files allowed to read the wall clock:
 * harness/src/clock/wallAnchor.ts and listener/**\/WallAnchor.cs.
 */
export function isAllowlisted(relPath: string): boolean {
  if (relPath === "harness/src/clock/wallAnchor.ts") return true;
  return relPath.startsWith("listener/") && relPath.endsWith("/WallAnchor.cs");
}

/** True if a repository-relative path falls under a scan root, has a scanned extension and is not a test. */
export function isScannable(relPath: string): boolean {
  if (relPath.endsWith(".test.ts")) return false;
  if (!SCANNED_EXTENSIONS.some((ext) => relPath.endsWith(ext))) return false;
  return SCAN_ROOTS.some((root) => relPath.startsWith(`${root}/`));
}

/** Pure check of one file's text. Allowlisted and unscannable paths yield no violations. */
export function checkSource(relPath: string, text: string): ClockViolation[] {
  if (!isScannable(relPath) || isAllowlisted(relPath)) return [];
  const violations: ClockViolation[] = [];
  const lines = text.split(/\r?\n/);
  lines.forEach((lineText, index) => {
    for (const { label, regex } of FORBIDDEN_PATTERNS) {
      if (regex.test(lineText)) {
        violations.push({ file: relPath, line: index + 1, pattern: label, text: lineText.trim() });
      }
    }
  });
  return violations;
}

function toPosix(p: string): string {
  return sep === "/" ? p : p.split(sep).join("/");
}

function walk(repoRoot: string, dir: string, out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return;
    throw error;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!isSkippedDir(toPosix(relative(repoRoot, full)))) walk(repoRoot, full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
}

/** Scans the repository for forbidden wall-clock reads. Missing scan roots are skipped. */
export function scanRepoForWallClockReads(repoRoot: string): ClockViolation[] {
  const files: string[] = [];
  for (const root of SCAN_ROOTS) walk(repoRoot, join(repoRoot, root), files);
  const violations: ClockViolation[] = [];
  for (const full of files.sort()) {
    const relPath = toPosix(relative(repoRoot, full));
    if (!isScannable(relPath) || isAllowlisted(relPath)) continue;
    violations.push(...checkSource(relPath, readFileSync(full, "utf8")));
  }
  return violations;
}

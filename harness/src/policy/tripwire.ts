/**
 * Commercial-content tripwire matcher (DR-0014 D5 PRD publication; used by
 * harness/test/policy/repoSafety.test.ts).
 *
 * The tripwire phrases are themselves commercial content, so the repository
 * holds only their SHA-256 digests; the owner keeps the plain-text list
 * privately. Matching:
 *
 * | Step | Rule |
 * |---|---|
 * | Normalise | Unicode NFKC, lower case, and every run of characters other than letters and digits is a word break (so punctuation, Markdown emphasis, hyphens and line wraps do not hide a phrase) |
 * | Digest | SHA-256 hex of the normalised words joined by single spaces |
 * | Scan | Every window of 2 to 4 consecutive words is digested, plus the same window with one trailing "s" removed from its last word, so plurals are caught |
 * | Report | The line where the window starts and the matching digest, never the phrase |
 *
 * Short phrases can be recovered from their digests with a dictionary search,
 * so this keeps the list from casual readers; it does not make it secret.
 */

import { hash } from "node:crypto";

export const MIN_WINDOW_WORDS = 2;
export const MAX_WINDOW_WORDS = 4;

const WORD = /[\p{L}\p{N}]+/gu;

/** The normalised words of a text. */
export function normaliseWords(text: string): string[] {
  return text.normalize("NFKC").toLowerCase().match(WORD) ?? [];
}

/**
 * The tripwire digest of a phrase of 2 to 4 words. The owner uses this to add
 * a phrase to the list without committing it.
 */
export function tripwireDigest(phrase: string): string {
  const words = normaliseWords(phrase);
  if (words.length < MIN_WINDOW_WORDS || words.length > MAX_WINDOW_WORDS) {
    throw new RangeError(`a tripwire phrase must have ${String(MIN_WINDOW_WORDS)} to ${String(MAX_WINDOW_WORDS)} words, not ${String(words.length)}`);
  }
  return hash("sha256", words.join(" "), "hex");
}

export interface TripwireMatch {
  /** 1-based line on which the matching window starts. */
  line: number;
  /** The digest that matched. */
  digest: string;
}

/** Finds every window of `text` whose digest is in `digests`, once per line and digest. */
export function findTripwireDigests(text: string, digests: ReadonlySet<string>): TripwireMatch[] {
  const normalised = text.normalize("NFKC").toLowerCase();
  const words: string[] = [];
  const lines: number[] = [];
  let line = 1;
  let cursor = 0;
  for (const match of normalised.matchAll(WORD)) {
    for (let i = cursor; i < match.index; i++) {
      if (normalised.charCodeAt(i) === 10) line++;
    }
    cursor = match.index + match[0].length;
    words.push(match[0]);
    lines.push(line);
  }

  const seen = new Set<string>();
  const matches: TripwireMatch[] = [];
  for (let start = 0; start < words.length; start++) {
    let window = words[start] ?? "";
    for (let size = 2; size <= MAX_WINDOW_WORDS && start + size <= words.length; size++) {
      window += ` ${words[start + size - 1] ?? ""}`;
      if (size < MIN_WINDOW_WORDS) continue;
      const candidates = window.endsWith("s") ? [window, window.slice(0, -1)] : [window];
      for (const candidate of candidates) {
        const digest = hash("sha256", candidate, "hex");
        if (!digests.has(digest)) continue;
        const startLine = lines[start] ?? 1;
        const key = `${String(startLine)}:${digest}`;
        if (seen.has(key)) continue;
        seen.add(key);
        matches.push({ line: startLine, digest });
      }
    }
  }
  return matches;
}

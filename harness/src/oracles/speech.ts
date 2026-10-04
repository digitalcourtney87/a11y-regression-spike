/**
 * Matching expectations against NVDA's queued speech (the relay tap; DR-0011,
 * DR-0022). The speech normaliser (HANDOFF R6, developed on the dev split
 * only) renders an expected text as NVDA speaks it before comparing: symbols
 * that NVDA speaks at its default punctuation level become their names ("/"
 * is "slash"), then both sides are reduced to lower-cased letters and digits
 * and compared by containment, as P11 compares canary speech (`speechKey`).
 *
 * States are matched as NVDA's en-GB state labels, word by word, so that
 * "not checked" is not read as "checked".
 */
import { NVDA_ROLE_WORDS } from "../runner/goals.ts";
import { speechKey } from "../runner/outcome.ts";
import type { OracleRules } from "./rules.ts";

/** An expected text as NVDA would speak it, before `speechKey`. */
export function nvdaRendering(text: string, rules: OracleRules): string {
  let out = "";
  for (const ch of text) {
    const name = rules.symbols[ch];
    out += name === undefined ? ch : ` ${name} `;
  }
  return out;
}

/** Whether an utterance contains the expected text as NVDA speaks it (an empty expectation always matches). */
export function spokenContains(utterance: string, expected: string, rules: OracleRules): boolean {
  const wanted = speechKey(nvdaRendering(expected, rules));
  return wanted === "" || speechKey(utterance).includes(wanted);
}

/** NVDA's spoken word for a role (en-GB), or the role itself; "" for roles NVDA does not speak (option). */
export function roleWord(role: string): string {
  return NVDA_ROLE_WORDS[role] ?? role;
}

/** Whether the role's spoken word occurs in the utterances. */
export function roleSpoken(utterances: readonly string[], role: string): boolean {
  const word = speechKey(roleWord(role));
  return word === "" || utterances.some((u) => speechKey(u).includes(word));
}

function words(text: string): string[] {
  return text.toLowerCase().normalize("NFKC").split(/[^\p{L}\p{N}]+/u).filter((w) => w !== "");
}

/** Whether `phrase` occurs as consecutive words in `text`, not directly preceded by one of `negations`. */
export function phraseSpoken(text: string, phrase: string, negations: readonly string[] = []): boolean {
  const ws = words(text);
  const ps = words(phrase);
  if (ps.length === 0) return false;
  for (let i = 0; i + ps.length <= ws.length; i++) {
    if (!ps.every((p, j) => ws[i + j] === p)) continue;
    const before = i > 0 ? ws[i - 1] : undefined;
    if (before !== undefined && negations.includes(before)) continue;
    return true;
  }
  return false;
}

/**
 * Whether NVDA's speech conveys `state=value`. A true value needs the state's
 * label (not negated). A false value needs its negative label where NVDA has
 * one ("not checked", "collapsed"), so silence does not pass; where NVDA has
 * none (required, invalid, unavailable, busy), it needs the positive label's
 * absence, which is how NVDA conveys those states as false. Null when the
 * state has no NVDA label (the expectation is then not judgeable from speech).
 */
export function stateSpoken(utterances: readonly string[], state: string, value: string, rules: OracleRules): boolean | null {
  const phrases = rules.states[state];
  if (phrases === undefined) return null;
  const text = utterances.join(" • ");
  const positive = phraseSpoken(text, phrases.true, phrases.negations);
  if (value === "true") return positive;
  if (value === "false") return phrases.false !== undefined ? phraseSpoken(text, phrases.false) : !positive;
  return null;
}

/**
 * Canary outcomes from the relay tap's record (DR-0011 D2; DR-0022 D13: what
 * NVDA queues plus global cancels, not audio). Pure, so it is unit-tested.
 *
 * Gating canaries (K1–K5) give PASS or FAIL for G1. Record-only canaries
 * (K6, K7) give observations only (D4). Validity is decided elsewhere, from
 * pre-outcome checks only (validity.ts; D12).
 */
import type { TapEvent } from "../adapters/relayTap.ts";
import type { CanarySpec } from "./canaries.ts";
import { FILL_DELAY_MS } from "./canaries.ts";

type Speak = Extract<TapEvent, { kind: "speak" }>;

export function normaliseSpeech(text: string): string {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

export interface UtteranceView {
  text: string;
  /** Receipt time relative to activation (ms). */
  atMs: number;
  priority: string | null;
}

export interface GatingOutcome {
  kind: "gating";
  verdict: "PASS" | "FAIL";
  matched: UtteranceView | null;
  /** True when a matching utterance arrived after the deadline. */
  late: boolean;
}

export interface RecordOutcome {
  kind: "record";
  /** The canary's own text was queued. */
  announced: boolean;
  /** Priority of the first utterance carrying the text. */
  priority: string | null;
  firstAtMs: number | null;
  /** Global cancels after the update (activation key's cancel excluded). */
  cancelsAfterUpdate: number;
  /** K7: whether the polite text was queued before the focused control's speech. */
  politeBeforeFocus: boolean | null;
  /** K7: the text of the focused control's first utterance, if any. */
  focusSpeech: string | null;
}

export type CanaryOutcome = GatingOutcome | RecordOutcome;

function view(event: Speak, activationT: number): UtteranceView {
  return { text: event.text, atMs: (event.t - activationT) / 1e6, priority: event.priority };
}

/**
 * Evaluates one attempt. `events` are the tap events of the observation
 * window; `activationT` is the QPC time (ns) just before activation.
 */
export function evaluateAttempt(spec: CanarySpec, events: readonly TapEvent[], activationT: number): CanaryOutcome {
  const speaks = events.filter((e): e is Speak => e.kind === "speak" && e.t >= activationT);
  if (spec.gating) {
    const expectation = spec.expectation;
    if (expectation === undefined) throw new Error(`gating canary ${spec.itemId} has no expectation`);
    const matches = speaks.filter((e) => expectation.pattern.test(normaliseSpeech(e.text)));
    const inTime = matches.find((e) => (e.t - activationT) / 1e6 <= expectation.deadlineMs);
    return {
      kind: "gating",
      verdict: inTime === undefined ? "FAIL" : "PASS",
      matched: inTime === undefined ? (matches[0] === undefined ? null : view(matches[0], activationT)) : view(inTime, activationT),
      late: inTime === undefined && matches.length > 0,
    };
  }
  const phrase = normaliseSpeech(spec.phrase ?? "");
  const updateT = activationT + (FILL_DELAY_MS - 100) * 1e6;
  const carrying = speaks.filter((e) => phrase !== "" && normaliseSpeech(e.text).includes(phrase));
  const first = carrying[0];
  const cancels = events.filter((e) => e.kind === "cancel" && e.t >= updateT).length;
  let politeBeforeFocus: boolean | null = null;
  let focusSpeech: string | null = null;
  if (spec.canary === "K7a" || spec.canary === "K7b") {
    const focusPattern = spec.canary === "K7a" ? /k7a target button/ : /k7b text field/;
    const focus = speaks.find((e) => focusPattern.test(normaliseSpeech(e.text)));
    focusSpeech = focus?.text ?? null;
    politeBeforeFocus = first !== undefined && (focus === undefined || first.t <= focus.t);
  }
  return {
    kind: "record",
    announced: first !== undefined,
    priority: first?.priority ?? null,
    firstAtMs: first === undefined ? null : (first.t - activationT) / 1e6,
    cancelsAfterUpdate: cancels,
    politeBeforeFocus,
    focusSpeech,
  };
}

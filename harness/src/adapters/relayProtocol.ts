/**
 * NVDA Remote Access relay protocol, as the receive-only relay tap reads it
 * (DR-0011 D2 Speech capture; HANDOFF §8.1). This module implements the wire
 * protocol only; it never imports NVDA code (HANDOFF §4 rule 10).
 *
 * Wire format (NVDA release-2026.2 `_remoteClient/serializer.py`): UTF-8 JSON
 * objects separated by "\n". A speech message is
 * `{"type": "speak", "sequence": [...], "priority": 0|1|2}`, where each
 * sequence item is a string or `[className, fields]` for a speech command,
 * and the priority is NVDA's `SpeechPriority` (0 NORMAL, 1 NEXT, 2 NOW). It is
 * sent when NVDA queues the sequence (`pre_speechQueued`), not when audio
 * plays. A global cancel is `{"type": "cancel"}` (`speechCanceled`).
 */

/** The only two messages the tap ever sends (D2: receive-only). */
export const JOIN_MESSAGE = `${JSON.stringify({ type: "join", connection_type: "master", channel: "guidepup" })}\n`;
export const PROTOCOL_MESSAGE = `${JSON.stringify({ type: "protocol_version", version: 2 })}\n`;

export type SpeechPriorityName = "NORMAL" | "NEXT" | "NOW";

const PRIORITY_NAMES: readonly SpeechPriorityName[] = ["NORMAL", "NEXT", "NOW"];

/** Maps NVDA's numeric `SpeechPriority` to its name; null when absent or unknown. */
export function priorityName(value: unknown): SpeechPriorityName | null {
  if (typeof value === "number" && Number.isInteger(value)) return PRIORITY_NAMES[value] ?? null;
  if (typeof value === "string" && (PRIORITY_NAMES as readonly string[]).includes(value.toUpperCase())) {
    return value.toUpperCase() as SpeechPriorityName;
  }
  return null;
}

/**
 * The text of a speech sequence: its string items, trimmed, with internal
 * whitespace collapsed, joined by single spaces. Speech commands are skipped.
 */
export function sequenceText(sequence: unknown): string {
  if (!Array.isArray(sequence)) return "";
  const parts: string[] = [];
  for (const item of sequence) {
    if (typeof item !== "string") continue;
    const part = item.trim().replace(/\s+/g, " ");
    if (part !== "") parts.push(part);
  }
  return parts.join(" ");
}

/** The class names of the speech commands in a sequence, in order. */
export function sequenceCommands(sequence: unknown): string[] {
  if (!Array.isArray(sequence)) return [];
  const names: string[] = [];
  for (const item of sequence) {
    if (Array.isArray(item) && typeof item[0] === "string") names.push(item[0]);
  }
  return names;
}

/** One relay message as the tap records it. `t` is the QPC receipt time in ns (D1). */
export type TapMessage =
  | { kind: "speak"; t: number; text: string; priority: SpeechPriorityName | null; commands: string[] }
  | { kind: "cancel"; t: number }
  | { kind: "pause"; t: number; paused: boolean }
  | { kind: "joined"; t: number }
  | { kind: "other"; t: number; type: string };

/** Parses one relay line; returns null for blank or malformed lines. */
export function parseRelayLine(line: string, t: number): TapMessage | null {
  if (line.trim() === "") return null;
  let message: unknown;
  try {
    message = JSON.parse(line);
  } catch {
    return null;
  }
  if (typeof message !== "object" || message === null) return null;
  const record = message as Record<string, unknown>;
  const type = typeof record.type === "string" ? record.type : "";
  switch (type) {
    case "speak":
      return { kind: "speak", t, text: sequenceText(record.sequence), priority: priorityName(record.priority), commands: sequenceCommands(record.sequence) };
    case "cancel":
      return { kind: "cancel", t };
    case "pause_speech":
      return { kind: "pause", t, paused: record.switch === true };
    case "channel_joined":
      return { kind: "joined", t };
    default:
      return { kind: "other", t, type: type === "" ? "unknown" : type };
  }
}

/**
 * Splits a byte stream into newline-terminated lines. Unlike Guidepup's client,
 * which parses each TLS chunk as one message and so drops messages that share
 * a chunk or span chunks, this keeps a partial line until its newline arrives.
 */
export class LineFramer {
  #buffer = "";

  /** Appends a chunk and returns the complete lines it finishes, without their newlines. */
  push(chunk: string): string[] {
    this.#buffer += chunk;
    const lines = this.#buffer.split("\n");
    this.#buffer = lines.pop() ?? "";
    return lines.map((line) => line.replace(/\r$/, ""));
  }

  /** The unterminated remainder, if any. */
  get pending(): string {
    return this.#buffer;
  }
}

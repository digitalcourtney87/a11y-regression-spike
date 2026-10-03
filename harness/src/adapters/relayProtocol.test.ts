import { describe, expect, test } from "vitest";

import { JOIN_MESSAGE, LineFramer, parseRelayLine, priorityName, PROTOCOL_MESSAGE, sequenceCommands, sequenceText } from "./relayProtocol.ts";

describe("outbound messages (D2: receive-only)", () => {
  test("are exactly join and protocol_version, newline-terminated", () => {
    expect(JSON.parse(JOIN_MESSAGE)).toEqual({ type: "join", connection_type: "master", channel: "guidepup" });
    expect(JSON.parse(PROTOCOL_MESSAGE)).toEqual({ type: "protocol_version", version: 2 });
    expect(JOIN_MESSAGE.endsWith("\n") && PROTOCOL_MESSAGE.endsWith("\n")).toBe(true);
  });
});

describe("priorityName", () => {
  test("maps NVDA's SpeechPriority numbers", () => {
    expect([0, 1, 2].map(priorityName)).toEqual(["NORMAL", "NEXT", "NOW"]);
  });
  test("returns null for absent or unknown values", () => {
    expect(priorityName(null)).toBeNull();
    expect(priorityName(3)).toBeNull();
    expect(priorityName(1.5)).toBeNull();
  });
});

describe("sequence helpers", () => {
  const sequence = [["LangChangeCommand", { lang: "en_GB" }], "  Probe   anchor ", "button", ["EndUtteranceCommand", {}], ""];
  test("sequenceText joins the string items", () => {
    expect(sequenceText(sequence)).toBe("Probe anchor button");
  });
  test("sequenceCommands lists the command class names", () => {
    expect(sequenceCommands(sequence)).toEqual(["LangChangeCommand", "EndUtteranceCommand"]);
  });
  test("non-arrays give empty results", () => {
    expect(sequenceText("x")).toBe("");
    expect(sequenceCommands(undefined)).toEqual([]);
  });
});

describe("parseRelayLine", () => {
  test("parses a speak message with its priority", () => {
    const line = JSON.stringify({ type: "speak", sequence: [["LangChangeCommand", { lang: "en_GB" }], "Saved"], priority: 1 });
    expect(parseRelayLine(line, 42)).toEqual({ kind: "speak", t: 42, text: "Saved", priority: "NEXT", commands: ["LangChangeCommand"] });
  });
  test("parses cancel, pause and channel_joined", () => {
    expect(parseRelayLine('{"type":"cancel"}', 1)).toEqual({ kind: "cancel", t: 1 });
    expect(parseRelayLine('{"type":"pause_speech","switch":true}', 2)).toEqual({ kind: "pause", t: 2, paused: true });
    expect(parseRelayLine('{"type":"channel_joined","channel":"guidepup"}', 3)).toEqual({ kind: "joined", t: 3 });
  });
  test("keeps other message types by name", () => {
    expect(parseRelayLine('{"type":"wave","fileName":"x.wav"}', 4)).toEqual({ kind: "other", t: 4, type: "wave" });
  });
  test("ignores blank and malformed lines", () => {
    expect(parseRelayLine("", 5)).toBeNull();
    expect(parseRelayLine("{not json", 5)).toBeNull();
    expect(parseRelayLine("42", 5)).toBeNull();
  });
});

describe("LineFramer", () => {
  test("splits several messages in one chunk", () => {
    const framer = new LineFramer();
    expect(framer.push('{"type":"cancel"}\n{"type":"speak","sequence":["a"]}\n')).toEqual(['{"type":"cancel"}', '{"type":"speak","sequence":["a"]}']);
    expect(framer.pending).toBe("");
  });
  test("joins a message that spans chunks", () => {
    const framer = new LineFramer();
    expect(framer.push('{"type":"spe')).toEqual([]);
    expect(framer.pending).toBe('{"type":"spe');
    expect(framer.push('ak","sequence":["b"]}\r\n')).toEqual(['{"type":"speak","sequence":["b"]}']);
  });
});

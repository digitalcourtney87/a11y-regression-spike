import { describe, expect, test } from "vitest";

import { PlatformEventSchema } from "../schema/schemas.ts";
import { parseListenerOutput, toPlatformEvent } from "./listener.ts";

const LINE = '{"t":123456789,"channel":"IA2","event":"IA2_EVENT_TEXT_INSERTED","eventId":286,"hwndClass":"Chrome_RenderWidgetHostHWND","idObject":-4,"idChild":-17,"role":"grouping","automationId":"live","liveSetting":"polite"}';

describe("parseListenerOutput", () => {
  test("parses JSON lines and counts malformed ones", () => {
    const out = parseListenerOutput(`${LINE}\r\n\nnot json\n{"t":1}\n`);
    expect(out.events).toHaveLength(1);
    expect(out.events[0]).toMatchObject({ t: 123456789, event: "IA2_EVENT_TEXT_INSERTED", automationId: "live" });
    expect(out.malformed).toBe(2);
  });
});

describe("toPlatformEvent", () => {
  test("keeps the evidence-schema fields and drops listener-only ones", () => {
    const [event] = parseListenerOutput(LINE).events;
    if (event === undefined) throw new Error("no event");
    const mapped = toPlatformEvent(event);
    expect(mapped).not.toHaveProperty("idObject");
    expect(mapped).not.toHaveProperty("diagnostic");
    expect(PlatformEventSchema.safeParse(mapped).success).toBe(true);
  });
});

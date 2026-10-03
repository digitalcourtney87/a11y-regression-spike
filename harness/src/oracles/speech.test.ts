import { describe, expect, test } from "vitest";

import { oracleRules } from "./rules.ts";
import { nvdaRendering, phraseSpoken, roleSpoken, spokenContains, stateSpoken } from "./speech.ts";

const rules = oracleRules();

describe("the speech normaliser", () => {
  test("renders symbols NVDA speaks at its default level", () => {
    expect(nvdaRendering("Posts from /custom2", rules)).toBe("Posts from  slash custom2");
    expect(nvdaRendering("Q&A", rules)).toBe("Q and A");
    expect(nvdaRendering("a-b (c)", rules)).toBe("a-b (c)");
  });

  test("matches an expected text with a symbol against NVDA's speech", () => {
    expect(spokenContains("main landmark Posts from slash custom 2 heading level 1", "Posts from /custom2", rules)).toBe(true);
    expect(spokenContains("main landmark Posts heading level 1", "Posts from /custom2", rules)).toBe(false);
    expect(spokenContains("CANCEL button", "Cancel", rules)).toBe(true);
  });

  test("role words", () => {
    expect(roleSpoken(["bullet Ana graphic busy"], "img")).toBe(true);
    expect(roleSpoken(["clickable Cancel"], "button")).toBe(false);
    expect(roleSpoken(["Create not selected 14 of 14"], "option")).toBe(true);
  });
});

describe("states", () => {
  test("phrases respect negations", () => {
    expect(phraseSpoken("Show archived check box not checked", "checked", ["not"])).toBe(false);
    expect(phraseSpoken("Show archived check box checked", "checked", ["not"])).toBe(true);
    expect(phraseSpoken("invalid entry", "invalid entry")).toBe(true);
  });

  test("checked, selected and expanded", () => {
    expect(stateSpoken(["Show archived check box not checked"], "checked", "false", rules)).toBe(true);
    expect(stateSpoken(["Show archived check box checked"], "checked", "false", rules)).toBe(false);
    expect(stateSpoken(["checked"], "checked", "true", rules)).toBe(true);
    expect(stateSpoken(["Activity tab selected 1 of 3"], "selected", "true", rules)).toBe(true);
    expect(stateSpoken(["Activity tab 1 of 3"], "selected", "true", rules)).toBe(false);
    expect(stateSpoken(["task actions menu button collapsed"], "expanded", "false", rules)).toBe(true);
    expect(stateSpoken(["menu button expanded"], "expanded", "true", rules)).toBe(true);
  });

  test("a state with no NVDA label cannot be judged", () => {
    expect(stateSpoken(["x"], "level", "2", rules)).toBeNull();
  });
});

describe("false states (PR #8 review)", () => {
  test("a state with a negative label needs it: silence is not false", () => {
    expect(stateSpoken([], "checked", "false", rules)).toBe(false);
    expect(stateSpoken(["Show archived check box"], "checked", "false", rules)).toBe(false);
    expect(stateSpoken(["menu button"], "expanded", "false", rules)).toBe(false);
  });

  test("a state NVDA conveys only when true is false when its label is absent", () => {
    expect(stateSpoken(["First name edit"], "required", "false", rules)).toBe(true);
    expect(stateSpoken(["First name edit required"], "required", "false", rules)).toBe(false);
  });
});

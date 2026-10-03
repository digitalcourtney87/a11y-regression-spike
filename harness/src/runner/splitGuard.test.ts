import { describe, expect, expectTypeOf, test } from "vitest";

import type { FreezeGuardDeps } from "../score/freezeGuard.ts";
import { FreezeGuardRefusal } from "../score/freezeGuard.ts";
import type { ExecutableItem } from "./splitGuard.ts";
import { assertItemExecutable, ItemExecutionRefusal } from "./splitGuard.ts";

const H1 = "d".repeat(64);
const H2 = "e".repeat(64);

function throwing(): never {
  throw new Error("must not be called");
}

function deps(tags: Record<string, string>, hash: string): FreezeGuardDeps {
  return {
    listFreezeTags: () => Object.keys(tags),
    readTagMessage: (tag) => {
      const message = tags[tag];
      if (message === undefined) throw new Error(`no tag ${tag}`);
      return message;
    },
    computeHash: () => hash,
  };
}

const neverCalled: FreezeGuardDeps = { listFreezeTags: throwing, readTagMessage: throwing, computeHash: throwing };
const unfrozen = deps({}, H1);
const frozen = deps({ "protocol-freeze-v1": `Protocol freeze 1\n\nprotocol-sha256: ${H1}` }, H1);
const drifted = deps({ "protocol-freeze-v1": `protocol-sha256: ${H1}` }, H2);

function refusal(run: () => unknown): ItemExecutionRefusal {
  try {
    run();
  } catch (error) {
    expect(error).toBeInstanceOf(ItemExecutionRefusal);
    return error as ItemExecutionRefusal;
  }
  throw new Error("expected a refusal");
}

describe("assertItemExecutable (hard rule 5, DR-0034)", () => {
  test("takes a corpus item's id and split", () => {
    expectTypeOf<ExecutableItem>().toEqualTypeOf<{ id: string; split: "dev" | "test" }>();
  });

  test("a dev item always passes without consulting git or the hash", () => {
    expect(assertItemExecutable({ id: "item-0001", split: "dev" }, neverCalled)).toEqual({ allowed: true, split: "dev" });
  });

  test("a dev item passes with the default dependencies", () => {
    expect(assertItemExecutable({ id: "item-0001", split: "dev" })).toEqual({ allowed: true, split: "dev" });
  });

  test("a test item is refused before the freeze, naming the item and the reason", () => {
    const error = refusal(() => assertItemExecutable({ id: "item-0042", split: "test" }, unfrozen));
    expect(error).toBeInstanceOf(Error);
    expect(error.itemId).toBe("item-0042");
    expect(error.message).toMatch(/"item-0042"/);
    expect(error.message).toMatch(/no protocol freeze tag/);
    expect(error.reason).toMatch(/no protocol freeze tag/);
    expect(error.cause).toBeInstanceOf(FreezeGuardRefusal);
  });

  test("before the freeze the live hash is never computed", () => {
    const noHash: FreezeGuardDeps = { ...unfrozen, computeHash: throwing };
    expect(refusal(() => assertItemExecutable({ id: "item-0042", split: "test" }, noHash)).reason).toMatch(/no protocol freeze tag/);
  });

  test("a test item is refused when the frozen set has changed since the freeze", () => {
    expect(refusal(() => assertItemExecutable({ id: "item-0043", split: "test" }, drifted)).reason).toMatch(/does not match/);
  });

  test("a test item is refused when the hash cannot be computed (for example a dirty frozen set)", () => {
    const dirty: FreezeGuardDeps = {
      ...frozen,
      computeHash: () => {
        throw new Error("the frozen set has uncommitted or untracked changes");
      },
    };
    expect(refusal(() => assertItemExecutable({ id: "item-0044", split: "test" }, dirty)).reason).toMatch(/uncommitted or untracked/);
  });

  test("a test item passes after the freeze and returns the tag and hash", () => {
    expect(assertItemExecutable({ id: "item-0045", split: "test" }, frozen)).toEqual({
      allowed: true,
      split: "test",
      tag: "protocol-freeze-v1",
      protocolSha256: H1,
    });
  });

  test("an unknown split from untyped data is guarded as the test split (fail closed)", () => {
    const item = { id: "item-0046", split: "holdout" } as unknown as ExecutableItem;
    expect(refusal(() => assertItemExecutable(item, unfrozen)).itemId).toBe("item-0046");
  });
});

import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Check from issue #4620 and PR #4662, independent of the arm oracles.
// Pointer activation is a control; keyboard activation must advance once too.
export default async function check({ page, fresh }) {
  const header = (p) => p.locator(".ms-DatePicker-monthAndYear").first();
  const next = ".ms-DatePicker-nextMonth";
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const before = (await header(p).innerText()).trim();
    if (!before.includes("April") || !before.includes("2018")) {
      throw new Error(`Calendar precondition failed: ${before}`);
    }
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 60; i++) {
        await p.keyboard.press("Tab");
        reached = await p.evaluate((selector) => document.activeElement?.matches(selector) === true, next);
        if (reached) break;
      }
      if (!reached) throw new Error("Next month was not keyboard reachable");
      await p.keyboard.press("Space");
    } else {
      await p.locator(next).first().click();
    }
    await p.waitForTimeout(100);
    const after = (await header(p).innerText()).trim();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "May 2018", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseMayReachedAt: reachedAt, holds: after.includes("May") && after.includes("2018"), detail: `${before} -> ${after} (${keyboard ? "one Space press" : "one pointer click"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

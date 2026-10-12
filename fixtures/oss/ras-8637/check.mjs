import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Issue #8637's reported leading-zero sequence; no oracle-derived criterion.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const first = p.locator('[role="spinbutton"]').first();
    if (await p.locator("#date").innerText() !== "empty") throw new Error("Date must start empty");
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await first.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("First date segment not keyboard reachable");
    } else await first.click();
    await p.keyboard.type("01011970");
    await p.waitForTimeout(100);
    const actual = await p.locator("#date").innerText();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "1970-01-01", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseDateReachedAt: reachedAt, holds: actual === "1970-01-01", detail: `01011970 -> ${actual} (${keyboard ? "Tab" : "pointer"} to first segment; continuous typing)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

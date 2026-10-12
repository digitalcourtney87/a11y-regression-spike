import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Issue-derived task: mount the documented combobox and choose Beta by keyboard.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const opener = p.getByRole("button", { name: "Choose assignee" });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await opener.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Opener not keyboard reachable");
      await p.keyboard.press("Enter");
    } else await opener.click();
    await p.waitForTimeout(200);
    const input = p.locator("#assignee");
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.count() === 1 && await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) return { holds: false, detail: "Assignee input unreachable after documented combobox mount" };
    } else {
      if (await input.count() === 0) return { holds: false, detail: "Assignee input absent after documented combobox mount" };
      await input.click();
    }
    if (!await input.evaluate((el) => el.selectionStart === 0 && el.selectionEnd === el.value.length)) throw new Error("Input select-all setup precondition failed");
    await p.keyboard.type("Be");
    await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(200);
    const chosen = await p.locator("#chosen").textContent();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "Chosen Beta", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseChosenReachedAt: reachedAt, holds: chosen === "Chosen Beta", detail: `${chosen} (${keyboard ? "Tab" : "pointer"} entry)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Original criterion: successive keystrokes append rather than overwriting each other.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const preview = p.getByLabel("Edit text");
    const input = p.getByRole("textbox", { name: "Text", includeHidden: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Editable input not keyboard reachable");
    } else await preview.click();
    await p.waitForTimeout(200);
    if (!await input.evaluate((el) => el === document.activeElement)) throw new Error("Editable input focus precondition failed");
    if (!await input.evaluate((el) => el.selectionStart === 0 && el.selectionEnd === el.value.length)) throw new Error("Default select-all precondition failed");
    await p.keyboard.type("abc", { delay: 100 });
    await p.waitForTimeout(200);
    const value = await input.inputValue();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "Entered abc", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseEnteredReachedAt: reachedAt, holds: value === "abc", detail: `typed abc -> ${value} (${keyboard ? "Tab" : "pointer"} entry)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

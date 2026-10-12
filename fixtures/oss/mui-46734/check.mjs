import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Original46734 Enter criterion, plus issue's typing/blur control.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const input = p.getByRole("combobox", { name: "Entry", exact: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Entry input unreachable");
    } else await input.click();
    await p.keyboard.type("foobar");
    if (keyboard) await p.keyboard.press("Enter");
    else await p.getByRole("button", { name: "Finish", exact: true }).click();
    await p.waitForTimeout(200);
    const holds = await p.getByText("Chosen foobar", { exact: true }).isVisible();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "Chosen foobar", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseChosenReachedAt: reachedAt, holds, detail: `Chosen foobar=${holds} (${keyboard ? "Enter" : "blur"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

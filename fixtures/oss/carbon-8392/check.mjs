import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Original issue criterion: notification persists before its specified timeout.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const entry = p.getByRole("button", { name: "Save changes", exact: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await entry.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Entry unreachable");
      await p.keyboard.press("Enter");
    } else await entry.click();
    await p.waitForTimeout(1500);
    const holds = await p.getByText("Saved", { exact: true }).isVisible();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "Saved", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseGoalReachedAt: reachedAt, holds, detail: `Saved visible=${holds} (${keyboard ? "keyboard" : "pointer"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

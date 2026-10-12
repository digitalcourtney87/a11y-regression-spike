import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Original45049/fix45050 criterion: ArrowRight at last allowed mark must retain30, not NaN.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const slider = p.getByRole("slider", { name: "Level", exact: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await slider.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Level slider unreachable");
    } else {
      const box = await p.locator(".MuiSlider-root").boundingBox();
      if (!box) throw new Error("Slider bounds missing");
      await p.mouse.click(box.x + box.width * 0.3, box.y + box.height / 2);
    }
    const initial = await slider.getAttribute("aria-valuenow");
    if (initial !== "30") throw new Error(`Initial upper mark differs: ${initial}`);
    if (!(await slider.evaluate((el) => el === document.activeElement))) throw new Error("Slider entry not focused");
    await p.keyboard.press("ArrowRight");
    await p.waitForTimeout(200);
    const value = await slider.getAttribute("aria-valuenow");
    const holds = value === "30" && await p.getByText("Level 30", { exact: true }).isVisible();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "Level 30", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseGoalReachedAt: reachedAt, holds, detail: `Upper mark after ArrowRight=${value}` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

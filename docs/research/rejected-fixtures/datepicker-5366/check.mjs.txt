import { pruneAxTree, flattenAxTree } from "../../../harness/src/runner/axTree.ts";
import { nextIndex, lineAt } from "../../../harness/src/runner/virtualCursor.ts";
import { nodeMatchesGoal } from "../../../harness/src/runner/goals.ts";

// Original5366 criterion: selection closes a controlled-open calendar, without reopening.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const input = p.getByRole("textbox", { name: "Date", exact: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Date input unreachable");
      const start = p.getByRole("option", { name: "Choose Wednesday, February 19th, 2025", exact: true });
      let dayReached = false;
      for (let i = 0; i < 30; i++) {
        await p.keyboard.press("Tab");
        dayReached = await start.evaluate((el) => el === document.activeElement);
        if (dayReached) break;
      }
      if (!dayReached) throw new Error("Initial day not keyboard reachable");
      await p.keyboard.press("Enter");
    } else {
      await input.click();
      await p.getByRole("option", { name: "Choose Thursday, February 20th, 2025", exact: true }).click();
    }
    await p.waitForTimeout(500);
    const calendarVisible = await p.locator(".react-datepicker").isVisible();
    const closedFeedback = await p.getByText("Calendar closed", { exact: true }).isVisible();
    const session = await p.context().newCDPSession(p);
    const { nodes } = await session.send("Accessibility.getFullAXTree");
    const flat = flattenAxTree(pruneAxTree(nodes));
    let position = -1;
    let reachedAt = null;
    for (let attempt = 1; attempt <= 60; attempt++) {
      const nextLine = nextIndex(flat, position, "BROWSE_NEXT");
      if (nextLine === null) break;
      position = nextLine;
      if (lineAt(flat, position).some((i) => nodeMatchesGoal(flat[i], { name: "Calendar closed", maxAttempts: 60 }))) {
        reachedAt = attempt;
        break;
      }
    }
    await session.detach();
    return { browseGoalReachedAt: reachedAt, holds: !calendarVisible && closedFeedback, detail: `Calendar visible=${calendarVisible}; closed feedback=${closedFeedback}` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

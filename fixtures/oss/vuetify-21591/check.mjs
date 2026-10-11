// Original issue criterion: Tab opens; ArrowDown enters Item 1 without closing.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const trigger = p.getByRole("button", { name: "Test menu" });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await trigger.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Menu trigger not keyboard reachable");
    } else await trigger.hover();
    await p.waitForTimeout(400);
    if (await trigger.getAttribute("aria-expanded") !== "true") throw new Error("Menu-open precondition failed");
    if (!keyboard) {
      return { holds: await p.getByText("Item 1", { exact: true }).isVisible(), detail: "Hover exposes Item 1" };
    }
    await p.keyboard.press("ArrowDown");
    await p.waitForTimeout(400);
    const focused = await p.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    const expanded = await trigger.getAttribute("aria-expanded");
    const visible = await p.getByText("Item 1", { exact: true }).isVisible();
    return { holds: expanded === "true" && visible && focused === "Item 1", detail: `expanded=${expanded}; Item 1 visible=${visible}; focus=${focused}` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

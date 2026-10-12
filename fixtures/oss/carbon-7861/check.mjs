// Original issue's selection criterion, narrowed to first filtered option/index zero.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const input = p.locator('input:not([type="checkbox"]):not([type="hidden"])').first();
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Filterable input not keyboard reachable");
    } else await input.click();
    await p.keyboard.type("Al");
    await p.waitForTimeout(300);
    const option = p.getByRole("option", { name: "Alpha", exact: true });
    if (!await option.isVisible()) throw new Error("Filtered Alpha visibility precondition failed");
    if (keyboard) {
      await p.keyboard.press("ArrowDown");
      await p.keyboard.press("Enter");
    } else await option.click();
    await p.waitForTimeout(300);
    const chosen = await p.locator("#chosen").textContent();
    return { holds: chosen === "Chosen Alpha", detail: `${chosen} (${keyboard ? "ArrowDown/Enter" : "option click"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

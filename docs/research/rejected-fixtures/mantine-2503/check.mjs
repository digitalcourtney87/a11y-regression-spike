// Issue #2503: focusing the all-selected MultiSelect must keep feedback open.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const input = p.locator('input:not([type="hidden"])').first();
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("MultiSelect input not keyboard reachable");
    } else await p.getByRole("combobox").click();
    await p.waitForTimeout(300);
    const expanded = await p.getByRole("combobox").getAttribute("aria-expanded");
    const visible = await p.getByText("No choices", { exact: true }).isVisible();
    return { holds: expanded === "true" && visible, detail: `expanded=${expanded}, No choices visible=${visible} (${keyboard ? "Tab" : "pointer"} focus)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

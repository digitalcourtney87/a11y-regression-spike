// Original issue/fix test criterion: activating the trigger opens the named modal.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const opener = p.getByRole("button", { name: "Open details" });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await opener.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Modal trigger not keyboard reachable");
      await p.keyboard.press("Enter");
    } else await opener.click();
    await p.waitForTimeout(500);
    const dialog = p.getByRole("dialog", { name: "Details", exact: true });
    const visible = await dialog.isVisible();
    const focus = visible && await dialog.evaluate((el) => el === document.activeElement);
    return { holds: visible && focus, detail: `Details visible=${visible}; dialog focused=${focus} (${keyboard ? "Enter" : "click"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

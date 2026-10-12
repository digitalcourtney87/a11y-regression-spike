// Original732 criterion: Tab never leaves the dialog at hidden end elements.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const opener = p.getByRole("button", { name: "Open dialog", exact: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await opener.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Dialog opener unreachable");
      await p.keyboard.press("Enter");
    } else await opener.click();
    await p.waitForTimeout(200);
    const dialog = p.getByRole("dialog", { name: "Details", exact: true });
    if (!keyboard) return { holds: await dialog.isVisible(), detail: "Pointer activation opens Details" };
    const first = p.getByRole("button", { name: "First action", exact: true });
    await p.keyboard.press("Tab");
    if (!(await first.evaluate((el) => el === document.activeElement))) throw new Error("Initial first action not reached");
    await p.keyboard.press("Tab");
    if (!(await p.getByRole("button", { name: "Last action", exact: true }).evaluate((el) => el === document.activeElement))) throw new Error("Last action not reached");
    await dialog.evaluate((el) => {
      window.dialogEscapes = [];
      document.addEventListener("focusin", (event) => {
        if (!el.contains(event.target)) window.dialogEscapes.push(event.target.textContent);
      });
    });
    await p.keyboard.press("Tab");
    const wrapped = await first.evaluate((el) => el === document.activeElement);
    const escapes = await p.evaluate(() => window.dialogEscapes);
    return { holds: wrapped && escapes.length === 0, detail: `First action wrap=${wrapped}; outside focus events=${JSON.stringify(escapes)}` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

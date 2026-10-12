// Original5428 criterion: same-month arrow navigation must move actual day focus.
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
      await p.keyboard.press("ArrowDown");
      const start = p.getByRole("option", { name: "Choose Wednesday, February 19th, 2025", exact: true });
      if (!(await start.evaluate((el) => el === document.activeElement))) throw new Error("Initial selected day not focused");
      await p.keyboard.press("ArrowLeft");
    } else {
      await input.click();
      await p.getByRole("option", { name: "Choose Tuesday, February 18th, 2025", exact: true }).click();
      return { holds: await input.inputValue() === "02/18/2025", detail: `Pointer date=${await input.inputValue()}` };
    }
    await p.waitForTimeout(200);
    const focused = await p.getByRole("option", { name: "Choose Tuesday, February 18th, 2025", exact: true }).evaluate((el) => el === document.activeElement);
    return { holds: focused, detail: `February 18 actual focus=${focused}` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

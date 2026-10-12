// Issue-derived task: mount the documented combobox and choose Beta by keyboard.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const opener = p.getByRole("button", { name: "Choose assignee" });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await opener.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Opener not keyboard reachable");
      await p.keyboard.press("Enter");
    } else await opener.click();
    await p.waitForTimeout(200);
    const input = p.locator("#assignee");
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.count() === 1 && await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) return { holds: false, detail: "Assignee input unreachable after documented combobox mount" };
    } else {
      if (await input.count() === 0) return { holds: false, detail: "Assignee input absent after documented combobox mount" };
      await input.click();
    }
    await p.keyboard.press("Control+a");
    await p.keyboard.type("Be");
    await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Enter");
    await p.waitForTimeout(200);
    const chosen = await p.locator("#chosen").textContent();
    return { holds: chosen === "Chosen Beta", detail: `${chosen} (${keyboard ? "Tab" : "pointer"} entry)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

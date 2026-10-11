// Issue #22770 and fix #23031's keyboard wrap scenario.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const input = p.locator("input").first();
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Autocomplete not keyboard reachable");
    } else await input.click();
    await p.keyboard.press("Enter");
    await p.waitForTimeout(300);
    await p.keyboard.press("ArrowDown");
    await p.waitForTimeout(300);
    const current = () => p.evaluate(() => document.activeElement?.textContent?.trim() ?? "");
    const first = await current();
    if (first !== "Item 1") throw new Error(`First option precondition failed: ${first}`);
    await p.keyboard.press("ArrowUp");
    await p.waitForTimeout(300);
    const last = await current();
    return { holds: last === "Item 100", detail: `Item 1 -> ${last} (ArrowUp; ${keyboard ? "Tab" : "pointer"} entry)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

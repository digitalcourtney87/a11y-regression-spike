// Issues #27997/#27896: controlled selection must change when a row is selected.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    if (await p.locator("#selection").innerText() !== "alpha") throw new Error("Initial selection must be Alpha");
    if (keyboard) {
      let reached = false;
      const trace = [];
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        trace.push(await p.evaluate(() => {
          const el = document.activeElement;
          return { tag: el?.tagName, role: el?.getAttribute("role"), text: el?.textContent?.slice(0, 100), tabIndex: el?.tabIndex, row: el?.closest('[role="row"]')?.textContent?.slice(0, 100) };
        }));
        reached = await p.evaluate(() => document.activeElement?.closest('[role="columnheader"]')?.textContent?.trim() === "Name");
        if (reached) break;
      }
      if (!reached) throw new Error(`Grid header not keyboard reachable: ${JSON.stringify({ trace, tabbables: await p.evaluate(() => [...document.querySelectorAll("[tabindex]")].map((el) => ({ role: el.getAttribute("role"), tabIndex: el.tabIndex, text: el.textContent?.slice(0, 80) }))) })}`);
      await p.keyboard.press("ArrowDown");
      if (!await p.evaluate(() => document.activeElement?.closest('[role="row"]')?.textContent?.includes("Alpha") === true)) throw new Error("ArrowDown did not reach Alpha from header");
      await p.keyboard.press("ArrowDown");
      if (!await p.evaluate(() => document.activeElement?.closest('[role="row"]')?.textContent?.includes("Beta") === true)) throw new Error("ArrowDown did not reach Beta");
      await p.keyboard.press("Space");
    } else await p.getByRole("row").filter({ hasText: "Beta" }).click();
    await p.waitForTimeout(100);
    const beta = p.getByRole("row").filter({ hasText: "Beta" });
    const selected = await beta.getAttribute("aria-selected");
    const actual = await p.locator("#selection").innerText();
    return { holds: actual === "beta" && selected === "true", detail: `selection=${actual}, Beta aria-selected=${selected} (${keyboard ? "ArrowDown/Space" : "pointer"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

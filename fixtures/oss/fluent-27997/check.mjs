// Issues #27997/#27896: controlled selection must change when a row is selected.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    if (await p.locator("#selection").innerText() !== "alpha") throw new Error("Initial selection must be Alpha");
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await p.evaluate(() => document.activeElement?.closest('[role="row"]')?.textContent?.includes("Alpha") === true);
        if (reached) break;
      }
      if (!reached) throw new Error("First data row not keyboard reachable");
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

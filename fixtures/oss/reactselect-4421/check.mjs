// Issue #4421 / fix #4422: one ArrowDown after filtering 'o' reaches Orange.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const input = p.locator("#color");
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Select input not keyboard reachable");
    } else await p.locator(".colors__control").click();
    await p.keyboard.type("o");
    await p.waitForTimeout(300);
    const active = () => p.locator(".colors__option--is-focused").allTextContents().then((values) => values.join(""));
    const initial = await active();
    if (initial !== "Ocean") throw new Error(`Filtered Ocean precondition failed: ${initial}`);
    await p.keyboard.press("ArrowDown");
    await p.waitForTimeout(300);
    const next = await active();
    await p.keyboard.press("Enter");
    await p.waitForTimeout(300);
    const chosen = await p.locator("#chosen").textContent();
    return { holds: next === "Orange" && chosen === "Chosen Orange", detail: `Ocean -> ${next}; ${chosen} (${keyboard ? "Tab" : "pointer"} entry)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

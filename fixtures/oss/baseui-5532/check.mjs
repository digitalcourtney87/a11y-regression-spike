// Issue/fix criterion: router tabs mount and settle without the update loop.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const show = p.getByRole("button", { name: "Show tabs", exact: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await show.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Show tabs button unreachable");
      await p.keyboard.press("Enter");
    } else await show.click();
    await p.waitForTimeout(500);
    const tabs = p.getByRole("tab");
    const count = await tabs.count();
    let focused = false;
    if (count === 2 && keyboard) {
      await p.keyboard.press("Tab");
      focused = await p.getByRole("tab", { name: "Overview", exact: true }).evaluate((el) => el === document.activeElement);
    }
    return { holds: count === 2 && (!keyboard || focused), detail: `Tabs settled=${count === 2}; Overview focused=${focused} (${keyboard ? "Enter" : "click"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

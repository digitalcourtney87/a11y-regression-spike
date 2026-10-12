// Issue #23126: one Escape from default close-button focus closes passive modal.
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
      if (!reached) throw new Error("Opener not keyboard reachable");
      await p.keyboard.press("Enter");
    } else await opener.click();
    await p.waitForTimeout(500);
    const close = p.getByRole("button", { name: "Close", exact: true });
    if (!await close.evaluate((el) => el === document.activeElement)) throw new Error("Default close-button focus precondition failed");
    if (keyboard) await p.keyboard.press("Escape");
    else await close.click();
    await p.waitForTimeout(500);
    const status = await p.locator("#status").textContent();
    const visible = await p.getByRole("dialog").isVisible();
    return { holds: status === "Modal closed" && !visible, detail: `${status}; dialog visible=${visible} (${keyboard ? "one Escape" : "close click"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

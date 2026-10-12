// Original criterion: successive keystrokes append rather than overwriting each other.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard, twin = false) => {
    if (twin) await p.locator("main").evaluate((el) => { el.style.maxWidth = "480px"; });
    const preview = p.getByLabel("Edit text");
    const input = p.getByRole("textbox", { name: "Text", includeHidden: true });
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await input.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("Editable input not keyboard reachable");
    } else await preview.click();
    await p.waitForTimeout(200);
    if (!await input.evaluate((el) => el === document.activeElement)) throw new Error("Editable input focus precondition failed");
    await p.keyboard.press("Control+a");
    await p.keyboard.type("abc", { delay: 100 });
    await p.waitForTimeout(200);
    const value = await input.inputValue();
    return { holds: value === "abc", detail: `typed abc -> ${value} (${keyboard ? "Tab" : "pointer"} entry)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true), benignTwin: await scenario(await fresh(), true, true) };
}

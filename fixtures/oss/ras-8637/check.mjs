// Issue #8637's reported leading-zero sequence; no oracle-derived criterion.
export default async function check({ page, fresh }) {
  const scenario = async (p, keyboard) => {
    const first = p.locator('[role="spinbutton"]').first();
    if (await p.locator("#date").innerText() !== "empty") throw new Error("Date must start empty");
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 20; i++) {
        await p.keyboard.press("Tab");
        reached = await first.evaluate((el) => el === document.activeElement);
        if (reached) break;
      }
      if (!reached) throw new Error("First date segment not keyboard reachable");
    } else await first.click();
    await p.keyboard.type("01011970");
    await p.waitForTimeout(100);
    const actual = await p.locator("#date").innerText();
    return { holds: actual === "1970-01-01", detail: `01011970 -> ${actual} (${keyboard ? "Tab" : "pointer"} to first segment; continuous typing)` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true) };
}

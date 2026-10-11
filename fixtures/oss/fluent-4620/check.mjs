// Check from issue #4620 and PR #4662, independent of the arm oracles.
// Pointer activation is a control; keyboard activation must advance once too.
export default async function check({ page, fresh }) {
  const header = (p) => p.locator(".ms-DatePicker-monthAndYear").first();
  const next = ".ms-DatePicker-nextMonth";
  const scenario = async (p, keyboard) => {
    const before = (await header(p).innerText()).trim();
    if (!before.includes("April") || !before.includes("2018")) {
      throw new Error(`Calendar precondition failed: ${before}`);
    }
    if (keyboard) {
      let reached = false;
      for (let i = 0; i < 60; i++) {
        await p.keyboard.press("Tab");
        reached = await p.evaluate((selector) => document.activeElement?.matches(selector) === true, next);
        if (reached) break;
      }
      if (!reached) throw new Error("Next month was not keyboard reachable");
      await p.keyboard.press("Space");
    } else {
      await p.locator(next).first().click();
    }
    await p.waitForTimeout(100);
    const after = (await header(p).innerText()).trim();
    return { holds: after.includes("May") && after.includes("2018"), detail: `${before} -> ${after} (${keyboard ? "one Space press" : "one pointer click"})` };
  };
  return { pointer: await scenario(page, false), keyboard: await scenario(await fresh(), true) };
}

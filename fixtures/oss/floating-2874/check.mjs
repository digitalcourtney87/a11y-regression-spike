// Issue #2874: closing the menu returns focus to the previously focused
// button instead of the menu button. The issue's steps (click First, click
// Menu to open, click Menu to close), and from the keyboard (Tab from First,
// Enter to open, Escape to close). useRole replaces the reference's id, so
// the buttons are found by data-testid.
const MENU = '[data-testid="menu"]';
const active = (p) => p.evaluate(() => document.activeElement && document.activeElement.getAttribute("data-testid"));
export default async function check({ page, fresh }) {
  await page.click('[data-testid="first"]');
  await page.click(MENU);
  await page.waitForTimeout(200);
  const opened = await page.getByRole("menu").count();
  await page.click(MENU);
  await page.waitForTimeout(300);
  const p = await active(page);
  const k = await fresh();
  await k.focus('[data-testid="first"]');
  await k.keyboard.press("Tab");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(200);
  const kOpened = await k.getByRole("menu").count();
  await k.keyboard.press("Escape");
  await k.waitForTimeout(300);
  const q = await active(k);
  return {
    pointer: { holds: opened > 0 && p === "menu", detail: `menu opened ${String(opened > 0)}; focus on ${String(p)}` },
    keyboard: { holds: kOpened > 0 && q === "menu", detail: `menu opened ${String(kOpened > 0)}; focus on ${String(q)}` },
  };
}

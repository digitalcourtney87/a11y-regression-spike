// PR #6163 (regression from #6149): selecting an item in Select2's list with
// the Enter key no longer closes the popover. The list is opened (by a click,
// or from the keyboard with ArrowDown on the focused button), the second film
// is made active with ArrowDown and chosen with Enter; the choice must be
// made and the popover closed.
const TARGET = '[data-testid="target"]';
async function after(p) {
  await p.keyboard.press("ArrowDown");
  await p.waitForTimeout(100);
  await p.keyboard.press("Enter");
  await p.waitForTimeout(600);
  return p.evaluate(() => ({ open: document.querySelectorAll(".bp4-select-popover").length, button: document.querySelector('[data-testid="target"]')?.textContent }));
}
const ok = (s) => s.open === 0 && s.button === "Casablanca";
export default async function check({ page, fresh }) {
  await page.click(TARGET);
  await page.waitForTimeout(400);
  const a = await after(page);
  const k = await fresh();
  await k.keyboard.press("Tab");
  await k.keyboard.press("ArrowDown");
  await k.waitForTimeout(400);
  const b = await after(k);
  return { pointer: { holds: ok(a), detail: JSON.stringify(a) }, keyboard: { holds: ok(b), detail: JSON.stringify(b) } };
}

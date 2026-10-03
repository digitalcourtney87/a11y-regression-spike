// Issue #8298: the ComboBox closes while its items are navigated with the keyboard.
export default async function check({ page }) {
  await page.focus("#input");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(300);
  const open = await page.getByRole("listbox").count();
  const keyboard = { holds: open > 0, detail: `listbox open after navigation: ${String(open > 0)}` };
  return { pointer: keyboard, keyboard };
}

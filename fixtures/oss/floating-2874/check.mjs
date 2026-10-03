// Issue #2874: closing the menu returns focus to the previously focused button instead of the menu button.
export default async function check({ page, fresh }) {
  await page.click("#first");
  await page.click("#menu");
  await page.waitForTimeout(200);
  await page.click("#menu");
  await page.waitForTimeout(300);
  const p = await page.evaluate(() => document.activeElement && document.activeElement.id);
  const k = await fresh();
  await k.focus("#first");
  await k.keyboard.press("Tab");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(200);
  await k.keyboard.press("Escape");
  await k.waitForTimeout(300);
  const q = await k.evaluate(() => document.activeElement && document.activeElement.id);
  return { pointer: { holds: p === "menu", detail: `focus on #${String(p)}` }, keyboard: { holds: q === "menu", detail: `focus on #${String(q)}` } };
}

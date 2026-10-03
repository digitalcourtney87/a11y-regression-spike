// Issue #8697: a menu item link does nothing when activated with the keyboard.
export default async function check({ page, fresh }) {
  await page.click("#trigger");
  await page.getByRole("menuitem", { name: "Go to target" }).click();
  await page.waitForTimeout(300);
  const pointerHash = await page.evaluate(() => location.hash);
  const k = await fresh();
  await k.focus("#trigger");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(300);
  await k.keyboard.press("Enter");
  await k.waitForTimeout(300);
  const keyHash = await k.evaluate(() => location.hash);
  return { pointer: { holds: pointerHash === "#target", detail: `hash ${pointerHash}` }, keyboard: { holds: keyHash === "#target", detail: `hash ${keyHash}` } };
}

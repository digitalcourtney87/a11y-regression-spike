// Issue #8697: from 1.11.0, pressing Enter on a MenuItem link closes the menu
// without opening the link. The issue's steps (click "Links", press Down,
// press Enter), and a keyboard-only run (Tab to "Links", Enter, Enter); the
// page must have navigated to the first link, /adobe.
async function path(p) {
  await p.waitForTimeout(800);
  await p.waitForLoadState("load");
  return p.evaluate(() => location.pathname);
}
export default async function check({ page, fresh }) {
  await page.click("#trigger");
  await page.waitForTimeout(300);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(100);
  await page.keyboard.press("Enter");
  const a = await path(page);
  const k = await fresh();
  await k.keyboard.press("Tab");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(300);
  await k.keyboard.press("Enter");
  const b = await path(k);
  return { pointer: { holds: a === "/adobe", detail: `path ${a}` }, keyboard: { holds: b === "/adobe", detail: `path ${b}` } };
}

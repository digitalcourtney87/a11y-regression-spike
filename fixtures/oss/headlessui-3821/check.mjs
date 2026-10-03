// Issue #3821: opening a Menu nested in a MenuItem closes every menu.
export default async function check({ page, fresh }) {
  await page.click("#parent");
  await page.click("#nested");
  await page.waitForTimeout(300);
  const childPointer = await page.getByText("Child").count();
  const k = await fresh();
  await k.focus("#parent");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(200);
  await k.keyboard.press("ArrowDown");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(300);
  const childKey = await k.getByText("Child").count();
  return { pointer: { holds: childPointer > 0, detail: `nested menu open: ${String(childPointer > 0)}` }, keyboard: { holds: childKey > 0, detail: `nested menu open: ${String(childKey > 0)}` } };
}

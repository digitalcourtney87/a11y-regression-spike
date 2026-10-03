// Issue #4014: on React 19.2, Escape no longer closes the menu (stale handlers); tried over two open/close cycles.
async function cycle(p, open) {
  await open(p);
  await p.waitForTimeout(200);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(300);
  return p.getByRole("menu").count();
}
export default async function check({ page, fresh }) {
  const ptr = [];
  for (let i = 0; i < 2; i++) ptr.push(await cycle(page, (p) => p.click("#trigger")));
  const k = await fresh();
  const key = [];
  for (let i = 0; i < 2; i++) key.push(await cycle(k, async (p) => { await p.focus("#trigger"); await p.keyboard.press("Enter"); }));
  return { pointer: { holds: ptr.every((n) => n === 0), detail: `menus open after Escape: ${ptr.join(",")}` }, keyboard: { holds: key.every((n) => n === 0), detail: `menus open after Escape: ${key.join(",")}` } };
}

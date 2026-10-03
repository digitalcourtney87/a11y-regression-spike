// Issue #18484: calling focus() on a select TextField's input ref throws, so focus does not move.
async function run(p, activate) {
  await activate(p);
  await p.waitForTimeout(300);
  return p.evaluate(() => ({ error: window.__focusError, role: document.activeElement && document.activeElement.getAttribute("role") }));
}
export default async function check({ page, fresh }) {
  const a = await run(page, (p) => p.click("#go"));
  const b = await run(await fresh(), async (p) => { await p.focus("#go"); await p.keyboard.press("Enter"); });
  const ok = (s) => s.error === null && s.role === "button";
  return { pointer: { holds: ok(a), detail: JSON.stringify(a) }, keyboard: { holds: ok(b), detail: JSON.stringify(b) } };
}

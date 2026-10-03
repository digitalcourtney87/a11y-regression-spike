// Issue #18484: focusing a select TextField from its inputRef callback (the
// issue's setTimeout pattern) throws from 4.5.0, so focus does not move. Here
// the field mounts when "Edit" is activated, by a click or from the keyboard;
// focus must land on the select (role="button") with no error.
async function run(p, activate) {
  await activate(p);
  await p.waitForTimeout(500);
  return p.evaluate(() => ({ errors: window.__focusErrors, role: document.activeElement && document.activeElement.getAttribute("role") }));
}
export default async function check({ page, fresh }) {
  const a = await run(page, (p) => p.click("#edit"));
  const b = await run(await fresh(), async (p) => {
    await p.focus("#edit");
    await p.keyboard.press("Enter");
  });
  const ok = (s) => s.errors.length === 0 && s.role === "button";
  return { pointer: { holds: ok(a), detail: JSON.stringify(a) }, keyboard: { holds: ok(b), detail: JSON.stringify(b) } };
}

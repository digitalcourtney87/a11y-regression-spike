// Issue #519: from 1.6, toast.custom no longer applies role and aria attributes to the toast.
async function run(p, activate) {
  await activate(p);
  await p.waitForTimeout(500);
  return p.evaluate(() => {
    const li = document.querySelector("[data-sonner-toast]");
    return li ? { role: li.getAttribute("role"), live: li.getAttribute("aria-live"), atomic: li.getAttribute("aria-atomic") } : { missing: true };
  });
}
export default async function check({ page, fresh }) {
  const a = await run(page, (p) => p.click("#show"));
  const b = await run(await fresh(), async (p) => { await p.focus("#show"); await p.keyboard.press("Enter"); });
  const ok = (s) => s.role === "status" || s.live === "polite" || s.live === "assertive";
  return { pointer: { holds: ok(a), detail: JSON.stringify(a) }, keyboard: { holds: ok(b), detail: JSON.stringify(b) } };
}

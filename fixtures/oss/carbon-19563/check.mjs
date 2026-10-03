// Issue #19563: setting a checkbox's checked state no longer updates it (the internal input stays unchecked).
async function run(p, act) {
  await p.waitForFunction(() => customElements.get("cds-checkbox") !== undefined);
  await act(p);
  await p.waitForTimeout(300);
  return p.evaluate(() => {
    const cb = document.querySelector("cds-checkbox");
    const input = cb.shadowRoot && cb.shadowRoot.querySelector("input");
    return { host: cb.checked, input: input ? input.checked : null, aria: input ? input.getAttribute("aria-checked") : null };
  });
}
export default async function check({ page, fresh }) {
  const toggle = (p) => p.evaluate(() => { const cb = document.querySelector("cds-checkbox"); cb.checked = true; cb.checked = false; cb.checked = true; });
  const a = await run(page, toggle);
  const b = await run(await fresh(), async (p) => { await toggle(p); });
  const ok = (s) => s.input === true;
  return { pointer: { holds: ok(a), detail: JSON.stringify(a) }, keyboard: { holds: ok(b), detail: JSON.stringify(b) } };
}

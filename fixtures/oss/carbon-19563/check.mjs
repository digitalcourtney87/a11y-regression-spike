// Issue #19563: after the user ticks a cds-checkbox, setting checked = false
// in code ("clear the filters") no longer unticks it; the inner input, which
// is what assistive technology reads, stays checked. Driven by clicks (on
// the checkbox's label), and from the keyboard (Tab, Space, Tab, Enter).
async function state(p) {
  return p.evaluate(() => {
    const cb = document.querySelector("cds-checkbox");
    const input = cb.shadowRoot && cb.shadowRoot.querySelector("input");
    return { host: cb.checked, input: input ? input.checked : null };
  });
}
async function ready(p) {
  await p.waitForFunction(() => customElements.get("cds-checkbox") !== undefined);
  await p.waitForTimeout(200);
}
export default async function check({ page, fresh }) {
  await ready(page);
  // Playwright's CSS selectors pierce the open shadow root; the label toggles the inner input.
  await page.click("cds-checkbox label");
  await page.waitForTimeout(200);
  const ticked = await state(page);
  await page.click("#clear");
  await page.waitForTimeout(300);
  const a = await state(page);
  const k = await fresh();
  await ready(k);
  await k.keyboard.press("Tab");
  await k.keyboard.press("Space");
  await k.waitForTimeout(200);
  const kTicked = await state(k);
  await k.keyboard.press("Tab");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(300);
  const b = await state(k);
  const ok = (before, after) => before.input === true && after.host === false && after.input === false;
  return {
    pointer: { holds: ok(ticked, a), detail: JSON.stringify({ ticked, cleared: a }) },
    keyboard: { holds: ok(kTicked, b), detail: JSON.stringify({ ticked: kTicked, cleared: b }) },
  };
}

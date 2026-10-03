// Issue #18824: an icon-only ghost button with isSelected no longer has
// aria-pressed. The toggle is turned on by a click, and again from the
// keyboard (Tab from the button before it, then Space); after each, the
// button must report aria-pressed="true".
async function pressed(page) {
  return page.evaluate(() => {
    const b = document.querySelector("button.cds--btn--icon-only");
    return b ? b.getAttribute("aria-pressed") : "missing";
  });
}

export default async function check({ page, fresh }) {
  await page.click("button.cds--btn--icon-only");
  await page.waitForTimeout(300);
  const p = await pressed(page);
  const k = await fresh();
  await k.focus("#before");
  await k.keyboard.press("Tab");
  await k.keyboard.press("Space");
  await k.waitForTimeout(300);
  const q = await pressed(k);
  return { pointer: { holds: p === "true", detail: `aria-pressed=${String(p)}` }, keyboard: { holds: q === "true", detail: `aria-pressed=${String(q)}` } };
}

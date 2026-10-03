// Issue #36947: choose tab C inside the dropdown, then tab A; only A should be selected and shown.
async function state(p) {
  return p.evaluate(() => ({
    selected: [...document.querySelectorAll('[role="tab"]')].filter((t) => t.getAttribute("aria-selected") === "true").map((t) => t.textContent.trim()),
    shown: [...document.querySelectorAll(".tab-pane")].filter((t) => t.classList.contains("active")).map((t) => t.id),
  }));
}
export default async function check({ page, fresh }) {
  await page.click("#menu");
  await page.click("#tab-c");
  await page.click("#tab-a");
  await page.waitForTimeout(300);
  const s1 = await state(page);
  const pointer = { holds: s1.selected.join() === "A" && s1.shown.join() === "pane-a", detail: JSON.stringify(s1) };
  const k = await fresh();
  await k.focus("#menu");
  await k.keyboard.press("Enter");
  await k.keyboard.press("ArrowDown");
  await k.keyboard.press("Enter");
  await k.focus("#tab-a");
  await k.keyboard.press("Enter");
  await k.waitForTimeout(300);
  const s2 = await state(k);
  return { pointer, keyboard: { holds: s2.selected.join() === "A" && s2.shown.join() === "pane-a", detail: JSON.stringify(s2) } };
}

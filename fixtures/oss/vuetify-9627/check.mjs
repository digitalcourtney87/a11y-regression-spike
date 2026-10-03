// Issue #9627 (regression from commit fa0a893): Tab moves focus out of an
// open VDialog onto the page behind it. The dialog is opened (by a click, or
// from the keyboard: Tab to "Open dialog", Enter), then Tab is pressed eight
// times; focus must stay inside the dialog after every press.
async function tabs(p) {
  await p.waitForSelector("#card", { state: "visible" });
  await p.waitForTimeout(400);
  const outside = [];
  for (let i = 0; i < 8; i++) {
    await p.keyboard.press("Tab");
    await p.waitForTimeout(80);
    const where = await p.evaluate(() => {
      const a = document.activeElement;
      return a && a.closest(".v-dialog") ? null : a ? a.id || a.tagName : "none";
    });
    if (where !== null) outside.push(`${String(i + 1)}:${where}`);
  }
  return { holds: outside.length === 0, detail: outside.length === 0 ? "focus stayed in the dialog" : `focus outside after Tab ${outside.join(", ")}` };
}
export default async function check({ page, fresh }) {
  await page.click("#open");
  const pointer = await tabs(page);
  const k = await fresh();
  await k.focus("#before");
  await k.keyboard.press("Tab");
  await k.keyboard.press("Enter");
  const keyboard = await tabs(k);
  return { pointer, keyboard };
}

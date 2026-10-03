// Issue #5623: from 7.10.0, a controlled ComboBox does not accept typing; the
// input keeps showing the selected item. The field starts on "Apple"; after
// replacing its text with "Ban" the input must show "Ban". By pointer (click
// into the field, select its text with a triple click, type), and from the
// keyboard (Tab into the field, Control+A, type).
const value = (p) => p.evaluate(() => document.getElementById("fruit").value);
export default async function check({ page, fresh }) {
  await page.click("#fruit", { clickCount: 3 });
  await page.keyboard.type("Ban", { delay: 50 });
  await page.waitForTimeout(300);
  const a = await value(page);
  const k = await fresh();
  await k.keyboard.press("Tab");
  await k.keyboard.press("Control+a");
  await k.keyboard.type("Ban", { delay: 50 });
  await k.waitForTimeout(300);
  const b = await value(k);
  return { pointer: { holds: a === "Ban", detail: `input shows ${JSON.stringify(a)}` }, keyboard: { holds: b === "Ban", detail: `input shows ${JSON.stringify(b)}` } };
}

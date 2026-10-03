// Issue #8298: navigating past the last visible item of a scrollable ComboBox
// dropdown scrolls the window, which closes the dropdown. The issue's steps
// are keyboard steps (open, then ArrowDown past the visible items), so both
// outcomes come from the keyboard; the second run opens with the button.
async function run(p, open) {
  await open(p);
  await p.waitForTimeout(300);
  for (let i = 0; i < 15; i++) {
    await p.keyboard.press("ArrowDown");
    await p.waitForTimeout(50);
  }
  await p.waitForTimeout(300);
  const open_ = await p.getByRole("listbox").count();
  const scrollY = await p.evaluate(() => window.scrollY);
  return { holds: open_ > 0, detail: `listbox open ${String(open_ > 0)}, window scrollY ${String(scrollY)}` };
}
export default async function check({ page, fresh }) {
  const keyboard = await run(page, async (p) => {
    await p.focus("#input");
    await p.keyboard.press("ArrowDown");
  });
  const pointer = await run(await fresh(), async (p) => {
    await p.click("#input");
    await p.keyboard.press("ArrowDown");
  });
  return { pointer, keyboard };
}

// Issue #35496: open a dropdown, move into the menu with the arrow keys, press Escape;
// focus should return to the toggle. The issue's own steps are keyboard steps.
export default async function check({ page, fresh }) {
  const run = async (p) => {
    await p.focus("#toggle");
    await p.keyboard.press("Enter");
    await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Escape");
    await p.waitForTimeout(300);
    const id = await p.evaluate(() => document.activeElement && document.activeElement.id);
    return { holds: id === "toggle", detail: `focus on #${String(id)} after Escape` };
  };
  const keyboard = await run(page);
  return { pointer: keyboard, keyboard: await run(await fresh()) };
}

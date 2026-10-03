// Issue #4014: from dismissable-layer 1.1.14 on React 19.2, onEscapeKeyDown
// keeps its first-render closure. The Dialog blocks Escape while pending,
// which is true at mount and false 300 ms later; once the status reads
// "Ready", Escape must close the dialog (with the stale handler it stays
// blocked, a keyboard trap). Opened by a click, and from the keyboard.
async function run(p, open) {
  await open(p);
  await p.waitForSelector("#status");
  await p.waitForFunction(() => document.getElementById("status")?.textContent === "Ready");
  await p.waitForTimeout(200);
  await p.keyboard.press("Escape");
  await p.waitForTimeout(400);
  return p.getByRole("dialog").count();
}
export default async function check({ page, fresh }) {
  const a = await run(page, (p) => p.click("#trigger"));
  const b = await run(await fresh(), async (p) => {
    await p.focus("#trigger");
    await p.keyboard.press("Enter");
  });
  return {
    pointer: { holds: a === 0, detail: `dialogs open after Escape: ${String(a)}` },
    keyboard: { holds: b === 0, detail: `dialogs open after Escape: ${String(b)}` },
  };
}

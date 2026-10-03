// Issue #18824: an icon-only ghost button with isSelected no longer has aria-pressed.
export default async function check({ page }) {
  const pressed = await page.evaluate(() => {
    const b = document.querySelector("button");
    return b ? b.getAttribute("aria-pressed") : "missing";
  });
  const state = { holds: pressed === "true", detail: `aria-pressed=${String(pressed)}` };
  return { pointer: state, keyboard: state };
}

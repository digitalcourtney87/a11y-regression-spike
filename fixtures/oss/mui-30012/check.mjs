// Issue #30012: a disabled informational Chip (no onClick, no onDelete) is no
// longer marked aria-disabled. The chip is static and not focusable, so there
// is no interaction to drive: both outcomes are the same reading of the DOM.
export default async function check({ page }) {
  const attr = await page.evaluate(() => {
    const el = document.querySelector(".MuiChip-root");
    return el ? el.getAttribute("aria-disabled") : "missing";
  });
  const state = { holds: attr === "true", detail: `aria-disabled=${String(attr)} (static)` };
  return { pointer: state, keyboard: state };
}

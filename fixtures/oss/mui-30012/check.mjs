// Issue #30012: a disabled Chip is no longer marked aria-disabled.
export default async function check({ page }) {
  const attr = await page.evaluate(() => {
    const el = document.querySelector(".MuiChip-root");
    return el ? el.getAttribute("aria-disabled") : "missing";
  });
  const state = { holds: attr === "true", detail: `aria-disabled=${String(attr)}` };
  return { pointer: state, keyboard: state };
}

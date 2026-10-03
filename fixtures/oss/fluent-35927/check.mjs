// PR #35927 (regression from #35811): PresenceBadge is always labelled
// "available", whatever its status. Each badge's label must name its own
// status. The badges are static and not focusable, so there is no
// interaction to drive: both outcomes are the same reading of the DOM.
export default async function check({ page }) {
  const labels = await page.evaluate(() =>
    [...document.querySelectorAll("li[data-status]")].map((li) => {
      const badge = li.querySelector("[aria-label]");
      return [li.getAttribute("data-status"), badge ? badge.getAttribute("aria-label") : null];
    }),
  );
  const state = { holds: labels.length === 3 && labels.every(([status, label]) => label === status), detail: `${JSON.stringify(labels)} (static)` };
  return { pointer: state, keyboard: state };
}

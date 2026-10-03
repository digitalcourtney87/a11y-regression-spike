// PR #7796 (regression from commit 5b8befe): DocumentCard ignores props.role.
// An operator-precedence slip makes a card with a role of its own render as
// role="link" (or "button"). Each non-actionable card here asks for
// role="listitem" and must keep it. The cards are static and not focusable,
// so both outcomes are the same reading of the DOM.
export default async function check({ page }) {
  const roles = await page.evaluate(() => [...document.querySelectorAll('[role="list"] > *')].map((el) => el.getAttribute("role")));
  const state = { holds: roles.length === 2 && roles.every((r) => r === "listitem"), detail: `${JSON.stringify(roles)} (static)` };
  return { pointer: state, keyboard: state };
}

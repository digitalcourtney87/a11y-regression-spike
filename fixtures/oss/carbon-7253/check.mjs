// Issue #7233 (fixed by PR #7253, regression from PR #7029): pagination's
// icon-only buttons lost their labels. The 10.23 tooltip styles set
// display: none on a disabled icon-only button's assistive text, so the
// disabled "Previous page" button has no accessible name. The name is read
// from Chrome's accessibility tree. The button is disabled, so not
// focusable: both outcomes are the same static reading.
async function axName(page, selector) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Accessibility.enable");
  const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
  const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
  if (!nodeId) return null;
  const { nodes } = await cdp.send("Accessibility.getPartialAXTree", { nodeId, fetchRelatives: false });
  return nodes[0]?.name?.value ?? "";
}
export default async function check({ page }) {
  const back = await axName(page, "button.bx--pagination__button--backward");
  const forward = await axName(page, "button.bx--pagination__button--forward");
  const state = { holds: back === "Previous page", detail: `names: backward ${JSON.stringify(back)}, forward ${JSON.stringify(forward)} (static)` };
  return { pointer: state, keyboard: state };
}

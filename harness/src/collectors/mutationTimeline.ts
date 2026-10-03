/**
 * DOM mutation timeline for Arm B2 (HANDOFF §8.3; DR-0010 D1 for times;
 * DR-0037 for the K6 delay grading). The init script runs in every frame
 * before page scripts (Playwright `addInitScript`) and records, with
 * `performance.now()` times (mapped to QPC by the runner):
 * - node insertions and removals, and text changes;
 * - attribute changes for aria-*, role, hidden, inert and tabindex;
 * - focusin and focusout, pushState, replaceState and popstate, and title changes;
 * - live regions inserted with non-empty content.
 * `attachShadow` is patched so that shadow roots are observed too, and
 * `takeRecords()` runs before focus and history entries so records keep
 * causal order. Entries are buffered in `window.__a11yTimeline` and drained
 * by `drainTimeline` after the observation window.
 */

/** One timeline entry, as the init script records it. */
export interface TimelineEntry {
  /** performance.now() in the page (ms). */
  t: number;
  kind: "insert" | "remove" | "text" | "attr" | "focusin" | "focusout" | "history" | "title";
  /** A short descriptor: tag, #id and [role]. */
  target: string;
  /** For attr: the attribute; for history: the method; for title: the new title. */
  detail?: string;
  /** For insert: the inserted node is a live region (or contains one) with non-empty text. */
  liveWithContent?: boolean;
  /** For insert and text: whether the node is inside a live region. */
  inLive?: boolean;
}

/** The init script (a classic script string; it reads performance.now() only). */
export const TIMELINE_INIT_SCRIPT = `(() => {
  if (window.__a11yTimeline) return;
  const out = [];
  window.__a11yTimeline = out;
  const LIVE_ROLES = new Set(["status", "alert", "log", "marquee", "timer"]);
  const ATTRS = new Set(["role", "hidden", "inert", "tabindex"]);
  const now = () => performance.now();
  const describe = (node) => {
    if (!node || node.nodeType !== 1) return node && node.nodeType === 3 ? "#text" : String(node && node.nodeName);
    let d = node.tagName.toLowerCase();
    if (node.id) d += "#" + node.id;
    const role = node.getAttribute("role");
    if (role) d += "[" + role + "]";
    return d;
  };
  const isLiveRoot = (el) => el && el.nodeType === 1 && ((el.hasAttribute("aria-live") && el.getAttribute("aria-live") !== "off") || LIVE_ROLES.has(el.getAttribute("role")));
  const inLive = (node) => {
    for (let n = node && node.nodeType === 1 ? node : node && node.parentElement; n; n = n.parentElement) if (isLiveRoot(n)) return true;
    return false;
  };
  const liveWithContent = (node) => {
    if (node.nodeType !== 1) return false;
    const roots = isLiveRoot(node) ? [node] : Array.from(node.querySelectorAll("[aria-live],[role=status],[role=alert],[role=log],[role=marquee],[role=timer]")).filter(isLiveRoot);
    return roots.some((r) => (r.textContent || "").trim() !== "");
  };
  const record = (records) => {
    const t = now();
    for (const m of records) {
      if (m.type === "childList") {
        for (const n of m.addedNodes) out.push({ t, kind: "insert", target: describe(n), liveWithContent: liveWithContent(n), inLive: inLive(m.target) });
        for (const n of m.removedNodes) out.push({ t, kind: "remove", target: describe(n) });
        if (m.target && m.target.nodeName === "TITLE") out.push({ t, kind: "title", target: "title", detail: document.title });
      } else if (m.type === "characterData") {
        const parent = m.target.parentElement;
        if (parent && parent.nodeName === "TITLE") out.push({ t, kind: "title", target: "title", detail: document.title });
        else out.push({ t, kind: "text", target: describe(parent), inLive: inLive(parent) });
      } else if (m.type === "attributes") {
        const name = m.attributeName || "";
        if (name.startsWith("aria-") || ATTRS.has(name)) out.push({ t, kind: "attr", target: describe(m.target), detail: name });
      }
    }
  };
  const observer = new MutationObserver(record);
  const options = { childList: true, subtree: true, characterData: true, attributes: true };
  const flush = () => record(observer.takeRecords());
  const start = () => observer.observe(document, options);
  if (document) start();
  const attachShadow = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    const root = attachShadow.call(this, init);
    observer.observe(root, options);
    return root;
  };
  addEventListener("focusin", (e) => { flush(); out.push({ t: now(), kind: "focusin", target: describe(e.target) }); }, true);
  addEventListener("focusout", (e) => { flush(); out.push({ t: now(), kind: "focusout", target: describe(e.target) }); }, true);
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method];
    history[method] = function (...args) { flush(); out.push({ t: now(), kind: "history", target: "history", detail: method }); return original.apply(this, args); };
  }
  addEventListener("popstate", () => { flush(); out.push({ t: now(), kind: "history", target: "history", detail: "popstate" }); }, true);
  window.__a11yTimelineFlush = flush;
})();`;

/** Script that flushes pending records and returns and clears the buffer. */
export const TIMELINE_DRAIN_SCRIPT = `(() => {
  if (window.__a11yTimelineFlush) window.__a11yTimelineFlush();
  const out = window.__a11yTimeline || [];
  return out.splice(0, out.length);
})()`;

/**
 * K6 grading (DR-0037): the delay between a live region's insertion and the
 * first text change inside it, in ms; null if it was inserted already
 * populated or never filled within the entries given.
 */
export function insertionToContentMs(entries: readonly TimelineEntry[], target: string): number | null {
  const insert = entries.find((e) => e.kind === "insert" && e.target === target);
  if (insert === undefined || insert.liveWithContent === true) return null;
  const fill = entries.find((e) => (e.kind === "text" || e.kind === "insert") && e.t >= insert.t && e !== insert && e.inLive === true);
  return fill === undefined ? null : fill.t - insert.t;
}

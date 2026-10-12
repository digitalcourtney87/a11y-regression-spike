// Owned known-answer pages for the approved P42 registered evaluation (DR-0120).
// Registered with their predictions before cursor v2 exists; never executed before the single dispatch.
const scenario = new URLSearchParams(location.search).get("case");
const page = document.getElementById("page");
const pages = {
  "marker-list": '<h1>Marker list</h1><ol role="listbox" aria-label="Route stops"><li role="option" aria-selected="false">North gate</li><li role="option" aria-selected="false">River bridge</li><li role="option" aria-selected="false">Market square</li></ol><p>Marker target reached</p>',
  "generated-text": '<h1>Generated text</h1><div class="note">Check the second panel before continuing.</div><p>Generated target reached</p>',
  "ignored-wrappers": '<h1>Wrapped text</h1><p><span role="none"><span role="presentation">Wrapped sentence one.</span></span> <span role="none">Wrapped sentence two.</span></p><p>Wrapper target reached</p>',
  "plain-page": '<h1>Plain page</h1><p>Plain paragraph one.</p><button type="button">Plain action</button><h2>Plain section</h2><p>Plain final line.</p>',
  "static-label": '<h1>Static label</h1><label for="field">Delivery note</label><input id="field">',
  "focus-hidden-label": '<h1>Focus-hidden label</h1><div class="field"><label class="resting" for="field">Billing code</label><label class="floating" for="field" aria-hidden="true">Billing code</label><input id="field"></div>',
  "delayed-label": '<h1>Delayed label</h1><label id="later">Account reference</label><input id="field">',
  "unnamed-wrapper": '<h1>Unnamed wrapper</h1><div role="textbox"><label for="field">Item name</label><input id="field"></div>',
};
if (Object.hasOwn(pages, scenario)) {
  page.innerHTML = pages[scenario];
  if (scenario === "delayed-label") {
    document.getElementById("field").addEventListener("focus", () => {
      setTimeout(() => { document.getElementById("later").htmlFor = "field"; }, 1100);
    }, { once: true });
  }
} else {
  page.textContent = "Unknown registered case";
}

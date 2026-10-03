// React 16.7 predates the automatic JSX runtime, so this fixture calls
// createElement directly.
import { createElement as h } from "react";
import { render } from "react-dom";
import { DocumentCard, DocumentCardTitle } from "office-ui-fabric-react/lib/DocumentCard";

// A list of non-actionable document cards, each given its own role.
const docs = ["Quarterly report", "Product roadmap"];
render(
  h(
    "main",
    { style: { padding: "2rem" } },
    h("div", { role: "list", "aria-label": "Recent documents" }, ...docs.map((title) => h(DocumentCard, { key: title, role: "listitem" }, h(DocumentCardTitle, { title })))),
  ),
  document.getElementById("root"),
);

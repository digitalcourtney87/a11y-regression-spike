import "carbon-components/css/carbon-components.min.css";
import { render } from "react-dom";
import { Pagination } from "carbon-components-react";

// The issue's Pagination on its first page, so "Previous page" is a disabled
// icon-only button whose name comes from its assistive-text span. The
// package under test is carbon-components, which supplies the CSS.
render(
  <main style={{ padding: "4rem 2rem" }}>
    <Pagination page={1} pageSize={10} pageSizes={[10, 20, 30]} totalItems={45} backwardText="Previous page" forwardText="Next page" />
  </main>,
  document.getElementById("root"),
);

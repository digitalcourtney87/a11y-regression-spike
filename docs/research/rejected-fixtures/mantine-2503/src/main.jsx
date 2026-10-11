import { useState } from "react";
import { render } from "react-dom";
import { MantineProvider, MultiSelect } from "@mantine/core";

const data = [{ value: "alpha", label: "Alpha" }, { value: "beta", label: "Beta" }];
// Issue #2503 / fix #2602: all-selected feedback and dropdown-handler rerenders.
function App() {
  const [values, setValues] = useState(["alpha", "beta"]);
  const [status, setStatus] = useState("closed");
  return <main>
    <h1>MultiSelect feedback</h1>
    <MultiSelect label="Options" data={data} value={[...values]} onChange={setValues} nothingFound="No choices" onDropdownOpen={() => setStatus("open")} onDropdownClose={() => setStatus("closed")} />
    <p id="status">{status}</p>
  </main>;
}
render(<MantineProvider withGlobalStyles withNormalizeCSS><App /></MantineProvider>, document.getElementById("root"));

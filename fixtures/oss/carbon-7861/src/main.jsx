import React, { useState } from "react";
import ReactDOM from "react-dom";
import { MultiSelect } from "carbon-components-react";
import "carbon-components/css/carbon-components.css";
import "./local.css";

// Issue #7861 / fix #8178: keyboard selection must accept the first filtered item.
const items = [{ id: "alpha", text: "Alpha" }, { id: "beta", text: "Beta" }];
function App() {
  const [selected, setSelected] = useState([]);
  return <main style={{ padding: "2rem" }}><h1>Filterable selection</h1><MultiSelect.Filterable id="choice" titleText="Choices" placeholder="Choose items" items={items} itemToString={(item) => item?.text ?? ""} onChange={({ selectedItems }) => setSelected(selectedItems)} /><p id="chosen">Chosen {selected.map((item) => item.text).join(", ") || "none"}</p></main>;
}
ReactDOM.render(<App />, document.getElementById("root"));

import React, { useState } from "react";
import ReactDOM from "react-dom";
import Select from "react-select";

const options = [
  { label: "Blues", options: [{ value: "ocean", label: "Ocean" }, { value: "blue", label: "Blue" }, { value: "purple", label: "Purple" }] },
  { label: "Other colors", options: [{ value: "orange", label: "Orange" }, { value: "yellow", label: "Yellow" }, { value: "forest", label: "Forest" }] },
];
function App() {
  const [value, setValue] = useState(null);
  return <main><h1>Grouped color selection</h1><label htmlFor="color">Color</label><Select classNamePrefix="colors" inputId="color" instanceId="colors" options={options} value={value} onChange={setValue} /><p id="chosen">Chosen {value?.label ?? "none"}</p></main>;
}
ReactDOM.render(<App />, document.getElementById("root"));

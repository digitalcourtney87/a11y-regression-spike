import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import DatePickerModule from "react-datepicker";
// Normalize published CJS default exports uniformly; same component and props.
const DatePicker = DatePickerModule.default ?? DatePickerModule;
import "react-datepicker/dist/react-datepicker.css";
function App() {
  const [selected, setSelected] = useState(new Date(2025, 1, 19));
  return <main><h1>Date navigation</h1><DatePicker ariaLabelledBy="date-label" selected={selected} onChange={setSelected} /><span id="date-label">Date</span></main>;
}
createRoot(document.getElementById("root")).render(<App />);

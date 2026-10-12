import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import DatePickerModule from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
const DatePicker = DatePickerModule.default ?? DatePickerModule;
function App() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Date(2025, 1, 19));
  return <main>
    <h1>Controlled calendar</h1>
    <span id="date-label">Date</span>
    <DatePicker ariaLabelledBy="date-label" selected={selected} onChange={setSelected} openToDate={new Date(2025, 1, 19)} open={open} preventOpenOnFocus shouldCloseOnSelect onCalendarOpen={() => setOpen(true)} onCalendarClose={() => setOpen(false)} onFocus={() => setOpen(true)} />
    <p>{open ? "Calendar open" : "Calendar closed"}</p>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);

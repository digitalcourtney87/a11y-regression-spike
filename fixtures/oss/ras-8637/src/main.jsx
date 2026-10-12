import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Provider, defaultTheme, DateField } from "@adobe/react-spectrum";

// Issue #8637: uninterrupted 01011970 must enter January 1, 1970.
function App() {
  const [date, setDate] = useState(null);
  return <Provider theme={defaultTheme} locale="en-US">
    <main>
      <h1>Date entry</h1>
      <DateField label="Birthdate" value={date} onChange={setDate} />
      <p id="date">{date?.toString() ?? "empty"}</p>
    </main>
  </Provider>;
}
createRoot(document.getElementById("root")).render(<App />);

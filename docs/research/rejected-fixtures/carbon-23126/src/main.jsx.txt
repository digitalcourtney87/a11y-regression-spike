import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Modal } from "@carbon/react";
import styles from "@carbon/styles/css/styles.css?raw";

// Keep the published CSS intact; the current minifier rejects an unrelated legacy media query.
const style = document.createElement("style");
style.textContent = styles;
document.head.appendChild(style);

// Issue #23126's default passive modal, without native-dialog feature flags.
function App() {
  const [open, setOpen] = useState(false);
  return <main><h1>Passive modal dismissal</h1><button onClick={() => setOpen(true)}>Open details</button><p id="status">Modal {open ? "open" : "closed"}</p><Modal open={open} passiveModal modalHeading="Details" closeButtonLabel="Close" onRequestClose={() => setOpen(false)}><p>Details content</p></Modal></main>;
}
createRoot(document.getElementById("root")).render(<App />);

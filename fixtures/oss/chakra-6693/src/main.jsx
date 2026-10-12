import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, Editable, EditablePreview, EditableInput } from "@chakra-ui/react";

// Issue #6693: onChange/onEdit handlers must allow continuous text entry.
function App() {
  const [value, setValue] = useState("Initial");
  const [editing, setEditing] = useState(false);
  return <ChakraProvider><main><h1>Editable text entry</h1><Editable value={value} onChange={(next) => setValue(next)} onEdit={() => setEditing(true)}><EditablePreview aria-label="Edit text" /><EditableInput aria-label="Text" /></Editable><p id="value">{`Entered ${value}`}</p><p>{editing ? "Editing" : "Preview"}</p></main></ChakraProvider>;
}
createRoot(document.getElementById("root")).render(<App />);

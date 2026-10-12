import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Autocomplete, TextField } from "@mui/material";
function App() {
  const [values, setValues] = useState([]);
  return <main>
    <h1>New entry</h1>
    <Autocomplete multiple freeSolo autoHighlight autoSelect options={[]} value={values} onChange={(_event, next) => setValues(next)} renderInput={(params) => <TextField {...params} label="Entry" />} />
    <button>Finish</button>
    <p>{`Chosen ${values.length ? String(values[values.length - 1]) : "none"}`}</p>
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);

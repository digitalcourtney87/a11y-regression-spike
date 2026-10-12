import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { Slider } from "@mui/material";
const marks = [{ value: 10 }, { value: 20 }, { value: 30 }];
function App() {
  const [value, setValue] = useState(30);
  return <main><h1>Restricted marks</h1><Slider aria-label="Level" marks={marks} step={null} value={value} onChange={(_event, next) => setValue(next)} style={{ width: "300px", margin: "2rem" }} /><p>{`Level ${value}`}</p></main>;
}
createRoot(document.getElementById("root")).render(<App />);

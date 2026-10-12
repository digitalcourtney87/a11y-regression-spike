import React from "react";
import { createRoot } from "react-dom/client";
import { Autocomplete, TextField, Paper } from "@mui/material";
function SearchPaper({ children, ...props }) {
  return <Paper {...props}><p>No recent searches</p>{children}</Paper>;
}
function App() {
  return <main><h1>Search information</h1><Autocomplete freeSolo disablePortal options={[]} PaperComponent={SearchPaper} renderInput={(params) => <TextField {...params} label="Search" />} /></main>;
}
createRoot(document.getElementById("root")).render(<App />);

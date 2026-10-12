import React, { useState } from "react";
import ReactDOM from "react-dom";
import { SearchBox } from "@fluentui/react";
function App() {
  const [query, setQuery] = useState("");
  return <main><h1>Search query</h1><SearchBox ariaLabel="Query" role="searchbox" onChanged={setQuery} /><p>{`Query ${query || "none"}`}</p></main>;
}
ReactDOM.render(<App />, document.getElementById("root"));

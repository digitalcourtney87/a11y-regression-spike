import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Link } from "react-router";
import { Tabs } from "@base-ui/react/tabs";

function App() {
  const [shown, setShown] = useState(false);
  return <main>
    <h1>Router tabs</h1>
    <button onClick={() => setShown(true)}>Show tabs</button>
    {shown && <MemoryRouter>
      <Tabs.Root defaultValue="overview">
        <Tabs.List aria-label="Sections">
          <Tabs.Tab value="overview" nativeButton={false} render={<Link to="/overview" />}>Overview</Tabs.Tab>
          <Tabs.Tab value="details" nativeButton={false} render={<Link to="/details" />}>Details</Tabs.Tab>
        </Tabs.List>
      </Tabs.Root>
    </MemoryRouter>}
  </main>;
}
createRoot(document.getElementById("root")).render(<App />);

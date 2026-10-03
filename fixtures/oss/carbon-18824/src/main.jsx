import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button } from "@carbon/react";

// An inline icon, so the fixture needs no icon package.
function Star(props) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" {...props}>
      <path d="M8 1l2 5h5l-4 3 2 6-5-4-5 4 2-6-4-3h5z" />
    </svg>
  );
}

function App() {
  const [selected, setSelected] = useState(false);
  return (
    <main style={{ padding: "4rem" }}>
      <button id="before">Before</button>
      <Button id="star" hasIconOnly kind="ghost" iconDescription="Favourite" renderIcon={Star} isSelected={selected} onClick={() => setSelected((s) => !s)} />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);

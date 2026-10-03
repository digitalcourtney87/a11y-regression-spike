import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/popover2/lib/css/blueprint-popover2.css";
import { useState } from "react";
import { createRoot } from "react-dom/client";
import { Button, MenuItem } from "@blueprintjs/core";
import { Select2 } from "@blueprintjs/select";

// A filterable Select2, as in the Blueprint docs example.
const films = ["The Godfather", "Casablanca", "Vertigo", "Rashomon", "Metropolis"];
const filter = (query, film) => film.toLowerCase().includes(query.toLowerCase());
const renderFilm = (film, { handleClick, handleFocus, modifiers }) =>
  modifiers.matchesPredicate ? <MenuItem key={film} text={film} active={modifiers.active} onClick={handleClick} onFocus={handleFocus} /> : null;

function App() {
  const [film, setFilm] = useState(null);
  return (
    <main style={{ padding: "2rem" }}>
      <Select2 items={films} itemPredicate={filter} itemRenderer={renderFilm} onItemSelect={setFilm} noResults={<MenuItem disabled text="No results" />}>
        <Button data-testid="target" text={film ?? "Select a film"} />
      </Select2>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);

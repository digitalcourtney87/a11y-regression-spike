import { createRoot } from "react-dom/client";
import { Button, ComboBox, Input, Label, ListBox, ListBoxItem, Popover } from "react-aria-components";

// The issue's setup: the dropdown is scrollable (more items than fit), and
// the page itself is taller than the window, so it can scroll.
const fruits = Array.from({ length: 30 }, (_, i) => `Fruit ${String(i + 1).padStart(2, "0")}`);
createRoot(document.getElementById("root")).render(
  <main style={{ padding: "2rem", minHeight: "250vh" }}>
    <ComboBox>
      <Label>Fruit</Label>
      <div>
        <Input id="input" />
        <Button>Show</Button>
      </div>
      <Popover maxHeight={200} style={{ overflow: "auto", background: "white", border: "1px solid", width: 220 }}>
        <ListBox>
          {fruits.map((f) => (
            <ListBoxItem key={f} id={f} style={{ padding: "4px 8px" }}>
              {f}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </ComboBox>
  </main>,
);

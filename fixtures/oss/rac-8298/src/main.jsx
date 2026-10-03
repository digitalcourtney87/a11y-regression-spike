import { createRoot } from "react-dom/client";
import { Button, ComboBox, Input, Label, ListBox, ListBoxItem, Popover } from "react-aria-components";

// The issue's setup, as the fix PR's test steps give it: the dropdown opens
// below the field and is scrollable (more items than fit), and the page is
// taller than the window. As in the React Aria docs styles, the ListBox is the
// scroll container, limited to the popover's height. The field sits below the
// middle of the window.
const fruits = Array.from({ length: 30 }, (_, i) => `Fruit ${String(i + 1).padStart(2, "0")}`);
createRoot(document.getElementById("root")).render(
  <main style={{ padding: "380px 2rem 0", minHeight: "250vh" }}>
    <ComboBox>
      <Label>Fruit</Label>
      <div>
        <Input id="input" />
        <Button>Show</Button>
      </div>
      <Popover maxHeight={200} style={{ background: "white", border: "1px solid", width: 220 }}>
        <ListBox style={{ maxHeight: "inherit", overflow: "auto" }}>
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

import { createRoot } from "react-dom/client";
import { Button, ComboBox, Input, Label, ListBox, ListBoxItem, Popover } from "react-aria-components";

const fruits = ["Apple", "Banana", "Cherry", "Date", "Elderberry"];
createRoot(document.getElementById("root")).render(
  <ComboBox>
    <Label>Fruit</Label>
    <div>
      <Input id="input" />
      <Button>Show</Button>
    </div>
    <Popover>
      <ListBox>{fruits.map((f) => <ListBoxItem key={f} id={f}>{f}</ListBoxItem>)}</ListBox>
    </Popover>
  </ComboBox>,
);

import { createRoot } from "react-dom/client";
import { ComboBox, defaultTheme, Item, Provider } from "@adobe/react-spectrum";

// The fix PR's test steps (#8301): React Spectrum's ComboBox, with the window
// such that its dropdown is scrollable and opens below the field, on a page
// taller than the window. The field sits below the middle of the window.
const fruits = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `Fruit ${String(i + 1).padStart(2, "0")}` }));
createRoot(document.getElementById("root")).render(
  <Provider theme={defaultTheme} colorScheme="light">
    <main style={{ padding: "380px 2rem 0", minHeight: "250vh" }}>
      <ComboBox label="Fruit" defaultItems={fruits} id="fruit">
        {(item) => <Item>{item.name}</Item>}
      </ComboBox>
    </main>
  </Provider>,
);

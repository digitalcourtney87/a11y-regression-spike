// React 16.12 predates the automatic JSX runtime, so this fixture calls
// createElement directly.
import { createElement as h, useState } from "react";
import { render } from "react-dom";
import { ComboBox } from "carbon-components-react";

// The issue's controlled ComboBox: selectedItem comes from state and onChange updates it.
const items = [
  { id: "apple", text: "Apple" },
  { id: "banana", text: "Banana" },
  { id: "cherry", text: "Cherry" },
];
function App() {
  const [selected, setSelected] = useState(items[0]);
  return h(
    "main",
    { style: { padding: "2rem", width: 320 } },
    h(ComboBox, {
      id: "fruit",
      titleText: "Fruit",
      placeholder: "Choose a fruit",
      items,
      itemToString: (item) => (item ? item.text : ""),
      selectedItem: selected,
      onChange: ({ selectedItem }) => setSelected(selectedItem),
    }),
  );
}
render(h(App), document.getElementById("root"));

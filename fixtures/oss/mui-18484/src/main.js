// React 16.10 predates the automatic JSX runtime, so this fixture calls
// createElement directly.
import { createElement as h, useState } from "react";
import { render } from "react-dom";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

window.__focusErrors = [];

// The issue's own pattern: focus the field from its inputRef callback, 100 ms later.
const textFieldInputFocus = (inputRef) => {
  if (inputRef && inputRef.node !== null) {
    setTimeout(() => {
      try {
        inputRef.focus();
      } catch (e) {
        window.__focusErrors.push(String(e));
      }
    }, 100);
  }
};

function App() {
  const [editing, setEditing] = useState(false);
  return h(
    "main",
    { style: { padding: "2rem" } },
    h("button", { id: "edit", onClick: () => setEditing(true) }, "Edit"),
    editing &&
      h(
        TextField,
        { select: true, label: "Choice", value: "", inputRef: textFieldInputFocus, style: { minWidth: 200, marginLeft: 16 } },
        h(MenuItem, { value: "a" }, "A"),
        h(MenuItem, { value: "b" }, "B"),
      ),
  );
}
render(h(App), document.getElementById("root"));

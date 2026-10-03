import { useRef } from "react";
import { render } from "react-dom";
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";

function App() {
  const ref = useRef(null);
  const go = () => {
    try {
      ref.current.focus();
      window.__focusError = null;
    } catch (e) {
      window.__focusError = String(e);
    }
  };
  return (
    <>
      <TextField select label="Choice" value="" inputRef={ref} style={{ minWidth: 200 }}>
        <MenuItem value="a">A</MenuItem>
        <MenuItem value="b">B</MenuItem>
      </TextField>
      <button id="go" onClick={go}>Focus the choice</button>
    </>
  );
}
render(<App />, document.getElementById("root"));

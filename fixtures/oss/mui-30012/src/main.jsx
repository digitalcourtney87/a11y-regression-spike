import { render } from "react-dom";
import Chip from "@mui/material/Chip";

// The issue's case: a basic informational chip, with no actions.
render(<Chip label="Disabled chip" disabled />, document.getElementById("root"));

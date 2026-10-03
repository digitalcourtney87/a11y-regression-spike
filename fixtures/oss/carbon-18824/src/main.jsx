import { createRoot } from "react-dom/client";
import { IconButton } from "@carbon/react";
import { Add } from "@carbon/icons-react";

createRoot(document.getElementById("root")).render(
  <IconButton label="Add item" kind="ghost" isSelected>
    <Add />
  </IconButton>,
);

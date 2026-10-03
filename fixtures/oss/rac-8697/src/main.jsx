import { createRoot } from "react-dom/client";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

createRoot(document.getElementById("root")).render(
  <MenuTrigger>
    <Button id="trigger">Links</Button>
    <Popover>
      <Menu aria-label="Links">
        <MenuItem href="#target">Go to target</MenuItem>
        <MenuItem href="#other">Other</MenuItem>
      </Menu>
    </Popover>
  </MenuTrigger>,
);

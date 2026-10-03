import { createRoot } from "react-dom/client";
import { Button, Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

// The docs' "Links" example, with same-origin pages so navigation can be
// observed; the popover has no exit animation.
createRoot(document.getElementById("root")).render(
  <main style={{ padding: "2rem" }}>
    <p id="where">{location.pathname}</p>
    <MenuTrigger>
      <Button id="trigger">Links</Button>
      <Popover style={{ background: "white", border: "1px solid" }}>
        <Menu aria-label="Links">
          <MenuItem href="/adobe">Adobe</MenuItem>
          <MenuItem href="/apple">Apple</MenuItem>
          <MenuItem href="/google">Google</MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  </main>,
);

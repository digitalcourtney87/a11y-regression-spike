import { createRoot } from "react-dom/client";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

createRoot(document.getElementById("root")).render(
  <Menu>
    <MenuButton id="parent">Parent</MenuButton>
    <MenuItems>
      <MenuItem><button>One</button></MenuItem>
      <MenuItem as="div">
        <Menu>
          <MenuButton id="nested">Nested</MenuButton>
          <MenuItems>
            <MenuItem><button>Child</button></MenuItem>
          </MenuItems>
        </Menu>
      </MenuItem>
    </MenuItems>
  </Menu>,
);

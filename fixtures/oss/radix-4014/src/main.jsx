import { createRoot } from "react-dom/client";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";

createRoot(document.getElementById("root")).render(
  <DropdownMenu.Root>
    <DropdownMenu.Trigger id="trigger">Options</DropdownMenu.Trigger>
    <DropdownMenu.Portal>
      <DropdownMenu.Content>
        <DropdownMenu.Item>One</DropdownMenu.Item>
        <DropdownMenu.Item>Two</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>,
);

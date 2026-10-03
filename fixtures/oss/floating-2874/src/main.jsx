import { useState } from "react";
import { createRoot } from "react-dom/client";
import { FloatingFocusManager, useClick, useDismiss, useFloating, useInteractions, useRole } from "@floating-ui/react";

function App() {
  const [open, setOpen] = useState(false);
  const { refs, floatingStyles, context } = useFloating({ open, onOpenChange: setOpen });
  const { getReferenceProps, getFloatingProps } = useInteractions([useClick(context), useDismiss(context), useRole(context, { role: "menu" })]);
  return (
    <>
      <button id="first">First</button>
      <button id="menu" ref={refs.setReference} {...getReferenceProps()}>Menu</button>
      {open && (
        <FloatingFocusManager context={context} modal={false}>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <button role="menuitem">Item 1</button>
            <button role="menuitem">Item 2</button>
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);

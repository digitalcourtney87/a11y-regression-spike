import { useState } from "react";
import { createRoot } from "react-dom/client";
import * as Dialog from "@radix-ui/react-dialog";

// The issue's Dialog: Escape is blocked while work is pending. Here the work
// starts when the dialog opens and finishes 300 ms later, after which Escape
// must close the dialog again.
function App() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const onOpenChange = (next) => {
    setOpen(next);
    if (next) {
      setPending(true);
      setTimeout(() => setPending(false), 300);
    }
  };
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger id="trigger">Edit profile</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)" }} />
        <Dialog.Content
          aria-describedby={undefined}
          style={{ position: "fixed", top: "30%", left: "30%", background: "white", padding: "1rem" }}
          onEscapeKeyDown={(event) => {
            if (pending) event.preventDefault();
          }}
        >
          <Dialog.Title>Edit profile</Dialog.Title>
          <p id="status">{pending ? "Loading…" : "Ready"}</p>
          <input id="name" aria-label="Name" />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

createRoot(document.getElementById("root")).render(<App />);

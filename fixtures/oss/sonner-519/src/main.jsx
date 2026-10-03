import { createRoot } from "react-dom/client";
import { Toaster, toast } from "sonner";

createRoot(document.getElementById("root")).render(
  <>
    <Toaster />
    <button id="show" onClick={() => toast.custom(() => <div>Custom toast text</div>)}>Show toast</button>
  </>,
);

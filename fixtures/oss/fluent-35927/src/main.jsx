import { createRoot } from "react-dom/client";
import { PresenceBadge } from "@fluentui/react-badge";

// A team list with each person's presence, as PresenceBadge is used.
const people = [
  ["Ana", "busy"],
  ["Ben", "away"],
  ["Cy", "offline"],
];
createRoot(document.getElementById("root")).render(
  <main style={{ padding: "2rem" }}>
    <ul aria-label="Team">
      {people.map(([name, status]) => (
        <li key={name} data-status={status}>
          {name} <PresenceBadge status={status} />
        </li>
      ))}
    </ul>
  </main>,
);

// Owned known-answer pages for the approved M8 exploratory pilot.
const scenario = new URLSearchParams(location.search).get("case");
const page = document.getElementById("page");
if (scenario === "delayed-modal") {
  page.innerHTML = '<h1>Delayed modal focus</h1><button id="opener" type="button">Open details</button><div id="details" role="dialog" aria-label="Details" tabindex="-1" hidden><h2>Details</h2><p>Details content</p></div>';
  document.getElementById("opener").addEventListener("click", () => {
    setTimeout(() => {
      const details = document.getElementById("details");
      details.hidden = false;
      details.focus();
    }, 800);
  });
} else if (scenario === "nested-editor") {
  page.innerHTML = '<h1>Native focus identity</h1><div role="textbox" aria-label="Wrapper field"><label for="actual">Actual field</label><input id="actual" aria-label="Actual field"></div><p>Wrapper and input have different declared names.</p>';
} else if (scenario === "feedback-document" || scenario === "feedback-application") {
  if (scenario === "feedback-application") page.setAttribute("role", "application");
  page.innerHTML = '<h1>Selection feedback</h1><label for="choices">Choices</label><input id="choices"><ul role="listbox" aria-label="Available choices"><li id="alpha" role="option" aria-selected="false" tabindex="-1">Alpha</li></ul><p id="chosen">Chosen none</p>';
  document.getElementById("choices").addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      document.getElementById("alpha").focus();
    }
  });
  const selectAlpha = () => {
    document.getElementById("alpha").setAttribute("aria-selected", "true");
    document.getElementById("chosen").textContent = "Chosen Alpha";
  };
  document.getElementById("alpha").addEventListener("click", selectAlpha);
  document.getElementById("alpha").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      selectAlpha();
    }
  });
} else {
  page.textContent = "Unknown calibration case";
}

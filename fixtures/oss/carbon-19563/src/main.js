import "@carbon/web-components/es/components/checkbox/index.js";

// The issue's flow: the user ticks the filter, then "Clear filters" resets it in code.
document.getElementById("clear").addEventListener("click", () => {
  document.getElementById("cb").checked = false;
});

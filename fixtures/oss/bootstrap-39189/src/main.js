import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";

// Issue #39189 / fix #39201: valid HTML ids containing ':' remain usable by modal triggers.
document.getElementById("app").innerHTML = `
<main>
  <h1>Modal trigger</h1>
  <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#j_id22:exampleModal">Open details</button>
  <div class="modal fade" id="j_id22:exampleModal" tabindex="-1" aria-labelledby="details-title" aria-hidden="true">
    <div class="modal-dialog"><div class="modal-content">
      <div class="modal-header"><h2 class="modal-title" id="details-title">Details</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body"><p>Details content</p></div>
    </div></div>
  </div>
</main>`;

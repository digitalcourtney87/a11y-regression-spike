import $ from "./jquery-global.js";
import "bootstrap/dist/js/bootstrap.js";
import "bootstrap/dist/css/bootstrap.css";
document.getElementById("app").innerHTML = '<main><h1>Manual tooltip</h1><button id="help" type="button" class="btn btn-primary"><span class="delegate">Show help</span></button></main>';
// Source15168/15466: selector initialization must preserve manual string methods.
$("#help").tooltip({ selector: ".delegate", trigger: "manual", title: "Extra information", container: "body", animation: false });
document.getElementById("help").addEventListener("click", () => { $("#help").tooltip("show"); });

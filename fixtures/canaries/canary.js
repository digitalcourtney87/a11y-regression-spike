// Known-answer canaries K1–K7 (HANDOFF §9.1; DR-0013 D4, DR-0036, DR-0037).
//
// One fixed page; `?id=` selects the canary, `?variant=` a K6a variant and
// `?delay=` a K6e fill delay. Markup that must exist at load is built here
// before anything else runs. Activation is a click on #start (in the
// NVDA-present leg, NVDA activating the button after an OS-level Enter); the
// behaviour then runs on a timer, so no keypress falls inside the observation
// window (D4). Live regions carry an id but no accessible name (D4). Timing
// uses performance.now() only (D1).
(function () {
  "use strict";
  var params = new URLSearchParams(location.search);
  var id = params.get("id") || "K1";
  var variant = params.get("variant") || "";
  var delayParam = params.get("delay") || "";
  var stage = document.getElementById("stage");
  var start = document.getElementById("start");
  var FILL_DELAY_MS = 500; // over 350 ms (D4), except in the K6e sweep
  var log = [];
  window.__canary = { id: id, variant: variant, delay: delayParam, activatedAt: null, log: log };

  function note(what) { log.push({ t: performance.now(), what: what }); }
  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (text) node.textContent = text;
    return node;
  }
  function later(ms, fn) { setTimeout(function () { fn(); note("done"); }, ms); }

  document.title = id + " canary";
  document.getElementById("heading").textContent = id + " canary";

  // Markup present at load.
  var setup = {
    K1: function () { stage.appendChild(el("div", { id: "live", "aria-live": "polite" })); },
    K2: function () { stage.appendChild(el("div", { id: "alert", role: "alert" })); },
    K3: function () { stage.appendChild(el("button", { id: "target", type: "button" }, "K3 target button")); },
    K4: function () {
      var dialog = el("div", { id: "dialog", role: "dialog", "aria-modal": "true", "aria-labelledby": "dialog-title", hidden: "" });
      dialog.appendChild(el("h2", { id: "dialog-title" }, "K4 settings dialog"));
      dialog.appendChild(el("button", { id: "dialog-first", type: "button" }, "First control"));
      dialog.appendChild(el("button", { type: "button" }, "Close"));
      stage.appendChild(dialog);
    },
    K5: function () {},
    K6a: function () {},
    K6b: function () {},
    K6e: function () {},
    K7a: function () {
      stage.appendChild(el("div", { id: "live", "aria-live": "polite" }));
      stage.appendChild(el("button", { id: "target", type: "button" }, "K7a target button"));
    },
    K7b: function () {
      stage.appendChild(el("div", { id: "live", "aria-live": "polite" }));
      stage.appendChild(el("input", { id: "field", type: "text", "aria-label": "K7b text field" }));
    }
  };

  // Behaviour after activation.
  var behaviour = {
    K1: function () { later(FILL_DELAY_MS, function () { document.getElementById("live").textContent = "K1 polite update arrived"; }); },
    K2: function () { later(FILL_DELAY_MS, function () { document.getElementById("alert").textContent = "K2 alert update arrived"; }); },
    K3: function () { later(FILL_DELAY_MS, function () { document.getElementById("target").focus(); }); },
    K4: function () {
      later(FILL_DELAY_MS, function () {
        document.getElementById("dialog").removeAttribute("hidden");
        document.getElementById("dialog-first").focus();
      });
    },
    K5: function () {
      later(FILL_DELAY_MS, function () {
        history.pushState({ route: "k5" }, "", location.pathname + location.search + "#k5-route");
        var main = document.getElementById("main");
        main.textContent = "";
        var h1 = el("h1", { id: "route-heading", tabindex: "-1" }, "K5 route heading");
        main.appendChild(h1);
        main.appendChild(el("p", {}, "Route content."));
        document.title = "K5 route";
        h1.focus();
      });
    },
    K6a: function () {
      var attrs = { polite: { "aria-live": "polite" }, status: { role: "status" }, assertive: { "aria-live": "assertive" } }[variant];
      if (!attrs) throw new Error("K6a needs ?variant=polite|status|assertive");
      later(FILL_DELAY_MS, function () {
        var region = el("div", Object.assign({ id: "region" }, attrs), "K6a " + variant + " inserted populated");
        stage.appendChild(region);
      });
    },
    K6b: function () {
      later(FILL_DELAY_MS, function () { stage.appendChild(el("div", { id: "region", role: "alert" }, "K6b alert inserted populated")); });
    },
    K6e: function () {
      later(FILL_DELAY_MS, function () {
        var region = el("div", { id: "region", "aria-live": "polite" });
        stage.appendChild(region);
        note("inserted");
        var text = "K6e filled after " + delayParam;
        var fill = function () { region.textContent = text; note("filled"); };
        if (delayParam === "raf") requestAnimationFrame(fill);
        else if (delayParam === "0") fill();
        else setTimeout(fill, Number(delayParam));
      });
    },
    K7a: function () {
      later(FILL_DELAY_MS, function () {
        document.getElementById("live").textContent = "K7a polite update";
        document.getElementById("target").focus();
      });
    },
    K7b: function () {
      later(FILL_DELAY_MS, function () {
        document.getElementById("live").textContent = "K7b polite update";
        document.getElementById("field").focus();
      });
    }
  };

  if (!setup[id]) throw new Error("unknown canary " + id);
  setup[id]();
  var activated = false;
  start.addEventListener("click", function () {
    if (activated) return;
    activated = true;
    window.__canary.activatedAt = performance.now();
    note("activated");
    behaviour[id]();
  });
})();

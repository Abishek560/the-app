/**
 * Controller: Entry form (release mode) – email only; store email + default portalName, proceed.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var contentEl = document.getElementById("content");

  var DEFAULT_PORTAL = "default";

  function handleSubmit(email, portalName) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem("crm-email", String(email || "").trim());
        global.localStorage.setItem("crm-portalName", String(portalName || "").trim());
      }
      state.email = String(email || "").trim();
      state.portalName = String(portalName || "").trim();
      state.showAuthScreen = false;
      if (theApp.controller.app && theApp.controller.app.loadAndShowMainApp) {
        theApp.controller.app.loadAndShowMainApp();
      } else {
        global.location.href = "index.html#/" + encodeURIComponent(portalName) + "/dashboard";
      }
    } catch (e) {
      if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(e && e.message ? e.message : "Failed to save");
    }
  }

  function bind(root) {
    if (!root) return;
    var form = root.querySelector("#auth-entry-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.querySelector("[name=email]") || {}).value;
        if (!email || !email.trim()) return;
        handleSubmit(email.trim(), DEFAULT_PORTAL);
      });
    }
  }

  function renderAuth() {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.render();
    bind(contentEl);
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.auth = {
    renderAuth: renderAuth
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

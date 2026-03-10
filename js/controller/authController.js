/**
 * Controller: Entry form (release mode) – store email + portalName in localStorage, proceed.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var contentEl = document.getElementById("content");

  function toPortalName(orgName) {
    return (orgName || "portal").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "portal";
  }

  function switchToTestMode() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem("crm-testMode", "true");
        global.location.reload();
      }
    } catch (e) {}
  }

  function handleSubmit(email, portalName, useTestMode) {
    if (useTestMode) {
      switchToTestMode();
      return;
    }
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
    var testModeToggle = root.querySelector("#auth-test-mode-toggle");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.querySelector("[name=email]") || {}).value;
        var portalNameRaw = (form.querySelector("[name=portalName]") || {}).value;
        var useTestMode = testModeToggle && testModeToggle.checked;
        if (!email || !email.trim()) return;
        var portalName = useTestMode ? "default" : toPortalName(portalNameRaw);
        if (!useTestMode && (!portalNameRaw || !portalNameRaw.trim())) return;
        handleSubmit(email.trim(), portalName, useTestMode);
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
    renderAuth: renderAuth,
    switchToTestMode: switchToTestMode
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

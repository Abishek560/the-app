/**
 * Entry point for index.html: session check, then bootstrap app with hash router.
 */
(function (global) {
  "use strict";

  // Apply saved theme before DOM ready to avoid flash
  try {
    var storedTheme = global.localStorage && global.localStorage.getItem("crm-theme");
    var storedAccent = global.localStorage && global.localStorage.getItem("crm-accent");
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      var effective = storedTheme === "system" && global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : (storedTheme === "system" ? "light" : storedTheme);
      document.documentElement.setAttribute("data-theme", effective);
    }
    if (storedAccent === "amber" || storedAccent === "blue" || storedAccent === "green") {
      document.documentElement.setAttribute("data-accent", storedAccent);
    }
  } catch (e) {}

  function run() {
    var theApp = global.theApp;
    if (!theApp || !theApp.state) return;
    var state = theApp.state;
    var hasSession = !!(state.email && state.email.trim() && state.portalName && state.portalName.trim());
    if (!hasSession) {
      global.location.href = "login.html";
      return;
    }
    if (!theApp.controller || !theApp.controller.app || !theApp.controller.app.init) {
      console.error("App not ready. Ensure script load order: config → api → model → view → controller → router → main.");
      return;
    }
    theApp.controller.app.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})(typeof window !== "undefined" ? window : this);

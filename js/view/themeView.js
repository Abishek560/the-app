/**
 * View: theme and accent UI in the profile panel.
 * Updates DOM for theme/accent state; does not bind events.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.config) return;

  var state = theApp.state;
  var config = theApp.config;

  function getEffectiveTheme() {
    if (state.theme === "light") return "light";
    if (state.theme === "dark") return "dark";
    var mq = global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)");
    return mq && mq.matches ? "dark" : "light";
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", getEffectiveTheme());
    document.documentElement.setAttribute("data-accent", state.accent);
  }

  function renderThemeOptions() {
    var container = document.getElementById("theme-options");
    if (!container) return;
    container.querySelectorAll(".theme-option").forEach(function (btn) {
      var mode = btn.getAttribute("data-mode");
      var active = state.theme === mode;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function renderAccentOptions() {
    var container = document.getElementById("accent-options");
    if (!container) return;
    container.querySelectorAll(".accent-swatch").forEach(function (btn) {
      btn.classList.toggle("active", state.accent === btn.getAttribute("data-accent"));
    });
  }

  theApp.view = theApp.view || {};
  theApp.view.theme = {
    applyTheme: applyTheme,
    renderThemeOptions: renderThemeOptions,
    renderAccentOptions: renderAccentOptions,
    getEffectiveTheme: getEffectiveTheme
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

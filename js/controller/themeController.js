/**
 * Controller: theme and accent – persistence, state updates, and DOM bindings.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.config || !theApp.view || !theApp.view.theme) return;

  var state = theApp.state;
  var config = theApp.config;
  var themeView = theApp.view.theme;

  function getStoredTheme() {
    try {
      var stored = global.localStorage.getItem(config.themeStorageKey);
      if (config.themeModes.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return "system";
  }

  function getStoredAccent() {
    try {
      var stored = global.localStorage.getItem(config.accentStorageKey);
      if (config.accentValues.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return "amber";
  }

  function setTheme(mode) {
    state.theme = mode;
    try { global.localStorage.setItem(config.themeStorageKey, mode); } catch (e) {}
    themeView.applyTheme();
    themeView.renderThemeOptions();
  }

  function setAccent(accent) {
    state.accent = accent;
    try { global.localStorage.setItem(config.accentStorageKey, accent); } catch (e) {}
    themeView.applyTheme();
    themeView.renderAccentOptions();
  }

  function bindThemeControls() {
    state.theme = getStoredTheme();
    state.accent = getStoredAccent();
    themeView.applyTheme();
    themeView.renderThemeOptions();
    themeView.renderAccentOptions();

    var themeContainer = document.getElementById("theme-options");
    if (themeContainer) {
      themeContainer.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest(".theme-option[data-mode]");
        if (btn) setTheme(btn.getAttribute("data-mode"));
      });
    }
    var accentContainer = document.getElementById("accent-options");
    if (accentContainer) {
      accentContainer.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest(".accent-swatch[data-accent]");
        if (btn) setAccent(btn.getAttribute("data-accent"));
      });
    }
    var mq = global.matchMedia && global.matchMedia("(prefers-color-scheme: dark)");
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", function () {
        if (state.theme === "system") themeView.applyTheme();
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.theme = {
    getStoredTheme: getStoredTheme,
    getStoredAccent: getStoredAccent,
    setTheme: setTheme,
    setAccent: setAccent,
    bindThemeControls: bindThemeControls
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

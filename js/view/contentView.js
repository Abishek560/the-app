/**
 * View: main content area – placeholder for modules without entity list, and initial loading.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;

  /**
   * Returns HTML for initial app load (splash-style, distinct from in-app loading).
   */
  function renderInitialLoading() {
    return "<div class=\"app-splash\" role=\"status\" aria-live=\"polite\">" +
      "<div class=\"app-splash-inner\">" +
      "<h1 class=\"app-splash-title\">Glow</h1>" +
      "<p class=\"app-splash-tagline\">Car Garage</p>" +
      "<div class=\"app-splash-dots\" aria-hidden=\"true\">" +
      "<span class=\"app-splash-dot\"></span><span class=\"app-splash-dot\"></span><span class=\"app-splash-dot\"></span>" +
      "</div>" +
      "</div>" +
      "</div>";
  }

  /**
   * Returns HTML for an unimplemented module placeholder.
   */
  function renderPlaceholder(moduleLabel) {
    var title = moduleLabel || "Module";
    return "<div class=\"card\">" +
      "<div class=\"card-header\">" +
      "<div>" +
      "<div class=\"card-title\">" + title.replace(/</g, "&lt;") + "</div>" +
      "<div class=\"muted\">This module is not wired up yet.</div>" +
      "</div>" +
      "</div>" +
      "<div class=\"muted\">Add UI + data for <strong>" + title.replace(/</g, "&lt;") + "</strong> in the controller.</div>" +
      "</div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.content = {
    renderInitialLoading: renderInitialLoading,
    renderPlaceholder: renderPlaceholder
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

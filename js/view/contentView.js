/**
 * View: main content area – placeholder for modules without entity list, and initial loading.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  /**
   * Returns HTML for initial app load (splash-style, distinct from in-app loading).
   */
  function renderInitialLoading() {
    return "<div class=\"app-splash\" role=\"status\" aria-live=\"polite\">" +
      "<div class=\"app-splash-inner\">" +
      "<h1 class=\"app-splash-title\">" + (t("appName").replace(/</g, "&lt;")) + "</h1>" +
      "<p class=\"app-splash-tagline\">" + (t("appTagline").replace(/</g, "&lt;")) + "</p>" +
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
    var title = moduleLabel || t("module");
    return "<div class=\"card\">" +
      "<div class=\"card-header\">" +
      "<div>" +
      "<div class=\"card-title\">" + title.replace(/</g, "&lt;") + "</div>" +
      "<div class=\"muted\">" + (t("moduleNotWired").replace(/</g, "&lt;")) + "</div>" +
      "</div>" +
      "</div>" +
      "<div class=\"muted\">" + (t("addUIFor").replace(/</g, "&lt;")) + " <strong>" + title.replace(/</g, "&lt;") + "</strong> " + (t("inTheController").replace(/</g, "&lt;")) + "</div>" +
      "</div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.content = {
    renderInitialLoading: renderInitialLoading,
    renderPlaceholder: renderPlaceholder
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

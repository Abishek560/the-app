/**
 * View: Entry form (release mode) – email only. No Firebase Auth.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.language) return;

  var t = theApp.language.t ? theApp.language.t : function (k) { return k; };

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function render() {
    var emailT = escapeHtml(t("email"));
    var continueT = escapeHtml(t("continue") || "Continue");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + escapeHtml(t("appName") || "The App") + "</h1>" +
      "<p class=\"auth-subtitle\">" + escapeHtml(t("enterEmailToContinue") || "Enter your email to continue") + "</p>" +
      "<form id=\"auth-entry-form\" class=\"signup-form auth-form\">" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label for=\"auth-email\">" + emailT + "</label><input type=\"email\" id=\"auth-email\" name=\"email\" required placeholder=\"you@example.com\" autocomplete=\"email\" /></div>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-entry-submit\">" + continueT + "</button>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.auth = {
    render: render
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

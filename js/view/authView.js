/**
 * View: Auth (release mode) – email-first, then login or signup based on account existence.
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

  function renderEmailStep() {
    var emailT = escapeHtml(t("email"));
    var continueT = escapeHtml(t("continue") || "Continue");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + escapeHtml(t("signIn") || "Sign in") + "</h1>" +
      "<p class=\"auth-subtitle\">" + escapeHtml(t("enterEmailToContinue") || "Enter your email to continue") + "</p>" +
      "<form id=\"auth-email-form\" class=\"signup-form auth-form\">" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label for=\"auth-email\">" + emailT + "</label><input type=\"email\" id=\"auth-email\" name=\"email\" required placeholder=\"you@example.com\" autocomplete=\"email\" /></div>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-email-submit\">" + continueT + "</button>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  function renderLogin(email) {
    var signInT = escapeHtml(t("signIn") || "Sign in");
    var emailT = escapeHtml(t("email"));
    var passwordT = escapeHtml(t("password") || "Password");
    var backT = escapeHtml(t("back") || "Back");
    var emailVal = escapeHtml(email || "");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + signInT + "</h1>" +
      "<form id=\"auth-login-form\" class=\"signup-form auth-form\">" +
      "<input type=\"hidden\" name=\"email\" value=\"" + emailVal + "\" />" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label>" + emailT + "</label><input type=\"email\" id=\"auth-email-display\" value=\"" + emailVal + "\" readonly disabled class=\"auth-email-readonly\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-password\">" + passwordT + "</label><input type=\"password\" id=\"auth-password\" name=\"password\" required placeholder=\"••••••••\" autocomplete=\"current-password\" /></div>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-login-submit\">" + signInT + "</button>" +
      "<a href=\"#\" class=\"auth-link\" id=\"auth-back-to-email\">" + backT + "</a>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  function renderSignup(email) {
    var signUpT = escapeHtml(t("signUp") || "Sign up");
    var nameT = escapeHtml(t("name"));
    var emailT = escapeHtml(t("email"));
    var passwordT = escapeHtml(t("password") || "Password");
    var orgNameT = escapeHtml(t("orgName") || "Organization");
    var createAccountT = escapeHtml(t("createAccount") || "Create account");
    var backT = escapeHtml(t("back") || "Back");
    var useTestModeT = escapeHtml(t("testModeToggle") || t("useTestMode") || "Use test mode");
    var testModeHintT = escapeHtml(t("testModeHint") || "No account, demo data only");
    var emailVal = escapeHtml(email || "");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + signUpT + "</h1>" +
      "<form id=\"auth-signup-form\" class=\"signup-form auth-form\">" +
      "<input type=\"hidden\" name=\"email\" value=\"" + emailVal + "\" />" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label>" + emailT + "</label><input type=\"email\" id=\"auth-email-display\" value=\"" + emailVal + "\" readonly disabled class=\"auth-email-readonly\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-signup-name\">" + nameT + "</label><input type=\"text\" id=\"auth-signup-name\" name=\"name\" required placeholder=\"" + escapeHtml(t("placeholderName")) + "\" autocomplete=\"name\" /></div>" +
      "<div class=\"signup-field auth-password-field\"><label for=\"auth-signup-password\">" + passwordT + "</label><input type=\"password\" id=\"auth-signup-password\" name=\"password\" placeholder=\"••••••••\" autocomplete=\"new-password\" minlength=\"6\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-signup-org\">" + orgNameT + "</label><input type=\"text\" id=\"auth-signup-org\" name=\"orgName\" required placeholder=\"" + escapeHtml(t("placeholderOrgName")) + "\" autocomplete=\"organization\" /></div>" +
      "<div class=\"signup-field signup-field--toggle\">" +
      "<label class=\"auth-toggle-label\"><input type=\"checkbox\" id=\"auth-test-mode-toggle\" name=\"testMode\" value=\"1\" /> <span class=\"auth-toggle-text\">" + useTestModeT + "</span></label>" +
      "<span class=\"auth-toggle-hint\">" + testModeHintT + "</span>" +
      "</div>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-signup-submit\">" + createAccountT + "</button>" +
      "<a href=\"#\" class=\"auth-link\" id=\"auth-back-to-email\">" + backT + "</a>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  function render(showSignup) {
    return showSignup ? renderSignup("") : renderLogin("");
  }

  theApp.view = theApp.view || {};
  theApp.view.auth = {
    render: render,
    renderEmailStep: renderEmailStep,
    renderLogin: renderLogin,
    renderSignup: renderSignup
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

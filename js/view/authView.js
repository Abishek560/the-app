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

  function renderEmailStep() {
    var emailT = escapeHtml(t("email"));
    var continueT = escapeHtml(t("continue") || "Continue");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + escapeHtml(t("appName") || "The App") + "</h1>" +
      "<p class=\"auth-subtitle\">" + escapeHtml(t("enterEmailToContinue") || "Enter your email to continue") + "</p>" +
      "<form id=\"auth-entry-form\" class=\"signup-form auth-form\">" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label for=\"auth-email\">" + emailT + "</label><input type=\"email\" id=\"auth-email\" name=\"email\" required placeholder=\"you@example.com\" autocomplete=\"email\" /></div>" +
      "<p id=\"auth-entry-error\" class=\"auth-error\" role=\"alert\" style=\"display:none;\"></p>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-entry-submit\">" + continueT + "</button>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  function renderLogin(email) {
    var emailT = escapeHtml(t("email"));
    var passwordT = escapeHtml(t("password") || "Password");
    var signInT = escapeHtml(t("signIn") || "Sign in");
    var backT = escapeHtml(t("back") || "Back");
    var emailVal = escapeHtml(email || "");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + escapeHtml(t("appName") || "The App") + "</h1>" +
      "<p class=\"auth-subtitle\">" + escapeHtml(t("signIn") || "Sign in") + "</p>" +
      "<form id=\"auth-login-form\" class=\"signup-form auth-form\">" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label for=\"auth-login-email\">" + emailT + "</label><input type=\"email\" id=\"auth-login-email\" name=\"email\" readonly value=\"" + emailVal + "\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-login-password\">" + passwordT + "</label><input type=\"password\" id=\"auth-login-password\" name=\"password\" required placeholder=\"\" autocomplete=\"current-password\" /></div>" +
      "<p id=\"auth-login-error\" class=\"auth-error\" role=\"alert\" style=\"display:none;\"></p>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-login-submit\">" + signInT + "</button>" +
      "<button type=\"button\" class=\"signup-btn signup-btn--secondary\" id=\"auth-login-back\">" + backT + "</button>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  function renderSignup(email) {
    var emailT = escapeHtml(t("email"));
    var nameT = escapeHtml(t("name") || "Name");
    var passwordT = escapeHtml(t("password") || "Password");
    var orgT = escapeHtml(t("orgName") || t("organization") || "Organization name");
    var createT = escapeHtml(t("createAccount") || "Create account");
    var backT = escapeHtml(t("back") || "Back");
    var emailVal = escapeHtml(email || "");
    var placeholderName = escapeHtml(t("placeholderName") || "Your name");
    var placeholderOrg = escapeHtml(t("placeholderOrgName") || "e.g. Acme Inc");
    return "<div class=\"auth-page signup-page\">" +
      "<div class=\"signup-card auth-card\">" +
      "<h1 class=\"signup-title\">" + escapeHtml(t("appName") || "The App") + "</h1>" +
      "<p class=\"auth-subtitle\">" + escapeHtml(t("signUpSubtitle") || "Enter your details to get started.") + "</p>" +
      "<form id=\"auth-signup-form\" class=\"signup-form auth-form\">" +
      "<div class=\"signup-form-body\">" +
      "<div class=\"signup-field\"><label for=\"auth-signup-email\">" + emailT + "</label><input type=\"email\" id=\"auth-signup-email\" name=\"email\" readonly value=\"" + emailVal + "\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-signup-name\">" + nameT + "</label><input type=\"text\" id=\"auth-signup-name\" name=\"name\" required placeholder=\"" + placeholderName + "\" autocomplete=\"name\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-signup-password\">" + passwordT + "</label><input type=\"password\" id=\"auth-signup-password\" name=\"password\" required placeholder=\"\" autocomplete=\"new-password\" /></div>" +
      "<div class=\"signup-field\"><label for=\"auth-signup-org\">" + orgT + "</label><input type=\"text\" id=\"auth-signup-org\" name=\"orgName\" required placeholder=\"" + placeholderOrg + "\" /></div>" +
      "<p id=\"auth-signup-error\" class=\"auth-error\" role=\"alert\" style=\"display:none;\"></p>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"auth-signup-submit\">" + createT + "</button>" +
      "<button type=\"button\" class=\"signup-btn signup-btn--secondary\" id=\"auth-signup-back\">" + backT + "</button>" +
      "</div>" +
      "</form>" +
      "</div></div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.auth = {
    render: renderEmailStep,
    renderEmailStep: renderEmailStep,
    renderLogin: renderLogin,
    renderSignup: renderSignup
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

/**
 * View: Sign up form – user details, language, theme. Data in JS only (no localStorage). Resets on reload.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.language) return;

  var t = theApp.language.t ? theApp.language.t : function (k) { return k; };
  var state = theApp.state || {};

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function render() {
    var title = escapeHtml(t("signUp"));
    var subtitle = escapeHtml(t("signUpSubtitle"));
    var yourDetails = escapeHtml(t("yourDetails"));
    var name = escapeHtml(t("name"));
    var email = escapeHtml(t("email"));
    var getStarted = escapeHtml(t("getStarted"));
    var placeholderName = escapeHtml(t("placeholderName"));
    var placeholderEmail = escapeHtml(t("placeholderEmail"));
    var languageLabel = escapeHtml(t("language"));
    var themeLabel = escapeHtml(t("theme"));
    var enLabel = escapeHtml(t("english"));
    var taLabel = escapeHtml(t("tamil"));
    var lightLabel = escapeHtml(t("light"));
    var systemLabel = escapeHtml(t("system"));
    var darkLabel = escapeHtml(t("dark"));
    var accentLabel = escapeHtml(t("accent"));
    var amberLabel = escapeHtml(t("amber"));
    var blueLabel = escapeHtml(t("blue"));
    var greenLabel = escapeHtml(t("green"));
    var moreOptionsLabel = escapeHtml(t("languageAndAppearance") || "Language & appearance");

    var currentLocale = (theApp.language.getLocale && theApp.language.getLocale()) || "en";
    var currentTheme = state.theme || "system";
    var currentAccent = state.accent || "amber";

    var step1T = escapeHtml(t("step1Of2") || "Step 1 of 2");
    return "<div class=\"signup-page\">" +
      "<div class=\"signup-card\">" +
      "<p class=\"signup-step\" aria-hidden=\"true\">" + step1T + "</p>" +
      "<h1 class=\"signup-title\">" + title + "</h1>" +
      "<p class=\"signup-subtitle\">" + subtitle + "</p>" +
      "<form id=\"signup-form\" class=\"signup-form\">" +
      "<div class=\"signup-form-body\">" +
      "<fieldset class=\"signup-section\">" +
      "<legend class=\"signup-legend\">" + yourDetails + "</legend>" +
      "<div class=\"signup-field\" data-field=\"userName\"><label for=\"signup-user-name\">" + name + "</label><input type=\"text\" id=\"signup-user-name\" name=\"userName\" required placeholder=\"" + placeholderName + "\" autocomplete=\"name\" aria-describedby=\"signup-error-userName\" /><span class=\"signup-field-error\" id=\"signup-error-userName\" role=\"alert\" aria-live=\"polite\"></span></div>" +
      "<div class=\"signup-field\" data-field=\"userEmail\"><label for=\"signup-user-email\">" + email + "</label><input type=\"email\" id=\"signup-user-email\" name=\"userEmail\" required placeholder=\"" + placeholderEmail + "\" autocomplete=\"email\" aria-describedby=\"signup-error-userEmail\" /><span class=\"signup-field-error\" id=\"signup-error-userEmail\" role=\"alert\" aria-live=\"polite\"></span></div>" +
      "<div class=\"signup-field\" data-field=\"orgName\"><label for=\"signup-org-name\">" + escapeHtml(t("orgName")) + "</label><input type=\"text\" id=\"signup-org-name\" name=\"orgName\" required placeholder=\"" + escapeHtml(t("placeholderOrgName")) + "\" autocomplete=\"organization\" aria-describedby=\"signup-error-orgName\" /><span class=\"signup-field-error\" id=\"signup-error-orgName\" role=\"alert\" aria-live=\"polite\"></span></div>" +
      "</fieldset>" +
      "<div class=\"signup-more-wrap\">" +
      "<button type=\"button\" class=\"signup-more-toggle\" id=\"signup-more-toggle\" aria-expanded=\"false\" aria-controls=\"signup-more-content\">" +
      "<span class=\"signup-more-toggle-text\">" + moreOptionsLabel + "</span>" +
      "<span class=\"signup-more-toggle-icon\" aria-hidden=\"true\">▼</span>" +
      "</button>" +
      "<div class=\"signup-more-content\" id=\"signup-more-content\" role=\"region\" aria-label=\"" + moreOptionsLabel + "\" hidden>" +
      "<fieldset class=\"signup-section signup-section--muted\">" +
      "<legend class=\"signup-legend\">" + languageLabel + "</legend>" +
      "<div class=\"signup-options\" role=\"group\" aria-label=\"" + languageLabel + "\">" +
      "<button type=\"button\" class=\"signup-option-btn" + (currentLocale === "en" ? " is-active" : "") + "\" data-locale=\"en\">" + enLabel + "</button>" +
      "<button type=\"button\" class=\"signup-option-btn" + (currentLocale === "ta" ? " is-active" : "") + "\" data-locale=\"ta\">" + taLabel + "</button>" +
      "</div>" +
      "</fieldset>" +
      "<fieldset class=\"signup-section signup-section--muted\">" +
      "<legend class=\"signup-legend\">" + themeLabel + "</legend>" +
      "<div class=\"signup-options\" role=\"group\" aria-label=\"" + themeLabel + "\">" +
      "<button type=\"button\" class=\"signup-option-btn" + (currentTheme === "light" ? " is-active" : "") + "\" data-theme-option=\"light\">" + lightLabel + "</button>" +
      "<button type=\"button\" class=\"signup-option-btn" + (currentTheme === "system" ? " is-active" : "") + "\" data-theme-option=\"system\">" + systemLabel + "</button>" +
      "<button type=\"button\" class=\"signup-option-btn" + (currentTheme === "dark" ? " is-active" : "") + "\" data-theme-option=\"dark\">" + darkLabel + "</button>" +
      "</div>" +
      "</fieldset>" +
      "<fieldset class=\"signup-section signup-section--muted\">" +
      "<legend class=\"signup-legend\">" + accentLabel + "</legend>" +
      "<div class=\"signup-accent-options\" role=\"group\" aria-label=\"" + accentLabel + "\">" +
      "<button type=\"button\" class=\"signup-accent-swatch" + (currentAccent === "amber" ? " is-active" : "") + "\" data-accent-option=\"amber\" aria-label=\"" + amberLabel + "\" title=\"" + amberLabel + "\"></button>" +
      "<button type=\"button\" class=\"signup-accent-swatch" + (currentAccent === "blue" ? " is-active" : "") + "\" data-accent-option=\"blue\" aria-label=\"" + blueLabel + "\" title=\"" + blueLabel + "\"></button>" +
      "<button type=\"button\" class=\"signup-accent-swatch" + (currentAccent === "green" ? " is-active" : "") + "\" data-accent-option=\"green\" aria-label=\"" + greenLabel + "\" title=\"" + greenLabel + "\"></button>" +
      "</div>" +
      "</fieldset>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "<div class=\"signup-actions\">" +
      "<button type=\"submit\" class=\"signup-btn\" id=\"signup-submit\">" + getStarted + "</button>" +
      "<button type=\"button\" class=\"signup-populate-link\" id=\"signup-populate\" title=\"" + escapeHtml(t("populateTitle") || "Fill form with sample data for testing") + "\">" + escapeHtml(t("fillWithSampleData") || "Fill with sample data") + "</button>" +
      "</div>" +
      "</form>" +
      "</div>" +
      "</div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.onboarding = { render: render };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

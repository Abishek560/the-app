/**
 * Entry point for login.html: theme, auth/onboarding only. Redirects to index.html on success.
 */
(function (global) {
  "use strict";

  // Apply saved theme before DOM ready
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
    var contentEl = document.getElementById("content");
    var language = theApp.language;

    // Stub for onboarding submit button loading
    function withButtonLoading(btn, promise) {
      if (!btn || !promise || typeof promise.then !== "function") return promise;
      var orig = btn.textContent;
      var loadingT = (language && language.t && language.t("loading")) || "Loading";
      btn.disabled = true;
      btn.classList.add("btn-loading");
      btn.textContent = loadingT + "…";
      return promise.finally(function () {
        btn.disabled = false;
        btn.classList.remove("btn-loading");
        btn.textContent = orig;
      });
    }
    theApp.withButtonLoading = withButtonLoading;

    if (theApp.controller.theme && theApp.controller.theme.bindThemeControls) {
      theApp.controller.theme.bindThemeControls();
    }
    if (theApp.errorPopup && theApp.errorPopup.bind) {
      theApp.errorPopup.bind();
    }
    if (language && language.init) language.init();
    if (typeof document.documentElement.setAttribute === "function") {
      document.documentElement.setAttribute("dir", theApp.config && theApp.config.rtl ? "rtl" : "ltr");
    }
    if (language && language.applyToDocument) language.applyToDocument();

    var hasSession = !!(state.email && state.email.trim() && state.portalName && state.portalName.trim());

    if (hasSession) {
      global.location.href = "index.html#/" + encodeURIComponent(state.portalName) + "/dashboard";
      return;
    }

    if (state.testMode) {
      state.showOnboarding = true;
      state.showAuthScreen = false;
      if (contentEl) {
        var onboardingView = theApp.view.onboarding;
        contentEl.innerHTML = onboardingView ? onboardingView.render() : "<div class=\"signup-page\"><p>Loading…</p></div>";
        if (theApp.controller.onboarding && theApp.controller.onboarding.bind) {
          theApp.controller.onboarding.bind(contentEl);
        }
      }
    } else {
      state.showAuthScreen = true;
      state.showOnboarding = false;
      if (theApp.controller.auth && theApp.controller.auth.renderAuth) {
        theApp.controller.auth.renderAuth();
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})(typeof window !== "undefined" ? window : this);

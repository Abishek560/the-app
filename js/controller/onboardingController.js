/**
 * Controller: Sign up – save user to state only (no localStorage). Language/theme applied in-memory. Resets on reload.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var contentEl = document.getElementById("content");

  function getInitials(name) {
    if (!name || typeof name !== "string") return "?";
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (name[0] || "?").toUpperCase();
  }

  function getFormValues(form) {
    if (!form) return {};
    return {
      userName: (form.querySelector("[name=userName]") || {}).value,
      userEmail: (form.querySelector("[name=userEmail]") || {}).value,
      orgName: (form.querySelector("[name=orgName]") || {}).value
    };
  }

  function setFormValues(form, vals) {
    if (!form || !vals) return;
    var n = form.querySelector("[name=userName]");
    var e = form.querySelector("[name=userEmail]");
    var o = form.querySelector("[name=orgName]");
    if (n) n.value = vals.userName || "";
    if (e) e.value = vals.userEmail || "";
    if (o) o.value = vals.orgName || "";
  }

  function toPortalName(orgName) {
    return (orgName || "portal").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "portal";
  }

  function reRenderSignup() {
    if (!theApp.view.onboarding || !contentEl) return;
    var form = contentEl.querySelector("#signup-form");
    var vals = form ? getFormValues(form) : {};
    contentEl.innerHTML = theApp.view.onboarding.render();
    form = contentEl.querySelector("#signup-form");
    if (form) setFormValues(form, vals);
    bind(contentEl);
  }

  function bind(el) {
    var root = el || contentEl;
    if (!root) return;

    var form = root.querySelector("#signup-form");
    if (form) {
      var populateBtn = root.querySelector("#signup-populate");
      if (populateBtn) {
        populateBtn.addEventListener("click", function () {
          var n = form.querySelector("[name=userName]");
          var e = form.querySelector("[name=userEmail]");
          var o = form.querySelector("[name=orgName]");
          var sample = (typeof window !== "undefined" && window.__POPULATE_DATA__ && window.__POPULATE_DATA__.signupSample) ? window.__POPULATE_DATA__.signupSample : { userName: "Demo User", userEmail: "demo@example.com", orgName: "My Garage" };
          if (n) n.value = sample.userName || "";
          if (e) e.value = sample.userEmail || "";
          if (o) o.value = sample.orgName || "";
          var delayPromise = new Promise(function (resolve) { setTimeout(resolve, 1000); });
          var proceedPromise = delayPromise.then(function () {
            form.requestSubmit();
          });
          if (theApp.withButtonLoading && populateBtn) theApp.withButtonLoading(populateBtn, proceedPromise);
        });
      }
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };
        root.querySelectorAll(".signup-field-error").forEach(function (el) { el.textContent = ""; });
        root.querySelectorAll(".signup-field input").forEach(function (inp) { inp.setAttribute("aria-invalid", "false"); });
        var nameInp = form.querySelector("[name=userName]");
        var emailInp = form.querySelector("[name=userEmail]");
        var orgInp = form.querySelector("[name=orgName]");
        var userName = (nameInp && nameInp.value) || "";
        var userEmail = (emailInp && emailInp.value) || "";
        var orgName = (orgInp && orgInp.value) || "";
        var errName = root.querySelector("#signup-error-userName");
        var errEmail = root.querySelector("#signup-error-userEmail");
        var errOrg = root.querySelector("#signup-error-orgName");
        if (!userName.trim()) {
          if (errName) errName.textContent = t("signupErrorName") || "Enter your name";
          if (nameInp) { nameInp.setAttribute("aria-invalid", "true"); nameInp.focus(); }
          return;
        }
        if (!userEmail.trim()) {
          if (errEmail) errEmail.textContent = t("signupErrorEmail") || "Enter your email";
          if (emailInp) { emailInp.setAttribute("aria-invalid", "true"); emailInp.focus(); }
          return;
        }
        if (!orgName.trim()) {
          if (errOrg) errOrg.textContent = t("signupErrorOrgName") || "Enter organization name";
          if (orgInp) { orgInp.setAttribute("aria-invalid", "true"); orgInp.focus(); }
          return;
        }
        var userData = { name: userName.trim(), email: userEmail.trim() };
        var orgNameTrimmed = orgName.trim();
        var portalName = toPortalName(orgNameTrimmed);
        var portalData = {
          name: orgNameTrimmed || "My Organization",
          portalName: portalName,
          version: (theApp.config && theApp.config.api && theApp.config.api.version) || "v1",
          baseURL: (theApp.config && theApp.config.api && theApp.config.api.baseURL) || ""
        };

        function goToModuleSetup() {
          state.showModuleSetup = true;
          if (theApp.controller.app && theApp.controller.app.renderContent) theApp.controller.app.renderContent();
        }

        var api = theApp.api;
        var createUserThenPortal = function () {
          if (api && api.createUser) {
            return api.createUser(userData).then(function (created) {
              state.currentUser = created && typeof created === "object"
                ? Object.assign({ id: 1, initials: getInitials(created.name || userData.name) }, created)
                : { id: 1, name: userData.name, email: userData.email, initials: getInitials(userData.name) };
            });
          }
          state.currentUser = { id: 1, name: userData.name, email: userData.email, initials: getInitials(userData.name) };
          return Promise.resolve();
        };

        var submitBtn = form.querySelector("#signup-submit") || form.querySelector('button[type="submit"]');
        var promise = createUserThenPortal().then(function () {
          if (api && api.createPortal) {
            return api.createPortal(portalData).then(function (created) {
              state.portal = (created && typeof created === "object") ? created : portalData;
              if (theApp.config && theApp.config.api) theApp.config.api.portalName = (state.portal.portalName || portalName);
              goToModuleSetup();
            });
          }
          state.portal = portalData;
          if (theApp.config && theApp.config.api) theApp.config.api.portalName = portalName;
          goToModuleSetup();
        });
        if (theApp.withButtonLoading && submitBtn && promise) theApp.withButtonLoading(submitBtn, promise);
      });
    }

    root.querySelectorAll(".signup-option-btn[data-locale]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var locale = btn.getAttribute("data-locale");
        if (theApp.language && theApp.language.setLocale) theApp.language.setLocale(locale, { persist: false });
        reRenderSignup();
      });
    });

    root.querySelectorAll(".signup-option-btn[data-theme-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-theme-option");
        if (theApp.controller.theme && theApp.controller.theme.setTheme) theApp.controller.theme.setTheme(mode, { persist: false });
        root.querySelectorAll(".signup-option-btn[data-theme-option]").forEach(function (b) { b.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
    });

    root.querySelectorAll(".signup-accent-swatch[data-accent-option]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var accent = btn.getAttribute("data-accent-option");
        if (theApp.controller.theme && theApp.controller.theme.setAccent) theApp.controller.theme.setAccent(accent, { persist: false });
        root.querySelectorAll(".signup-accent-swatch[data-accent-option]").forEach(function (s) { s.classList.remove("is-active"); });
        btn.classList.add("is-active");
      });
    });

    var firstInput = root.querySelector("#signup-user-name");
    if (firstInput) {
      setTimeout(function () { firstInput.focus(); }, 0);
    }

    var moreToggle = root.querySelector("#signup-more-toggle");
    var moreContent = root.querySelector("#signup-more-content");
    if (moreToggle && moreContent) {
      moreToggle.addEventListener("click", function () {
        var expanded = moreToggle.getAttribute("aria-expanded") === "true";
        moreToggle.setAttribute("aria-expanded", !expanded);
        moreContent.hidden = expanded;
        moreToggle.classList.toggle("is-expanded", !expanded);
        if (!expanded) {
          requestAnimationFrame(function () {
            moreContent.scrollIntoView({ behavior: "smooth", block: "start" });
          });
        }
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.onboarding = {
    bind: bind,
    reRenderSignup: reRenderSignup
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

/**
 * Controller: Entry form (release mode) – email first, then login or signup via API; store email + portalName, no Firebase Auth.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var contentEl = document.getElementById("content");
  var api = theApp.api;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  var DEFAULT_PORTAL = "default";

  function toPortalName(orgName) {
    return (orgName || "portal").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "portal";
  }

  function storeSessionAndRedirect(email, portalName, hashPath) {
    try {
      if (global.localStorage) {
        global.localStorage.setItem("crm-email", String(email || "").trim());
        global.localStorage.setItem("crm-portalName", String(portalName || "").trim());
      }
      state.email = String(email || "").trim();
      state.portalName = String(portalName || "").trim();
      state.showAuthScreen = false;
      if (theApp.controller.app && theApp.controller.app.loadAndShowMainApp) {
        theApp.controller.app.loadAndShowMainApp();
      } else {
        var path = (hashPath != null && hashPath !== "") ? hashPath : "dashboard";
        global.location.href = "index.html#/" + encodeURIComponent(portalName) + "/" + path.replace(/^\//, "");
      }
    } catch (e) {
      if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(e && e.message ? e.message : "Failed to save");
    }
  }

  function showEmailStep() {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderEmailStep();
    bindEmailStep(contentEl);
  }

  function showLogin(email) {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderLogin(email);
    bindLogin(contentEl, email);
  }

  function showSignup(email) {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderSignup(email);
    bindSignup(contentEl, email);
  }

  function bindEmailStep(root) {
    if (!root) return;
    var form = root.querySelector("#auth-entry-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (form.querySelector("[name=email]") || {}).value;
        if (!email || !email.trim()) return;
        var emailTrimmed = email.trim();
        var errEl = root.querySelector("#auth-entry-error");
        if (errEl) errEl.style.display = "none";
        if (!api || !api.checkUserAvailability) {
          showLogin(emailTrimmed);
          return;
        }
        api.checkUserAvailability(emailTrimmed).then(function (res) {
          if (res && res.exists === true) {
            showLogin(emailTrimmed);
          } else {
            showSignup(emailTrimmed);
          }
        }).catch(function () {
          if (errEl) {
            errEl.textContent = t("error") || "Error";
            errEl.style.display = "block";
          }
        });
      });
    }
  }

  function bindLogin(root, email) {
    if (!root || !email) return;
    var form = root.querySelector("#auth-login-form");
    var backBtn = root.querySelector("#auth-login-back");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var password = (form.querySelector("[name=password]") || {}).value;
        var errEl = root.querySelector("#auth-login-error");
        if (errEl) errEl.style.display = "none";
        if (!password || !password.trim()) return;
        if (!api || !api.login) {
          storeSessionAndRedirect(email, DEFAULT_PORTAL, "dashboard");
          return;
        }
        api.login(email, password).then(function (user) {
          var portalName = (user && user.portalName) ? user.portalName : DEFAULT_PORTAL;
          storeSessionAndRedirect(email, portalName, "dashboard");
        }).catch(function (err) {
          var msg = (err && err.message) ? err.message : (t("invalidEmailOrPassword") || "Invalid email or password");
          var errEl = root.querySelector("#auth-login-error");
          if (errEl) {
            errEl.textContent = msg;
            errEl.style.display = "block";
          }
        });
      });
    }
    if (backBtn) {
      backBtn.addEventListener("click", function () { showEmailStep(); });
    }
  }

  function bindSignup(root, email) {
    if (!root || !email) return;
    var form = root.querySelector("#auth-signup-form");
    var backBtn = root.querySelector("#auth-signup-back");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var name = (form.querySelector("[name=name]") || {}).value;
        var password = (form.querySelector("[name=password]") || {}).value;
        var orgName = (form.querySelector("[name=orgName]") || {}).value;
        var errEl = root.querySelector("#auth-signup-error");
        if (errEl) errEl.style.display = "none";
        if (!name || !name.trim()) {
          if (errEl) { errEl.textContent = t("signupErrorName") || "Enter your name"; errEl.style.display = "block"; }
          return;
        }
        if (!password || !password.trim()) {
          if (errEl) { errEl.textContent = t("password") || "Password"; errEl.style.display = "block"; }
          return;
        }
        if (!orgName || !orgName.trim()) {
          if (errEl) { errEl.textContent = t("signupErrorOrgName") || "Enter organization name"; errEl.style.display = "block"; }
          return;
        }
        var portalName = toPortalName(orgName.trim());
        var userData = { name: name.trim(), email: email, password: password };
        var portalData = {
          name: orgName.trim() || "My Organization",
          portalName: portalName,
          version: (theApp.config && theApp.config.api && theApp.config.api.version) || "v1",
          baseURL: (theApp.config && theApp.config.api && theApp.config.api.baseURL) || ""
        };
        var submitBtn = form.querySelector("#auth-signup-submit") || form.querySelector('button[type="submit"]');
        var promise = (api && api.createUser ? api.createUser(userData) : Promise.resolve(userData)).then(function (created) {
          if (created && typeof created === "object") state.currentUser = created;
          if (api && api.createPortal) {
            return api.createPortal(portalData).then(function (p) {
              if (p && typeof p === "object") state.portal = p;
              else state.portal = portalData;
              storeSessionAndRedirect(email, portalName, "setup");
            });
          }
          state.portal = portalData;
          storeSessionAndRedirect(email, portalName, "setup");
        }).catch(function (err) {
          if (errEl) {
            errEl.textContent = (err && err.message) ? err.message : (t("error") || "Error");
            errEl.style.display = "block";
          }
        });
        if (theApp.withButtonLoading && submitBtn && promise) theApp.withButtonLoading(submitBtn, promise);
      });
    }
    if (backBtn) {
      backBtn.addEventListener("click", function () { showEmailStep(); });
    }
  }

  function renderAuth() {
    showEmailStep();
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.auth = {
    renderAuth: renderAuth,
    showEmailStep: showEmailStep,
    showLogin: showLogin,
    showSignup: showSignup
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

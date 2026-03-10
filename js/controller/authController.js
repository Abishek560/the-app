/**
 * Controller: Auth (release mode) – sign in, sign up, test mode switch.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var contentEl = document.getElementById("content");

  function toPortalName(orgName) {
    return (orgName || "portal").trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "") || "portal";
  }

  function getInitials(name) {
    if (!name || typeof name !== "string") return "?";
    var parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return (name[0] || "?").toUpperCase();
  }

  function switchToTestMode() {
    try {
      if (global.localStorage) {
        global.localStorage.setItem("crm-testMode", "true");
        global.location.reload();
      }
    } catch (e) {}
  }

  function showEmailStep() {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderEmailStep();
    bind(contentEl);
  }

  function showLogin(email) {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderLogin(email || "");
    bind(contentEl);
  }

  function showSignup(email) {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderSignup(email || "");
    bind(contentEl);
  }

  function checkEmailAndProceed(email) {
    var fetchMethods = global.firebaseFetchSignInMethodsForEmail;
    var auth = global.firebaseAuth;
    if (!fetchMethods || !auth) {
      showSignup(email);
      return;
    }
    return fetchMethods(auth, email).then(function (methods) {
      if (methods && methods.length > 0) {
        showLogin(email);
      } else {
        showSignup(email);
      }
    }).catch(function () {
      showSignup(email);
    });
  }

  function handleLogin(email, password) {
    var signIn = global.firebaseAuthSignIn;
    var auth = global.firebaseAuth;
    if (!signIn || !auth) return Promise.reject(new Error("Firebase Auth not loaded"));
    return signIn(auth, email, password);
  }

  function handleSignup(name, email, password, orgName) {
    var signUp = global.firebaseAuthSignUp;
    var auth = global.firebaseAuth;
    var updateProfileFn = global.firebaseAuthUpdateProfile;
    var dbRef = global.firebaseDbRef;
    var dbSet = global.firebaseDbSet;
    var dbGet = global.firebaseDbGet;
    var db = global.firebaseDb;
    if (!signUp || !auth) return Promise.reject(new Error("Firebase Auth not loaded"));

    var portalName = toPortalName(orgName);
    var portalData = {
      name: (orgName || "My Organization").trim(),
      portalName: portalName,
      version: (theApp.config && theApp.config.api && theApp.config.api.version) || "v1",
      baseURL: (theApp.config && theApp.config.api && theApp.config.api.baseURL) || ""
    };
    var initials = getInitials(name);

    return signUp(auth, email, password).then(function (userCred) {
      var user = userCred && userCred.user;
      if (!user) throw new Error("Sign up failed");
      try { if (global.sessionStorage) global.sessionStorage.setItem("crm-pendingPortalName", portalName); } catch (e) {}
      var updatePromise = updateProfileFn
        ? updateProfileFn(user, { displayName: name })
        : Promise.resolve();
      return updatePromise.then(function () {
        if (dbRef && dbSet && db) {
          var uid = user.uid;
          var userProfile = { name: name, email: email, portalName: portalName };
          var currentUser = { id: uid, name: name, email: email, initials: initials };
          return Promise.all([
            dbSet(dbRef(db, "users/" + uid + "/portalName"), portalName),
            dbSet(dbRef(db, "portals/" + portalName + "/portal"), portalData),
            dbSet(dbRef(db, "portals/" + portalName + "/currentUser"), currentUser),
            dbSet(dbRef(db, "portals/" + portalName + "/modules"), {}),
            dbSet(dbRef(db, "portals/" + portalName + "/entities"), {})
          ]).then(function () { return user; });
        }
        return user;
      });
    });
  }

  function loadPortalForUser(uid) {
    try {
      var pending = global.sessionStorage && global.sessionStorage.getItem("crm-pendingPortalName");
      if (pending) {
        global.sessionStorage.removeItem("crm-pendingPortalName");
        return Promise.resolve(String(pending).trim() || null);
      }
    } catch (e) {}
    var dbRef = global.firebaseDbRef;
    var dbGet = global.firebaseDbGet;
    var db = global.firebaseDb;
    if (!dbRef || !dbGet || !db) return Promise.resolve(null);
    return dbGet(dbRef(db, "users/" + uid + "/portalName")).then(function (snap) {
      var val = snap && snap.val();
      return val != null ? String(val) : null;
    }).catch(function () { return null; });
  }

  function updatePasswordFieldVisibility(root, testModeOn) {
    var pwField = root && root.querySelector(".auth-password-field");
    var pwInput = root && root.querySelector("#auth-signup-password");
    if (!pwField || !pwInput) return;
    if (testModeOn) {
      pwField.style.display = "none";
      pwInput.removeAttribute("required");
      pwInput.value = "";
    } else {
      pwField.style.display = "";
      pwInput.setAttribute("required", "required");
    }
  }

  function bind(root) {
    if (!root) return;
    var emailForm = root.querySelector("#auth-email-form");
    var loginForm = root.querySelector("#auth-login-form");
    var signupForm = root.querySelector("#auth-signup-form");
    var backToEmailLinks = root.querySelectorAll("#auth-back-to-email");
    var testModeToggle = root.querySelector("#auth-test-mode-toggle");

    if (backToEmailLinks.length) {
      backToEmailLinks.forEach(function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          showEmailStep();
        });
      });
    }
    if (testModeToggle) {
      updatePasswordFieldVisibility(root, testModeToggle.checked);
      testModeToggle.addEventListener("change", function () {
        updatePasswordFieldVisibility(root, testModeToggle.checked);
      });
    }
    if (emailForm) {
      emailForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (emailForm.querySelector("[name=email]") || {}).value;
        if (!email || !email.trim()) return;
        var btn = root.querySelector("#auth-email-submit");
        var promise = checkEmailAndProceed(email.trim());
        if (theApp.withButtonLoading && btn && promise) {
          theApp.withButtonLoading(btn, promise);
        }
      });
    }
    if (loginForm) {
      loginForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (loginForm.querySelector("[name=email]") || {}).value;
        var password = (loginForm.querySelector("[name=password]") || {}).value;
        if (!email || !password) return;
        var btn = root.querySelector("#auth-login-submit");
        if (theApp.withButtonLoading && btn) {
          theApp.withButtonLoading(btn, handleLogin(email.trim(), password).catch(function (err) {
            if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(err && err.message ? err.message : "Sign in failed");
            throw err;
          }));
        } else {
          handleLogin(email.trim(), password).catch(function (err) {
            if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(err && err.message ? err.message : "Sign in failed");
          });
        }
      });
    }
    if (signupForm) {
      signupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var testModeToggleEl = root.querySelector("#auth-test-mode-toggle");
        var useTestMode = testModeToggleEl && testModeToggleEl.checked;
        var name = (signupForm.querySelector("[name=name]") || {}).value;
        var email = (signupForm.querySelector("[name=email]") || {}).value;
        var password = (signupForm.querySelector("[name=password]") || {}).value;
        var orgName = (signupForm.querySelector("[name=orgName]") || {}).value;
        if (!name || !email || !orgName) return;
        if (!useTestMode && !password) return;
        if (useTestMode) {
          try {
            if (global.sessionStorage) {
              global.sessionStorage.setItem("crm-signup-prefill", JSON.stringify({
                userName: name.trim(),
                userEmail: email.trim(),
                orgName: orgName.trim()
              }));
            }
            switchToTestMode();
          } catch (err) {
            if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(err && err.message ? err.message : "Failed to switch to test mode");
          }
          return;
        }
        var btn = root.querySelector("#auth-signup-submit");
        if (theApp.withButtonLoading && btn) {
          theApp.withButtonLoading(btn, handleSignup(name.trim(), email.trim(), password, orgName.trim()).catch(function (err) {
            if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(err && err.message ? err.message : "Sign up failed");
            throw err;
          }));
        } else {
          handleSignup(name.trim(), email.trim(), password, orgName.trim()).catch(function (err) {
            if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(err && err.message ? err.message : "Sign up failed");
          });
        }
      });
    }
  }

  function renderAuth() {
    if (!theApp.view.auth || !contentEl) return;
    contentEl.innerHTML = theApp.view.auth.renderEmailStep();
    bind(contentEl);
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.auth = {
    renderAuth: renderAuth,
    showEmailStep: showEmailStep,
    showLogin: showLogin,
    showSignup: showSignup,
    switchToTestMode: switchToTestMode,
    handleLogin: handleLogin,
    handleSignup: handleSignup,
    loadPortalForUser: loadPortalForUser
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

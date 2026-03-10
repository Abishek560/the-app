/**
 * Controller: app bootstrap and content routing.
 * Routes by active module: any module with fields uses the dynamic entity controller/view.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.view || !theApp.controller) return;

  var state = theApp.state;
  var api = theApp.api;
  var contentView = theApp.view.content;
  var entityView = theApp.view.entityModule;
  var entityController = theApp.controller.entity;
  var entityDetailView = theApp.view.entityDetail;
  var entityDetailController = theApp.controller.entityDetail;
  var entityFormView = theApp.view.entityForm;
  var entityFormController = theApp.controller.entityForm;
  var settingsView = theApp.view.settings;
  var settingsController = theApp.controller.settings;
  var dashboardView = theApp.view.dashboard;
  var dashboardController = theApp.controller.dashboard;
  var topbarView = theApp.view.topbar;
  var navController = theApp.controller.nav;
  var getModuleFields = theApp.getModuleFields || function () { return []; };
  var getEntityData = theApp.getEntityData;
  var language = theApp.language;

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

  var contentEl = document.getElementById("content");
  var profileBtn = document.getElementById("profile-btn");
  var profilePanel = document.getElementById("profile-panel");
  var profileBackdrop = document.getElementById("profile-backdrop");
  var profileCloseBtn = document.querySelector && document.querySelector(".profile-close-btn");

  /** Static modules always present: Dashboard (nav + content). Ensures it exists in the list from API. */
  function ensureStaticModules(modules) {
    var list = Array.isArray(modules) ? modules.slice() : [];
    var hasDashboard = list.some(function (m) { return m.id === "dashboard"; });
    if (!hasDashboard) {
      list.unshift({
        id: "dashboard",
        label: (language && language.t && language.t("dashboard")) ? language.t("dashboard") : "Dashboard",
        fields: []
      });
    }
    return list;
  }

  /**
   * Renders the main content area based on state.activeModule.
   * Any module with fields uses the dynamic entity flow; others get a placeholder.
   */
  function ensureTopbarSettingsMode() {
    var topbarInner = document.querySelector(".topbar-inner");
    if (!topbarInner || topbarInner.getAttribute("data-settings-mode") === "true") return;
    topbarInner.innerHTML = topbarView.renderSettingsBarHTML();
    topbarInner.setAttribute("data-settings-mode", "true");
    var backBtn = document.getElementById("settings-topbar-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        state.settingsOpen = false;
        state.settingsSection = "organization";
        state.settingsEditingOrg = false;
        state.settingsEditingModuleId = null;
        renderContent();
      });
    }
    var profileBtnEl = document.getElementById("profile-btn");
    if (profileBtnEl) profileBtnEl.addEventListener("click", function (e) { e.stopPropagation(); navController.toggleProfilePanel(); });
  }

  function ensureTopbarNormalMode() {
    var topbarInner = document.querySelector(".topbar-inner");
    if (!topbarInner || topbarInner.getAttribute("data-settings-mode") !== "true") return;
    topbarInner.innerHTML = topbarView.getDefaultTopbarInnerHTML();
    topbarInner.removeAttribute("data-settings-mode");
    var freshNavEl = document.getElementById("nav-modules");
    topbarView.renderNav(freshNavEl, { getMaxPrimary: topbarView.getMaxPrimary });
    navController.bindNavListeners();
    var profileBtnEl = document.getElementById("profile-btn");
    if (profileBtnEl) profileBtnEl.addEventListener("click", function (e) { e.stopPropagation(); navController.toggleProfilePanel(); });
  }

  function renderContent() {
    if (!contentEl) return;

    if (state.showAuthScreen) {
      var authCtrl = theApp.controller.auth;
      if (authCtrl && authCtrl.renderAuth) authCtrl.renderAuth();
      return;
    }

    if (state.showOnboarding) {
      if (state.showModuleSetup) {
        var moduleSetupView = theApp.view.moduleSetup;
        if (state.moduleSetupTemplates != null) {
          contentEl.innerHTML = moduleSetupView ? moduleSetupView.render({ templateGroups: state.moduleSetupTemplates, templateSearch: state.templateSearch || "" }) : "<div class=\"module-setup-page\"><p>" + (language && language.t ? language.t("loading") : "Loading") + "…</p></div>";
          if (theApp.controller.moduleSetup && theApp.controller.moduleSetup.bind) theApp.controller.moduleSetup.bind(contentEl);
        } else {
          contentEl.innerHTML = "<div class=\"module-setup-page\"><p>" + (language && language.t ? language.t("loading") : "Loading") + "…</p></div>";
          var locale = (language && language.getLocale) ? language.getLocale() : "en";
          (api.getModuleSetupTemplates ? api.getModuleSetupTemplates({ locale: locale }) : Promise.resolve(null)).then(function (templates) {
            state.moduleSetupTemplates = templates;
            if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") theApp.controller.app.renderContent();
          });
        }
      } else {
        var onboardingView = theApp.view.onboarding;
        contentEl.innerHTML = onboardingView ? onboardingView.render() : "<div class=\"signup-page\"><p>" + (language && language.t ? language.t("loading") : "Loading") + "…</p></div>";
        if (theApp.controller.onboarding && theApp.controller.onboarding.bind) theApp.controller.onboarding.bind(contentEl);
      }
      return;
    }

    if (state.settingsOpen) {
      var section = state.settingsSection || "organization";
      if (section === "staffs") state.settingsSection = "organization";
      if (section === "fields") state.settingsSection = "modules";
      ensureTopbarSettingsMode();
      contentEl.innerHTML = settingsView ? settingsView.renderLoading() : "<div>" + (language && language.t ? language.t("loading") : "Loading") + "…</div>";
      var portalPromise = state.portal != null ? Promise.resolve(state.portal) : (api.getPortalDetails ? api.getPortalDetails() : Promise.resolve({}));
      portalPromise.then(function (portal) {
        portal = portal || {};
        contentEl.innerHTML = settingsView.render(portal, state.modules || []);
        if (settingsController && settingsController.bind) settingsController.bind(contentEl);
      });
      return;
    }

    ensureTopbarNormalMode();

    var getModuleLabel = theApp.getModuleLabel || function (m) { return (m && m.label) || (m && m.id) || ""; };
    var activeEntity = state.activeEntity;
    var entityViewMode = state.entityViewMode || "detail";

    if (activeEntity && activeEntity.moduleId && activeEntity.entityId && entityViewMode === "edit") {
      var modLabelEdit = (state.modules || []).filter(function (m) { return m.id === activeEntity.moduleId; })[0];
      var moduleLabelEdit = modLabelEdit ? getModuleLabel(modLabelEdit) : activeEntity.moduleId;
      contentEl.innerHTML = entityDetailView ? entityDetailView.renderLoading(moduleLabelEdit) : "<div>" + (language && language.t ? language.t("loading") : "Loading") + "…</div>";
      api.getEntity(activeEntity.moduleId, activeEntity.entityId).then(function (entity) {
        if (!entity) {
          state.entityViewMode = "detail";
          if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") theApp.controller.app.renderContent();
          return;
        }
        var ensureOpts = entityController.ensureModuleFieldOptions ? entityController.ensureModuleFieldOptions(activeEntity.moduleId) : Promise.resolve();
        ensureOpts.then(function () {
          contentEl.innerHTML = entityFormView.renderEdit(activeEntity.moduleId, entity, moduleLabelEdit);
          if (entityFormController && entityFormController.bind) entityFormController.bind(contentEl, false);
        });
      });
      return;
    }

    if (state.creatingModule) {
      var moduleIdCreate = state.creatingModule;
      var modLabelCreate = (state.modules || []).filter(function (m) { return m.id === moduleIdCreate; })[0];
      var moduleLabelCreate = modLabelCreate ? getModuleLabel(modLabelCreate) : moduleIdCreate;
      var ensureOptsCreate = entityController.ensureModuleFieldOptions ? entityController.ensureModuleFieldOptions(moduleIdCreate) : Promise.resolve();
      ensureOptsCreate.then(function () {
        contentEl.innerHTML = entityFormView.renderCreate(moduleIdCreate, moduleLabelCreate);
        if (entityFormController && entityFormController.bind) entityFormController.bind(contentEl, true);
      });
      return;
    }

    if (activeEntity && activeEntity.moduleId && activeEntity.entityId) {
      var modLabel = (state.modules || []).filter(function (m) { return m.id === activeEntity.moduleId; })[0];
      var moduleLabel = modLabel ? getModuleLabel(modLabel) : activeEntity.moduleId;
      contentEl.innerHTML = entityDetailView ? entityDetailView.renderLoading(moduleLabel) : "<div>" + (language && language.t ? language.t("loading") : "Loading") + "…</div>";
      api.getEntity(activeEntity.moduleId, activeEntity.entityId).then(function (entity) {
        if (!entity) {
          state.activeEntity = null;
          if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") theApp.controller.app.renderContent();
          return;
        }
        var ensureOptsDetail = entityController.ensureModuleFieldOptions ? entityController.ensureModuleFieldOptions(activeEntity.moduleId) : Promise.resolve();
        ensureOptsDetail.then(function () {
          contentEl.innerHTML = entityDetailView.render(activeEntity.moduleId, entity, moduleLabel);
          if (entityDetailController && entityDetailController.bind) entityDetailController.bind(contentEl);
        });
      });
      return;
    }
    var moduleId = state.activeModule;
    if (moduleId === "dashboard") {
      contentEl.innerHTML = dashboardView.render();
      if (dashboardController && dashboardController.bind) dashboardController.bind(contentEl);
      return;
    }
    var fields = getModuleFields(moduleId);
    if (fields.length > 0) {
      var data = getEntityData(moduleId);
      if (data.list === null) {
        contentEl.innerHTML = entityView.renderShell(moduleId);
        entityController.fetchEntityPage(moduleId, 1, contentEl);
        return;
      }
      var filters = data.filters || {};
      var filtersApplied = Object.keys(filters).some(function (k) {
        var v = filters[k] != null ? String(filters[k]).trim() : "";
        return v !== "" && v !== "all";
      });
      var emptyMsg = (language && language.t) ? (filtersApplied ? language.t("noResultsMatchFilters") : language.t("noResults")) : (filtersApplied ? "No results match your filters." : "No results.");
      contentEl.innerHTML = entityView.renderFull(moduleId, emptyMsg);
      entityController.bindFilterListeners(moduleId, contentEl);
      entityController.bindPaginationListeners(moduleId, contentEl);
      entityController.bindSortListeners(moduleId, contentEl);
      if (entityController.bindListRowClicks) entityController.bindListRowClicks(moduleId, contentEl);
      return;
    }
    var module = (state.modules || []).filter(function (m) { return m.id === moduleId; })[0];
    var title = module ? getModuleLabel(module) : "Module";
    contentEl.innerHTML = contentView.renderPlaceholder(title);
  }

  function bindSettingsLink() {
    var settingsLink = document.getElementById("profile-settings-link");
    if (settingsLink) {
      settingsLink.addEventListener("click", function (e) {
        e.preventDefault();
        state.settingsOpen = true;
        state.settingsSection = "organization";
        state.settingsEditingOrg = false;
        state.settingsEditingModuleId = null;
        if (navController.closeProfilePanel) navController.closeProfilePanel();
        renderContent();
      });
    }
    var signOutBtn = document.getElementById("profile-sign-out-btn");
    if (signOutBtn && signOutBtn.getAttribute("data-crm-bound") !== "true") {
      signOutBtn.setAttribute("data-crm-bound", "true");
      signOutBtn.addEventListener("click", function (e) {
        e.preventDefault();
        var signOut = global.firebaseAuthSignOut;
        var auth = global.firebaseAuth;
        if (signOut && auth) {
          signOut(auth);
        }
      });
    }
  }

  function bindLanguageOptions() {
    if (!language || !language.setLocale || !language.getLocale || !language.t) return;
    var container = document.getElementById("language-options");
    if (!container) return;
    var current = language.getLocale();
    container.querySelectorAll(".language-option").forEach(function (btn) {
      var locale = btn.getAttribute("data-locale");
      btn.setAttribute("aria-pressed", locale === current ? "true" : "false");
      btn.addEventListener("click", function () {
        if (locale === current) return;
        var msg = language.t("confirmLanguageReload") || "Change language? The app will reload.";
        if (typeof global.confirm !== "function" || !global.confirm(msg)) return;
        if (language.setLocale(locale) && typeof global.location !== "undefined" && global.location.reload) {
          global.location.reload();
        }
      });
    });
  }

  function setupTopbarForOnboarding() {
    var topbarInner = document.querySelector(".topbar-inner");
    if (topbarInner) {
      var appTitle = (language && language.t ? language.t("appName") : "App").replace(/</g, "&lt;");
      topbarInner.innerHTML = "<span class=\"signup-topbar-title\">" + appTitle + "</span>";
      topbarInner.setAttribute("data-onboarding", "true");
    }
    if (language && language.t && typeof document !== "undefined" && document.title !== undefined) document.title = language.t("appName") + " – " + (language.t("appTagline") || "");
  }

  function setupTopbarForMainApp() {
    var navModules = topbarView.getNavModules ? topbarView.getNavModules() : state.modules || [];
    if (!state.activeModule && navModules.length) state.activeModule = navModules[0].id;
    if (state.activeModule === "staffs" && navModules.length) state.activeModule = navModules[0].id;
    if (language && language.t && typeof document !== "undefined" && document.title !== undefined) {
      document.title = (state.portal && state.portal.name) ? (state.portal.name + " – " + (language.t("appTagline") || "")) : (language.t("appName") + " – " + (language.t("appTagline") || ""));
    }
    if (language && language.setOnLocaleChange) language.setOnLocaleChange(function () {
      var loc = language.getLocale ? language.getLocale() : "en";
      if (document.title !== undefined) document.title = (state.portal && state.portal.name) ? (state.portal.name + " – " + (language.t("appTagline") || "")) : (language.t("appName") + " – " + (language.t("appTagline") || ""));
      var bootstrapPromise = api.getBootstrap ? api.getBootstrap({ locale: loc, portalName: state.portalName }) : (api.getModules ? api.getModules({ locale: loc }) : Promise.resolve([])).then(function (modules) { return { modules: modules }; });
      bootstrapPromise.then(function (b) {
        if (b.modules && b.modules.length) state.modules = ensureStaticModules(b.modules);
        var navMods = topbarView.getNavModules ? topbarView.getNavModules() : [];
        if (state.activeModule === "staffs" && navMods.length) state.activeModule = navModules[0].id;
        var navEl = document.getElementById("nav-modules");
        topbarView.renderNav(navEl, { getMaxPrimary: topbarView.getMaxPrimary });
        navController.bindNavListeners();
        renderContent();
        if (navController.isProfileOpen && navController.isProfileOpen()) topbarView.hydrateProfileFromState();
      });
    });
    var navEl = document.getElementById("nav-modules");
    topbarView.renderNav(navEl, { getMaxPrimary: topbarView.getMaxPrimary });
    navController.bindNavListeners();
  }

  function loadAndShowMainApp() {
    var locale = (language && language.getLocale) ? language.getLocale() : "en";
    return (api.getBootstrap ? api.getBootstrap({ locale: locale, portalName: state.portalName }) : Promise.resolve({})).then(function (bootstrap) {
      if (bootstrap.user != null) state.currentUser = bootstrap.user;
      if (bootstrap.portal != null) state.portal = bootstrap.portal;
      if (bootstrap.modules && bootstrap.modules.length) state.modules = ensureStaticModules(bootstrap.modules);
      if (!state.modules || state.modules.length === 0) state.modules = [];
      state.showOnboarding = false;
      state.showAuthScreen = false;
      setupTopbarForMainApp();
      renderContent();
      if (profileBtn) profileBtn.addEventListener("click", function (e) { e.stopPropagation(); navController.toggleProfilePanel(); });
    });
  }

  /**
   * Bootstraps the app: theme, modules, nav, content, global listeners.
   * Test mode: show onboarding. Release mode: auth screen if not signed in, else main app.
   */
  async function init() {
    theApp.controller.theme.bindThemeControls();
    if (theApp.errorPopup && theApp.errorPopup.bind) theApp.errorPopup.bind();
    if (language && language.init) language.init();
    if (contentEl) contentEl.innerHTML = contentView.renderInitialLoading();

    var locale = (language && language.getLocale) ? language.getLocale() : "en";
    var needOnboarding = true;

    try {
      if (global.localStorage && global.localStorage.getItem("crm-testMode") === "true") {
        state.testMode = true;
      }
    } catch (e) {}

    if (state.testMode) {
      needOnboarding = true;
      state.showOnboarding = true;
      state.showAuthScreen = false;
    } else {
      needOnboarding = false;
      state.showAuthScreen = true;
      state.showOnboarding = false;
      var firebaseReady = (global.firebaseReady && typeof global.firebaseReady.then === "function") ? global.firebaseReady : Promise.resolve();
      var firebaseTimeout = new Promise(function (resolve) { setTimeout(resolve, 3000); });
      Promise.race([firebaseReady, firebaseTimeout]).then(function () {
        var onAuthChanged = global.firebaseAuthOnStateChanged;
        var auth = global.firebaseAuth;
        if (onAuthChanged && auth) {
          needOnboarding = false;
          onAuthChanged(auth, function (user) {
            if (user) {
              state.authUser = user;
              state.showAuthScreen = false;
              var authCtrl = theApp.controller.auth;
              var loadPortal = authCtrl && authCtrl.loadPortalForUser ? authCtrl.loadPortalForUser(user.uid) : Promise.resolve(null);
              loadPortal.then(function (portalName) {
                state.portalName = portalName || "";
                try { if (global.localStorage && portalName) global.localStorage.setItem("crm-portalName", portalName); } catch (e) {}
                loadAndShowMainApp();
              }).catch(function () {
                state.portalName = "";
                loadAndShowMainApp();
              });
            } else {
              state.authUser = null;
              state.portalName = "";
              state.showAuthScreen = true;
              state.showOnboarding = false;
              if (navController.closeProfilePanel) navController.closeProfilePanel();
              setupTopbarForOnboarding();
              renderContent();
            }
          });
        } else {
          needOnboarding = false;
          state.showAuthScreen = true;
          state.showOnboarding = false;
        }
      });
    }

    if (!state.modules || state.modules.length === 0) state.modules = [];

    if (typeof document.documentElement.setAttribute === "function") document.documentElement.setAttribute("dir", theApp.config.rtl ? "rtl" : "ltr");
    if (language && language.applyToDocument) language.applyToDocument();

    if (needOnboarding) {
      state.showOnboarding = true;
      setupTopbarForOnboarding();
    } else if (state.showAuthScreen) {
      setupTopbarForOnboarding();
    }

    renderContent();
    bindLanguageOptions();
    bindSettingsLink();

    document.addEventListener("click", function (e) {
      if (navController.isProfileOpen()) {
        if (profilePanel && profileBackdrop && e.target instanceof Node &&
            (e.target === profileBackdrop || !profilePanel.contains(e.target))) {
          navController.closeProfilePanel();
        }
        return;
      }
      if (!navController.isMoreMenuOpen()) return;
      var nav = document.getElementById("nav-modules");
      var moreWrap = nav && nav.querySelector(".nav-more");
      if (!moreWrap || (e.target instanceof Node && moreWrap.contains(e.target))) return;
      navController.closeMoreMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (navController.isProfileOpen()) navController.closeProfilePanel();
        else navController.closeMoreMenu();
      }
    });

    if (!needOnboarding && !state.showAuthScreen && profileBtn) {
      profileBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        navController.toggleProfilePanel();
      });
    }
    if (profileBackdrop) profileBackdrop.addEventListener("click", navController.closeProfilePanel);
    if (profileCloseBtn) profileCloseBtn.addEventListener("click", navController.closeProfilePanel);

    var resizeTimer;
    global.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        navController.closeMoreMenu();
        var nav = document.getElementById("nav-modules");
        topbarView.renderNav(nav, { getMaxPrimary: topbarView.getMaxPrimary });
        navController.bindNavListeners();
      }, 120);
    });
  }

  /** Called after module setup Finish (or when resuming). Uses state.modules if already set (from setup), else fetches. Renders main app. */
  function enterMainApp() {
    var locale = (language && language.getLocale) ? language.getLocale() : "en";
    var opts = { locale: locale, portalName: state.portalName };
    var hasModulesFromSetup = state.modules && state.modules.length > 0;
    var promise = hasModulesFromSetup
      ? Promise.resolve({ modules: state.modules })
      : (api.getBootstrap ? api.getBootstrap(opts) : (api.getModules ? api.getModules({ locale: locale }) : Promise.resolve([])).then(function (mods) { return { modules: mods }; }));
    return promise.then(function (b) {
      if (!hasModulesFromSetup && b.modules && b.modules.length) state.modules = ensureStaticModules(b.modules);
      var navModules = topbarView.getNavModules ? topbarView.getNavModules() : state.modules || [];
      if (!state.activeModule && navModules.length) state.activeModule = navModules[0].id;
      if (state.activeModule === "staffs" && navModules.length) state.activeModule = navModules[0].id;
      state.showOnboarding = false;
      if (typeof document !== "undefined" && document.title !== undefined && language && language.t) {
        document.title = (state.portal && state.portal.name) ? (state.portal.name + " – " + (language.t("appTagline") || "")) : (language.t("appName") + " – " + language.t("appTagline"));
      }
      var topbarInner = document.querySelector(".topbar-inner");
      if (topbarInner && topbarInner.getAttribute("data-onboarding") === "true") {
        topbarInner.innerHTML = topbarView.getDefaultTopbarInnerHTML();
        topbarInner.removeAttribute("data-onboarding");
      }
      var navEl = document.getElementById("nav-modules");
      topbarView.renderNav(navEl, { getMaxPrimary: topbarView.getMaxPrimary });
      navController.bindNavListeners();
      renderContent();
      var pb = document.getElementById("profile-btn");
      if (pb) pb.addEventListener("click", function (e) { e.stopPropagation(); navController.toggleProfilePanel(); });
      if (profileBackdrop) profileBackdrop.addEventListener("click", navController.closeProfilePanel);
      if (profileCloseBtn) profileCloseBtn.addEventListener("click", navController.closeProfilePanel);
    });
  }

  theApp.controller.app = {
    renderContent: renderContent,
    init: init,
    enterMainApp: enterMainApp,
    ensureStaticModules: ensureStaticModules
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

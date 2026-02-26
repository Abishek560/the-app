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
  var dashboardView = theApp.view.dashboard;
  var dashboardController = theApp.controller.dashboard;
  var topbarView = theApp.view.topbar;
  var navController = theApp.controller.nav;
  var getModuleFields = theApp.getModuleFields || function () { return []; };
  var getEntityData = theApp.getEntityData;

  var navEl = document.getElementById("nav-modules");
  var contentEl = document.getElementById("content");
  var profileBtn = document.getElementById("profile-btn");
  var profilePanel = document.getElementById("profile-panel");
  var profileBackdrop = document.getElementById("profile-backdrop");
  var profileCloseBtn = document.querySelector && document.querySelector(".profile-close-btn");

  /**
   * Renders the main content area based on state.activeModule.
   * Any module with fields uses the dynamic entity flow; others get a placeholder.
   */
  function renderContent() {
    if (!contentEl) return;
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
      contentEl.innerHTML = entityView.renderFull(moduleId, "No results match your filters.");
      entityController.bindFilterListeners(moduleId, contentEl);
      entityController.bindPaginationListeners(moduleId, contentEl);
      entityController.bindSortListeners(moduleId, contentEl);
      return;
    }
    var module = (state.modules || []).filter(function (m) { return m.id === moduleId; })[0];
    var title = (module && module.label) || "Module";
    contentEl.innerHTML = contentView.renderPlaceholder(title);
  }

  /**
   * Bootstraps the app: theme, modules, nav, content, global listeners.
   */
  async function init() {
    theApp.controller.theme.bindThemeControls();
    if (contentEl) contentEl.innerHTML = contentView.renderInitialLoading();

    state.modules = await api.getModules();
    if (!state.activeModule && state.modules.length) state.activeModule = state.modules[0].id;
    if (theApp.config && theApp.config.appName && typeof document !== "undefined" && document.title !== undefined) document.title = theApp.config.appName;
    topbarView.renderNav(navEl, { getMaxPrimary: topbarView.getMaxPrimary });
    navController.bindNavListeners();
    renderContent();

    (function prefetchCurrentUser() {
      var run = function () {
        api.getCurrentUser().then(function (user) {
          state.currentUser = user;
          if (navController.isProfileOpen && navController.isProfileOpen()) topbarView.hydrateProfileFromState();
        });
      };
      if (typeof global.requestIdleCallback !== "undefined") global.requestIdleCallback(run, { timeout: 500 }); else global.setTimeout(run, 0);
    })();

    document.addEventListener("click", function (e) {
      if (navController.isProfileOpen()) {
        if (profilePanel && profileBackdrop && e.target instanceof Node &&
            (e.target === profileBackdrop || !profilePanel.contains(e.target))) {
          navController.closeProfilePanel();
        }
        return;
      }
      if (!navController.isMoreMenuOpen()) return;
      var moreWrap = navEl && navEl.querySelector(".nav-more");
      if (!moreWrap || (e.target instanceof Node && moreWrap.contains(e.target))) return;
      navController.closeMoreMenu();
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        if (navController.isProfileOpen()) navController.closeProfilePanel();
        else navController.closeMoreMenu();
      }
    });

    if (profileBtn) {
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
        topbarView.renderNav(navEl, { getMaxPrimary: topbarView.getMaxPrimary });
        navController.bindNavListeners();
      }, 120);
    });
  }

  theApp.controller.app = {
    renderContent: renderContent,
    init: init
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

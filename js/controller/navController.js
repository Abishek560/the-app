/**
 * Controller: navigation (module switch, More menu, profile panel).
 * Orchestrates topbar view and content routing.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.view || !theApp.view.topbar || !theApp.api) return;

  var state = theApp.state;
  var topbarView = theApp.view.topbar;
  var api = theApp.api;

  var navEl = document.getElementById("nav-modules");
  var profileBtn = document.getElementById("profile-btn");
  var profilePanel = document.getElementById("profile-panel");
  var profileBackdrop = document.getElementById("profile-backdrop");
  var profileCloseBtn = document.querySelector && document.querySelector(".profile-close-btn");

  var moreMenuOpen = false;
  var profileOpen = false;

  function setActiveModule(moduleId) {
    state.activeModule = moduleId;
    topbarView.renderNav(navEl, { getMaxPrimary: topbarView.getMaxPrimary });
    bindNavListeners();
    if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
      theApp.controller.app.renderContent();
    }
  }

  function closeMoreMenu() {
    var wrap = navEl && navEl.querySelector(".nav-more");
    var btn = wrap && wrap.querySelector(".more-btn");
    if (!wrap || !btn) return;
    wrap.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    moreMenuOpen = false;
  }

  function toggleMoreMenu(wrap, btn) {
    var willOpen = !wrap.classList.contains("open");
    if (!willOpen) { closeMoreMenu(); return; }
    wrap.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    moreMenuOpen = true;
  }

  function openProfilePanel() {
    if (!profilePanel || !profileBackdrop) return;
    topbarView.hydrateProfileFromState();
    profilePanel.classList.add("open");
    profileBackdrop.classList.add("open");
    profilePanel.setAttribute("aria-hidden", "false");
    profileOpen = true;
  }

  function closeProfilePanel() {
    if (!profilePanel || !profileBackdrop) return;
    profilePanel.classList.remove("open");
    profileBackdrop.classList.remove("open");
    profilePanel.setAttribute("aria-hidden", "true");
    profileOpen = false;
  }

  function toggleProfilePanel() {
    if (profileOpen) closeProfilePanel();
    else {
      closeMoreMenu();
      openProfilePanel();
    }
  }

  function bindNavListeners() {
    if (!navEl) return;
    navEl.querySelectorAll("button[data-module-id]").forEach(function (btn) {
      var id = btn.getAttribute("data-module-id");
      if (!id) return;
      var alreadyBound = btn.getAttribute("data-crm-bound") === "true";
      if (alreadyBound) return;
      btn.setAttribute("data-crm-bound", "true");
      btn.addEventListener("click", function () {
        setActiveModule(id);
      });
    });
    var moreWrap = navEl.querySelector(".nav-more");
    if (moreWrap) {
      var moreBtn = moreWrap.querySelector(".more-btn");
      if (moreBtn && moreBtn.getAttribute("data-crm-bound") !== "true") {
        moreBtn.setAttribute("data-crm-bound", "true");
        moreBtn.addEventListener("click", function (e) {
          e.stopPropagation();
          toggleMoreMenu(moreWrap, moreBtn);
        });
      }
      moreWrap.querySelectorAll("[role=menuitem]").forEach(function (item) {
        var id = item.getAttribute("data-module-id");
        if (!id || item.getAttribute("data-crm-bound") === "true") return;
        item.setAttribute("data-crm-bound", "true");
        item.addEventListener("click", function () {
          var maxPrimary = topbarView.getMaxPrimary();
          var primaryIds = topbarView.getPrimaryIds(maxPrimary);
          if (primaryIds.length > 0) {
            var lastId = primaryIds[primaryIds.length - 1];
            var remaining = state.primaryOrder.filter(function (oid) {
              return primaryIds.indexOf(oid) === -1 && oid !== id && oid !== lastId;
            });
            state.primaryOrder = primaryIds.slice(0, -1).concat(id, lastId, remaining);
          }
          setActiveModule(id);
          closeMoreMenu();
        });
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.nav = {
    setActiveModule: setActiveModule,
    closeMoreMenu: closeMoreMenu,
    openProfilePanel: openProfilePanel,
    closeProfilePanel: closeProfilePanel,
    toggleProfilePanel: toggleProfilePanel,
    bindNavListeners: bindNavListeners,
    isProfileOpen: function () { return profileOpen; },
    isMoreMenuOpen: function () { return moreMenuOpen; }
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

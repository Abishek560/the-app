/**
 * View: topbar navigation (module list + More menu) and profile panel hydration.
 * Renders nav from state; does not bind click handlers (controller responsibility).
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.config) return;

  var state = theApp.state;

  /**
   * Computes max number of primary nav items by viewport width.
   */
  function getMaxPrimary() {
    var w = global.innerWidth || 1024;
    if (w < 560) return 4;
    if (w < 768) return 5;
    if (w < 1024) return 7;
    return 9;
  }

  /**
   * Returns the ordered list of module ids that fit in the primary nav.
   */
  function getPrimaryIds(maxPrimary) {
    var modules = state.modules || [];
    if (!state.primaryOrder || state.primaryOrder.length === 0) {
      state.primaryOrder = modules.map(function (m) { return m.id; });
    }
    var moduleIdSet = {};
    modules.forEach(function (m) { moduleIdSet[m.id] = true; });
    state.primaryOrder = state.primaryOrder.filter(function (id) { return moduleIdSet[id]; });
    var primaryIds = state.primaryOrder.slice(0, maxPrimary);
    var missing = modules.map(function (m) { return m.id; }).filter(function (id) { return primaryIds.indexOf(id) === -1; });
    state.primaryOrder = primaryIds.concat(missing);
    return state.primaryOrder.slice(0, maxPrimary);
  }

  /**
   * Renders the topbar nav (primary buttons + More dropdown). Caller must pass navEl and attach handlers.
   */
  function renderNav(navEl, options) {
    if (!navEl) return;
    navEl.innerHTML = "";
    var maxPrimary = (options && options.getMaxPrimary) ? options.getMaxPrimary() : getMaxPrimary();
    var primaryIds = getPrimaryIds(maxPrimary);
    var primarySet = {};
    primaryIds.forEach(function (id) { primarySet[id] = true; });
    var primaryModules = state.modules.filter(function (m) { return primarySet[m.id]; });
    var overflowModules = state.modules.filter(function (m) { return !primarySet[m.id]; });

    primaryModules.forEach(function (module) {
      var btn = document.createElement("button");
      btn.textContent = module.label;
      if (module.id === state.activeModule) btn.classList.add("active");
      btn.setAttribute("data-module-id", module.id);
      navEl.appendChild(btn);
    });

    if (overflowModules.length > 0) {
      var moreWrap = document.createElement("div");
      moreWrap.className = "nav-more";
      var moreBtn = document.createElement("button");
      moreBtn.className = "more-btn";
      moreBtn.type = "button";
      moreBtn.textContent = "⋯";
      moreBtn.setAttribute("aria-haspopup", "menu");
      moreBtn.setAttribute("aria-expanded", "false");
      moreBtn.setAttribute("aria-label", "More modules");
      if (overflowModules.some(function (m) { return m.id === state.activeModule; })) moreBtn.classList.add("active");
      var menu = document.createElement("div");
      menu.className = "more-menu";
      menu.setAttribute("role", "menu");
      overflowModules.forEach(function (module) {
        var item = document.createElement("button");
        item.type = "button";
        item.setAttribute("role", "menuitem");
        item.textContent = module.label;
        item.setAttribute("data-module-id", module.id);
        if (module.id === state.activeModule) item.classList.add("active");
        menu.appendChild(item);
      });
      moreWrap.appendChild(moreBtn);
      moreWrap.appendChild(menu);
      navEl.appendChild(moreWrap);
    }
  }

  /**
   * Fills profile panel DOM from state.currentUser.
   */
  function hydrateProfileFromState() {
    var user = state.currentUser;
    if (!user) return;
    var avatarEl = document.querySelector(".profile-avatar");
    if (avatarEl) {
      var initial = (user.initials && user.initials.trim()[0]) || (user.name && user.name.trim()[0]) || "U";
      avatarEl.textContent = initial.toUpperCase();
    }
    var nameEl = document.getElementById("profile-name");
    if (nameEl && user.name) nameEl.textContent = user.name;
    var roleEl = document.getElementById("profile-role");
    if (roleEl && user.role) roleEl.textContent = user.role;
    var emailEl = document.getElementById("profile-email");
    if (emailEl && user.email) emailEl.textContent = user.email;
    var subtitleEl = document.getElementById("profile-subtitle");
    if (subtitleEl && user.name) subtitleEl.textContent = "Signed in as " + user.name;
  }

  theApp.view = theApp.view || {};
  theApp.view.topbar = {
    renderNav: renderNav,
    hydrateProfileFromState: hydrateProfileFromState,
    getMaxPrimary: getMaxPrimary,
    getPrimaryIds: getPrimaryIds
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

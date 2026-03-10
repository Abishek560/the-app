/**
 * View: topbar navigation (module list + More menu) and profile panel hydration.
 * Renders nav from state; does not bind click handlers (controller responsibility).
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.config) return;

  var state = theApp.state;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };
  var getModuleLabel = theApp.getModuleLabel || function (m) { return (m && m.label) || (m && m.id) || ""; };

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

  /** Modules that appear in the nav (excludes staffs, which is settings-only). */
  function getNavModules() {
    return (state.modules || []).filter(function (m) { return m.id !== "staffs"; });
  }

  /**
   * Returns the ordered list of module ids that fit in the primary nav.
   */
  function getPrimaryIds(maxPrimary) {
    var modules = getNavModules();
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
   * When the active module is in overflow, it is promoted to the last primary slot (before "…") so it is visible and selected in the bar.
   */
  function renderNav(navEl, options) {
    if (!navEl) return;
    navEl.innerHTML = "";
    var navModules = getNavModules();
    var maxPrimary = (options && options.getMaxPrimary) ? options.getMaxPrimary() : getMaxPrimary();
    var primaryIds = getPrimaryIds(maxPrimary);
    var primarySet = {};
    primaryIds.forEach(function (id) { primarySet[id] = true; });
    var overflowModules = navModules.filter(function (m) { return !primarySet[m.id]; });
    var activeInOverflow = state.activeModule && overflowModules.some(function (m) { return m.id === state.activeModule; });

    var displayPrimaryIds = primaryIds;
    if (activeInOverflow) {
      displayPrimaryIds = primaryIds.slice(0, maxPrimary - 1).concat(state.activeModule);
    }
    var displayPrimarySet = {};
    displayPrimaryIds.forEach(function (id) { displayPrimarySet[id] = true; });
    var primaryModules = navModules.filter(function (m) { return displayPrimarySet[m.id]; });
    primaryModules.sort(function (a, b) {
      return displayPrimaryIds.indexOf(a.id) - displayPrimaryIds.indexOf(b.id);
    });
    var overflowForMenu = navModules.filter(function (m) { return !displayPrimarySet[m.id]; });

    primaryModules.forEach(function (module) {
      var btn = document.createElement("button");
      btn.textContent = getModuleLabel(module) || module.id;
      if (module.id === state.activeModule) btn.classList.add("active");
      btn.setAttribute("data-module-id", module.id);
      navEl.appendChild(btn);
    });

    if (overflowForMenu.length > 0) {
      var moreWrap = document.createElement("div");
      moreWrap.className = "nav-more";
      var moreBtn = document.createElement("button");
      moreBtn.className = "more-btn";
      moreBtn.type = "button";
      moreBtn.textContent = "⋯";
      moreBtn.setAttribute("aria-haspopup", "menu");
      moreBtn.setAttribute("aria-expanded", "false");
      moreBtn.setAttribute("aria-label", t("moreModules"));
      navEl.appendChild(moreWrap);
      var menu = document.createElement("div");
      menu.className = "more-menu";
      menu.setAttribute("role", "menu");
      overflowForMenu.forEach(function (module) {
        var item = document.createElement("button");
        item.type = "button";
        item.setAttribute("role", "menuitem");
        item.textContent = getModuleLabel(module) || module.id;
        item.setAttribute("data-module-id", module.id);
        if (module.id === state.activeModule) item.classList.add("active");
        menu.appendChild(item);
      });
      moreWrap.appendChild(moreBtn);
      moreWrap.appendChild(menu);
    }
  }

  /**
   * Fills profile panel DOM from state.currentUser (header avatar, panel hero pic/initials, name, role, email).
   */
  function hydrateProfileFromState() {
    var user = state.currentUser;
    if (!user) return;
    var initial = (user.initials && user.initials.trim()[0]) || (user.name && user.name.trim()[0]) || "U";
    initial = initial.toUpperCase();

    var headerAvatar = document.querySelector(".profile-btn .profile-avatar");
    if (headerAvatar) headerAvatar.textContent = initial;

    var panelImg = document.getElementById("profile-panel-avatar-img");
    var panelInitials = document.getElementById("profile-panel-avatar-initials");
    var avatarUrl = user.avatarUrl || user.avatar || user.photoURL || "";
    if (panelImg && panelInitials) {
      if (avatarUrl && avatarUrl.trim()) {
        panelImg.src = avatarUrl.trim();
        panelImg.alt = user.name ? (t("profilePhotoOf") + " " + user.name) : t("profilePhoto");
        panelImg.removeAttribute("hidden");
        panelInitials.setAttribute("hidden", "hidden");
      } else {
        panelImg.setAttribute("hidden", "hidden");
        panelImg.src = "";
        panelImg.alt = "";
        panelInitials.textContent = initial;
        panelInitials.removeAttribute("hidden");
      }
    }

    var heroName = document.getElementById("profile-hero-name");
    if (heroName) heroName.textContent = user.name || "—";

    var nameEl = document.getElementById("profile-name");
    var emailEl = document.getElementById("profile-email");
    if (nameEl) nameEl.textContent = user.name || "—";
    if (emailEl) emailEl.textContent = user.email || "—";

    var subtitleEl = document.getElementById("profile-subtitle");
    if (subtitleEl && user.name) subtitleEl.textContent = t("signedInAs") + " " + user.name;
  }

  /**
   * Returns HTML for the topbar when Settings/Setup is open (back + title + profile).
   */
  function renderSettingsBarHTML() {
    var backT = (t("back") || "Back").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    var setupT = (t("setup") || "Setup").replace(/</g, "&lt;");
    return "<button type=\"button\" id=\"settings-topbar-back\" class=\"settings-topbar-back\" aria-label=\"" + backT + "\">← " + backT + "</button>" +
      "<span class=\"settings-topbar-title\">" + setupT + "</span>" +
      "<button id=\"profile-btn\" class=\"profile-btn\" aria-label=\"Open profile\"><span class=\"profile-avatar\">" + (state.currentUser && state.currentUser.initials ? state.currentUser.initials : "A") + "</span></button>";
  }

  /**
   * Returns the default topbar inner HTML (nav + profile) for restoring after leaving Settings.
   */
  function getDefaultTopbarInnerHTML() {
    return "<nav class=\"topbar-module-list nav\" id=\"nav-modules\" aria-label=\"Modules\"></nav>" +
      "<button id=\"profile-btn\" class=\"profile-btn\" aria-label=\"Open profile\"><span class=\"profile-avatar\">A</span></button>";
  }

  theApp.view = theApp.view || {};
  theApp.view.topbar = {
    renderNav: renderNav,
    hydrateProfileFromState: hydrateProfileFromState,
    getMaxPrimary: getMaxPrimary,
    getPrimaryIds: getPrimaryIds,
    getNavModules: getNavModules,
    renderSettingsBarHTML: renderSettingsBarHTML,
    getDefaultTopbarInnerHTML: getDefaultTopbarInnerHTML
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

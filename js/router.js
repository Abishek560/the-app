/**
 * Hash router: #/{portalName}/dashboard | /{moduleId} | /{moduleId}/{entityId} | /setup | /settings
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;

  function parseHash() {
    var raw = (global.location && global.location.hash) || "";
    var path = raw.replace(/^#\/?/, "").trim();
    var segments = path ? path.split("/").filter(Boolean) : [];

    var portalName = (state.portalName && state.portalName.trim()) || "";
    var moduleId = "";
    var entityId = "";
    var mode = "detail";
    var settingsSection = "organization";
    var showSetup = false;

    if (segments.length === 0) {
      return { portalName: portalName, moduleId: "dashboard", entityId: "", mode: "detail", settingsSection: settingsSection, showSetup: false, showSettings: false };
    }

    var first = segments[0];
    if (first === "settings") {
      settingsSection = segments[1] === "modules" ? "modules" : "organization";
      return { portalName: portalName || "default", moduleId: "", entityId: "", mode: "detail", settingsSection: settingsSection, showSetup: false, showSettings: true };
    }
    if (first === "setup") {
      return { portalName: portalName || "default", moduleId: "", entityId: "", mode: "detail", settingsSection: "organization", showSetup: true, showSettings: false };
    }

    portalName = first;
    if (segments.length === 1) {
      return { portalName: portalName, moduleId: "dashboard", entityId: "", mode: "detail", settingsSection: "organization", showSetup: false, showSettings: false };
    }

    var second = segments[1];
    if (second === "dashboard") {
      return { portalName: portalName, moduleId: "dashboard", entityId: "", mode: "detail", settingsSection: "organization", showSetup: false, showSettings: false };
    }
    if (second === "setup") {
      return { portalName: portalName, moduleId: "", entityId: "", mode: "detail", settingsSection: "organization", showSetup: true, showSettings: false };
    }
    if (second === "settings") {
      settingsSection = segments[2] === "modules" ? "modules" : "organization";
      return { portalName: portalName, moduleId: "", entityId: "", mode: "detail", settingsSection: settingsSection, showSetup: false, showSettings: true };
    }

    moduleId = second;
    if (segments.length === 2) {
      return { portalName: portalName, moduleId: moduleId, entityId: "", mode: "detail", settingsSection: "organization", showSetup: false, showSettings: false };
    }

    var third = segments[2];
    if (third === "new") {
      return { portalName: portalName, moduleId: moduleId, entityId: "", mode: "new", settingsSection: "organization", showSetup: false, showSettings: false };
    }

    entityId = third;
    if (segments.length === 3) {
      return { portalName: portalName, moduleId: moduleId, entityId: entityId, mode: "detail", settingsSection: "organization", showSetup: false, showSettings: false };
    }

    if (segments[3] === "edit") {
      return { portalName: portalName, moduleId: moduleId, entityId: entityId, mode: "edit", settingsSection: "organization", showSetup: false, showSettings: false };
    }

    return { portalName: portalName, moduleId: moduleId, entityId: entityId, mode: "detail", settingsSection: "organization", showSetup: false, showSettings: false };
  }

  function applyRoute(route) {
    if (!route) return;
    if (route.portalName) state.portalName = route.portalName;
    state.showModuleSetup = route.showSetup === true;
    state.settingsOpen = route.showSettings === true;
    state.settingsSection = route.settingsSection || "organization";
    state.activeModule = route.moduleId || "dashboard";
    if (route.mode === "new") {
      state.activeEntity = null;
      state.creatingModule = route.moduleId;
      state.entityViewMode = "detail";
    } else if (route.entityId) {
      state.activeEntity = { moduleId: route.moduleId, entityId: route.entityId };
      state.creatingModule = null;
      state.entityViewMode = route.mode === "edit" ? "edit" : "detail";
    } else {
      state.activeEntity = null;
      state.creatingModule = null;
      state.entityViewMode = "detail";
    }
  }

  function getHashFromState() {
    var pn = (state.portalName && state.portalName.trim()) || "default";
    if (state.showModuleSetup) return "#/" + encodeURIComponent(pn) + "/setup";
    if (state.settingsOpen) {
      var sec = state.settingsSection === "modules" ? "modules" : "organization";
      return "#/" + encodeURIComponent(pn) + "/settings" + (sec === "modules" ? "/modules" : "");
    }
    if (state.creatingModule) {
      return "#/" + encodeURIComponent(pn) + "/" + encodeURIComponent(state.creatingModule) + "/new";
    }
    if (state.activeEntity && state.activeEntity.moduleId && state.activeEntity.entityId) {
      var base = "#/" + encodeURIComponent(pn) + "/" + encodeURIComponent(state.activeEntity.moduleId) + "/" + encodeURIComponent(String(state.activeEntity.entityId));
      return state.entityViewMode === "edit" ? base + "/edit" : base;
    }
    var mod = state.activeModule || "dashboard";
    if (mod === "dashboard") return "#/" + encodeURIComponent(pn) + "/dashboard";
    return "#/" + encodeURIComponent(pn) + "/" + encodeURIComponent(mod);
  }

  function navigateTo(hash) {
    if (hash == null || hash === "") hash = "#/";
    if (hash.charAt(0) !== "#") hash = "#" + hash;
    if (global.location) global.location.hash = hash;
  }

  function onHashChange() {
    var route = parseHash();
    applyRoute(route);
    if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
      theApp.controller.app.renderContent();
    }
  }

  function init() {
    var route = parseHash();
    applyRoute(route);
    if (global.addEventListener) {
      global.addEventListener("hashchange", onHashChange);
    }
  }

  theApp.router = {
    parseHash: parseHash,
    applyRoute: applyRoute,
    getHashFromState: getHashFromState,
    navigateTo: navigateTo,
    init: init,
    onHashChange: onHashChange
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

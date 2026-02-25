/**
 * Model: application state. Fully data-driven – no hardcoded module names or field config.
 * Module list and field definitions come only from state.modules (API/mock).
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.config) throw new Error("theApp.config required");

  var state = {
    modules: [],
    activeModule: "",
    entityData: {},
    currentUser: null,
    primaryOrder: [],
    theme: "system",
    accent: "amber"
  };

  function getEntityData(moduleId) {
    if (!state.entityData[moduleId]) {
      state.entityData[moduleId] = {
        list: null,
        total: 0,
        page: 1,
        search: "",
        filters: {},
        sortBy: null,
        sortOrder: "asc",
        debounceTimer: null
      };
    }
    return state.entityData[moduleId];
  }

  /** Returns field config for a module from state.modules only. No fallbacks – change strings in mock/API. */
  function getModuleFields(moduleId) {
    var modules = state.modules || [];
    var module = modules.filter(function (m) { return m.id === moduleId; })[0];
    return (module && module.fields && module.fields.length) ? module.fields : [];
  }

  theApp.state = state;
  theApp.getEntityData = getEntityData;
  theApp.getModuleFields = getModuleFields;

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

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
    /** When set, show entity detail view instead of list. { moduleId, entityId } */
    activeEntity: null,
    /** 'detail' | 'edit' – when viewing an entity. Edit shows the form. */
    entityViewMode: "detail",
    /** When set, show create form for this module. */
    creatingModule: null,
    entityData: {},
    currentUser: null,
    /** Portal/organization from bootstrap (name, portalName, version, baseURL). */
    portal: null,
    primaryOrder: [],
    theme: "system",
    accent: "amber",
    /** When true, content area shows Settings page (organization, modules & fields). */
    settingsOpen: false,
    /** Active settings tab: 'organization' | 'modules'. */
    settingsSection: "organization",
    /** True when editing organization in settings. */
    settingsEditingOrg: false,
    /** Module id when editing a module in settings (null when not editing). */
    settingsEditingModuleId: null,
    /** When true, show onboarding form instead of main app (collect portal + user to build app). */
    showOnboarding: false,
    /** When true, show module setup step (after signup) to collect modules and fields from user. */
    showModuleSetup: false,
    /** Modules + fields collected during module setup step (before Finish). Merged into state.modules on Finish. */
    setupModules: [],
    /** Selected module index on Set up your modules page (list + edit layout). null when none selected. */
    setupModuleSelectedIndex: null,
    /** Cached options for reference (module) fields: { [refModuleId]: [{ value, label }] }. Filled when loading list/form. */
    moduleFieldOptions: {},
    /** List view mode for entity modules: 'table' | 'spreadsheet' | 'tile'. Applied to all modules. */
    listViewMode: "table"
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

  /** Returns field config for a module from state.modules. Merges cached options for type "module" fields. */
  function getModuleFields(moduleId) {
    var modules = state.modules || [];
    var module = modules.filter(function (m) { return m.id === moduleId; })[0];
    var fields = (module && module.fields && module.fields.length) ? module.fields.slice() : [];
    var optsCache = state.moduleFieldOptions || {};
    return fields.map(function (f) {
      if ((f.type === "module" || f.type === "select") && f.moduleId && optsCache[f.moduleId]) {
        var out = {};
        for (var k in f) if (f.hasOwnProperty(k)) out[k] = f[k];
        out.options = optsCache[f.moduleId];
        return out;
      }
      return f;
    });
  }

  /** Returns display label for a module (string or { en, ta }) for use in nav, dashboard, entity title, etc. */
  function getModuleLabel(module) {
    if (!module) return "";
    if (typeof module.label === "string") return module.label;
    if (typeof module.label === "object" && (module.label.en != null || module.label.ta != null)) {
      var loc = (theApp.language && theApp.language.getLocale) ? theApp.language.getLocale() : "en";
      var l = (loc === "en" || loc === "ta") ? loc : "en";
      return module.label[l] || module.label.en || module.label.ta || "";
    }
    return module.id || "";
  }

  theApp.state = state;
  theApp.getEntityData = getEntityData;
  theApp.getModuleFields = getModuleFields;
  theApp.getModuleLabel = getModuleLabel;

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

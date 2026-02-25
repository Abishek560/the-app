/**
 * Application configuration constants.
 * Single source for API paths, pagination, theme keys, and debounce.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp || {};

  theApp.config = {
    /** App title (set on document.title after init) */
    appName: "Glow – Car Garage",

    /** API path pattern: api/{version}/portals/{portalName}/{resource} */
    api: {
      baseURL: "",
      version: "v1",
      portalName: "abiportal"
    },

    /** Pagination */
    pageSize: 25,

    /** Search input debounce (ms) */
    searchDebounceMs: 350,

    /** LocalStorage keys for theme persistence */
    themeStorageKey: "crm-theme",
    accentStorageKey: "crm-accent",

    /** Allowed theme and accent values */
    themeModes: ["light", "dark", "system"],
    accentValues: ["amber", "blue", "green"]
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

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
    pageSize: 20,

    /** Right-to-left layout (set true for RTL languages e.g. Arabic) */
    rtl: false,

    /** Search input debounce (ms) */
    searchDebounceMs: 350,

    /** LocalStorage keys for theme persistence */
    themeStorageKey: "crm-theme",
    accentStorageKey: "crm-accent",
    localeStorageKey: "crm-locale",

    /** Default locale (en | ta). Language selector in profile panel. */
    defaultLocale: "en",

    /** Allowed theme and accent values */
    themeModes: ["light", "dark", "system"],
    accentValues: ["amber", "blue", "green"]
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

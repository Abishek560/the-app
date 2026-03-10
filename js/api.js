/**
 * API client: ALWAYS try real HTTP first. Mock data ONLY used after API fails (404, network error).
 * Pattern: 1) Make API call (fetch) 2) On failure (null/invalid) -> MockApi for add/edit/read.
 *
 * Endpoints to implement on server:
 *
 * Top-level (no portal in path):
 *   POST /api/v1/portals     Body: { name, portalName, version, baseURL } -> create portal
 *   POST /api/v1/users       Body: { name, email } -> create user
 *
 * Portal-scoped (/api/v1/portals/{portalName}/):
 *   GET  me                 -> current user
 *   GET  portal             -> portal details
 *   PUT  portal             Body: { name, portalName, version, baseURL } -> update portal
 *   GET  modules?locale=    -> modules array
 *   GET  module-setup-templates?locale= -> { groups: [{ id, label, modules }] } for suggested templates
 *   POST modules            Body: { modules: [{ label, fields }] } -> create modules (server assigns ids)
 *   GET  {moduleId}?page&limit&search&... -> entity list
 *   GET  {moduleId}/{id}    -> single entity
 *   POST {moduleId}         Body: entity -> create entity
 *   PUT  {moduleId}/{id}    Body: entity -> update entity
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.config) throw new Error("theApp.config required");

  var config = theApp.config;
  var baseRoot = (config.api.baseURL || "").replace(/\/$/, "") + "/api/" + config.api.version;

  function isTestMode() {
    try {
      if (typeof global !== "undefined" && global.localStorage && global.localStorage.getItem("crm-testMode") === "true") return true;
      if (theApp.state && theApp.state.testMode === true) return true;
    } catch (e) {}
    return false;
  }

  function getBasePath() {
    var pn = (theApp.state && theApp.state.portalName) || (theApp.state && theApp.state.portal && theApp.state.portal.portalName) || (config.api && config.api.portalName) || "default";
    return baseRoot + "/portals/" + pn;
  }

  function buildUrl(resource, queryParams, opts) {
    var path = opts && opts.root ? baseRoot + "/" + resource : getBasePath() + "/" + resource;
    if (queryParams && typeof queryParams === "object") {
      var pairs = [];
      Object.keys(queryParams).forEach(function (key) {
        var val = queryParams[key];
        if (val != null && val !== "") pairs.push(encodeURIComponent(key) + "=" + encodeURIComponent(String(val)));
      });
      if (pairs.length) path += "?" + pairs.join("&");
    }
    return path;
  }

  function parseBody(res) {
    return res.json().then(function (body) {
      if (body != null && typeof body === "object" && "data" in body) return body.meta ? body : body.data;
      return body;
    }).catch(function () { return null; });
  }

  function apiGet(resource, queryParams, opts) {
    if (isTestMode()) return Promise.resolve(null);
    var url = buildUrl(resource, queryParams, opts);
    return fetch(url, { method: "GET", headers: { Accept: "application/json" } })
      .then(function (res) { return res.ok ? parseBody(res) : null; })
      .catch(function () { return null; });
  }

  function apiPost(resource, body, opts) {
    if (isTestMode()) return Promise.resolve(null);
    var url = buildUrl(resource, null, opts);
    return fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {})
    })
      .then(function (res) { return res.ok ? parseBody(res) : null; })
      .catch(function () { return null; });
  }

  function apiPut(resource, body, opts) {
    if (isTestMode()) return Promise.resolve(null);
    var url = buildUrl(resource, null, opts);
    return fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body || {})
    })
      .then(function (res) { return res.ok ? parseBody(res) : null; })
      .catch(function () { return null; });
  }

  function emptyPaginated(pageNumber, pageLimit) {
    return { data: [], meta: { total: 0, page: pageNumber || 1, limit: pageLimit || config.pageSize } };
  }

  function moduleDataParams(options) {
    var opts = options || {};
    var pageNumber = Math.max(1, opts.page || 1);
    var pageLimit = Math.max(1, opts.limit || config.pageSize);
    var params = { page: pageNumber, limit: pageLimit };
    if ((opts.search || "").trim()) params.search = String(opts.search).trim();
    var filters = opts.filters || {};
    Object.keys(filters).forEach(function (key) {
      var val = filters[key];
      if (val != null && String(val).trim() !== "" && String(val).trim() !== "all") params[key] = filters[key];
    });
    if (opts.sortBy && String(opts.sortBy).trim()) params.sortBy = String(opts.sortBy).trim();
    if (opts.sortOrder === "desc" || opts.sortOrder === "asc") params.sortOrder = opts.sortOrder;
    return params;
  }

  /** Mock data used ONLY after API fails. Never call directly – always via api methods. */
  function mockFallback(method) {
    var args = [].slice.call(arguments, 1);
    if (typeof global.MockApi === "undefined") return Promise.resolve(null);
    var fn = global.MockApi[method];
    return typeof fn === "function" ? fn.apply(global.MockApi, args) : Promise.resolve(null);
  }

  /** Read: API first, mock only on failure. isValid(data) => truthy to keep API result. */
  function tryRead(apiPromise, isValid, mockMethod) {
    var mockArgs = [].slice.call(arguments, 3);
    return apiPromise.then(function (data) {
      if (data != null && (isValid == null || isValid(data))) return data;
      return mockFallback.apply(null, [mockMethod].concat(mockArgs));
    });
  }

  /** Add/Create: API POST first, mock only on failure. */
  function tryCreate(apiPromise, mockMethod) {
    var mockArgs = [].slice.call(arguments, 2);
    return apiPromise.then(function (data) {
      if (data != null && typeof data === "object") return data;
      return mockFallback.apply(null, [mockMethod].concat(mockArgs));
    });
  }

  /** Edit/Update: API PUT first, mock only on failure. */
  function tryUpdate(apiPromise, mockMethod) {
    var mockArgs = [].slice.call(arguments, 2);
    return apiPromise.then(function (data) {
      if (data != null && typeof data === "object") return data;
      return mockFallback.apply(null, [mockMethod].concat(mockArgs));
    });
  }

  theApp.api = {
    /** GET /api/v1/portals/{portalName}/me, /portal, /modules. Fallback: MockApi.getBootstrap. */
    getBootstrap: function (options) {
      var opts = (options && typeof options === "object") ? options : {};
      var locale = opts.locale || "en";
      return Promise.all([
        apiGet("me", {}).then(function (data) {
          if (data && typeof data === "object" && (data.name != null || data.email != null)) return data;
          return mockFallback("getBootstrap", opts).then(function (b) { return b && b.user || null; });
        }),
        apiGet("portal", {}).then(function (data) {
          if (data && typeof data === "object") return data;
          return mockFallback("getBootstrap", opts).then(function (b) { return b && b.portal || null; });
        }),
        apiGet("modules", { locale: locale }).then(function (data) {
          if (Array.isArray(data)) return data;
          return mockFallback("getModules", opts);
        })
      ]).then(function (results) {
        return { user: results[0], portal: results[1], modules: results[2] || [] };
      });
    },

    /** Read modules. API first, mock only on failure. */
    getModules: function (options) {
      var params = (options && typeof options === "object") ? options : {};
      return tryRead(apiGet("modules", params), function (d) { return Array.isArray(d); }, "getModules", options);
    },

    /** Options for reference (module) fields: list of { value, label } from linked module. Used for dropdowns. */
    getModuleFieldOptions: function (refModuleId) {
      return apiGet(refModuleId, { page: 1, limit: 500 }).then(function (apiResponse) {
        var list = Array.isArray(apiResponse) ? apiResponse : (apiResponse && apiResponse.data) ? apiResponse.data : [];
        return list.map(function (row) {
          var label = row.name != null ? String(row.name) : (row.customer_name != null ? String(row.customer_name) : (row.title != null ? String(row.title) : "Item " + row.id));
          return { value: row.id, label: label };
        });
      }).catch(function () {
        return typeof global.MockApi !== "undefined" && global.MockApi.getModuleFieldOptions
          ? global.MockApi.getModuleFieldOptions(refModuleId) : Promise.resolve([]);
      });
    },

    /** Read entity list. API first, mock only on failure. */
    getModuleData: function (moduleId, options) {
      var params = moduleDataParams(options);
      return apiGet(moduleId, params).then(function (apiResponse) {
        if (apiResponse && typeof apiResponse === "object" && Array.isArray(apiResponse.data) && apiResponse.meta) return apiResponse;
        if (Array.isArray(apiResponse)) {
          var pageNumber = params.page;
          var pageLimit = params.limit;
          var total = apiResponse.length;
          var start = (pageNumber - 1) * pageLimit;
          return { data: apiResponse.slice(start, start + pageLimit), meta: { total: total, page: pageNumber, limit: pageLimit } };
        }
        return mockFallback("getModuleData", moduleId, options).then(function (r) { return r || emptyPaginated(params.page, params.limit); });
      });
    },

    /** Read single entity. API first, mock only on failure. */
    getEntity: function (moduleId, entityId) {
      return tryRead(apiGet(moduleId + "/" + encodeURIComponent(String(entityId)), {}), function (d) { return d.id != null || d.name != null; }, "getEntity", moduleId, entityId);
    },

    /** Edit entity. API PUT first, mock only on failure. */
    updateEntity: function (moduleId, entityId, data) {
      return tryUpdate(apiPut(moduleId + "/" + encodeURIComponent(String(entityId)), data), "updateEntity", moduleId, entityId, data);
    },

    /** Add entity. API POST first, mock only on failure. */
    createEntity: function (moduleId, data) {
      return tryCreate(apiPost(moduleId, data), "createEntity", moduleId, data);
    },

    /** Read current user. API first, mock only on failure. */
    getCurrentUser: function () {
      return tryRead(apiGet("me", {}), function (d) { return d.name != null || d.email != null; }, "getCurrentUser");
    },

    /** Add user. API POST first, mock only on failure. */
    createUser: function (data) {
      return tryCreate(apiPost("users", data, { root: true }), "setCurrentUser", data).then(function (u) { return u || data; });
    },

    setCurrentUser: function (data) {
      return tryCreate(apiPost("me", data), "setCurrentUser", data);
    },

    /** Read portal. API first, mock only on failure. */
    getPortalDetails: function () {
      return tryRead(apiGet("portal", {}), function (d) { return typeof d === "object"; }, "getPortalDetails");
    },

    /** Add portal. API POST first, mock only on failure. */
    createPortal: function (data) {
      return apiPost("portals", data, { root: true }).then(function (res) {
        if (res && typeof res === "object") return res;
        return mockFallback("updatePortalDetails", data).then(function (p) { return p || data; });
      });
    },

    /** Edit portal. API PUT first, mock only on failure. */
    updatePortalDetails: function (data) {
      return tryUpdate(apiPut("portal", data), "updatePortalDetails", data);
    },

    /** Edit module. API PUT first, mock only on failure. */
    updateModule: function (moduleId, data) {
      return tryUpdate(apiPut("modules/" + encodeURIComponent(moduleId), data), "updateModule", moduleId, data);
    },

    /** Add module. API POST first, mock only on failure. */
    createModule: function (moduleId, data) {
      return tryCreate(apiPost("modules", { id: moduleId, label: data && data.label }), "createModule", moduleId, data);
    },

    /** Add modules (batch). API POST first, mock only on failure. */
    createModules: function (modules) {
      return apiPost("modules", { modules: modules }).then(function (res) {
        if (res && Array.isArray(res)) return res;
        if (res && res.modules && Array.isArray(res.modules)) return res.modules;
        return mockFallback("createModules", modules);
      });
    },

    /** Suggested module templates for setup step. API first, mock only on failure. */
    getModuleSetupTemplates: function (options) {
      var locale = (options && options.locale) || (theApp.language && theApp.language.getLocale ? theApp.language.getLocale() : "en");
      function isValid(d) {
        return d != null && typeof d === "object" && d.groups && Array.isArray(d.groups);
      }
      return tryRead(apiGet("module-setup-templates", { locale: locale }), isValid, "getModuleSetupTemplates").then(function (data) {
        return data || null;
      });
    }
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

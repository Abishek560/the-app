/**
 * API client: fully data-driven. Single getModuleData(moduleId, options) for any module.
 * Real API: GET /api/.../modules and GET /api/.../{moduleId}. Fallback: MockApi.getModuleData(moduleId, options).
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.config) throw new Error("theApp.config required");

  var config = theApp.config;
  var basePath = "/api/" + config.api.version + "/portals/" + config.api.portalName;
  if (config.api.baseURL) {
    basePath = config.api.baseURL.replace(/\/$/, "") + basePath;
  }

  function buildUrl(resource, queryParams) {
    var path = basePath + "/" + resource;
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

  function apiGet(resource, queryParams) {
    var url = buildUrl(resource, queryParams);
    var fallbackUrl = url.indexOf("?") >= 0 ? url : basePath + "/" + resource + ".json";
    return fetch(url, { method: "GET", headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok && url.indexOf("?") < 0) {
          return fetch(fallbackUrl, { method: "GET", headers: { Accept: "application/json" } });
        }
        return res;
      })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (body) {
        if (body != null && typeof body === "object" && "data" in body) return body.meta ? body : body.data;
        return body;
      })
      .catch(function () { return null; });
  }

  function emptyPaginated(pageNumber, pageLimit) {
    return { data: [], meta: { total: 0, page: pageNumber || 1, limit: pageLimit || config.pageSize } };
  }

  /** Build query params from options (page, limit, search, filters, sortBy, sortOrder). */
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

  theApp.api = {
    getModules: function () {
      return apiGet("modules", {}).then(function (data) {
        if (Array.isArray(data)) return data;
        if (typeof global.MockApi !== "undefined" && global.MockApi.getModules) return global.MockApi.getModules();
        return [];
      });
    },

    /** Fetches entity list for any module by id. No hardcoded module names – works for any moduleId from getModules(). */
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
        if (typeof global.MockApi !== "undefined" && global.MockApi.getModuleData) return global.MockApi.getModuleData(moduleId, options);
        return emptyPaginated(params.page, params.limit);
      });
    },

    getCurrentUser: function () {
      return apiGet("me", {}).then(function (data) {
        if (data && typeof data === "object" && (data.name != null || data.email != null)) return data;
        if (typeof global.MockApi !== "undefined" && global.MockApi.getCurrentUser) return global.MockApi.getCurrentUser();
        return null;
      });
    }
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

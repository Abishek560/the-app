/**
 * Mock API – loads static data from mock-data.json, then exposes getModules, getModuleData, getEntity, etc.
 */
(function () {
  "use strict";

  var MOCK_DELAY_MS = 200;
  var modulesObj;
  var mockDataObj;
  var MODULE_SETUP_TEMPLATES;

  /** Data loaded from Firebase or data/app-data.json. Falls back to window globals if present. */
  function applyData(mockData, populateData) {
    MODULE_SETUP_TEMPLATES = (populateData && populateData.moduleSetupTemplates) || (typeof window !== "undefined" && window.__POPULATE_DATA__ && window.__POPULATE_DATA__.moduleSetupTemplates) || { groups: [] };
    modulesObj = (mockData && mockData.modules && typeof mockData.modules === "object") ? mockData.modules : (modulesObj || {});
    mockDataObj = (mockData && mockData.mockData && typeof mockData.mockData === "object") ? mockData.mockData : (mockDataObj || { currentUser: {} });
    if (mockData && mockData.portal && typeof mockData.portal === "object") portalDetailsStore = mockData.portal;
    if (typeof window !== "undefined" && populateData) window.__POPULATE_DATA__ = populateData;
    return { mockData: mockData, populateData: populateData };
  }
  var FIREBASE_RTDB_BASE = "https://the-app-32d6c-default-rtdb.firebaseio.com";
  var FIREBASE_RTDB_URL = FIREBASE_RTDB_BASE + "/.json";
  var LOCAL_DATA_URL = "data/app-data.json";

  function isTestMode() {
    try {
      if (typeof window !== "undefined" && window.localStorage && window.localStorage.getItem("crm-testMode") === "true") return true;
      if (typeof window !== "undefined" && window.theApp && window.theApp.state && window.theApp.state.testMode === true) return true;
    } catch (e) {}
    return false;
  }

  function getPortalPath() {
    var pn = (typeof window !== "undefined" && window.theApp && window.theApp.state && window.theApp.state.portalName) ? String(window.theApp.state.portalName).trim() : "";
    return pn ? "portals/" + pn : "";
  }

  /** Persist data to Firebase. Test mode: no-op. Release: write to portals/{portalName}/... */
  function persistToFirebase(path, data) {
    if (isTestMode()) return;
    if (typeof fetch === "undefined") return;
    var basePath = getPortalPath();
    if (!basePath) return;
    var rel = path.replace(/^\/+/, "");
    if (rel.indexOf("mockData/portal") === 0) rel = "portal";
    else if (rel.indexOf("mockData/mockData/currentUser") === 0) rel = "currentUser";
    else if (rel.indexOf("mockData/modules") === 0) rel = "modules";
    else if (rel.indexOf("mockData/mockData/") === 0) rel = "entities/" + rel.replace("mockData/mockData/", "");
    var fullPath = basePath + "/" + rel;
    var url = FIREBASE_RTDB_BASE + "/" + fullPath + ".json";
    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }).catch(function (err) { console.warn("Firebase persist failed:", fullPath, err && err.message); });
  }

  function loadDataFromUrl(url) {
    return fetch(url).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
  }


  function tryLoadAppData() {
    if (typeof fetch === "undefined") return Promise.resolve(applyData(null, null));
    if (isTestMode()) {
      return loadDataFromUrl(LOCAL_DATA_URL)
        .then(function (data) { return applyData(data && data.mockData, data && data.populateData); })
        .catch(function (err) { console.warn("Test mode: app data load failed:", err && err.message); applyData(null, null); return {}; });
    }
    return loadDataFromUrl(LOCAL_DATA_URL)
      .then(function (data) { return applyData(data && data.mockData, data && data.populateData); })
      .catch(function (err) { console.warn("App data load failed, using defaults:", err && err.message); applyData(null, null); return {}; });
  }

  var dataPromise = tryLoadAppData();

  function delay(ms, value) {
    return new Promise(function (resolve) { setTimeout(function () { resolve(value); }, ms); });
  }

  /** Resolve label/name: string → as-is; object { en, ta } → pick by locale. */
  function resolveLabel(val, locale) {
    if (val == null) return undefined;
    if (typeof val === "string") return val;
    if (typeof val === "object" && (val.en != null || val.ta != null))
      return val[locale] || val.en || val.ta || "";
    return undefined;
  }

  /** Options for a type "module" field: { value: entity id, label: display } from linked module list. Uses "name" for label when present, else "registration" (e.g. vehicles), else first field. */
  function getModuleFieldOptions(refModuleId) {
    var list = mockDataObj[refModuleId];
    if (!Array.isArray(list) || list.length === 0) return [];
    var refModule = modulesObj[refModuleId];
    var fields = refModule && refModule.fields;
    var labelKey = (fields && fields.name) ? "name" : (fields && fields.registration) ? "registration" : (fields ? Object.keys(fields)[0] : "name");
    var opts = list.map(function (row) {
      var label = row[labelKey] != null ? String(row[labelKey]) : "Item " + row.id;
      return { value: row.id, label: label };
    });
    return [{ value: "all", label: "All" }].concat(opts);
  }

  /** Converts modules object to array; each field label from name/label (string or { en, ta }) via resolveLabel. type "module" → "select" with options from linked module. */
  function modulesToArray(locale) {
    var loc = (locale === "en" || locale === "ta") ? locale : "en";
    return Object.keys(modulesObj).map(function (moduleId) {
      var m = modulesObj[moduleId];
      var label = resolveLabel(m.label, loc) || m.id || moduleId;
      var fieldsArr = Object.keys(m.fields || {}).map(function (fieldId) {
        var f = m.fields[fieldId];
        var fieldLabel = resolveLabel(f.name, loc) || resolveLabel(f.label, loc) || fieldId;
        var out = { id: f.id || fieldId, label: fieldLabel };
        if (f.type === "module" && f.moduleId) {
          out.type = "select";
          out.options = getModuleFieldOptions(f.moduleId);
          if (f.moduleId) out.moduleId = f.moduleId;
        } else {
          if (f.type != null) out.type = f.type;
          if (f.options != null) out.options = f.options;
        }
        if (f.placeholder != null) out.placeholder = resolveLabel(f.placeholder, loc);
        if (f.width != null) out.width = f.width;
        if (f.value != null) out.value = f.value;
        if (f.sortable != null) out.sortable = f.sortable;
        if (f.format != null) out.format = f.format;
        if (f.currencyCode != null) out.currencyCode = f.currencyCode;
        if (f.chipByValue != null) out.chipByValue = f.chipByValue;
        if (f.chipPalette != null) out.chipPalette = f.chipPalette;
        if (f.searchable != null) out.searchable = f.searchable;
        if (f.hideInList != null) out.hideInList = f.hideInList;
        if (f.hideInFilter != null) out.hideInFilter = f.hideInFilter;
        if (f.multi != null) out.multi = f.multi;
        if (f.chipPalette && f.options && Array.isArray(f.options)) {
          out.options = f.options.map(function (o) {
            var val = (o && typeof o === "object" && o.value != null) ? o.value : o;
            var label = (o && typeof o === "object" && o.label != null) ? o.label : String(val);
            var chipClass = f.chipPalette[val] != null ? f.chipPalette[val] : (f.chipPalette[String(val)] != null ? f.chipPalette[String(val)] : null);
            if (val === "all" || chipClass != null) return { value: val, label: label, chipClass: chipClass || undefined };
            return { value: val, label: label };
          });
        }
        return out;
      });
      return { id: m.id || moduleId, label: label, fields: fieldsArr };
    });
  }

  /** Returns field config array for a module. type "module" → "select" with options from linked module. locale = optional for label resolution. */
  function getModuleFieldsArray(moduleId, locale) {
    var m = modulesObj[moduleId];
    if (!m || !m.fields) return [];
    var loc = (locale === "en" || locale === "ta") ? locale : "en";
    return Object.keys(m.fields).map(function (fieldId) {
      var f = m.fields[fieldId];
      var fieldLabel = resolveLabel(f.name, loc) || resolveLabel(f.label, loc) || fieldId;
      var out = { id: f.id || fieldId, label: fieldLabel };
      if (f.type === "module" && f.moduleId) {
        out.type = "select";
        out.options = getModuleFieldOptions(f.moduleId);
        if (f.moduleId) out.moduleId = f.moduleId;
      } else {
        if (f.type != null) out.type = f.type;
        if (f.options != null) out.options = f.options;
      }
      if (f.placeholder != null) out.placeholder = resolveLabel(f.placeholder, loc);
      if (f.width != null) out.width = f.width;
      if (f.value != null) out.value = f.value;
      if (f.sortable != null) out.sortable = f.sortable;
      if (f.format != null) out.format = f.format;
      if (f.currencyCode != null) out.currencyCode = f.currencyCode;
      if (f.chipByValue != null) out.chipByValue = f.chipByValue;
      if (f.chipPalette != null) out.chipPalette = f.chipPalette;
      if (f.searchable != null) out.searchable = f.searchable;
      if (f.hideInList != null) out.hideInList = f.hideInList;
      if (f.hideInFilter != null) out.hideInFilter = f.hideInFilter;
      if (f.multi != null) out.multi = f.multi;
      if (f.chipPalette && f.options && Array.isArray(f.options)) {
        out.options = f.options.map(function (o) {
          var val = (o && typeof o === "object" && o.value != null) ? o.value : o;
          var label = (o && typeof o === "object" && o.label != null) ? o.label : String(val);
          var chipClass = f.chipPalette[val] != null ? f.chipPalette[val] : (f.chipPalette[String(val)] != null ? f.chipPalette[String(val)] : null);
          if (val === "all" || chipClass != null) return { value: val, label: label, chipClass: chipClass || undefined };
          return { value: val, label: label };
        });
      }
      return out;
    });
  }

  function toPaginated(pageData, totalCount, pageNumber, pageLimit) {
    return { data: pageData, meta: { total: totalCount, page: pageNumber, limit: pageLimit } };
  }

  function filterBySearchAndFilters(list, fieldConfig, searchTerm, filters) {
    return list.filter(function (row) {
      var matchesSearch = !searchTerm || fieldConfig.some(function (f) {
        if (f.searchable === false) return false;
        var val = row[f.id];
        return val != null && String(val).toLowerCase().indexOf(searchTerm) !== -1;
      });
      if (!matchesSearch) return false;
      var key;
      for (key in filters) {
        if (!filters.hasOwnProperty(key)) continue;
        var filterVal = filters[key];
        if (filterVal == null || String(filterVal).trim() === "") continue;
        var field = fieldConfig.filter(function (f) { return f.id === key || f.moduleId === key; })[0];
        var recordVal = field ? row[field.id] : row[key];
        if (field && field.type === "select") {
          if (filterVal === "all") continue;
          if (Array.isArray(recordVal)) {
            var hasMatch = recordVal.some(function (id) { return String(id) === String(filterVal); });
            if (!hasMatch) return false;
          } else if (String(recordVal) !== String(filterVal)) return false;
        } else if (field && field.type === "number") {
          var num = parseFloat(String(filterVal).trim(), 10);
          if (!isNaN(num) && (recordVal == null || Number(recordVal) < num)) return false;
        } else {
          var term = String(filterVal).trim().toLowerCase();
          if (term && (recordVal == null || String(recordVal).toLowerCase().indexOf(term) === -1)) return false;
        }
      }
      return true;
    });
  }

  /** Generic: fetches list for any module by id. Data must live at mockDataObj[moduleId]. Supports sortBy + sortOrder. */
  function getModuleData(moduleId, options) {
    var pageNumber = Math.max(1, (options && options.page) || 1);
    var pageLimit = Math.max(1, (options && options.limit) || 25);
    var searchTerm = ((options && options.search) || "").trim().toLowerCase();
    var filters = (options && options.filters) || {};
    var sortBy = (options && options.sortBy && String(options.sortBy).trim()) || null;
    var sortOrder = (options && options.sortOrder === "desc") ? "desc" : "asc";
    var fieldConfig = getModuleFieldsArray(moduleId, options && options.locale);
    var list = mockDataObj.hasOwnProperty(moduleId) && Array.isArray(mockDataObj[moduleId]) ? mockDataObj[moduleId] : [];
    var filtered = filterBySearchAndFilters(list, fieldConfig, searchTerm, filters);
    var sortField = sortBy ? fieldConfig.filter(function (f) { return f.id === sortBy; })[0] : null;
    if (sortBy && sortField && sortField.sortable === true) {
      var isNum = sortField.type === "number";
      filtered = filtered.slice().sort(function (a, b) {
        var va = a[sortBy];
        var vb = b[sortBy];
        if (isNum) {
          var na = Number(va);
          var nb = Number(vb);
          if (isNaN(na) && isNaN(nb)) return 0;
          if (isNaN(na)) return 1;
          if (isNaN(nb)) return -1;
          return sortOrder === "asc" ? na - nb : nb - na;
        }
        var sa = va == null ? "" : String(va).toLowerCase();
        var sb = vb == null ? "" : String(vb).toLowerCase();
        var cmp = sa < sb ? -1 : (sa > sb ? 1 : 0);
        return sortOrder === "asc" ? cmp : -cmp;
      });
    }
    var total = filtered.length;
    var start = (pageNumber - 1) * pageLimit;
    return delay(MOCK_DELAY_MS, toPaginated(filtered.slice(start, start + pageLimit), total, pageNumber, pageLimit));
  }

  function getEntity(moduleId, entityId) {
    var list = mockDataObj.hasOwnProperty(moduleId) && Array.isArray(mockDataObj[moduleId]) ? mockDataObj[moduleId] : [];
    var id = entityId != null ? Number(entityId) : NaN;
    if (isNaN(id)) {
      var row = list.filter(function (r) { return String(r.id) === String(entityId); })[0];
      return row || null;
    }
    var found = list.filter(function (r) { return r.id === id; })[0];
    return found || null;
  }

  function updateEntity(moduleId, entityId, data) {
    var list = mockDataObj.hasOwnProperty(moduleId) && Array.isArray(mockDataObj[moduleId]) ? mockDataObj[moduleId] : [];
    var entity = getEntity(moduleId, entityId);
    if (!entity || !list.length) return null;
    Object.keys(data).forEach(function (key) {
      if (key !== "id") entity[key] = data[key];
    });
    persistToFirebase("mockData/mockData/" + moduleId, list);
    return entity;
  }

  function createEntity(moduleId, data) {
    if (!mockDataObj.hasOwnProperty(moduleId) || !Array.isArray(mockDataObj[moduleId])) mockDataObj[moduleId] = [];
    var list = mockDataObj[moduleId];
    var maxId = list.length ? Math.max.apply(null, list.map(function (r) { return Number(r.id) || 0; })) : 0;
    var newId = maxId + 1;
    var entity = Object.assign({ id: newId }, data);
    list.push(entity);
    persistToFirebase("mockData/mockData/" + moduleId, list);
    return entity;
  }

  var portalDetailsStore = null;

  function getPortalDetails() {
    if (portalDetailsStore) return portalDetailsStore;
    var c = typeof window !== "undefined" && window.theApp && window.theApp.config;
    return {
      name: (c && c.appName) ? String(c.appName) : "The App",
      portalName: (c && c.api && c.api.portalName) ? String(c.api.portalName) : "",
      version: (c && c.api && c.api.version) ? String(c.api.version) : "v1",
      baseURL: (c && c.api && c.api.baseURL) ? String(c.api.baseURL) : ""
    };
  }

  function updatePortalDetails(data) {
    portalDetailsStore = portalDetailsStore || getPortalDetails();
    if (data && typeof data === "object") {
      if (data.name != null) portalDetailsStore.name = String(data.name);
      if (data.portalName != null) portalDetailsStore.portalName = String(data.portalName);
      if (data.version != null) portalDetailsStore.version = String(data.version);
      if (data.baseURL != null) portalDetailsStore.baseURL = String(data.baseURL);
    }
    persistToFirebase("mockData/portal", portalDetailsStore);
    return portalDetailsStore;
  }

  function updateModule(moduleId, data) {
    var m = modulesObj[moduleId];
    if (!m || !data || typeof data !== "object") return null;
    if (data.label != null) m.label = data.label;
    persistToFirebase("mockData/modules", modulesObj);
    return m;
  }

  /** Minimal field set for a newly created module (id + name). */
  var defaultNewModuleFields = {
    id: { id: "id", name: { en: "ID", ta: "ஐடி" }, type: "id", width: "8%", searchable: false, hideInFilter: true },
    name: { id: "name", name: { en: "Name", ta: "பெயர்" }, type: "text", placeholder: { en: "Filter by name", ta: "பெயரால் வடிகட்டு" }, width: "20%", sortable: true }
  };

  function createModule(moduleId, data) {
    var id = (moduleId && String(moduleId).trim()) || (data && data.id && String(data.id).trim());
    if (!id || modulesObj.hasOwnProperty(id)) return null;
    var label = (data && data.label != null) ? data.label : id;
    var labelObj = typeof label === "string" ? { en: label, ta: label } : label;
    modulesObj[id] = {
      id: id,
      label: labelObj,
      fields: JSON.parse(JSON.stringify(defaultNewModuleFields))
    };
    if (typeof mockDataObj !== "undefined") mockDataObj[id] = [];
    persistToFirebase("mockData/modules", modulesObj);
    persistToFirebase("mockData/mockData/" + id, mockDataObj[id]);
    return modulesObj[id];
  }

  /** Server assigns IDs. Accepts [{ label, fields }] (no id). Returns [{ id, label, fields }] with server-assigned ids. refModuleIndex on a field → moduleId pointing to that module in the same batch. */
  function createModules(modulesInput) {
    var list = Array.isArray(modulesInput) ? modulesInput : [];
    var existing = Object.keys(modulesObj).filter(function (k) { return /^module\d+$/.test(k); });
    var maxN = existing.reduce(function (m, k) {
      var n = parseInt(k.replace(/^module/, ""), 10);
      return isNaN(n) ? m : Math.max(m, n);
    }, 0);
    var result = [];
    list.forEach(function (item, i) {
      var id = "module" + (maxN + i + 1);
      var label = (item && item.label != null) ? String(item.label).trim() : ("Module " + (i + 1));
      var labelObj = { en: label, ta: label };
      var fieldsArr = (item && Array.isArray(item.fields)) ? item.fields : [];
      var fieldsObj = {};
      fieldsArr.forEach(function (f) {
        var fid = (f && (f.id || "").trim()) || ("field_" + Object.keys(fieldsObj).length);
        if (!fid) return;
        var flabel = (f && (f.label || f.id || "").trim()) || fid;
        var ftype = (f && f.type) || "text";
        var fieldDef = {
          id: fid,
          name: { en: flabel, ta: flabel },
          type: ftype
        };
        if (ftype === "module" && f.refModuleIndex != null) {
          fieldDef.moduleId = "module" + (maxN + f.refModuleIndex + 1);
        }
        fieldsObj[fid] = fieldDef;
      });
      modulesObj[id] = { id: id, label: labelObj, fields: fieldsObj };
      if (typeof mockDataObj !== "undefined") mockDataObj[id] = [];
      persistToFirebase("mockData/mockData/" + id, mockDataObj[id]);
      var resultFields = fieldsArr.map(function (f) {
        var out = { id: (f && f.id || "").trim(), label: (f && (f.label || f.id || "").trim()) || "", type: (f && f.type) || "text" };
        if (f && f.type === "module" && f.refModuleIndex != null) out.moduleId = "module" + (maxN + f.refModuleIndex + 1);
        return out;
      });
      result.push({
        id: id,
        label: label,
        fields: resultFields
      });
    });
    persistToFirebase("mockData/modules", modulesObj);
    return result;
  }

  function runBootstrap(options) {
    var locale = (options && options.locale) || "en";
    return Promise.all([
      delay(MOCK_DELAY_MS, mockDataObj.currentUser),
      delay(MOCK_DELAY_MS, getPortalDetails()),
      delay(MOCK_DELAY_MS, modulesToArray(locale))
    ]).then(function (results) {
      return { user: results[0], portal: results[1], modules: results[2] };
    });
  }

  function loadPortalData(portalName) {
    var url = FIREBASE_RTDB_BASE + "/portals/" + encodeURIComponent(portalName) + ".json";
    return loadDataFromUrl(url).then(function (data) {
      if (data && data.portal) portalDetailsStore = data.portal;
      if (data && data.currentUser) mockDataObj.currentUser = data.currentUser;
      if (data && data.modules && typeof data.modules === "object") modulesObj = data.modules;
      if (data && data.entities && typeof data.entities === "object") {
        Object.keys(data.entities).forEach(function (mid) {
          mockDataObj[mid] = Array.isArray(data.entities[mid]) ? data.entities[mid] : [];
        });
      }
      return data;
    });
  }

  window.MockApi = {
    getModuleSetupTemplates: function () {
      return dataPromise.then(function () { return MODULE_SETUP_TEMPLATES; });
    },
    getBootstrap: function (options) {
      return dataPromise.then(function () {
        var pn = (options && options.portalName) || (typeof window !== "undefined" && window.theApp && window.theApp.state && window.theApp.state.portalName);
        if (!isTestMode() && pn) {
          return loadPortalData(pn).then(function () { return runBootstrap(options); }).catch(function () { return runBootstrap(options); });
        }
        return runBootstrap(options);
      });
    },
    loadPortalData: function (portalName) {
      return dataPromise.then(function () { return loadPortalData(portalName); });
    },
    getModules: function (options) {
      return dataPromise.then(function () {
        var locale = (options && options.locale) || "en";
        return delay(MOCK_DELAY_MS, modulesToArray(locale));
      });
    },
    getModuleData: function (moduleId, options) {
      return dataPromise.then(function () { return getModuleData(moduleId, options); });
    },
    getEntity: function (moduleId, entityId) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, getEntity(moduleId, entityId)); });
    },
    updateEntity: function (moduleId, entityId, data) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, updateEntity(moduleId, entityId, data)); });
    },
    createEntity: function (moduleId, data) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, createEntity(moduleId, data)); });
    },
    getCurrentUser: function () {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, mockDataObj.currentUser); });
    },
    setCurrentUser: function (data) {
      return dataPromise.then(function () {
        if (data && typeof data === "object") {
          mockDataObj.currentUser = {
            id: mockDataObj.currentUser && mockDataObj.currentUser.id != null ? mockDataObj.currentUser.id : 1,
            name: data.name != null ? String(data.name) : (mockDataObj.currentUser && mockDataObj.currentUser.name) || "",
            email: data.email != null ? String(data.email) : (mockDataObj.currentUser && mockDataObj.currentUser.email) || "",
            initials: data.initials != null ? String(data.initials) : (mockDataObj.currentUser && mockDataObj.currentUser.initials) || "?"
          };
          persistToFirebase("mockData/mockData/currentUser", mockDataObj.currentUser);
        }
        return delay(MOCK_DELAY_MS, mockDataObj.currentUser);
      });
    },
    getPortalDetails: function () {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, getPortalDetails()); });
    },
    updatePortalDetails: function (data) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, updatePortalDetails(data)); });
    },
    updateModule: function (moduleId, data) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, updateModule(moduleId, data)); });
    },
    createModule: function (moduleId, data) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, createModule(moduleId, data)); });
    },
    createModules: function (modules) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, createModules(modules)); });
    },
    getModuleFieldOptions: function (refModuleId) {
      return dataPromise.then(function () { return delay(MOCK_DELAY_MS, getModuleFieldOptions(refModuleId)); });
    }
  };
})();

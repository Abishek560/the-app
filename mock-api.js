/**
 * Mock API – SINGLE SOURCE OF TRUTH for modules and data. Fully dynamic.
 * - modulesObj = { moduleId: { id, label, fields: { fieldId: { id, name, type, options?, ... } } } }
 * - List data is generated from each module's fields (generateMockList). No per-module generators.
 * To add/rename modules or fields: edit only modulesObj. Data is built automatically.
 */
(function () {
  "use strict";

  var MOCK_DELAY_MS = 1000;

  function delay(ms, value) {
    return new Promise(function (resolve) { setTimeout(function () { resolve(value); }, ms); });
  }

  var defaultListSize = 10;
  /** Generic word pools for text generation. No field-id or business logic – change modules only. */
  var textPoolA = ["Anita", "Kavya", "Divya", "Shruti", "Rekha", "Priya", "Anjali", "Kavitha", "Deepa", "Lakshmi", "Meera", "Sneha", "Riya", "Neha", "Pooja"];
  var textPoolB = ["Sharma", "Reddy", "Nair", "Patel", "Kumar", "Iyer", "Pillai", "Menon", "Rao", "Singh", "Gupta", "Mehta", "Joshi", "Desai", "Narayan"];

  function generatePhone(rowIndex) {
    var n = 9000000000 + (rowIndex % 999999999);
    return "+91 " + String(n).replace(/(\d{5})(\d{5})/, "$1 $2");
  }
  function generateEmail(rowIndex) {
    var a = textPoolA[rowIndex % textPoolA.length].toLowerCase();
    var b = textPoolB[rowIndex % textPoolB.length].toLowerCase();
    return a + "." + b + "@example.com";
  }

  /**
   * Generates one cell value from field config and row index.
   * Uses field.type and field.options; type "module" + field.moduleId uses the linked module's list.
   */
  function generateCellValue(field, rowIndex, builtLists) {
    if (field && (field.type === "id" || field.id === "id")) return rowIndex + 1;
    var type = (field && field.type) || "text";
    if (type === "module" && field.moduleId && builtLists && builtLists[field.moduleId]) {
      var refList = builtLists[field.moduleId];
      if (field.multi === true && refList.length > 0) {
        var n = 1 + (rowIndex % Math.min(3, refList.length));
        var ids = [];
        for (var i = 0; i < n; i++) {
          var r = refList[(rowIndex + i) % refList.length];
          if (r && r.id != null && ids.indexOf(r.id) === -1) ids.push(r.id);
        }
        return ids.length > 0 ? ids : [refList[0].id];
      }
      var refRow = refList[rowIndex % refList.length];
      return refRow && refRow.id != null ? refRow.id : null;
    }
    if (type === "select" && field.options && field.options.length > 1) {
      var opts = field.options.filter(function (o) { return String(o) !== "all"; });
      return opts[rowIndex % opts.length];
    }
    if (type === "number") {
      return 100 + (rowIndex % 4000);
    }
    if (type === "text" || !type) {
      if (field.options && field.options.length > 1) {
        var opts = field.options.filter(function (o) { return String(o) !== "all"; });
        return opts[rowIndex % opts.length] + (opts.length > 1 ? ", " + opts[(rowIndex + 2) % opts.length] : "");
      }
      var fmt = (field && field.format) ? String(field.format).toLowerCase() : "";
      if (fmt === "phone") return generatePhone(rowIndex);
      if (fmt === "email") return generateEmail(rowIndex);
      return textPoolA[rowIndex % textPoolA.length] + " " + textPoolB[rowIndex % textPoolB.length];
    }
    return "Value " + rowIndex;
  }

  /** Returns module ids in dependency order: referenced modules (e.g. services) before modules that reference them. */
  function getModuleBuildOrder() {
    var ids = Object.keys(modulesObj);
    var order = [];
    var added = {};
    function depsSatisfied(moduleId) {
      var m = modulesObj[moduleId];
      if (!m || !m.fields) return true;
      var k;
      for (k in m.fields) {
        if (m.fields[k].type === "module" && m.fields[k].moduleId && !added[m.fields[k].moduleId]) return false;
      }
      return true;
    }
    while (order.length < ids.length) {
      var progress = false;
      ids.forEach(function (id) {
        if (!added[id] && depsSatisfied(id)) { order.push(id); added[id] = true; progress = true; }
      });
      if (!progress) break;
    }
    ids.forEach(function (id) { if (!added[id]) order.push(id); });
    return order;
  }

  /** Generates mock list for any module from its fields. builtLists = { moduleId: list } for type "module" fields. */
  function generateMockList(moduleId, count, builtLists) {
    var m = modulesObj[moduleId];
    if (!m || !m.fields) return [];
    var fieldIds = Object.keys(m.fields);
    var list = [];
    for (var i = 0; i < count; i++) {
      var row = { id: i + 1 };
      for (var k = 0; k < fieldIds.length; k++) {
        var fid = fieldIds[k];
        row[fid] = generateCellValue(m.fields[fid], i, builtLists);
      }
      list.push(row);
    }
    return list;
  }

  /** modules = { moduleId: { id, label, fields: { fieldId: { id, name, type, placeholder?, options?, width?, moduleId? } } } }.
   *  type "module" + moduleId connects to another module: values and UI options come from that module's list. */
  var modulesObj = {
    enquiries: {
      id: "enquiries",
      label: "Leads",
      fields: {
        id: { id: "id", name: "ID", type: "id", width: "8%", searchable: false, hideInFilter: true },
        name: { id: "name", name: "Customer name", type: "text", placeholder: "Filter by name", width: "20%", sortable: true },
        phone: { id: "phone", name: "Phone", type: "text", format: "phone", placeholder: "Filter by phone", width: "18%" },
        service_type: { id: "service_type", name: "Services", type: "module", moduleId: "services", width: "18%", multi: true },
        status: { id: "status", name: "Status", type: "select", options: ["all", "New", "Booked", "In progress", "Done", "Cancelled"], width: "14%", chipByValue: true, chipPalette: { "New": "new", "Booked": "booked", "In progress": "in-progress", "Done": "done", "Cancelled": "cancelled" } }
      }
    },
    contacts: {
      id: "contacts",
      label: "Customers",
      fields: {
        id: { id: "id", name: "ID", type: "id", width: "8%", searchable: false, hideInFilter: true },
        name: { id: "name", name: "Name", type: "text", placeholder: "Filter by name", width: "20%", sortable: true },
        phone: { id: "phone", name: "Phone", type: "text", format: "phone", placeholder: "Filter by phone", width: "18%" },
        email: { id: "email", name: "Email", type: "text", format: "email", placeholder: "Filter by email", width: "28%" }
      }
    },
    services: {
      id: "services",
      label: "Services",
      fields: {
        id: { id: "id", name: "ID", type: "id", width: "8%", searchable: false, hideInFilter: true },
        name: { id: "name", name: "Service name", type: "text", placeholder: "Filter by name", width: "38%", sortable: true },
        price: { id: "price", name: "Price (₹)", type: "number", format: "currency", currencyCode: "₹", placeholder: "e.g. 500", width: "27%" },
        duration_mins: { id: "duration_mins", name: "Duration (mins)", type: "number", format: "number", placeholder: "e.g. 60", width: "27%" }
      }
    },
    staffs: {
      id: "staffs",
      label: "Staffs",
      fields: {
        id: { id: "id", name: "ID", type: "id", width: "8%", searchable: false, hideInFilter: true },
        name: { id: "name", name: "Name", type: "text", placeholder: "Filter by name", width: "22%", sortable: true },
        role: { id: "role", name: "Role", type: "text", placeholder: "Filter by role", width: "22%" },
        email: { id: "email", name: "Email", type: "text", format: "email", placeholder: "Filter by email", width: "24%" },
        phone: { id: "phone", name: "Phone", type: "text", format: "phone", placeholder: "Filter by phone", width: "24%" }
      }
    },
    work_orders: {
      id: "work_orders",
      label: "Work orders",
      fields: {
        id: { id: "id", name: "ID", type: "id", width: "8%", searchable: false, hideInFilter: true },
        customer: { id: "customer", name: "Customer", type: "module", moduleId: "contacts", width: "18%", sortable: true },
        vehicle: { id: "vehicle", name: "Vehicle", type: "module", moduleId: "vehicles", width: "18%" },
        service: { id: "service", name: "Services", type: "module", moduleId: "services", width: "18%", multi: true },
        status: { id: "status", name: "Status", type: "select", options: ["all", "Scheduled", "In progress", "Done", "Cancelled"], width: "14%", chipByValue: true, chipPalette: { "Scheduled": "booked", "In progress": "in-progress", "Done": "done", "Cancelled": "cancelled" } },
        amount: { id: "amount", name: "Amount (₹)", type: "number", format: "currency", currencyCode: "₹", placeholder: "Filter by amount", width: "14%" }
      }
    },
    vehicles: {
      id: "vehicles",
      label: "Vehicles",
      fields: {
        id: { id: "id", name: "ID", type: "id", width: "8%", searchable: false, hideInFilter: true },
        registration: { id: "registration", name: "Vehicle number", type: "text", placeholder: "Filter by vehicle number", width: "46%", sortable: true },
        owner: { id: "owner", name: "Owner", type: "module", moduleId: "contacts", width: "46%" }
      }
    }
  };

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

  /** Converts modules object to array; each field gets label from name. type "module" → "select" with options from linked module. */
  function modulesToArray() {
    return Object.keys(modulesObj).map(function (moduleId) {
      var m = modulesObj[moduleId];
      var fieldsArr = Object.keys(m.fields || {}).map(function (fieldId) {
        var f = m.fields[fieldId];
        var out = { id: f.id || fieldId, label: f.name != null ? f.name : f.label || fieldId };
        if (f.type === "module" && f.moduleId) {
          out.type = "select";
          out.options = getModuleFieldOptions(f.moduleId);
          if (f.moduleId) out.moduleId = f.moduleId;
        } else {
          if (f.type != null) out.type = f.type;
          if (f.options != null) out.options = f.options;
        }
        if (f.placeholder != null) out.placeholder = f.placeholder;
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
      return { id: m.id || moduleId, label: m.label, fields: fieldsArr };
    });
  }

  /** Returns field config array for a module. type "module" → "select" with options from linked module. */
  function getModuleFieldsArray(moduleId) {
    var m = modulesObj[moduleId];
    if (!m || !m.fields) return [];
    return Object.keys(m.fields).map(function (fieldId) {
      var f = m.fields[fieldId];
      var out = { id: f.id || fieldId, label: f.name != null ? f.name : f.label || fieldId };
      if (f.type === "module" && f.moduleId) {
        out.type = "select";
        out.options = getModuleFieldOptions(f.moduleId);
        if (f.moduleId) out.moduleId = f.moduleId;
      } else {
        if (f.type != null) out.type = f.type;
        if (f.options != null) out.options = f.options;
      }
      if (f.placeholder != null) out.placeholder = f.placeholder;
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

  /** One entity per service (single service per row). */
  var servicesList = [
    { id: 1, name: "Oil Change", price: 1500, duration_mins: 30 },
    { id: 2, name: "Brake Pad Replacement", price: 3500, duration_mins: 60 },
    { id: 3, name: "Full Service", price: 5000, duration_mins: 120 },
    { id: 4, name: "Brake Discs", price: 4500, duration_mins: 90 },
    { id: 5, name: "Tyre Change", price: 2000, duration_mins: 45 },
    { id: 6, name: "Wheel Alignment", price: 1200, duration_mins: 30 },
    { id: 7, name: "AC Repair", price: 2500, duration_mins: 60 },
    { id: 8, name: "Battery Check", price: 500, duration_mins: 15 },
    { id: 9, name: "Engine Diagnostic", price: 800, duration_mins: 30 },
    { id: 10, name: "Coolant Flush", price: 1800, duration_mins: 45 }
  ];

  var mockDataObj = { currentUser: { id: 1, name: "Priya", role: "Garage Manager", email: "priya@garage.example.com", initials: "P" } };
  var buildOrder = getModuleBuildOrder();
  buildOrder.forEach(function (moduleId) {
    if (moduleId === "services") {
      mockDataObj.services = servicesList;
      return;
    }
    var count = (moduleId === "staffs") ? 3 : defaultListSize;
    mockDataObj[moduleId] = generateMockList(moduleId, count, mockDataObj);
  });

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
    var fieldConfig = getModuleFieldsArray(moduleId);
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

  window.MockApi = {
    getModules: function () {
      return delay(MOCK_DELAY_MS, modulesToArray());
    },
    getModuleData: getModuleData,
    getCurrentUser: function () {
      return delay(MOCK_DELAY_MS, mockDataObj.currentUser);
    }
  };
})();

/**
 * Controller: entity module (any module with fields) – fetch, state, filter and pagination bindings.
 * Fully dynamic: keyed by moduleId; no hardcoded module names. HTML ids use module.id and field.id only.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.api || !theApp.getEntityData || !theApp.getModuleFields || !theApp.view || !theApp.view.entityModule) return;

  var state = theApp.state;
  var config = theApp.config;
  var api = theApp.api;
  var getEntityData = theApp.getEntityData;
  var getModuleFields = theApp.getModuleFields;
  var entityView = theApp.view.entityModule;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  var pageSize = config.pageSize;

  function hasAppliedFilters(filters) {
    if (!filters || typeof filters !== "object") return false;
    return Object.keys(filters).some(function (k) {
      var v = (filters[k] != null ? String(filters[k]).trim() : "");
      return v !== "" && v !== "all";
    });
  }

  /** Load options for reference (module) fields so list/detail can show labels. Returns a promise. */
  function ensureModuleFieldOptions(moduleId) {
    var modules = state.modules || [];
    var module = modules.filter(function (m) { return m.id === moduleId; })[0];
    var fields = (module && module.fields) ? module.fields : [];
    var optsCache = state.moduleFieldOptions || {};
    var promises = [];
    fields.forEach(function (f) {
      if (f.type === "module" && f.moduleId && !optsCache[f.moduleId] && api.getModuleFieldOptions) {
        promises.push(api.getModuleFieldOptions(f.moduleId).then(function (opts) {
          if (!state.moduleFieldOptions[f.moduleId]) state.moduleFieldOptions[f.moduleId] = opts;
        }));
      }
    });
    return promises.length ? Promise.all(promises) : Promise.resolve();
  }

  function fetchEntityPage(moduleId, page, contentEl) {
    var pageNumber = Math.max(1, page);
    var content = contentEl || document.getElementById("content");
    var data = getEntityData(moduleId);
    var listEl = content && content.querySelector(".module-list");
    var table = content && content.querySelector(".module-list .module-list-body table");
    var tbody = table && table.querySelector("tbody");

    var useLocalData = Array.isArray(data.list) && data.list.length > 0 && !hasAppliedFilters(data.filters);
    var emptyMsg = hasAppliedFilters(data.filters) ? t("noResultsMatchFilters") : t("noResults");
    var isTileMode = state.listViewMode === "tile";
    var canUpdateInPlace = listEl && (tbody || isTileMode);

    if (useLocalData) {
      data.page = pageNumber;
      ensureModuleFieldOptions(moduleId).then(function () {
        if (listEl && tbody) {
          entityView.updateTableAndPaginationOnly(moduleId, content, emptyMsg);
          bindSortListeners(moduleId, content);
          bindListRowClicks(moduleId, content);
        } else if (canUpdateInPlace && isTileMode) {
          entityView.updateListOnly(moduleId, content, emptyMsg);
          bindPaginationListeners(moduleId, content);
          bindListRowClicks(moduleId, content);
        } else if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        } else {
          content.innerHTML = entityView.renderFull(moduleId, emptyMsg);
          bindFilterListeners(moduleId, content);
          bindPaginationListeners(moduleId, content);
          bindListViewToggle(moduleId, content);
          bindSortListeners(moduleId, content);
          bindListRowClicks(moduleId, content);
        }
      });
      return;
    }

    if (canUpdateInPlace) {
      if (tbody) {
        var colCount = (getModuleFields(moduleId) || []).length || 1;
        tbody.innerHTML = "<tr><td colspan=\"" + colCount + "\" class=\"entity-list-loading-cell\"><div class=\"entity-list-loading\" role=\"status\" aria-live=\"polite\"><span class=\"entity-list-loading-spinner\" aria-hidden=\"true\"></span><span class=\"entity-list-loading-text\">" + (t("loading").replace(/</g, "&lt;")) + "</span></div></td></tr>";
      } else if (isTileMode) {
        listEl.innerHTML = "<div class=\"entity-list-loading entity-list-loading--module\" role=\"status\" aria-live=\"polite\"><span class=\"entity-list-loading-spinner\" aria-hidden=\"true\"></span><span class=\"entity-list-loading-text\">" + (t("loading").replace(/</g, "&lt;")) + "…</span></div>";
      }
      api.getModuleData(moduleId, {
        page: pageNumber,
        limit: pageSize,
        search: "",
        filters: data.filters,
        sortBy: data.sortBy || undefined,
        sortOrder: data.sortOrder || "asc"
      }).then(function (result) {
        data.list = result.data;
        data.total = (result.meta && result.meta.total) != null ? result.meta.total : result.data.length;
        data.page = (result.meta && result.meta.page) != null ? result.meta.page : pageNumber;
        var msg = hasAppliedFilters(data.filters) ? t("noResultsMatchFilters") : t("noResults");
        ensureModuleFieldOptions(moduleId).then(function () {
          if (tbody) {
            entityView.updateTableAndPaginationOnly(moduleId, content, msg);
            bindSortListeners(moduleId, content);
          } else {
            entityView.updateListOnly(moduleId, content, msg);
            bindPaginationListeners(moduleId, content);
          }
          bindListRowClicks(moduleId, content);
        });
      });
      return;
    }

    content.innerHTML = entityView.renderShell(moduleId);
    bindFilterListeners(moduleId, content);
    api.getModuleData(moduleId, {
      page: pageNumber,
      limit: pageSize,
      search: "",
      filters: data.filters,
      sortBy: data.sortBy || undefined,
      sortOrder: data.sortOrder || "asc"
    }).then(function (result) {
      data.list = result.data;
      data.total = (result.meta && result.meta.total) != null ? result.meta.total : result.data.length;
      data.page = (result.meta && result.meta.page) != null ? result.meta.page : pageNumber;
      var msg = hasAppliedFilters(data.filters) ? t("noResultsMatchFilters") : t("noResults");
      ensureModuleFieldOptions(moduleId).then(function () {
        if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        } else {
          content.innerHTML = entityView.renderFull(moduleId, msg);
          bindFilterListeners(moduleId, content);
          bindPaginationListeners(moduleId, content);
          bindListViewToggle(moduleId, content);
          bindSortListeners(moduleId, content);
          bindListRowClicks(moduleId, content);
        }
      });
    });
  }

  function bindSortListeners(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    if (!content) return;
    var data = getEntityData(moduleId);
    content.querySelectorAll(".entity-list-th-btn[data-sort-field]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var fieldId = btn.getAttribute("data-sort-field");
        if (!fieldId) return;
        var sameColumn = data.sortBy === fieldId;
        data.sortBy = fieldId;
        data.sortOrder = sameColumn && data.sortOrder === "asc" ? "desc" : "asc";
        fetchEntityPage(moduleId, 1, content);
      });
    });
  }

  function bindPaginationListeners(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    if (!content) return;
    var prev = document.getElementById(moduleId + "-prev");
    var next = document.getElementById(moduleId + "-next");
    var data = getEntityData(moduleId);
    if (prev) prev.addEventListener("click", function () { fetchEntityPage(moduleId, data.page - 1, content); });
    if (next) next.addEventListener("click", function () { fetchEntityPage(moduleId, data.page + 1, content); });
  }

  function bindHeaderFilterToggle(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    var filtersAside = content && content.querySelector(".module-filters");
    var headerFilterToggle = content && content.querySelector("#" + moduleId + "-filter-toggle");
    if (!headerFilterToggle || !filtersAside) return;
    var collapsed = filtersAside.classList.contains("module-filters--collapsed");
    headerFilterToggle.setAttribute("aria-pressed", collapsed ? "false" : "true");
    headerFilterToggle.classList.toggle("is-active", !collapsed);
    headerFilterToggle.addEventListener("click", function () {
      var nowCollapsed = filtersAside.classList.toggle("module-filters--collapsed");
      headerFilterToggle.setAttribute("aria-pressed", nowCollapsed ? "false" : "true");
      headerFilterToggle.setAttribute("aria-label", nowCollapsed ? t("showFilters") : t("hideFilters"));
      headerFilterToggle.classList.toggle("is-active", !nowCollapsed);
      if (nowCollapsed) {
        var data = getEntityData(moduleId);
        if (!hasAppliedFilters(data.filters)) return;
        data.filters = {};
        var fields = getModuleFields(moduleId);
        if (fields) {
          fields.forEach(function (field) {
            var el = content.querySelector("#" + moduleId + "-filter-" + field.id);
            if (el) {
              if (field.type === "select" || field.type === "module") el.value = "all";
              else el.value = "";
            }
          });
        }
        fetchEntityPage(moduleId, 1, content);
      }
    });
  }

  function bindFilterListeners(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    var data = getEntityData(moduleId);
    bindHeaderFilterToggle(moduleId, content);
    var applyBtn = content && content.querySelector("#" + moduleId + "-apply-filters");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        var fields = getModuleFields(moduleId);
        data.filters = {};
        fields.forEach(function (field) {
          var el = content.querySelector("#" + moduleId + "-filter-" + field.id);
          var filterKey = field.moduleId || field.id;
          data.filters[filterKey] = el ? String(el.value || "").trim() : (field.type === "select" || field.type === "module" ? "all" : "");
        });
        fetchEntityPage(moduleId, 1, content);
      });
    }
    bindAddButton(moduleId, content);
    bindListViewToggle(moduleId, content);
  }

  function bindAddButton(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    var addBtn = content && content.querySelector("#" + moduleId + "-add");
    if (!addBtn) return;
    addBtn.addEventListener("click", function () {
      state.creatingModule = moduleId;
      if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
        theApp.controller.app.renderContent();
      }
    });
  }

  function bindListViewToggle(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    if (!content) return;
    content.querySelectorAll(".module-list-view-btn[data-list-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-list-view");
        if (mode !== "table" && mode !== "spreadsheet" && mode !== "tile") return;
        state.listViewMode = mode;
        if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        }
      });
    });
  }

  function bindListRowClicks(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    if (!content) return;
    content.querySelectorAll(".entity-list-row[data-entity-id]").forEach(function (row) {
      var entityId = row.getAttribute("data-entity-id");
      if (!entityId) return;
      function openDetail() {
        state.activeEntity = { moduleId: moduleId, entityId: entityId };
        state.entityViewMode = "detail";
        if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        }
      }
      row.addEventListener("click", function (e) {
        e.preventDefault();
        openDetail();
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openDetail();
        }
      });
    });
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.entity = {
    fetchEntityPage: fetchEntityPage,
    ensureModuleFieldOptions: ensureModuleFieldOptions,
    bindSortListeners: bindSortListeners,
    bindFilterListeners: bindFilterListeners,
    bindPaginationListeners: bindPaginationListeners,
    bindAddButton: bindAddButton,
    bindListViewToggle: bindListViewToggle,
    bindListRowClicks: bindListRowClicks
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

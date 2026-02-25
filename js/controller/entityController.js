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

  var pageSize = config.pageSize;

  function fetchEntityPage(moduleId, page, contentEl) {
    var pageNumber = Math.max(1, page);
    var content = contentEl || document.getElementById("content");
    var data = getEntityData(moduleId);
    var listEl = content && content.querySelector(".module-list");

    var table = content && content.querySelector(".module-list .module-list-body table");
    var tbody = table && table.querySelector("tbody");
    if (listEl && tbody) {
      var colCount = (getModuleFields(moduleId) || []).length || 1;
      tbody.innerHTML = "<tr><td colspan=\"" + colCount + "\" class=\"entity-list-loading-cell\"><div class=\"entity-list-loading\" role=\"status\" aria-live=\"polite\"><span class=\"entity-list-loading-spinner\" aria-hidden=\"true\"></span><span class=\"entity-list-loading-text\">Loading</span></div></td></tr>";
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
        entityView.updateTableAndPaginationOnly(moduleId, content, "No results match your filters.");
        bindSortListeners(moduleId, content);
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
      if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
        theApp.controller.app.renderContent();
      } else {
        content.innerHTML = entityView.renderFull(moduleId, "No results match your filters.");
        bindFilterListeners(moduleId, content);
        bindPaginationListeners(moduleId, content);
        bindSortListeners(moduleId, content);
      }
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
      headerFilterToggle.setAttribute("aria-label", nowCollapsed ? "Show filters" : "Hide filters");
      headerFilterToggle.classList.toggle("is-active", !nowCollapsed);
      if (nowCollapsed) {
        var data = getEntityData(moduleId);
        data.filters = {};
        var fields = getModuleFields(moduleId);
        if (fields) {
          fields.forEach(function (field) {
            var el = content.querySelector("#" + moduleId + "-filter-" + field.id);
            if (el) {
              if (field.type === "select") el.value = "all";
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
          data.filters[filterKey] = el ? String(el.value || "").trim() : (field.type === "select" ? "all" : "");
        });
        fetchEntityPage(moduleId, 1, content);
      });
    }
    bindAddButton(moduleId, content);
  }

  function bindAddButton(moduleId, contentEl) {
    var content = contentEl || document.getElementById("content");
    var addBtn = content && content.querySelector("#" + moduleId + "-add");
    if (!addBtn) return;
    addBtn.addEventListener("click", function () {
      if (typeof global.theApp !== "undefined" && global.theApp.onAddEntity) {
        global.theApp.onAddEntity(moduleId);
      } else {
        var label = (global.theApp && global.theApp.getModuleFields && global.theApp.state && global.theApp.state.modules) ? (global.theApp.state.modules.filter(function (m) { return m.id === moduleId; })[0] || {}).label || moduleId : moduleId;
        if (typeof alert !== "undefined") alert("Add " + label + " – form can be wired here.");
      }
    });
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.entity = {
    fetchEntityPage: fetchEntityPage,
    bindSortListeners: bindSortListeners,
    bindFilterListeners: bindFilterListeners,
    bindPaginationListeners: bindPaginationListeners,
    bindAddButton: bindAddButton
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

/**
 * View: entity module (any module with fields) – filter sidebar + list.
 * Renders shell (loading), full (with data), or list-only update; all keyed by moduleId.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.getEntityData || !theApp.getModuleFields || !theApp.view || !theApp.view.entityList) return;

  var state = theApp.state;
  var config = theApp.config;
  var getEntityData = theApp.getEntityData;
  var getModuleFields = theApp.getModuleFields;
  var entityList = theApp.view.entityList;
  var buildFilterHTML = entityList.buildFilterFieldsHTML;
  var buildListHeaderHTML = entityList.buildListHeaderHTML;
  var buildListBodyHTML = entityList.buildListBodyHTML;
  var buildListSectionHTML = entityList.buildListSectionHTML;

  var pageSize = config.pageSize;

  function getModuleLabel(moduleId) {
    var m = (state.modules || []).filter(function (mod) { return mod.id === moduleId; })[0];
    return (m && m.label) || moduleId;
  }

  function getPagination(moduleId) {
    var data = getEntityData(moduleId);
    var list = Array.isArray(data.list) ? data.list : [];
    var totalCount = data.total || 0;
    var totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    var currentPage = Math.max(1, Math.min(data.page || 1, totalPages));
    var rangeFrom = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
    var rangeTo = totalCount ? (currentPage - 1) * pageSize + list.length : 0;
    return {
      currentPage: currentPage,
      totalPages: totalPages,
      rangeFrom: rangeFrom,
      rangeTo: rangeTo,
      totalCount: totalCount,
      prevId: moduleId + "-prev",
      nextId: moduleId + "-next"
    };
  }

  function renderShell(moduleId) {
    var data = getEntityData(moduleId);
    var label = getModuleLabel(moduleId);
    var filterHTML = buildFilterHTML(moduleId, moduleId, data.filters || {});
    var pagination = getPagination(moduleId);
    var headerHTML = buildListHeaderHTML(moduleId, pagination, label);
    return "<div class=\"card\">" +
      headerHTML +
      "<div class=\"module-layout\">" +
      "<aside class=\"module-filters module-filters--collapsed\" aria-label=\"Filter " + label + "\">" +
      "<div class=\"module-filters-panel\">" +
      "<h2 class=\"module-filters-header\">Filters</h2>" +
      "<div class=\"filter-section-options\">" + filterHTML + "</div>" +
      "</div>" +
      "</aside>" +
      "<section class=\"module-list\" aria-label=\"" + label + " list\">" +
      "<div class=\"entity-list-loading entity-list-loading--module\" role=\"status\" aria-live=\"polite\"><span class=\"entity-list-loading-spinner\" aria-hidden=\"true\"></span><span class=\"entity-list-loading-text\">Loading " + (label.replace(/</g, "&lt;").replace(/"/g, "&quot;")) + "…</span></div>" +
      "</section>" +
      "</div></div>";
  }

  function renderFull(moduleId, emptyMessage) {
    var data = getEntityData(moduleId);
    var list = Array.isArray(data.list) ? data.list : [];
    var label = getModuleLabel(moduleId);
    var filterHTML = buildFilterHTML(moduleId, moduleId, data.filters || {});
    var pagination = getPagination(moduleId);
    var headerHTML = buildListHeaderHTML(moduleId, pagination, label);
    var sortState = { sortBy: data.sortBy || null, sortOrder: data.sortOrder || "asc" };
    var listBodyHTML = buildListBodyHTML(moduleId, list, emptyMessage || "No results.", sortState);
    return "<div class=\"card\">" +
      headerHTML +
      "<div class=\"module-layout\">" +
      "<aside class=\"module-filters module-filters--collapsed\" aria-label=\"Filter " + label + "\">" +
      "<div class=\"module-filters-panel\">" +
      "<h2 class=\"module-filters-header\">Filters</h2>" +
      "<div class=\"filter-section-options\">" + filterHTML + "</div>" +
      "</div>" +
      "</aside>" +
      "<section class=\"module-list\" aria-label=\"" + label + " list\">" + listBodyHTML + "</section>" +
      "</div></div>";
  }

  function updateListOnly(moduleId, contentEl, emptyMessage) {
    var content = contentEl || document.querySelector("#content");
    if (!content) return;
    var listEl = content.querySelector(".module-list");
    if (!listEl) return;
    var data = getEntityData(moduleId);
    var list = Array.isArray(data.list) ? data.list : [];
    var pagination = getPagination(moduleId);
    var sortState = { sortBy: data.sortBy || null, sortOrder: data.sortOrder || "asc" };
    listEl.innerHTML = buildListBodyHTML(moduleId, list, emptyMessage || "No results.", sortState);
    var infoEl = content.querySelector(".module-list-header .pagination-info");
    if (infoEl) infoEl.textContent = "Page " + pagination.currentPage + " of " + pagination.totalPages;
    var prevEl = content.querySelector("#" + moduleId + "-prev");
    if (prevEl) {
      var prevDisabled = pagination.currentPage <= 1;
      prevEl.classList.toggle("disabled", prevDisabled);
      prevEl.setAttribute("tabindex", prevDisabled ? "-1" : "0");
    }
    var nextEl = content.querySelector("#" + moduleId + "-next");
    if (nextEl) {
      var nextDisabled = pagination.currentPage >= pagination.totalPages;
      nextEl.classList.toggle("disabled", nextDisabled);
      nextEl.setAttribute("tabindex", nextDisabled ? "-1" : "0");
    }
  }

  /** Updates only the table body and pagination controls (Page X of Y, prev/next state). Does not replace the list header. */
  function updateTableAndPaginationOnly(moduleId, contentEl, emptyMessage) {
    var content = contentEl || document.querySelector("#content");
    if (!content) return;
    var data = getEntityData(moduleId);
    var list = Array.isArray(data.list) ? data.list : [];
    var pagination = getPagination(moduleId);
    var sortState = { sortBy: data.sortBy || null, sortOrder: data.sortOrder || "asc" };
    var tableHTML = entityList.buildTableHTML(moduleId, list, emptyMessage || "No results.", sortState);
    var table = content.querySelector(".module-list .module-list-body table");
    if (table) table.innerHTML = tableHTML;
    var infoEl = content.querySelector(".module-list-header .pagination-info");
    if (infoEl) infoEl.textContent = "Page " + pagination.currentPage + " of " + pagination.totalPages;
    var prevEl = content.querySelector("#" + moduleId + "-prev");
    if (prevEl) {
      var prevDisabled = pagination.currentPage <= 1;
      prevEl.classList.toggle("disabled", prevDisabled);
      prevEl.setAttribute("tabindex", prevDisabled ? "-1" : "0");
      prevEl.setAttribute("aria-label", "Previous page");
    }
    var nextEl = content.querySelector("#" + moduleId + "-next");
    if (nextEl) {
      var nextDisabled = pagination.currentPage >= pagination.totalPages;
      nextEl.classList.toggle("disabled", nextDisabled);
      nextEl.setAttribute("tabindex", nextDisabled ? "-1" : "0");
      nextEl.setAttribute("aria-label", "Next page");
    }
  }

  theApp.view.entityModule = {
    renderShell: renderShell,
    renderFull: renderFull,
    updateListOnly: updateListOnly,
    updateTableAndPaginationOnly: updateTableAndPaginationOnly,
    getPagination: getPagination,
    getModuleLabel: getModuleLabel
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

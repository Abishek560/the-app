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
  var buildListFooterHTML = entityList.buildListFooterHTML;
  var buildListBodyHTML = entityList.buildListBodyHTML;
  var buildSpreadsheetBodyHTML = entityList.buildSpreadsheetBodyHTML;
  var buildTileBodyHTML = entityList.buildTileBodyHTML;
  var buildListSectionHTML = entityList.buildListSectionHTML;

  var pageSize = config.pageSize;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };
  var getModuleLabelFromState = theApp.getModuleLabel || function (m) { return (m && m.label) || (m && m.id) || ""; };

  function getModuleLabel(moduleId) {
    var m = (state.modules || []).filter(function (mod) { return mod.id === moduleId; })[0];
    return m ? getModuleLabelFromState(m) : moduleId;
  }

  function getPagination(moduleId) {
    var data = getEntityData(moduleId);
    var list = Array.isArray(data.list) ? data.list : [];
    var totalCount = data.total || list.length || 0;
    var totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    var currentPage = Math.max(1, Math.min(data.page || 1, totalPages));
    var rangeFrom = totalCount ? (currentPage - 1) * pageSize + 1 : 0;
    var rangeTo = totalCount ? Math.min(currentPage * pageSize, totalCount) : 0;
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
    var listViewMode = (state.listViewMode === "spreadsheet" || state.listViewMode === "tile") ? state.listViewMode : "table";
    var headerHTML = buildListHeaderHTML(moduleId, pagination, label, listViewMode);
    return "<div class=\"card\">" +
      headerHTML +
      "<div class=\"module-layout\">" +
      "<aside class=\"module-filters module-filters--collapsed\" aria-label=\"" + (t("filters").replace(/"/g, "&quot;")) + " " + (label.replace(/"/g, "&quot;")) + "\">" +
      "<div class=\"module-filters-panel\">" +
      "<h2 class=\"module-filters-header\">" + (t("filters").replace(/</g, "&lt;")) + "</h2>" +
      "<div class=\"filter-section-options\">" + filterHTML + "</div>" +
      "</div>" +
      "</aside>" +
      "<section class=\"module-list\" aria-label=\"" + (label.replace(/"/g, "&quot;")) + " list\">" +
      "<div class=\"entity-list-loading entity-list-loading--module\" role=\"status\" aria-live=\"polite\"><span class=\"entity-list-loading-spinner\" aria-hidden=\"true\"></span><span class=\"entity-list-loading-text\">" + (t("loading").replace(/</g, "&lt;")) + "…</span></div>" +
      "</section>" +
      "</div></div>";
  }

  function renderFull(moduleId, emptyMessage) {
    var data = getEntityData(moduleId);
    var list = Array.isArray(data.list) ? data.list : [];
    var label = getModuleLabel(moduleId);
    var filterHTML = buildFilterHTML(moduleId, moduleId, data.filters || {});
    var pagination = getPagination(moduleId);
    var start = (pagination.currentPage - 1) * pageSize;
    var listForPage = list.slice(start, start + pageSize);
    var listViewMode = (state.listViewMode === "spreadsheet" || state.listViewMode === "tile") ? state.listViewMode : "table";
    var headerHTML = buildListHeaderHTML(moduleId, pagination, label, listViewMode);
    var sortState = { sortBy: data.sortBy || null, sortOrder: data.sortOrder || "asc" };
    var emptyOpts = { emptyTitle: t("noResultsTitle") };
    var listBodyHTML = listViewMode === "spreadsheet"
      ? buildSpreadsheetBodyHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts)
      : listViewMode === "tile"
        ? buildTileBodyHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts)
        : buildListBodyHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts);
    return "<div class=\"card\">" +
      headerHTML +
      "<div class=\"module-layout\">" +
      "<aside class=\"module-filters module-filters--collapsed\" aria-label=\"" + (t("filters").replace(/"/g, "&quot;")) + " " + (label.replace(/"/g, "&quot;")) + "\">" +
      "<div class=\"module-filters-panel\">" +
      "<h2 class=\"module-filters-header\">" + (t("filters").replace(/</g, "&lt;")) + "</h2>" +
      "<div class=\"filter-section-options\">" + filterHTML + "</div>" +
      "</div>" +
      "</aside>" +
      "<section class=\"module-list\" aria-label=\"" + label + " list\">" + listBodyHTML + buildListFooterHTML(moduleId, pagination) + "</section>" +
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
    var start = (pagination.currentPage - 1) * pageSize;
    var listForPage = list.slice(start, start + pageSize);
    var listViewMode = (state.listViewMode === "spreadsheet" || state.listViewMode === "tile") ? state.listViewMode : "table";
    var sortState = { sortBy: data.sortBy || null, sortOrder: data.sortOrder || "asc" };
    var emptyOpts = { emptyTitle: t("noResultsTitle") };
    var bodyHTML = listViewMode === "spreadsheet"
      ? buildSpreadsheetBodyHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts)
      : listViewMode === "tile"
        ? buildTileBodyHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts)
        : buildListBodyHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts);
    listEl.innerHTML = bodyHTML + buildListFooterHTML(moduleId, pagination);
    var infoEl = content.querySelector(".module-list-footer .pagination-info");
    if (infoEl) infoEl.textContent = t("page") + " " + pagination.currentPage + " " + t("of") + " " + pagination.totalPages;
    var showingEl = content.querySelector(".module-list-footer .pagination-showing");
    if (showingEl) showingEl.textContent = pagination.totalCount === 0 ? t("showing") + " 0 " + t("of") + " 0" : t("showing") + " " + pagination.rangeFrom + "-" + pagination.rangeTo + " " + t("of") + " " + pagination.totalCount;
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
    var start = (pagination.currentPage - 1) * pageSize;
    var listForPage = list.slice(start, start + pageSize);
    var sortState = { sortBy: data.sortBy || null, sortOrder: data.sortOrder || "asc" };
    var emptyOpts = { emptyTitle: t("noResultsTitle") };
    var tableHTML = entityList.buildTableHTML(moduleId, listForPage, emptyMessage || t("noResults"), sortState, emptyOpts);
    var table = content.querySelector(".module-list .module-list-body table");
    if (table) table.innerHTML = tableHTML;
    var infoEl = content.querySelector(".module-list-footer .pagination-info");
    if (infoEl) infoEl.textContent = t("page") + " " + pagination.currentPage + " " + t("of") + " " + pagination.totalPages;
    var showingEl = content.querySelector(".module-list-footer .pagination-showing");
    if (showingEl) showingEl.textContent = pagination.totalCount === 0 ? t("showing") + " 0 " + t("of") + " 0" : t("showing") + " " + pagination.rangeFrom + "-" + pagination.rangeTo + " " + t("of") + " " + pagination.totalCount;
    var prevEl = content.querySelector("#" + moduleId + "-prev");
    if (prevEl) {
      var prevDisabled = pagination.currentPage <= 1;
      prevEl.classList.toggle("disabled", prevDisabled);
      prevEl.setAttribute("tabindex", prevDisabled ? "-1" : "0");
      prevEl.setAttribute("aria-label", t("previousPage"));
    }
    var nextEl = content.querySelector("#" + moduleId + "-next");
    if (nextEl) {
      var nextDisabled = pagination.currentPage >= pagination.totalPages;
      nextEl.classList.toggle("disabled", nextDisabled);
      nextEl.setAttribute("tabindex", nextDisabled ? "-1" : "0");
      nextEl.setAttribute("aria-label", t("nextPage"));
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

/**
 * View: shared entity list UI – table HTML, filter panel HTML, cell formatting.
 * Used by entity modules (table + filter panel).
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.getModuleFields) return;

  var getModuleFields = theApp.getModuleFields;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  /**
   * Escapes and formats a cell value for display (chip for select, currency for number).
   */
  function formatCellValue(value, field) {
    if (value == null || value === "") return "";
    if (field.type === "number") {
      var num = Number(value);
      if (isNaN(num)) return String(value).replace(/</g, "&lt;");
      var fmt = (field.format && String(field.format).toLowerCase()) || "currency";
      if (fmt === "percent") return (num <= 1 && num >= 0 ? num * 100 : num).toLocaleString() + "%";
      if (fmt === "number") return num.toLocaleString();
      var sym = (field.currencyCode != null && field.currencyCode !== "") ? String(field.currencyCode) : "$";
      return sym + num.toLocaleString();
    }
    if (field.type === "select" || field.type === "module") {
      var hasValueLabelOptions = field.options && field.options.length > 0 && field.options[0] && typeof field.options[0] === "object" && "label" in field.options[0];
      var ids = Array.isArray(value) ? value : (typeof value === "string" && value.indexOf(",") !== -1 ? value.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : [value]);
      if (field.multi === true && ids.length > 0 && (hasValueLabelOptions || (field.moduleId && field.options && field.options.length > 0))) {
        var chips = ids.map(function (id) {
          var opt = field.options.filter(function (o) { return o && (String(o.value) === String(id)); })[0];
          var str = opt ? opt.label : String(id);
          var chipClass = "chip-default";
          if (opt && opt.chipClass != null && String(opt.chipClass).trim() !== "") chipClass = String(opt.chipClass).trim().replace(/\s+/g, "-");
          else if (field.chipByValue === true) chipClass = str.toLowerCase().replace(/\s+/g, "-");
          return "<span class=\"chip " + chipClass + "\">" + str.replace(/</g, "&lt;") + "</span>";
        });
        return chips.join(" ");
      }
      var str = String(ids[0]);
      var opt = null;
      if (hasValueLabelOptions || (field.moduleId && field.options && field.options.length > 0)) {
        opt = field.options.filter(function (o) { return o && (String(o.value) === String(ids[0])); })[0];
        str = opt ? opt.label : str;
      }
      var chipClass = "chip-default";
      if (opt && opt.chipClass != null && String(opt.chipClass).trim() !== "") chipClass = String(opt.chipClass).trim().replace(/\s+/g, "-");
      else if (field.chipByValue === true) chipClass = str.toLowerCase().replace(/\s+/g, "-");
      return "<span class=\"chip " + chipClass + "\">" + str.replace(/</g, "&lt;") + "</span>";
    }
    return String(value).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function isSortableField(f) {
    return !!(f && f.sortable === true);
  }

  function sortIconSVG(direction) {
    if (direction === "asc") {
      return "<span class=\"entity-list-sort-icon entity-list-sort-icon--asc\" aria-hidden=\"true\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"18 15 12 9 6 15\"/></svg></span>";
    }
    if (direction === "desc") {
      return "<span class=\"entity-list-sort-icon entity-list-sort-icon--desc\" aria-hidden=\"true\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><polyline points=\"6 9 12 15 18 9\"/></svg></span>";
    }
    return "<span class=\"entity-list-sort-icon entity-list-sort-icon--none\" aria-hidden=\"true\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M7 15l5 5 5-5M7 9l5-5 5 5\"/></svg></span>";
  }

  /**
   * Empty state illustration SVG: empty list / no records (currentColor, theme-aware).
   */
  function emptyStateIllustrationSVG() {
    return "<svg class=\"entity-list-empty-svg\" viewBox=\"0 0 200 120\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\" aria-hidden=\"true\">" +
      "<rect x=\"20\" y=\"16\" width=\"160\" height=\"88\" rx=\"8\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" opacity=\"0.2\"/>" +
      "<line x1=\"20\" y1=\"40\" x2=\"180\" y2=\"40\" stroke=\"currentColor\" stroke-width=\"1.5\" opacity=\"0.25\"/>" +
      "<line x1=\"32\" y1=\"56\" x2=\"120\" y2=\"56\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.35\"/>" +
      "<line x1=\"32\" y1=\"68\" x2=\"90\" y2=\"68\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.35\"/>" +
      "<line x1=\"32\" y1=\"80\" x2=\"140\" y2=\"80\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.35\"/>" +
      "<line x1=\"20\" y1=\"56\" x2=\"180\" y2=\"56\" stroke=\"currentColor\" stroke-width=\"1\" opacity=\"0.15\"/>" +
      "<line x1=\"20\" y1=\"68\" x2=\"180\" y2=\"68\" stroke=\"currentColor\" stroke-width=\"1\" opacity=\"0.15\"/>" +
      "<line x1=\"20\" y1=\"80\" x2=\"180\" y2=\"80\" stroke=\"currentColor\" stroke-width=\"1\" opacity=\"0.15\"/>" +
      "<circle cx=\"158\" cy=\"68\" r=\"18\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" opacity=\"0.35\"/>" +
      "<path d=\"M158 56v24M146 68h24\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" opacity=\"0.5\"/>" +
      "</svg>";
  }

  /**
   * Builds <thead> and <tbody> HTML from module fields and data list. sortState = { sortBy: fieldId|null, sortOrder: "asc"|"desc" }.
   * opts (optional 5th): { emptyTitle?: string, compact?: boolean }.
   */
  function buildTableHTML(moduleId, list, emptyMessage, sortState, opts) {
    opts = opts || {};
    var sortBy = (sortState && sortState.sortBy) || null;
    var sortOrder = (sortState && sortState.sortOrder) || "asc";
    var fields = getModuleFields(moduleId).filter(function (f) { return f.hideInList !== true; });
    var theadCells = fields.map(function (f) {
      var label = (f.label || f.id).replace(/</g, "&lt;").replace(/"/g, "&quot;");
      var widthAttr = (f.width && String(f.width).trim()) ? " style=\"width:" + String(f.width).replace(/"/g, "&quot;") + "\"" : "";
      var sortable = isSortableField(f);
      var isActive = sortable && sortBy === f.id;
      var dir = isActive ? sortOrder : null;
      var thClass = "entity-list-th" + (sortable ? " entity-list-th--sortable" : "") + (isActive ? " entity-list-th--sorted-" + sortOrder : "");
      var titleText = "";
      if (sortable) {
        if (isActive && sortOrder === "asc") titleText = "Sorted ascending. Click for descending.";
        else if (isActive && sortOrder === "desc") titleText = "Sorted descending. Click for ascending.";
        else titleText = "Sort by " + (f.label || f.id);
      }
      var titleAttr = titleText ? " title=\"" + titleText.replace(/"/g, "&quot;") + "\"" : "";
      var fieldIdEsc = f.id.replace(/"/g, "&quot;");
      var btn = sortable
        ? ("<button type=\"button\" class=\"entity-list-th-btn\" data-sort-field=\"" + fieldIdEsc + "\"" + titleAttr + " aria-label=\"Sort by " + label + (isActive ? " (" + sortOrder + ")" : "") + "\">" + label + sortIconSVG(dir) + "</button>")
        : label;
      return "<th" + widthAttr + " class=\"" + thClass + "\">" + btn + "</th>";
    }).join("");
    var tbodyRows;
    if (!list || list.length === 0) {
      var msg = (emptyMessage || "No results.").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      var emptyTitle = opts.emptyTitle ? String(opts.emptyTitle).replace(/</g, "&lt;").replace(/"/g, "&quot;") : "";
      var compactClass = opts.compact ? " entity-list-empty--compact" : "";
      var emptyBlock = "<div class=\"entity-list-empty" + compactClass + "\" role=\"status\">" +
        "<div class=\"entity-list-empty-illustration\" aria-hidden=\"true\">" + emptyStateIllustrationSVG() + "</div>" +
        (emptyTitle ? "<h3 class=\"entity-list-empty-title\">" + emptyTitle + "</h3>" : "") +
        "<p class=\"entity-list-empty-message\">" + msg + "</p>" +
        "</div>";
      tbodyRows = "<tr><td colspan=\"" + fields.length + "\" class=\"entity-list-empty-cell\">" + emptyBlock + "</td></tr>";
    } else {
      tbodyRows = list.map(function (row) {
        var entityId = row.id != null ? String(row.id) : "";
        var idAttr = entityId ? " data-entity-id=\"" + entityId.replace(/"/g, "&quot;") + "\"" : "";
        var cells = fields.map(function (f) {
          var raw = row[f.id];
          var content = formatCellValue(raw, f);
          return "<td>" + content + "</td>";
        }).join("");
        return "<tr class=\"entity-list-row\"" + idAttr + " role=\"button\" tabindex=\"0\">" + cells + "</tr>";
      }).join("");
    }
    return "<thead><tr>" + theadCells + "</tr></thead><tbody>" + tbodyRows + "</tbody>";
  }

  /**
   * Builds filter panel HTML (labels + inputs/selects + Apply button) from module fields.
   */
  function buildFilterFieldsHTML(moduleId, filterPrefix, currentFilters) {
    var fields = getModuleFields(moduleId).filter(function (f) { return f.hideInFilter !== true; });
    var parts = [];
    fields.forEach(function (field) {
      var filterKey = field.moduleId || field.id;
      var value = (currentFilters[filterKey] != null ? String(currentFilters[filterKey]).trim() : "");
      var displayValue = value.replace(/"/g, "&quot;");
      var labelEsc = (field.label || field.id).replace(/"/g, "&quot;");
      parts.push("<label class=\"filter-field-label\">" + (field.label || field.id) + "</label>");
      if ((field.type === "select" || field.type === "module") && Array.isArray(field.options)) {
        var selectId = filterPrefix + "-filter-" + field.id;
        parts.push("<select id=\"" + selectId + "\" class=\"filter-field-select\" aria-label=\"" + labelEsc + "\">");
        field.options.forEach(function (opt) {
          var oVal = (opt && typeof opt === "object" && opt.value != null) ? opt.value : opt;
          var oLabel = (oVal === "all") ? t("all") : ((opt && typeof opt === "object" && opt.label != null) ? opt.label : (opt === "all" ? t("all") : String(opt)));
          var optVal = String(oVal).replace(/"/g, "&quot;");
          var isSelected = (!value || value === "all") ? (oVal === "all") : (String(oVal) === String(value));
          parts.push("<option value=\"" + optVal + "\"" + (isSelected ? " selected" : "") + ">" + (oLabel.replace(/</g, "&lt;").replace(/"/g, "&quot;")) + "</option>");
        });
        parts.push("</select>");
      } else {
        var type = field.type === "number" ? "number" : "text";
        var placeholder = (field.placeholder || t("filterPlaceholder")).replace(/"/g, "&quot;");
        parts.push("<input type=\"" + type + "\" id=\"" + filterPrefix + "-filter-" + field.id + "\" class=\"filter-field-input\" placeholder=\"" + placeholder + "\" value=\"" + displayValue + "\" aria-label=\"" + labelEsc + "\" />");
      }
    });
    parts.push("<button type=\"button\" id=\"" + filterPrefix + "-apply-filters\" class=\"filter-apply-btn\">" + (t("applyFilters").replace(/</g, "&lt;")) + "</button>");
    return parts.join("");
  }

  /**
   * Builds the top header bar (title, filter icon, view toggle, Add) – pagination is in the footer below the list.
   * listViewMode: 'table' | 'spreadsheet' | 'tile' – current mode for the view toggle.
   */
  function buildListHeaderHTML(moduleId, pagination, addLabel, listViewMode) {
    listViewMode = (listViewMode === "spreadsheet" || listViewMode === "tile") ? listViewMode : "table";
    var titleEsc = addLabel ? String(addLabel).replace(/</g, "&lt;").replace(/"/g, "&quot;") : "";
    var addBtn = "";
    if (addLabel) {
      var labelEsc = String(addLabel).replace(/</g, "&lt;").replace(/"/g, "&quot;");
      var addLabelT = t("add");
      addBtn = "<button type=\"button\" id=\"" + moduleId + "-add\" class=\"module-list-add-btn\" data-module-id=\"" + moduleId + "\" aria-label=\"" + (addLabelT + " " + labelEsc).replace(/"/g, "&quot;") + "\"><span class=\"module-list-add-icon\">+</span> " + addLabelT.replace(/</g, "&lt;") + " " + labelEsc + "</button>";
    }
    var showFiltersT = t("showFilters").replace(/"/g, "&quot;");
    var toggleFiltersT = t("toggleFilters").replace(/"/g, "&quot;");
    var filterIcon = "<button type=\"button\" id=\"" + moduleId + "-filter-toggle\" class=\"module-list-filter-toggle\" aria-pressed=\"false\" aria-label=\"" + showFiltersT + "\" title=\"" + toggleFiltersT + "\"><span class=\"module-list-filter-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"></polygon></svg></span></button>";
    var tableViewT = (t("listViewTable") || "Table").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    var spreadsheetViewT = (t("listViewSpreadsheet") || "Spreadsheet").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    var tileViewT = (t("listViewTile") || "Tile").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    var viewToggle = "<div class=\"module-list-view-toggle\" role=\"group\" aria-label=\"" + (t("listView") || "List view").replace(/"/g, "&quot;") + "\">" +
      "<button type=\"button\" class=\"module-list-view-btn" + (listViewMode === "table" ? " is-active" : "") + "\" data-list-view=\"table\" aria-pressed=\"" + (listViewMode === "table" ? "true" : "false") + "\">" + tableViewT + "</button>" +
      "<button type=\"button\" class=\"module-list-view-btn" + (listViewMode === "spreadsheet" ? " is-active" : "") + "\" data-list-view=\"spreadsheet\" aria-pressed=\"" + (listViewMode === "spreadsheet" ? "true" : "false") + "\">" + spreadsheetViewT + "</button>" +
      "<button type=\"button\" class=\"module-list-view-btn" + (listViewMode === "tile" ? " is-active" : "") + "\" data-list-view=\"tile\" aria-pressed=\"" + (listViewMode === "tile" ? "true" : "false") + "\">" + tileViewT + "</button>" +
      "</div>";
    return "<div class=\"module-list-header\">" +
      "<div class=\"module-list-header-start\">" +
      (titleEsc ? "<h2 class=\"module-list-title\">" + titleEsc + "</h2>" : "") +
      filterIcon +
      viewToggle +
      "</div>" +
      "<div class=\"module-list-header-end\">" + addBtn + "</div>" +
      "</div>";
  }

  /**
   * Builds the footer bar below the list: pagination (prev, Page X of Y, next).
   */
  function buildListFooterHTML(moduleId, pagination) {
    var p = pagination || {};
    var currentPage = p.currentPage || 1;
    var totalPages = p.totalPages || 1;
    var totalCount = p.totalCount != null ? p.totalCount : 0;
    var rangeFrom = p.rangeFrom != null ? p.rangeFrom : 0;
    var rangeTo = p.rangeTo != null ? p.rangeTo : 0;
    var showingText = totalCount === 0 ? t("showing") + " 0 " + t("of") + " 0" : t("showing") + " " + rangeFrom + "-" + rangeTo + " " + t("of") + " " + totalCount;
    var prevId = p.prevId || moduleId + "-prev";
    var nextId = p.nextId || moduleId + "-next";
    var prevDisabled = currentPage <= 1;
    var nextDisabled = currentPage >= totalPages;
    return "<div class=\"module-list-footer\">" +
      "<span class=\"pagination-showing\">" + showingText.replace(/</g, "&lt;") + "</span>" +
      "<nav class=\"module-list-pagination\" aria-label=\"Pagination\">" +
      "<span id=\"" + prevId + "\" class=\"pagination-arrow" + (prevDisabled ? " disabled" : "") + "\" role=\"button\" aria-label=\"" + (t("previousPage").replace(/"/g, "&quot;")) + "\" tabindex=\"" + (prevDisabled ? "-1" : "0") + "\">&lt;</span>" +
      "<span class=\"pagination-info\">" + t("page") + " " + currentPage + " " + t("of") + " " + totalPages + "</span>" +
      "<span id=\"" + nextId + "\" class=\"pagination-arrow" + (nextDisabled ? " disabled" : "") + "\" role=\"button\" aria-label=\"" + (t("nextPage").replace(/"/g, "&quot;")) + "\" tabindex=\"" + (nextDisabled ? "-1" : "0") + "\">&gt;</span>" +
      "</nav>" +
      "</div>";
  }

  /**
   * Builds only the list body: scroll wrapper + table (no header). sortState = { sortBy, sortOrder }. opts = { emptyTitle?, compact? }.
   */
  function buildListBodyHTML(moduleId, list, emptyMessage, sortState, opts) {
    var tableHTML = buildTableHTML(moduleId, list, emptyMessage, sortState, opts);
    return "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>";
  }

  /**
   * Builds list body in spreadsheet style: same table data, wrapper and table use spreadsheet classes for sticky header and grid styling.
   */
  function buildSpreadsheetBodyHTML(moduleId, list, emptyMessage, sortState, opts) {
    var tableHTML = buildTableHTML(moduleId, list, emptyMessage, sortState, opts);
    return "<div class=\"module-list-scroll\"><div class=\"module-list-body module-list-spreadsheet\"><table class=\"table table-spreadsheet\">" + tableHTML + "</table></div></div>";
  }

  /**
   * Builds list body as a grid of tiles (cards). Each tile is clickable and has data-entity-id for row-click handling.
   * Shows first few visible fields per entity. opts = { emptyTitle? }.
   */
  function buildTileBodyHTML(moduleId, list, emptyMessage, sortState, opts) {
    opts = opts || {};
    var fields = getModuleFields(moduleId).filter(function (f) { return f.hideInList !== true; });
    var emptyBlock = "";
    if (!list || list.length === 0) {
      var msg = (emptyMessage || "No results.").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      var emptyTitle = opts.emptyTitle ? String(opts.emptyTitle).replace(/</g, "&lt;").replace(/"/g, "&quot;") : "";
      emptyBlock = "<div class=\"entity-list-empty entity-list-empty--tile\" role=\"status\">" +
        "<div class=\"entity-list-empty-illustration\" aria-hidden=\"true\">" + emptyStateIllustrationSVG() + "</div>" +
        (emptyTitle ? "<h3 class=\"entity-list-empty-title\">" + emptyTitle + "</h3>" : "") +
        "<p class=\"entity-list-empty-message\">" + msg + "</p>" +
        "</div>";
    } else {
      var tileCards = list.map(function (row) {
        var entityId = row.id != null ? String(row.id) : "";
        var idAttr = entityId ? " data-entity-id=\"" + entityId.replace(/"/g, "&quot;") + "\"" : "";
        var cells = fields.slice(0, 5).map(function (f) {
          var label = (f.label || f.id).replace(/</g, "&lt;").replace(/"/g, "&quot;");
          var content = formatCellValue(row[f.id], f);
          if (!content) return "";
          return "<div class=\"entity-list-tile-field\"><span class=\"entity-list-tile-label\">" + label + "</span><span class=\"entity-list-tile-value\">" + content + "</span></div>";
        }).filter(Boolean).join("");
        return "<div class=\"entity-list-tile-item entity-list-row\"" + idAttr + " role=\"button\" tabindex=\"0\">" + cells + "</div>";
      }).join("");
      emptyBlock = "<div class=\"module-list-tiles\">" + tileCards + "</div>";
    }
    return "<div class=\"module-list-scroll\"><div class=\"module-list-body module-list-tiles-wrap\">" + emptyBlock + "</div></div>";
  }

  /** Builds header + body (for backward compat / single-section use). */
  function buildListSectionHTML(moduleId, list, emptyMessage, pagination, addLabel, sortState, opts) {
    return buildListHeaderHTML(moduleId, pagination || {}, addLabel) + buildListBodyHTML(moduleId, list, emptyMessage, sortState, opts);
  }

  theApp.view = theApp.view || {};
  theApp.view.entityList = {
    formatCellValue: formatCellValue,
    buildTableHTML: buildTableHTML,
    buildFilterFieldsHTML: buildFilterFieldsHTML,
    buildListHeaderHTML: buildListHeaderHTML,
    buildListFooterHTML: buildListFooterHTML,
    buildListBodyHTML: buildListBodyHTML,
    buildSpreadsheetBodyHTML: buildSpreadsheetBodyHTML,
    buildTileBodyHTML: buildTileBodyHTML,
    buildListSectionHTML: buildListSectionHTML
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

/**
 * View: shared entity list UI – table HTML, filter panel HTML, cell formatting.
 * Used by entity modules (table + filter panel).
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.getModuleFields) return;

  var getModuleFields = theApp.getModuleFields;

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
    if (field.type === "select") {
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
   * Builds <thead> and <tbody> HTML from module fields and data list. sortState = { sortBy: fieldId|null, sortOrder: "asc"|"desc" }.
   */
  function buildTableHTML(moduleId, list, emptyMessage, sortState) {
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
      tbodyRows = "<tr><td colspan=\"" + fields.length + "\" class=\"entity-list-empty-cell\"><div class=\"entity-list-empty\" role=\"status\"><span class=\"entity-list-empty-icon\" aria-hidden=\"true\"><svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z\"/><polyline points=\"14 2 14 8 20 8\"/><line x1=\"16\" y1=\"13\" x2=\"8\" y2=\"13\"/><line x1=\"16\" y1=\"17\" x2=\"8\" y2=\"17\"/><polyline points=\"10 9 9 9 8 9\"/></svg></span><p class=\"entity-list-empty-message\">" + msg + "</p></div></td></tr>";
    } else {
      tbodyRows = list.map(function (row) {
        var cells = fields.map(function (f) {
          var raw = row[f.id];
          var content = formatCellValue(raw, f);
          return "<td>" + content + "</td>";
        }).join("");
        return "<tr>" + cells + "</tr>";
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
      if (field.type === "select" && Array.isArray(field.options)) {
        var selectId = filterPrefix + "-filter-" + field.id;
        parts.push("<select id=\"" + selectId + "\" class=\"filter-field-select\" aria-label=\"" + labelEsc + "\">");
        field.options.forEach(function (opt) {
          var oVal = (opt && typeof opt === "object" && opt.value != null) ? opt.value : opt;
          var oLabel = (opt && typeof opt === "object" && opt.label != null) ? opt.label : (opt === "all" ? "All" : String(opt));
          var optVal = String(oVal).replace(/"/g, "&quot;");
          var isSelected = (!value || value === "all") ? (oVal === "all") : (String(oVal) === String(value));
          parts.push("<option value=\"" + optVal + "\"" + (isSelected ? " selected" : "") + ">" + (oLabel.replace(/</g, "&lt;").replace(/"/g, "&quot;")) + "</option>");
        });
        parts.push("</select>");
      } else {
        var type = field.type === "number" ? "number" : "text";
        var placeholder = (field.placeholder || "Filter...").replace(/"/g, "&quot;");
        parts.push("<input type=\"" + type + "\" id=\"" + filterPrefix + "-filter-" + field.id + "\" class=\"filter-field-input\" placeholder=\"" + placeholder + "\" value=\"" + displayValue + "\" aria-label=\"" + labelEsc + "\" />");
      }
    });
    parts.push("<button type=\"button\" id=\"" + filterPrefix + "-apply-filters\" class=\"filter-apply-btn\">Apply filters</button>");
    return parts.join("");
  }

  /**
   * Builds the top header bar (title, filter icon, Add, pagination) – used above both filter and list sections.
   */
  function buildListHeaderHTML(moduleId, pagination, addLabel) {
    var p = pagination || {};
    var currentPage = p.currentPage || 1;
    var totalPages = p.totalPages || 1;
    var prevId = p.prevId || "prev";
    var nextId = p.nextId || "next";
    var prevDisabled = currentPage <= 1;
    var nextDisabled = currentPage >= totalPages;
    var titleEsc = addLabel ? String(addLabel).replace(/</g, "&lt;").replace(/"/g, "&quot;") : "";
    var addBtn = "";
    if (addLabel) {
      var labelEsc = String(addLabel).replace(/</g, "&lt;").replace(/"/g, "&quot;");
      addBtn = "<button type=\"button\" id=\"" + moduleId + "-add\" class=\"module-list-add-btn\" data-module-id=\"" + moduleId + "\" aria-label=\"Add " + labelEsc + "\"><span class=\"module-list-add-icon\">+</span> Add " + labelEsc + "</button>";
    }
    var filterIcon = "<button type=\"button\" id=\"" + moduleId + "-filter-toggle\" class=\"module-list-filter-toggle\" aria-pressed=\"false\" aria-label=\"Show filters\" title=\"Toggle filters\"><span class=\"module-list-filter-icon\"><svg width=\"18\" height=\"18\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"></polygon></svg></span></button>";
    return "<div class=\"module-list-header\">" +
      "<div class=\"module-list-header-left\">" +
      (titleEsc ? "<h2 class=\"module-list-title\">" + titleEsc + "</h2>" : "") +
      filterIcon +
      "</div>" +
      "<div class=\"module-list-header-right\">" +
      addBtn +
      "<nav class=\"module-list-pagination\" aria-label=\"Pagination\">" +
      "<span id=\"" + prevId + "\" class=\"pagination-arrow" + (prevDisabled ? " disabled" : "") + "\" role=\"button\" aria-label=\"Previous page\" tabindex=\"" + (prevDisabled ? "-1" : "0") + "\">&lt;</span>" +
      "<span class=\"pagination-info\">Page " + currentPage + " of " + totalPages + "</span>" +
      "<span id=\"" + nextId + "\" class=\"pagination-arrow" + (nextDisabled ? " disabled" : "") + "\" role=\"button\" aria-label=\"Next page\" tabindex=\"" + (nextDisabled ? "-1" : "0") + "\">&gt;</span>" +
      "</nav>" +
      "</div>" +
      "</div>";
  }

  /**
   * Builds only the list body: scroll wrapper + table (no header). sortState = { sortBy, sortOrder }.
   */
  function buildListBodyHTML(moduleId, list, emptyMessage, sortState) {
    var tableHTML = buildTableHTML(moduleId, list, emptyMessage, sortState);
    return "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>";
  }

  /** Builds header + body (for backward compat / single-section use). */
  function buildListSectionHTML(moduleId, list, emptyMessage, pagination, addLabel, sortState) {
    return buildListHeaderHTML(moduleId, pagination || {}, addLabel) + buildListBodyHTML(moduleId, list, emptyMessage, sortState);
  }

  theApp.view = theApp.view || {};
  theApp.view.entityList = {
    formatCellValue: formatCellValue,
    buildTableHTML: buildTableHTML,
    buildFilterFieldsHTML: buildFilterFieldsHTML,
    buildListHeaderHTML: buildListHeaderHTML,
    buildListBodyHTML: buildListBodyHTML,
    buildListSectionHTML: buildListSectionHTML
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

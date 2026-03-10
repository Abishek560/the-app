/**
 * View: entity detail – read-only details, related list sidebar, header with back/edit.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.getModuleFields) return;

  var getModuleFields = theApp.getModuleFields;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  function formatDetailValue(value, field) {
    if (value == null || value === "") return "—";
    if (field.type === "number") {
      var num = Number(value);
      if (isNaN(num)) return String(value).replace(/</g, "&lt;");
      var fmt = (field.format && String(field.format).toLowerCase()) || "currency";
      if (fmt === "percent") return (num <= 1 && num >= 0 ? num * 100 : num).toLocaleString() + "%";
      if (fmt === "number") return num.toLocaleString();
      var sym = (field.currencyCode != null && field.currencyCode !== "") ? String(field.currencyCode) : "₹";
      return sym + num.toLocaleString();
    }
    if ((field.type === "select" || field.type === "module") && field.options && field.options.length) {
      var ids = Array.isArray(value) ? value : (typeof value === "string" && value.indexOf(",") !== -1 ? value.split(",").map(function (s) { return s.trim(); }).filter(Boolean) : [value]);
      var labels = ids.map(function (id) {
        var opt = field.options.filter(function (o) { return o && String(o.value) === String(id); })[0];
        return opt ? opt.label : String(id);
      });
      return labels.join(", ").replace(/</g, "&lt;");
    }
    return String(value).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function getDisplayName(entity, fields) {
    if (!entity) return "—";
    if (entity.name != null && String(entity.name).trim() !== "") return String(entity.name).trim();
    var nameField = (fields || []).filter(function (f) { return f.id === "name"; })[0];
    if (nameField && entity[nameField.id] != null) return String(entity[nameField.id]).replace(/</g, "&lt;");
    var first = (fields || []).filter(function (f) { return f.type === "text" || f.type === "id"; })[0];
    if (first && entity[first.id] != null) return String(entity[first.id]).replace(/</g, "&lt;");
    return entity.id != null ? "ID " + entity.id : "—";
  }

  function getInitial(entity) {
    if (!entity) return "?";
    var str = (entity.name != null && String(entity.name).trim() !== "") ? String(entity.name).trim()[0] : (entity.id != null ? String(entity.id)[0] : "?");
    return str.toUpperCase();
  }

  /**
   * Renders full entity detail layout: header (back, avatar, name, actions), sidebar (related list, links), main (Overview with read-only details).
   */
  function render(moduleId, entity, moduleLabel) {
    var fields = (getModuleFields(moduleId) || []).filter(function (f) { return f.hideInList !== true; });
    var displayName = getDisplayName(entity, fields);
    var initial = getInitial(entity);

    var backT = t("back").replace(/</g, "&lt;");
    var editT = t("edit").replace(/</g, "&lt;");
    var overviewT = t("overview").replace(/</g, "&lt;");
    var timelineT = t("timeline").replace(/</g, "&lt;");
    var relatedT = t("relatedLists").replace(/</g, "&lt;");
    var notesT = t("notes").replace(/</g, "&lt;");
    var attachmentsT = t("attachments").replace(/</g, "&lt;");
    var emailsT = t("emails").replace(/</g, "&lt;");
    var openActT = t("openActivities").replace(/</g, "&lt;");
    var closedActT = t("closedActivities").replace(/</g, "&lt;");
    var addRelatedT = t("addRelatedList").replace(/</g, "&lt;");
    var linksT = t("links").replace(/</g, "&lt;");
    var noLinksT = t("noLinksFound").replace(/</g, "&lt;");
    var addLinkT = t("addLink").replace(/</g, "&lt;");
    var hideDetailsT = t("hideDetails").replace(/</g, "&lt;");
    var sendEmailT = t("sendEmail").replace(/</g, "&lt;");

    var detailRows = fields.map(function (f) {
      var label = (f.label || f.id).replace(/</g, "&lt;").replace(/"/g, "&quot;");
      var val = entity[f.id];
      var display = formatDetailValue(val, f);
      var isEmail = f.type === "text" && (f.format === "email" || f.id === "email");
      var cell = isEmail && val ? "<a href=\"mailto:" + String(val).replace(/"/g, "&quot;") + "\" class=\"entity-detail-link\">" + display + "</a>" : display;
      return "<div class=\"entity-detail-row\"><span class=\"entity-detail-label\">" + label + "</span><span class=\"entity-detail-value\">" + cell + "</span></div>";
    }).join("");

    return "<div class=\"entity-detail\">" +
      "<header class=\"entity-detail-header\">" +
      "<button type=\"button\" class=\"entity-detail-back\" id=\"entity-detail-back\" aria-label=\"" + backT + "\">←</button>" +
      "<div class=\"entity-detail-header-avatar\" aria-hidden=\"true\">" + initial + "</div>" +
      "<div class=\"entity-detail-header-meta\">" +
      "<h1 class=\"entity-detail-title\">" + displayName + "</h1>" +
      "<div class=\"entity-detail-actions\">" +
      "<button type=\"button\" class=\"entity-detail-btn entity-detail-btn--primary\" id=\"entity-detail-send-email\">" + sendEmailT + "</button>" +
      "<button type=\"button\" class=\"entity-detail-btn entity-detail-btn--secondary\" id=\"entity-detail-edit\">" + editT + "</button>" +
      "<button type=\"button\" class=\"entity-detail-btn entity-detail-btn--icon\" id=\"entity-detail-more\" aria-label=\"More options\">⋯</button>" +
      "</div>" +
      "</div></header>" +
      "<div class=\"entity-detail-layout\">" +
      "<aside class=\"entity-detail-sidebar\">" +
      "<div class=\"entity-detail-sidebar-section\">" +
      "<h2 class=\"entity-detail-sidebar-title\">" + relatedT + "</h2>" +
      "<ul class=\"entity-detail-related-list\">" +
      "<li><a href=\"#\" class=\"entity-detail-related-link\" data-related=\"notes\">" + notesT + "</a></li>" +
      "<li><a href=\"#\" class=\"entity-detail-related-link\" data-related=\"attachments\">" + attachmentsT + "</a></li>" +
      "<li><a href=\"#\" class=\"entity-detail-related-link\" data-related=\"emails\">" + emailsT + "</a></li>" +
      "<li><a href=\"#\" class=\"entity-detail-related-link\" data-related=\"open-activities\">" + openActT + "</a></li>" +
      "<li><a href=\"#\" class=\"entity-detail-related-link\" data-related=\"closed-activities\">" + closedActT + "</a></li>" +
      "<li><a href=\"#\" class=\"entity-detail-related-link entity-detail-related-link--add\" data-related=\"add\">" + addRelatedT + "</a></li>" +
      "</ul></div>" +
      "<div class=\"entity-detail-sidebar-section\">" +
      "<h2 class=\"entity-detail-sidebar-title\">" + linksT + "</h2>" +
      "<p class=\"entity-detail-muted\">" + noLinksT + "</p>" +
      "<a href=\"#\" class=\"entity-detail-related-link entity-detail-related-link--add\" id=\"entity-detail-add-link\">" + addLinkT + "</a>" +
      "</div></aside>" +
      "<main class=\"entity-detail-main\">" +
      "<div class=\"entity-detail-tabs\">" +
      "<button type=\"button\" class=\"entity-detail-tab entity-detail-tab--active\" data-tab=\"overview\" aria-selected=\"true\">" + overviewT + "</button>" +
      "<button type=\"button\" class=\"entity-detail-tab\" data-tab=\"timeline\" aria-selected=\"false\">" + timelineT + "</button>" +
      "</div>" +
      "<div class=\"entity-detail-content\" data-tab-panel=\"overview\">" +
      "<div class=\"entity-detail-block\">" +
      "<div class=\"entity-detail-details-toggle\" data-details-toggle>" +
      "<button type=\"button\" class=\"entity-detail-toggle-btn\" id=\"entity-detail-toggle-details\" aria-expanded=\"true\">" + hideDetailsT + "</button>" +
      "</div>" +
      "<div class=\"entity-detail-details\" id=\"entity-detail-details\">" + detailRows + "</div>" +
      "</div></div>" +
      "<div class=\"entity-detail-content entity-detail-content--hidden\" data-tab-panel=\"timeline\">" +
      "<p class=\"entity-detail-muted\">" + timelineT + " – coming soon.</p>" +
      "</div>" +
      "</main></div></div>";
  }

  function renderLoading(moduleLabel) {
    var loadingT = (theApp.language && theApp.language.t ? theApp.language.t("loading") : "Loading").replace(/</g, "&lt;");
    return "<div class=\"entity-detail entity-detail--loading\">" +
      "<div class=\"entity-detail-loading\"><span class=\"entity-detail-loading-spinner\"></span><span>" + loadingT + "…</span></div></div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.entityDetail = {
    render: render,
    renderLoading: renderLoading,
    getDisplayName: getDisplayName
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

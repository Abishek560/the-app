/**
 * View: Setup/Settings page – sub-nav (Organization, Modules & fields) and edit forms.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.getModuleFields) return;

  var state = theApp.state;
  var getModuleFields = theApp.getModuleFields;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  function escapeHtml(s) {
    if (s == null) return "—";
    return String(s).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function render(portal, modules) {
    var section = state.settingsSection || "organization";
    var editingOrg = state.settingsEditingOrg === true;
    var editingModuleId = state.settingsEditingModuleId;

    portal = portal || {};
    modules = Array.isArray(modules) ? modules : [];

    var orgT = t("organization").replace(/</g, "&lt;");
    var modulesAndFieldsT = (t("modulesAndFields") || "Modules & fields").replace(/</g, "&lt;");
    var moduleConfigT = t("moduleConfig").replace(/</g, "&lt;");
    var fieldConfigT = t("fieldConfig").replace(/</g, "&lt;");
    var portalT = t("portalDetails").replace(/</g, "&lt;");
    var portalNameT = t("portalName").replace(/</g, "&lt;");
    var versionT = t("version").replace(/</g, "&lt;");
    var baseURLT = t("baseURL").replace(/</g, "&lt;");
    var nameT = t("name").replace(/</g, "&lt;");
    var editT = t("edit").replace(/</g, "&lt;");
    var cancelT = t("cancel").replace(/</g, "&lt;");
    var saveT = t("save").replace(/</g, "&lt;");
    var addT = t("add").replace(/</g, "&lt;");
    var moduleIdT = t("moduleId").replace(/</g, "&lt;");
    var moduleLabelT = t("moduleLabel").replace(/</g, "&lt;");
    var fieldIdT = t("fieldId").replace(/</g, "&lt;");
    var fieldLabelT = t("fieldLabel").replace(/</g, "&lt;");
    var fieldTypeT = t("fieldType").replace(/</g, "&lt;");

    var subNav = "<nav class=\"settings-subnav\" role=\"tablist\">" +
      "<button type=\"button\" class=\"settings-subnav-btn" + (section === "organization" ? " is-active" : "") + "\" data-settings-section=\"organization\" role=\"tab\">" + orgT + "</button>" +
      "<button type=\"button\" class=\"settings-subnav-btn" + (section === "modules" ? " is-active" : "") + "\" data-settings-section=\"modules\" role=\"tab\">" + modulesAndFieldsT + "</button>" +
      "</nav>";

    var orgPanel = "";
    if (section === "organization") {
      if (editingOrg) {
        orgPanel = "<section class=\"settings-panel settings-panel--form\">" +
          "<h2 class=\"settings-panel-title\">" + portalT + "</h2>" +
          "<form id=\"settings-org-form\" class=\"settings-form\">" +
          "<div class=\"settings-form-row\"><label for=\"settings-org-name\">" + nameT + "</label><input type=\"text\" id=\"settings-org-name\" name=\"name\" value=\"" + escapeHtml(portal.name) + "\" /></div>" +
          "<div class=\"settings-form-row\"><label for=\"settings-org-portalName\">" + portalNameT + "</label><input type=\"text\" id=\"settings-org-portalName\" name=\"portalName\" value=\"" + escapeHtml(portal.portalName) + "\" /></div>" +
          "<div class=\"settings-form-row\"><label for=\"settings-org-version\">" + versionT + "</label><input type=\"text\" id=\"settings-org-version\" name=\"version\" value=\"" + escapeHtml(portal.version) + "\" /></div>" +
          "<div class=\"settings-form-row\"><label for=\"settings-org-baseURL\">" + baseURLT + "</label><input type=\"text\" id=\"settings-org-baseURL\" name=\"baseURL\" value=\"" + escapeHtml(portal.baseURL) + "\" /></div>" +
          "<div class=\"settings-form-actions\"><button type=\"button\" class=\"settings-btn settings-btn--secondary\" id=\"settings-org-cancel\">" + cancelT + "</button><button type=\"submit\" class=\"settings-btn settings-btn--primary\">" + saveT + "</button></div>" +
          "</form></section>";
      } else {
        var portalRows = [
          [nameT, portal.name],
          [portalNameT, portal.portalName],
          [versionT, portal.version],
          [baseURLT, portal.baseURL || "—"]
        ].map(function (r) { return "<tr><td class=\"settings-k\">" + escapeHtml(r[0]) + "</td><td class=\"settings-v\">" + escapeHtml(r[1]) + "</td></tr>"; }).join("");
        orgPanel = "<section class=\"settings-panel\">" +
          "<div class=\"settings-panel-header\"><h2 class=\"settings-panel-title\">" + portalT + "</h2><button type=\"button\" class=\"settings-btn settings-btn--secondary\" id=\"settings-org-edit\">" + editT + "</button></div>" +
          "<table class=\"settings-table\"><tbody>" + portalRows + "</tbody></table></section>";
      }
    }

    var modulePanel = "";
    if (section === "modules") {
      if (editingModuleId) {
        var isNewModule = editingModuleId === "new";
        if (isNewModule) {
          modulePanel = "<section class=\"settings-panel settings-panel--form\">" +
            "<h2 class=\"settings-panel-title\">" + addT + " " + moduleConfigT + "</h2>" +
            "<form id=\"settings-module-form\" class=\"settings-form\" data-module-is-new=\"true\">" +
            "<div class=\"settings-form-row\"><label for=\"settings-module-id\">" + moduleIdT + "</label><input type=\"text\" id=\"settings-module-id\" name=\"id\" placeholder=\"" + escapeHtml(t("placeholderModuleIdExample") || "e.g. parts") + "\" /></div>" +
            "<div class=\"settings-form-row\"><label for=\"settings-module-label\">" + moduleLabelT + "</label><input type=\"text\" id=\"settings-module-label\" name=\"label\" placeholder=\"" + escapeHtml(t("placeholderModuleLabelExample") || "e.g. Parts") + "\" /></div>" +
            "<div class=\"settings-form-actions\"><button type=\"button\" class=\"settings-btn settings-btn--secondary\" id=\"settings-module-cancel\">" + cancelT + "</button><button type=\"submit\" class=\"settings-btn settings-btn--primary\">" + saveT + "</button></div>" +
            "</form></section>";
        } else {
          var mod = modules.filter(function (m) { return m.id === editingModuleId; })[0] || {};
          var modLabelVal = (typeof mod.label === "string" ? mod.label : (mod.label && mod.label.en) || mod.id || "").replace(/"/g, "&quot;");
          var fields = getModuleFields(editingModuleId) || [];
          var fieldRows = fields.map(function (f) {
            return "<tr><td>" + escapeHtml(f.id) + "</td><td>" + escapeHtml(typeof f.label === "string" ? f.label : (f.label && f.label.en) || f.id) + "</td><td>" + escapeHtml(f.type || "text") + "</td></tr>";
          }).join("");
          if (fieldRows === "") fieldRows = "<tr><td colspan=\"3\" class=\"settings-empty\">—</td></tr>";
          var fieldsBlock = "<div class=\"settings-field-block settings-field-block--in-edit\">" +
            "<h3 class=\"settings-subtitle\">" + fieldConfigT + "</h3>" +
            "<table class=\"settings-table\"><thead><tr><th>" + fieldIdT + "</th><th>" + fieldLabelT + "</th><th>" + fieldTypeT + "</th></tr></thead><tbody>" + fieldRows + "</tbody></table></div>";
          modulePanel = "<section class=\"settings-panel settings-panel--form\">" +
            "<h2 class=\"settings-panel-title\">" + editT + " " + moduleConfigT + "</h2>" +
            "<form id=\"settings-module-form\" class=\"settings-form\">" +
            "<div class=\"settings-form-row\"><label>" + moduleIdT + "</label><input type=\"text\" value=\"" + escapeHtml(editingModuleId) + "\" readonly /></div>" +
            "<div class=\"settings-form-row\"><label for=\"settings-module-label\">" + moduleLabelT + "</label><input type=\"text\" id=\"settings-module-label\" name=\"label\" value=\"" + modLabelVal + "\" /></div>" +
            "<div class=\"settings-form-actions\"><button type=\"button\" class=\"settings-btn settings-btn--secondary\" id=\"settings-module-cancel\">" + cancelT + "</button><button type=\"submit\" class=\"settings-btn settings-btn--primary\">" + saveT + "</button></div>" +
            "</form>" + fieldsBlock + "</section>";
        }
      } else {
        var moduleRows = modules.map(function (m) {
          var lbl = typeof m.label === "string" ? m.label : (m.label && m.label.en) || m.id;
          return "<tr><td>" + escapeHtml(m.id) + "</td><td>" + escapeHtml(lbl) + "</td><td><button type=\"button\" class=\"settings-row-edit\" data-module-id=\"" + escapeHtml(m.id) + "\">" + editT + "</button></td></tr>";
        }).join("");
        if (modules.length === 0) moduleRows = "<tr><td colspan=\"3\" class=\"settings-empty\">—</td></tr>";
        modulePanel = "<section class=\"settings-panel\">" +
          "<div class=\"settings-panel-header\"><h2 class=\"settings-panel-title\">" + modulesAndFieldsT + "</h2><button type=\"button\" class=\"settings-btn settings-btn--primary\" id=\"settings-module-add\">" + addT + " " + (t("module") || "module").replace(/</g, "&lt;") + "</button></div>" +
          "<table class=\"settings-table\"><thead><tr><th>" + moduleIdT + "</th><th>" + moduleLabelT + "</th><th></th></tr></thead><tbody>" + moduleRows + "</tbody></table></section>";
      }
    }

    return "<div class=\"settings-page\">" +
      subNav +
      "<div class=\"settings-content\">" +
      orgPanel + modulePanel +
      "</div></div>";
  }

  function renderLoading() {
    var loadingT = (theApp.language && theApp.language.t ? theApp.language.t("loading") : "Loading").replace(/</g, "&lt;");
    return "<div class=\"settings-page settings-page--loading\"><div class=\"settings-loading\">" + loadingT + "…</div></div>";
  }

  theApp.view = theApp.view || {};
  theApp.view.settings = {
    render: render,
    renderLoading: renderLoading
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

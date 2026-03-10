/**
 * View: entity create/edit form – image placeholder, fields in two columns, Cancel / Save and New / Save.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.getModuleFields) return;

  var getModuleFields = theApp.getModuleFields;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  function buildFieldInput(moduleId, field, value, prefix) {
    var id = prefix + "-" + field.id.replace(/[^a-z0-9_-]/gi, "_");
    var label = (field.label || field.id).replace(/</g, "&lt;").replace(/"/g, "&quot;");
    var placeholder = (field.placeholder || "").replace(/</g, "&lt;").replace(/"/g, "&quot;");
    var val = value != null ? (Array.isArray(value) ? value[0] : value) : "";
    var displayVal = String(val).replace(/"/g, "&quot;");

    if (field.type === "id") {
      return "<div class=\"entity-form-field\"><label class=\"entity-form-label\" for=\"" + id + "\">" + label + "</label>" +
        "<input type=\"text\" id=\"" + id + "\" name=\"" + (field.id).replace(/"/g, "&quot;") + "\" class=\"entity-form-input\" value=\"" + displayVal + "\" readonly /></div>";
    }
    if (field.type === "select" || field.type === "module") {
      var opts = (field.options || []).filter(function (o) { return o && String((o.value != null ? o.value : o)) !== "all"; });
      if (opts.length === 0) opts = [{ value: "", label: "—" }];
      var optionsHtml = opts.map(function (opt) {
        var oVal = (opt && typeof opt === "object" && opt.value != null) ? opt.value : opt;
        var oLabel = (opt && typeof opt === "object" && opt.label != null) ? opt.label : String(oVal);
        var selected = String(oVal) === String(val) ? " selected" : "";
        return "<option value=\"" + String(oVal).replace(/"/g, "&quot;") + "\"" + selected + ">" + (oLabel.replace(/</g, "&lt;").replace(/"/g, "&quot;")) + "</option>";
      }).join("");
      return "<div class=\"entity-form-field\"><label class=\"entity-form-label\" for=\"" + id + "\">" + label + "</label>" +
        "<select id=\"" + id + "\" name=\"" + (field.id).replace(/"/g, "&quot;") + "\" class=\"entity-form-select\" aria-label=\"" + label + "\">" + optionsHtml + "</select></div>";
    }
    if (field.type === "number") {
      return "<div class=\"entity-form-field\"><label class=\"entity-form-label\" for=\"" + id + "\">" + label + "</label>" +
        "<input type=\"number\" id=\"" + id + "\" name=\"" + (field.id).replace(/"/g, "&quot;") + "\" class=\"entity-form-input\" placeholder=\"" + placeholder + "\" value=\"" + displayVal + "\" /></div>";
    }
    return "<div class=\"entity-form-field\"><label class=\"entity-form-label\" for=\"" + id + "\">" + label + "</label>" +
      "<input type=\"text\" id=\"" + id + "\" name=\"" + (field.id).replace(/"/g, "&quot;") + "\" class=\"entity-form-input\" placeholder=\"" + placeholder + "\" value=\"" + displayVal + "\" /></div>";
  }

  function renderForm(moduleId, entity, moduleLabel, isCreate) {
    var fields = (getModuleFields(moduleId) || []).filter(function (f) { return f.type !== "id" || !isCreate; });
    var prefix = "entity-form";
    var title = isCreate ? (t("createEntity") + " " + moduleLabel) : (t("editEntity") + " " + moduleLabel);
    var sectionTitle = moduleLabel + " " + t("information");
    var cancelT = t("cancel").replace(/</g, "&lt;");
    var saveT = t("save").replace(/</g, "&lt;");
    var saveAndNewT = t("saveAndNew").replace(/</g, "&lt;");

    var fieldEls = fields.map(function (f) {
      var val = entity && entity[f.id] !== undefined ? entity[f.id] : "";
      return buildFieldInput(moduleId, f, val, prefix);
    });
    var half = Math.ceil(fieldEls.length / 2);
    var col1 = fieldEls.slice(0, half).join("");
    var col2 = fieldEls.slice(half).join("");

    return "<div class=\"entity-form-card card\">" +
      "<div class=\"entity-form-header\">" +
      "<h1 class=\"entity-form-title\">" + title.replace(/</g, "&lt;") + "</h1>" +
      "</div>" +
      "<div class=\"entity-form-body\">" +
      "<div class=\"entity-form-image-wrap\">" +
      "<div class=\"entity-form-image-placeholder\" aria-hidden=\"true\">" +
      "<svg width=\"48\" height=\"48\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" ry=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><polyline points=\"21 15 16 10 5 21\"/></svg>" +
      "</div></div>" +
      "<section class=\"entity-form-section\">" +
      "<h2 class=\"entity-form-section-title\">" + sectionTitle.replace(/</g, "&lt;") + "</h2>" +
      "<div class=\"entity-form-grid\">" +
      "<div class=\"entity-form-col\">" + col1 + "</div>" +
      "<div class=\"entity-form-col\">" + col2 + "</div>" +
      "</div></section>" +
      "<div class=\"entity-form-actions\">" +
      "<button type=\"button\" class=\"entity-form-btn entity-form-btn--secondary\" id=\"entity-form-cancel\">" + cancelT + "</button>" +
      (isCreate ? "<button type=\"button\" class=\"entity-form-btn entity-form-btn--secondary\" id=\"entity-form-save-new\">" + saveAndNewT + "</button>" : "") +
      "<button type=\"button\" class=\"entity-form-btn entity-form-btn--primary\" id=\"entity-form-save\">" + saveT + "</button>" +
      "</div></div></div>";
  }

  function renderEdit(moduleId, entity, moduleLabel) {
    return renderForm(moduleId, entity, moduleLabel, false);
  }

  function renderCreate(moduleId, moduleLabel) {
    return renderForm(moduleId, null, moduleLabel, true);
  }

  theApp.view = theApp.view || {};
  theApp.view.entityForm = {
    renderEdit: renderEdit,
    renderCreate: renderCreate
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

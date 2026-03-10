/**
 * View: Module setup step after signup – list modules and fields from user. Renders from state.setupModules.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.language) return;

  var t = theApp.language.t ? theApp.language.t : function (k) { return k; };
  var state = theApp.state || {};

  function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  function resolveLabel(val) {
    if (val == null) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && (val.en != null || val.ta != null)) {
      var loc = (theApp.language && theApp.language.getLocale) ? theApp.language.getLocale() : "en";
      loc = (loc === "en" || loc === "ta") ? loc : "en";
      return val[loc] || val.en || val.ta || "";
    }
    return "";
  }

  function render(opts) {
    var title = escapeHtml(t("setupModulesTitle"));
    var subtitle = escapeHtml(t("setupModulesSubtitle"));
    var addModule = escapeHtml(t("addModule"));
    var addField = escapeHtml(t("addField"));
    var fieldLabel = escapeHtml(t("fieldLabel"));
    var fieldType = escapeHtml(t("fieldType"));
    var fieldsHeading = escapeHtml((t("fields") || "Fields"));
    var relatedFieldsHeading = escapeHtml(t("relatedFields") || "Related fields");
    var moduleNameHeading = escapeHtml(t("moduleName") || "Module name");
    var isTestMode = state.testMode === true;
    var populateAndFinish = escapeHtml(isTestMode ? (t("populateAndFinish") || "Populate and finish") : (t("finish") || "Finish"));
    var remove = escapeHtml(t("remove"));

    var modules = state.setupModules || [];
    var pickTemplateT = escapeHtml(t("pickTemplate") || "Pick a template");
    var templatesT = escapeHtml(t("moduleTemplates") || "Start with");
    var moduleNamePlaceholder = escapeHtml(t("placeholderModuleName") || "Enter module name");
    var suggestionT = escapeHtml(t("setupSuggestion") || "Suggested for quick setup");
    var searchPlaceholder = escapeHtml(t("filterPlaceholder") || "Filter...");
    var usedTemplates = (modules || []).map(function (m) { return m.templateId || ""; }).filter(Boolean);
    var templateGroups = (opts && opts.templateGroups) != null ? opts.templateGroups : (state.moduleSetupTemplates || null);
    var templateSearch = (opts && opts.templateSearch) != null ? String(opts.templateSearch).toLowerCase() : "";
    var step2T = escapeHtml(t("step2Of2") || "Step 2 of 2");
    var backT = escapeHtml(t("back") || "Back");
    var html = "<div class=\"module-setup-page\">" +
      "<div class=\"module-setup-card\">" +
      "<div class=\"module-setup-header\">" +
      "<div class=\"module-setup-header-text\">" +
      "<p class=\"module-setup-step\" aria-hidden=\"true\">" + step2T + "</p>" +
      "<h1 class=\"module-setup-title\">" + title + "</h1>" +
      "<p class=\"module-setup-subtitle\">" + subtitle + "</p>" +
      "</div>" +
      (modules.length > 0 ? "<div class=\"module-setup-header-actions\">" +
      "<button type=\"button\" class=\"module-setup-add-module-btn module-setup-btn--secondary\" id=\"module-setup-pick-template\" aria-label=\"" + pickTemplateT + "\">" + pickTemplateT + "</button>" +
      "<button type=\"button\" class=\"module-setup-add-module-btn\" id=\"module-setup-add-module\" aria-label=\"" + addModule + "\">" +
      "<span class=\"module-setup-add-icon\" aria-hidden=\"true\">+</span> " + addModule +
      "</button></div>" : "") +
      "</div>" +
      "<div class=\"module-setup-list\" id=\"module-setup-list\">";

    var emptyTitle = escapeHtml(t("setupModulesEmptyTitle") || "No modules yet");
    var emptyDesc = escapeHtml(t("setupModulesEmptyDesc") || "Get started by adding a module or choosing a template from the list.");
    var pickTemplateHintT = escapeHtml(t("pickTemplateHint") || "Choose from the list on the right");
    var addModuleHintT = escapeHtml(t("addModuleHint") || "Create a custom module");
    if (modules.length === 0) {
      html += "<div class=\"module-setup-empty\">" +
        "<div class=\"module-setup-empty-illustration\" aria-hidden=\"true\">" +
        "<svg class=\"module-setup-empty-svg\" viewBox=\"0 0 200 140\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\">" +
        "<rect x=\"30\" y=\"20\" width=\"140\" height=\"100\" rx=\"8\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" opacity=\"0.25\"/>" +
        "<rect x=\"40\" y=\"35\" width=\"50\" height=\"36\" rx=\"6\" stroke=\"currentColor\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.4\"/>" +
        "<path d=\"M48 48h34M48 55h22M48 62h28\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.5\"/>" +
        "<rect x=\"100\" y=\"45\" width=\"55\" height=\"36\" rx=\"6\" stroke=\"currentColor\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.4\"/>" +
        "<path d=\"M108 58h30M108 65h18\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.5\"/>" +
        "<rect x=\"40\" y=\"82\" width=\"115\" height=\"28\" rx=\"6\" stroke=\"currentColor\" stroke-width=\"1.5\" fill=\"none\" opacity=\"0.35\"/>" +
        "<path d=\"M48 93h80M48 99h50\" stroke=\"currentColor\" stroke-width=\"1.2\" stroke-linecap=\"round\" opacity=\"0.45\"/>" +
        "<circle cx=\"165\" cy=\"96\" r=\"14\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\" opacity=\"0.5\"/>" +
        "<path d=\"M165 88v16M157 96h16\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" opacity=\"0.6\"/>" +
        "</svg></div>" +
        "<h2 class=\"module-setup-empty-title\">" + emptyTitle + "</h2>" +
        "<p class=\"module-setup-empty-desc\">" + emptyDesc + "</p>" +
        "<div class=\"module-setup-empty-actions\">" +
        "<button type=\"button\" class=\"module-setup-empty-action module-setup-empty-action--template\" id=\"module-setup-empty-pick-template-btn\">" +
        "<span class=\"module-setup-empty-action-icon\" aria-hidden=\"true\"><svg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"3\" width=\"7\" height=\"7\"/><rect x=\"14\" y=\"14\" width=\"7\" height=\"7\"/><rect x=\"3\" y=\"14\" width=\"7\" height=\"7\"/></svg></span>" +
        "<span class=\"module-setup-empty-action-label\">" + pickTemplateT + "</span>" +
        "<span class=\"module-setup-empty-action-hint\">" + pickTemplateHintT + "</span>" +
        "</button>" +
        "<button type=\"button\" class=\"module-setup-empty-action module-setup-empty-action--add\" id=\"module-setup-empty-add-btn\">" +
        "<span class=\"module-setup-empty-action-icon\" aria-hidden=\"true\">+</span>" +
        "<span class=\"module-setup-empty-action-label\">" + addModule + "</span>" +
        "<span class=\"module-setup-empty-action-hint\">" + addModuleHintT + "</span>" +
        "</button>" +
        "</div></div>";
    }
    var selectedIndex = state.setupModuleSelectedIndex;
    var animateIndex = (opts && typeof opts.focusModuleIndex === "number") ? opts.focusModuleIndex : -1;
    var linkToT = escapeHtml(t("linkToModule") || "Link to");
    var addRelatedT = escapeHtml(t("addRelatedField") || "Add related field");
    var chooseModuleT = escapeHtml(t("chooseModule") || "Choose module…");
    var selectModulePromptT = escapeHtml(t("selectModuleToEdit") || "Select a module from the list to edit.");
    var fieldsCountT = (t("fieldsCount") || "fields").toLowerCase();

    if (modules.length > 0) {
      html += "<div class=\"module-setup-layout\">";
      html += "<aside class=\"module-setup-sidebar\" aria-label=\"" + escapeHtml(t("modules") || "Modules") + "\">";
      html += "<div class=\"module-setup-cards\">";
      modules.forEach(function (mod, i) {
        var modLabel = resolveLabel(mod.label) || ("Module " + (i + 1));
        var fieldCount = (mod.fields || []).length;
        var isSelected = selectedIndex === i;
        var cardClass = "module-setup-card-item" + (isSelected ? " is-selected" : "");
        html += "<button type=\"button\" class=\"" + cardClass + "\" data-module-index=\"" + i + "\" aria-pressed=\"" + (isSelected ? "true" : "false") + "\">";
        html += "<span class=\"module-setup-card-name\">" + escapeHtml(modLabel) + "</span>";
        html += "<span class=\"module-setup-card-meta\">" + fieldCount + " " + fieldsCountT + "</span>";
        html += "</button>";
      });
      html += "</div></aside>";
      html += "<div class=\"module-setup-main\">";
      html += "<div id=\"module-setup-edit\">";
      if (selectedIndex != null && selectedIndex >= 0 && selectedIndex < modules.length) {
        var mod = modules[selectedIndex];
        var i = selectedIndex;
        var modLabel = escapeHtml(resolveLabel(mod.label) || "");
        var animateClass = (i === animateIndex) ? " module-setup-block--animate-in" : "";
        var tplId = (mod.templateId || "");
        var readOnlyModule = tplId ? " readonly" : "";
        html += "<div class=\"module-setup-block" + animateClass + "\" data-module-index=\"" + i + "\"" + (tplId ? " data-template-id=\"" + escapeHtml(tplId) + "\"" : "") + ">";
        html += "<div class=\"module-setup-block-header\">";
        html += "<div class=\"module-setup-module-name-title\">" + moduleNameHeading + "</div>";
        html += "<div class=\"module-setup-block-header-row\">";
        html += "<input type=\"text\" class=\"module-setup-module-label-inline" + (tplId ? " module-setup-module-label--readonly" : "") + "\" name=\"setup-module-label\" data-module-index=\"" + i + "\" value=\"" + modLabel + "\" placeholder=\"" + moduleNamePlaceholder + "\" aria-label=\"" + escapeHtml(t("moduleName") || "Module name") + "\"" + readOnlyModule + " />";
        html += "<button type=\"button\" class=\"module-setup-remove-btn\" data-remove-module=\"" + i + "\" aria-label=\"" + remove + "\">" + remove + "</button>";
        html += "</div></div>";
        html += "<div class=\"module-setup-block-fields\">";
        html += "<div class=\"module-setup-fields-section\">";
        html += "<div class=\"module-setup-fields-title\">" + fieldsHeading + "</div>";
        html += "<div class=\"module-setup-fields-table\">";
        html += "<div class=\"module-setup-fields-header module-setup-fields-header--regular\"><span class=\"module-setup-fields-th\">" + fieldLabel + "</span><span class=\"module-setup-fields-th\">" + fieldType + "</span><span class=\"module-setup-fields-th module-setup-fields-th--action\"></span></div>";
        (mod.fields || []).forEach(function (f, j) {
          if (f.type === "module") return;
          var fieldLabelEscaped = escapeHtml(resolveLabel(f.label) || "");
          var currentFieldType = f.type || "text";
          html += "<div class=\"module-setup-field-row\" data-module-index=\"" + i + "\" data-field-index=\"" + j + "\">";
          html += "<input type=\"text\" class=\"module-setup-field-input\" name=\"setup-field-label\" placeholder=\"\" value=\"" + fieldLabelEscaped + "\" />";
          html += "<select class=\"module-setup-field-select\" name=\"setup-field-type\">";
          var typeLabels = { text: t("typeText"), number: t("typeNumber"), select: t("typeSelect"), id: t("typeId") };
          ["text", "number", "select", "id"].forEach(function (opt) {
            html += "<option value=\"" + escapeHtml(opt) + "\"" + (currentFieldType === opt ? " selected" : "") + ">" + escapeHtml(typeLabels[opt] || opt) + "</option>";
          });
          html += "</select>";
          html += "<button type=\"button\" class=\"module-setup-remove-field\" data-remove-module=\"" + i + "\" data-remove-field=\"" + j + "\" aria-label=\"" + remove + "\" title=\"" + remove + "\"><span aria-hidden=\"true\">×</span></button>";
          html += "</div>";
        });
        html += "</div>";
        html += "<button type=\"button\" class=\"module-setup-add-field\" data-add-field=\"" + i + "\">" + addField + "</button>";
        html += "</div>";
        html += "<div class=\"module-setup-related-section\">";
        html += "<div class=\"module-setup-fields-title module-setup-fields-title--related\">" + relatedFieldsHeading + "</div>";
        html += "<div class=\"module-setup-fields-table module-setup-fields-table--related\">";
        html += "<div class=\"module-setup-fields-header module-setup-fields-header--related\"><span class=\"module-setup-fields-th\">" + linkToT + "</span><span class=\"module-setup-fields-th\">" + fieldLabel + "</span><span class=\"module-setup-fields-th module-setup-fields-th--action\"></span></div>";
        (mod.fields || []).forEach(function (f, j) {
          if (f.type !== "module") return;
          var fieldLabelEscaped = escapeHtml(resolveLabel(f.label) || "");
          html += "<div class=\"module-setup-field-row module-setup-field-row--related\" data-module-index=\"" + i + "\" data-field-index=\"" + j + "\">";
          html += "<div class=\"module-setup-related-cell module-setup-related-cell--ref\">";
          html += "<input type=\"hidden\" name=\"setup-field-type\" value=\"module\" />";
          html += "<select class=\"module-setup-field-ref\" name=\"setup-field-ref-module\" aria-label=\"" + linkToT + "\" title=\"" + linkToT + "\">";
          html += "<option value=\"\">" + chooseModuleT + "</option>";
          (state.setupModules || []).forEach(function (other, idx) {
            if (idx === i) return;
            var otherLabel = escapeHtml(resolveLabel(other.label) || ("Module " + (idx + 1)));
            html += "<option value=\"" + idx + "\"" + (f.refModuleIndex === idx ? " selected" : "") + ">" + otherLabel + "</option>";
          });
          html += "</select></div>";
          html += "<input type=\"text\" class=\"module-setup-field-input module-setup-field-input--related\" name=\"setup-field-label\" placeholder=\"\" value=\"" + fieldLabelEscaped + "\" />";
          html += "<button type=\"button\" class=\"module-setup-remove-field\" data-remove-module=\"" + i + "\" data-remove-field=\"" + j + "\" aria-label=\"" + remove + "\" title=\"" + remove + "\"><span aria-hidden=\"true\">×</span></button>";
          html += "</div>";
        });
        html += "</div>";
        html += "<button type=\"button\" class=\"module-setup-add-related-field\" data-add-related-field=\"" + i + "\">" + addRelatedT + "</button>";
        html += "</div>";
        html += "</div></div>";
      } else {
        html += "<div class=\"module-setup-select-prompt\">" + selectModulePromptT + "</div>";
      }
      html += "</div></div>";
      html += "</div>";
    }

    html += "</div>";
    html += "<div class=\"module-setup-footer\">";
    html += "<button type=\"button\" class=\"module-setup-back-link\" id=\"module-setup-back\" aria-label=\"" + backT + "\">" + backT + "</button>";
    html += "<button type=\"button\" class=\"module-setup-btn module-setup-btn--primary\" id=\"module-setup-finish\">" + populateAndFinish + "</button>";
    html += "</div>";
    html += "</div>";

    var templateAlreadyAddedT = escapeHtml(t("templateAlreadyAdded") || "Already added");
    var addSelectedT = escapeHtml(t("addSelected") || "Add selected");
    var selectAllT = escapeHtml(t("selectAll") || "Select all");
    var clearSelectionT = escapeHtml(t("clearSelection") || "Clear");
    var templatePopupInstructionT = escapeHtml(t("templatePopupInstruction") || "Select one or more modules, then choose Add selected.");
    var templateListHtml = "";
    if (templateGroups && templateGroups.groups && Array.isArray(templateGroups.groups)) {
      templateGroups.groups.forEach(function (group) {
        var groupLabel = resolveLabel(group.label);
        var groupLabelLower = groupLabel.toLowerCase();
        var groupMatches = !templateSearch || groupLabelLower.indexOf(templateSearch) >= 0;
        var modulesList = group.modules || [];
        var visibleModules = modulesList.filter(function (m) {
          var modLabel = resolveLabel(m.label).toLowerCase();
          return !templateSearch || modLabel.indexOf(templateSearch) >= 0 || groupMatches;
        });
        if (visibleModules.length === 0 && !groupMatches) return;
        templateListHtml += "<div class=\"module-setup-templates-group\" role=\"group\" aria-label=\"" + escapeHtml(groupLabel) + "\" data-group-id=\"" + escapeHtml(group.id || "") + "\">";
        templateListHtml += "<div class=\"module-setup-templates-group-header\">" + escapeHtml(groupLabel) + "</div>";
        templateListHtml += "<div class=\"module-setup-templates-options\">";
        visibleModules.forEach(function (m) {
          var modLabel = resolveLabel(m.label);
          var used = usedTemplates.indexOf(m.id) >= 0;
          var rowClass = "module-setup-template-row" + (used ? " module-setup-template-row--used" : "");
          var labelText = modLabel + (used ? " (" + templateAlreadyAddedT + ")" : "");
          var disabledAttr = used ? " disabled" : "";
          var idAttr = "module-setup-template-check-" + escapeHtml(m.id);
          templateListHtml += "<div class=\"" + rowClass + "\"><label><input type=\"checkbox\" name=\"module-setup-template-check\" value=\"" + escapeHtml(m.id) + "\" data-template=\"" + escapeHtml(m.id) + "\" id=\"" + idAttr + "\"" + disabledAttr + (used ? " aria-describedby=\"" + idAttr + "-desc\"" : "") + " /><span id=\"" + idAttr + "-desc\">" + escapeHtml(labelText) + "</span></label></div>";
        });
        templateListHtml += "</div></div>";
      });
    } else {
      templateListHtml += "<div class=\"module-setup-templates-options\" role=\"group\" aria-label=\"" + suggestionT + "\">";
      var fallbackLabels = { leads: t("templateLeads"), contacts: t("templateContacts"), products: t("templateProducts"), services: t("templateServices"), invoice: t("templateInvoice"), tasks: t("templateTasks") };
      ["leads", "contacts", "products", "services", "invoice", "tasks"].forEach(function (templateKey) {
        var used = usedTemplates.indexOf(templateKey) >= 0;
        var label = fallbackLabels[templateKey] || templateKey.charAt(0).toUpperCase() + templateKey.slice(1);
        var labelText = label + (used ? " (" + templateAlreadyAddedT + ")" : "");
        var rowClass = "module-setup-template-row" + (used ? " module-setup-template-row--used" : "");
        var disabledAttr = used ? " disabled" : "";
        var idAttr = "module-setup-template-check-" + escapeHtml(templateKey);
        templateListHtml += "<div class=\"" + rowClass + "\"><label><input type=\"checkbox\" name=\"module-setup-template-check\" value=\"" + escapeHtml(templateKey) + "\" data-template=\"" + escapeHtml(templateKey) + "\" id=\"" + idAttr + "\"" + disabledAttr + " /><span>" + escapeHtml(labelText) + "</span></label></div>";
      });
      templateListHtml += "</div>";
    }

    var closeT = escapeHtml(t("close") || "Close");
    html += "<div id=\"module-setup-template-popup\" class=\"module-setup-template-popup\" aria-hidden=\"true\">";
    html += "<div class=\"module-setup-template-popup-backdrop\"></div>";
    html += "<div class=\"module-setup-template-popup-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"module-setup-template-popup-title\" aria-describedby=\"module-setup-template-popup-desc\">";
    html += "<div class=\"module-setup-template-popup-header\">";
    html += "<h2 id=\"module-setup-template-popup-title\" class=\"module-setup-template-popup-title\">" + suggestionT + "</h2>";
    html += "<button type=\"button\" class=\"module-setup-template-popup-close\" aria-label=\"" + closeT + "\">×</button>";
    html += "</div>";
    html += "<p id=\"module-setup-template-popup-desc\" class=\"module-setup-template-popup-instruction\">" + templatePopupInstructionT + "</p>";
    html += "<input type=\"text\" id=\"module-setup-template-popup-search\" class=\"module-setup-template-search\" placeholder=\"" + searchPlaceholder + "\" aria-label=\"" + searchPlaceholder + "\" />";
    html += "<div class=\"module-setup-templates-list\">" + templateListHtml + "</div>";
    html += "<div class=\"module-setup-template-popup-footer\">";
    html += "<div class=\"module-setup-template-popup-actions\">";
    html += "<button type=\"button\" class=\"module-setup-template-link-btn\" id=\"module-setup-template-select-all\">" + selectAllT + "</button>";
    html += "<button type=\"button\" class=\"module-setup-template-link-btn\" id=\"module-setup-template-clear\">" + clearSelectionT + "</button>";
    html += "</div>";
    html += "<span id=\"module-setup-template-selection-count\" class=\"module-setup-template-selection-count\" aria-live=\"polite\" aria-atomic=\"true\">0 selected</span>";
    html += "<button type=\"button\" class=\"module-setup-btn module-setup-btn--primary\" id=\"module-setup-template-add-selected\" disabled>" + addSelectedT + "</button>";
    html += "</div>";
    html += "</div></div>";
    html += "</div>";
    return html;
  }

  /** Builds a single related-field row (Link to | Label | Remove). For partial DOM insert. */
  function buildRelatedFieldRowHTML(moduleIndex, fieldIndex, field, modules, currentModuleIndex) {
    var remove = escapeHtml(t("remove") || "Remove");
    var linkToT = escapeHtml(t("linkToModule") || "Link to");
    var chooseModuleT = escapeHtml(t("chooseModule") || "Choose module…");
    var fieldLabelEscaped = escapeHtml(resolveLabel(field && field.label) || "");
    var mods = modules || state.setupModules || [];
    var refOpts = "<option value=\"\">" + chooseModuleT + "</option>";
    mods.forEach(function (other, idx) {
      if (idx === currentModuleIndex) return;
      var otherLabel = escapeHtml(resolveLabel(other.label) || ("Module " + (idx + 1)));
      refOpts += "<option value=\"" + idx + "\"" + (field && field.refModuleIndex === idx ? " selected" : "") + ">" + otherLabel + "</option>";
    });
    return "<div class=\"module-setup-field-row module-setup-field-row--related\" data-module-index=\"" + moduleIndex + "\" data-field-index=\"" + fieldIndex + "\">" +
      "<div class=\"module-setup-related-cell module-setup-related-cell--ref\">" +
      "<input type=\"hidden\" name=\"setup-field-type\" value=\"module\" />" +
      "<select class=\"module-setup-field-ref\" name=\"setup-field-ref-module\" aria-label=\"" + linkToT + "\" title=\"" + linkToT + "\">" + refOpts + "</select>" +
      "</div>" +
      "<input type=\"text\" class=\"module-setup-field-input module-setup-field-input--related\" name=\"setup-field-label\" placeholder=\"\" value=\"" + fieldLabelEscaped + "\" />" +
      "<button type=\"button\" class=\"module-setup-remove-field\" data-remove-module=\"" + moduleIndex + "\" data-remove-field=\"" + fieldIndex + "\" aria-label=\"" + remove + "\" title=\"" + remove + "\"><span aria-hidden=\"true\">×</span></button>" +
      "</div>";
  }

  function buildFieldRowHTML(moduleIndex, fieldIndex, field, fieldLabel, fieldType, remove) {
    var fieldLabelEscaped = escapeHtml(resolveLabel(field && field.label) || "");
    var currentFieldType = (field && field.type) || "text";
    var isRef = currentFieldType === "module";
    var typeLabels = { text: t("typeText"), number: t("typeNumber"), select: t("typeSelect"), id: t("typeId"), module: t("typeReference") };
    var linkToT = escapeHtml(t("linkToModule") || "Link to");
    var refOpts = "<option value=\"\">—</option>";
    (state.setupModules || []).forEach(function (other, idx) {
      if (idx === moduleIndex) return;
      var otherLabel = escapeHtml(resolveLabel(other.label) || ("Module " + (idx + 1)));
      refOpts += "<option value=\"" + idx + "\"" + (isRef && field && field.refModuleIndex === idx ? " selected" : "") + ">" + otherLabel + "</option>";
    });
    return "<div class=\"module-setup-field-row\" data-module-index=\"" + moduleIndex + "\" data-field-index=\"" + fieldIndex + "\">" +
      "<input type=\"text\" class=\"module-setup-field-input\" name=\"setup-field-label\" placeholder=\"\" value=\"" + fieldLabelEscaped + "\" />" +
      "<select class=\"module-setup-field-select\" name=\"setup-field-type\">" +
      ["text", "number", "select", "id", "module"].map(function (opt) {
        return "<option value=\"" + escapeHtml(opt) + "\"" + (currentFieldType === opt ? " selected" : "") + ">" + escapeHtml(typeLabels[opt] || opt) + "</option>";
      }).join("") +
      "</select>" +
      "<select class=\"module-setup-field-ref\" name=\"setup-field-ref-module\" aria-label=\"" + linkToT + "\" title=\"" + linkToT + "\">" + refOpts + "</select>" +
      "<button type=\"button\" class=\"module-setup-remove-field\" data-remove-module=\"" + moduleIndex + "\" data-remove-field=\"" + fieldIndex + "\" aria-label=\"" + (remove || "Remove") + "\" title=\"" + (remove || "Remove") + "\"><span aria-hidden=\"true\">×</span></button>" +
      "</div>";
  }

  /** Returns only the template list HTML (for filter: update list without full re-render). */
  function renderTemplateList(opts) {
    var templateGroups = (opts && opts.templateGroups) != null ? opts.templateGroups : (state.moduleSetupTemplates || null);
    var templateSearch = (opts && opts.templateSearch) != null ? String(opts.templateSearch).toLowerCase() : "";
    var modules = state.setupModules || [];
    var usedTemplates = (modules || []).map(function (m) { return m.templateId || ""; }).filter(Boolean);
    var templateAlreadyAddedT = escapeHtml(t("templateAlreadyAdded") || "Already added");
    var html = "";
    if (templateGroups && templateGroups.groups && Array.isArray(templateGroups.groups)) {
      templateGroups.groups.forEach(function (group) {
        var groupLabel = resolveLabel(group.label);
        var groupLabelLower = groupLabel.toLowerCase();
        var groupMatches = !templateSearch || groupLabelLower.indexOf(templateSearch) >= 0;
        var modulesList = group.modules || [];
        var visibleModules = modulesList.filter(function (m) {
          var modLabel = resolveLabel(m.label).toLowerCase();
          return !templateSearch || modLabel.indexOf(templateSearch) >= 0 || groupMatches;
        });
        if (visibleModules.length === 0 && !groupMatches) return;
        html += "<div class=\"module-setup-templates-group\" role=\"group\" aria-label=\"" + escapeHtml(groupLabel) + "\" data-group-id=\"" + escapeHtml(group.id || "") + "\">";
        html += "<div class=\"module-setup-templates-group-header\">" + escapeHtml(groupLabel) + "</div>";
        html += "<div class=\"module-setup-templates-options\">";
        visibleModules.forEach(function (m) {
          var modLabel = resolveLabel(m.label);
          var used = usedTemplates.indexOf(m.id) >= 0;
          var rowClass = "module-setup-template-row" + (used ? " module-setup-template-row--used" : "");
          var labelText = modLabel + (used ? " (" + templateAlreadyAddedT + ")" : "");
          var disabledAttr = used ? " disabled" : "";
          var idAttr = "module-setup-template-check-" + escapeHtml(m.id);
          html += "<div class=\"" + rowClass + "\"><label><input type=\"checkbox\" name=\"module-setup-template-check\" value=\"" + escapeHtml(m.id) + "\" data-template=\"" + escapeHtml(m.id) + "\" id=\"" + idAttr + "\"" + disabledAttr + " /><span>" + escapeHtml(labelText) + "</span></label></div>";
        });
        html += "</div></div>";
      });
    } else {
      html += "<div class=\"module-setup-templates-options\" role=\"group\">";
      var fallbackLabels = { leads: t("templateLeads"), contacts: t("templateContacts"), products: t("templateProducts"), services: t("templateServices"), invoice: t("templateInvoice"), tasks: t("templateTasks") };
      ["leads", "contacts", "products", "services", "invoice", "tasks"].forEach(function (templateKey) {
        var used = usedTemplates.indexOf(templateKey) >= 0;
        var label = fallbackLabels[templateKey] || templateKey.charAt(0).toUpperCase() + templateKey.slice(1);
        var labelText = label + (used ? " (" + templateAlreadyAddedT + ")" : "");
        var rowClass = "module-setup-template-row" + (used ? " module-setup-template-row--used" : "");
        var disabledAttr = used ? " disabled" : "";
        var idAttr = "module-setup-template-check-" + escapeHtml(templateKey);
        html += "<div class=\"" + rowClass + "\"><label><input type=\"checkbox\" name=\"module-setup-template-check\" value=\"" + escapeHtml(templateKey) + "\" data-template=\"" + escapeHtml(templateKey) + "\" id=\"" + idAttr + "\"" + disabledAttr + " /><span>" + escapeHtml(labelText) + "</span></label></div>";
      });
      html += "</div>";
    }
    return html;
  }

  theApp.view = theApp.view || {};
  theApp.view.moduleSetup = { render: render, buildFieldRowHTML: buildFieldRowHTML, buildRelatedFieldRowHTML: buildRelatedFieldRowHTML, renderTemplateList: renderTemplateList };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

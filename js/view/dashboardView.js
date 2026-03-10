/**
 * View: Dashboard – first four entity modules from state.modules, dynamically.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.view || !theApp.view.entityList) return;

  var state = theApp.state;
  var entityList = theApp.view.entityList;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };
  var getModuleLabelFromState = theApp.getModuleLabel || function (m) { return (m && m.label) || (m && m.id) || ""; };

  function getModuleLabel(moduleId) {
    var m = (state.modules || []).filter(function (x) { return x.id === moduleId; })[0];
    return m ? getModuleLabelFromState(m) : moduleId;
  }

  function getSections() {
    var modules = state.modules || [];
    var entityModules = modules.filter(function (m) {
      return m.id !== "dashboard" && m.id !== "staffs" && m.fields && m.fields.length > 0;
    });
    return entityModules.slice(0, 4).map(function (m, i) {
      return { id: m.id, moduleId: m.id, recentPrefix: i === 0 };
    });
  }

  /**
   * Returns full dashboard HTML: header + 4-section grid (content areas empty until loaded).
   * Dashboard title and section titles come from state.modules (data layer).
   */
  function render() {
    var sections = getSections();
    var dashboardTitle = getModuleLabel("dashboard").replace(/</g, "&lt;");
    var populateDataT = (t("populateData") || "Populate data").replace(/</g, "&lt;");
    var showPopulate = state.testMode === true;
    var parts = [
      "<div class=\"card dashboard\">",
      "<div class=\"dashboard-header\">",
      "<h2 class=\"dashboard-title\">" + dashboardTitle + "</h2>",
      (showPopulate ? "<button type=\"button\" class=\"dashboard-populate-btn\" id=\"dashboard-populate-data\" aria-label=\"" + populateDataT + "\">" + populateDataT + "</button>" : ""),
      "</div>",
      "<div class=\"dashboard-grid\">"
    ];
    sections.forEach(function (section) {
      var moduleLabel = getModuleLabel(section.moduleId).replace(/</g, "&lt;");
      var label = section.recentPrefix ? (t("recent").replace(/</g, "&lt;") + " " + moduleLabel) : moduleLabel;
      parts.push(
        "<section class=\"dashboard-section\" id=\"dashboard-section-" + section.id + "\" data-section=\"" + section.id + "\" aria-labelledby=\"dashboard-section-title-" + section.id + "\">",
        "<h3 class=\"dashboard-section-title\" id=\"dashboard-section-title-" + section.id + "\">" + label + "</h3>",
        "<div class=\"dashboard-section-content\"></div>",
        "</section>"
      );
    });
    parts.push("</div>", "</div>");
    return parts.join("");
  }

  /**
   * Renders table HTML for a module's list into the given content element.
   * Uses same structure as module list: .module-list-scroll > .module-list-body > table.table
   */
  function renderSectionContent(moduleId, list, contentEl) {
    if (!contentEl) return;
    var emptyMessage = t("noItems");
    var opts = { compact: true, emptyTitle: t("noItemsTitle") };
    var tableHTML = entityList.buildTableHTML(moduleId, list || [], emptyMessage, {}, opts);
    contentEl.innerHTML = "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>";
  }

  /**
   * Returns loading HTML for a section.
   */
  function renderSectionLoading() {
    return "<div class=\"dashboard-loading\" role=\"status\" aria-live=\"polite\">" + (t("loading").replace(/</g, "&lt;")) + "…</div>";
  }

  theApp.view.dashboard = {
    render: render,
    renderSectionContent: renderSectionContent,
    renderSectionLoading: renderSectionLoading,
    getSections: getSections
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

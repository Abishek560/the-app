/**
 * Controller: Dashboard – load first four entity modules (dynamic sections) on a single screen.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.api || !theApp.view || !theApp.view.dashboard) return;

  var state = theApp.state;
  var api = theApp.api;
  var getEntityData = theApp.getEntityData;
  var getModuleFields = theApp.getModuleFields;
  var dashboardView = theApp.view.dashboard;
  var getSections = dashboardView.getSections || function () { return []; };
  var DASHBOARD_LIMIT = 8;
  var POPULATE_COUNT = 100;

  function getEntityModules() {
    var modules = state.modules || [];
    return modules.filter(function (m) {
      return m.id !== "dashboard" && m.id !== "staffs" && m.fields && m.fields.length > 0;
    });
  }

  function makeMockValue(field, index) {
    var id = field.id || "";
    var type = (field.type || "text").toLowerCase();
    if (type === "id") return index;
    if (type === "number") return index * 10;
    if (type === "select") {
      var opts = field.options || [];
      var first = opts[0];
      var val = first && typeof first === "object" && first.value != null ? first.value : (first || "open");
      return val;
    }
    return "Item " + index;
  }

  function populateAllModules() {
    var modules = getEntityModules();
    modules.forEach(function (module) {
      var moduleId = module.id;
      var fields = (module.fields || []);
      var list = [];
      for (var i = 1; i <= POPULATE_COUNT; i++) {
        var row = {};
        fields.forEach(function (f) {
          var fid = f.id || "";
          if (fid) row[fid] = makeMockValue(f, i);
        });
        if (row.id == null) row.id = i;
        list.push(row);
      }
      var data = getEntityData(moduleId);
      data.list = list;
      data.total = POPULATE_COUNT;
      data.page = 1;
    });
  }

  function loadSection(contentEl, section) {
    if (!section || !contentEl) return;
    var contentContainer = contentEl.querySelector("#dashboard-section-" + section.id + " .dashboard-section-content");
    if (!contentContainer) return;

    var data = getEntityData(section.moduleId);
    if (data.list && data.list.length > 0) {
      var list = data.list.slice(0, DASHBOARD_LIMIT);
      dashboardView.renderSectionContent(section.moduleId, list, contentContainer);
      contentContainer.setAttribute("data-loaded", "true");
      return;
    }
    if (contentContainer.getAttribute("data-loaded") === "true") return;

    contentContainer.innerHTML = dashboardView.renderSectionLoading();
    api.getModuleData(section.moduleId, { page: 1, limit: DASHBOARD_LIMIT }).then(function (res) {
      var list = (res && res.data) ? res.data : [];
      dashboardView.renderSectionContent(section.moduleId, list, contentContainer);
      contentContainer.setAttribute("data-loaded", "true");
    });
  }

  function loadAllSections(contentEl) {
    if (!contentEl) return;
    contentEl.querySelectorAll(".dashboard-section-content[data-loaded]").forEach(function (el) { el.removeAttribute("data-loaded"); });
    getSections().forEach(function (section) {
      loadSection(contentEl, section);
    });
  }

  function bind(contentEl) {
    if (!contentEl) return;
    loadAllSections(contentEl);
    var populateBtn = contentEl.querySelector("#dashboard-populate-data");
    if (populateBtn) {
      populateBtn.addEventListener("click", function () {
        populateAllModules();
        loadAllSections(contentEl);
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.dashboard = {
    bind: bind,
    loadSection: loadSection,
    populateAllModules: populateAllModules
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

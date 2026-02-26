/**
 * Controller: Dashboard – load all four sections (Recent leads, Work orders, Customers, Services) on a single screen.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.api || !theApp.view || !theApp.view.dashboard) return;

  var api = theApp.api;
  var dashboardView = theApp.view.dashboard;
  var SECTIONS = dashboardView.SECTIONS;
  var DASHBOARD_LIMIT = 8;

  function loadSection(contentEl, section) {
    if (!section || !contentEl) return;
    var contentContainer = contentEl.querySelector("#dashboard-section-" + section.id + " .dashboard-section-content");
    if (!contentContainer) return;
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
    SECTIONS.forEach(function (section) {
      loadSection(contentEl, section);
    });
  }

  function bind(contentEl) {
    if (!contentEl) return;
    loadAllSections(contentEl);
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.dashboard = {
    bind: bind,
    loadSection: loadSection
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

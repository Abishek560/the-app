/**
 * View: Dashboard – four sections (Recent leads, Work orders, Customers, Services) on a single screen.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.view || !theApp.view.entityList) return;

  var entityList = theApp.view.entityList;

  var SECTIONS = [
    { id: "leads", label: "Recent leads", moduleId: "enquiries" },
    { id: "works", label: "Work orders", moduleId: "work_orders" },
    { id: "customers", label: "Customers", moduleId: "contacts" },
    { id: "services", label: "Services", moduleId: "services" }
  ];

  /**
   * Returns full dashboard HTML: header + 4-section grid (content areas empty until loaded).
   */
  function render() {
    var parts = [
      "<div class=\"card dashboard\">",
      "<div class=\"dashboard-header\">",
      "<h2 class=\"dashboard-title\">Dashboard</h2>",
      "</div>",
      "<div class=\"dashboard-grid\">"
    ];
    SECTIONS.forEach(function (section) {
      parts.push(
        "<section class=\"dashboard-section\" id=\"dashboard-section-" + section.id + "\" data-section=\"" + section.id + "\" aria-labelledby=\"dashboard-section-title-" + section.id + "\">",
        "<h3 class=\"dashboard-section-title\" id=\"dashboard-section-title-" + section.id + "\">" + (section.label.replace(/</g, "&lt;")) + "</h3>",
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
    var emptyMessage = "No items.";
    var tableHTML = entityList.buildTableHTML(moduleId, list || [], emptyMessage, {});
    contentEl.innerHTML = "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>";
  }

  /**
   * Returns loading HTML for a section.
   */
  function renderSectionLoading() {
    return "<div class=\"dashboard-loading\" role=\"status\" aria-live=\"polite\">Loading…</div>";
  }

  theApp.view.dashboard = {
    render: render,
    renderSectionContent: renderSectionContent,
    renderSectionLoading: renderSectionLoading,
    SECTIONS: SECTIONS
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

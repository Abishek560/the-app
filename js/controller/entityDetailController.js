/**
 * Controller: entity detail – back, edit, related links, tabs, details toggle.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  function bind(contentEl) {
    if (!contentEl) return;
    var active = state.activeEntity;
    if (!active) return;

    var backBtn = contentEl.querySelector("#entity-detail-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        state.activeEntity = null;
        if (theApp.router && theApp.router.navigateTo && theApp.router.getHashFromState) {
          theApp.router.navigateTo(theApp.router.getHashFromState());
        } else if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        }
      });
    }

    var editBtn = contentEl.querySelector("#entity-detail-edit");
    if (editBtn) {
      editBtn.addEventListener("click", function () {
        state.entityViewMode = "edit";
        if (theApp.router && theApp.router.navigateTo && theApp.router.getHashFromState) {
          theApp.router.navigateTo(theApp.router.getHashFromState());
        } else if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        }
      });
    }

    var sendEmailBtn = contentEl.querySelector("#entity-detail-send-email");
    if (sendEmailBtn) {
      sendEmailBtn.addEventListener("click", function () {
        if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(t("sendEmail") + (t("sendEmailWiredHint") || " – can be wired to compose."));
      });
    }

    var moreBtn = contentEl.querySelector("#entity-detail-more");
    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(t("moreOptionsWiredHint") || "More options – menu can be wired here.");
      });
    }

    contentEl.querySelectorAll(".entity-detail-related-link").forEach(function (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        var rel = link.getAttribute("data-related") || link.id;
        if (rel === "add" || link.id === "entity-detail-add-link") {
          if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(t("addRelatedList") + " / " + t("addLink") + (t("addRelatedWiredHint") || " – can be wired."));
          return;
        }
        if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(rel + (t("relatedListWiredHint") || " – related list can be wired."));
      });
    });

    var toggleBtn = contentEl.querySelector("#entity-detail-toggle-details");
    var detailsEl = contentEl.querySelector("#entity-detail-details");
    if (toggleBtn && detailsEl) {
      toggleBtn.addEventListener("click", function () {
        var hidden = detailsEl.classList.toggle("entity-detail-details--hidden");
        toggleBtn.textContent = hidden ? t("showDetails") : t("hideDetails");
        toggleBtn.setAttribute("aria-expanded", hidden ? "false" : "true");
      });
    }

    contentEl.querySelectorAll(".entity-detail-tab").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var tabName = tab.getAttribute("data-tab");
        if (!tabName) return;
        contentEl.querySelectorAll(".entity-detail-tab").forEach(function (t) {
          t.classList.toggle("entity-detail-tab--active", t.getAttribute("data-tab") === tabName);
          t.setAttribute("aria-selected", t.getAttribute("data-tab") === tabName ? "true" : "false");
        });
        contentEl.querySelectorAll(".entity-detail-content[data-tab-panel]").forEach(function (panel) {
          panel.classList.toggle("entity-detail-content--hidden", panel.getAttribute("data-tab-panel") !== tabName);
        });
      });
    });
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.entityDetail = {
    bind: bind
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

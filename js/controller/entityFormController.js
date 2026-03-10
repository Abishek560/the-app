/**
 * Controller: entity create/edit form – Cancel, Save, Save and New.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state || !theApp.api) return;

  var state = theApp.state;
  var api = theApp.api;
  var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };

  function getFormData(contentEl) {
    var data = {};
    contentEl.querySelectorAll(".entity-form-input, .entity-form-select").forEach(function (el) {
      var name = el.getAttribute("name");
      if (!name || name === "id") return;
      var val = el.value != null ? String(el.value).trim() : "";
      if (el.type === "number" && val !== "") {
        var n = Number(val);
        data[name] = isNaN(n) ? val : n;
      } else {
        data[name] = val;
      }
    });
    return data;
  }

  function bind(contentEl, isCreate) {
    if (!contentEl) return;
    var active = state.activeEntity;
    var moduleId = isCreate ? state.creatingModule : (active && active.moduleId);
    var entityId = active && active.entityId;

    var cancelBtn = contentEl.querySelector("#entity-form-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        if (isCreate) {
          state.creatingModule = null;
        } else {
          state.entityViewMode = "detail";
        }
        if (theApp.router && theApp.router.navigateTo && theApp.router.getHashFromState) {
          theApp.router.navigateTo(theApp.router.getHashFromState());
        } else if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        }
      });
    }

    function afterSave(modId) {
      if (isCreate) {
        state.creatingModule = null;
        state.activeModule = modId;
      } else {
        state.entityViewMode = "detail";
      }
      var data = theApp.getEntityData && theApp.getEntityData(modId);
      if (data) {
        data.list = null;
        data.page = 1;
      }
      if (theApp.router && theApp.router.navigateTo && theApp.router.getHashFromState) {
        theApp.router.navigateTo(theApp.router.getHashFromState());
      } else if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
        theApp.controller.app.renderContent();
      }
    }

    var saveBtn = contentEl.querySelector("#entity-form-save");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var data = getFormData(contentEl);
        var promise = isCreate
          ? api.createEntity(moduleId, data).then(function () { afterSave(moduleId); })
          : api.updateEntity(moduleId, entityId, data).then(function () { afterSave(moduleId); });
        if (theApp.withButtonLoading) theApp.withButtonLoading(saveBtn, promise);
      });
    }

    var saveNewBtn = contentEl.querySelector("#entity-form-save-new");
    if (saveNewBtn && isCreate) {
      saveNewBtn.addEventListener("click", function () {
        var data = getFormData(contentEl);
        var promise = api.createEntity(moduleId, data).then(function () {
          var d = theApp.getEntityData && theApp.getEntityData(moduleId);
          if (d) {
            d.list = null;
            d.page = 1;
          }
          contentEl.querySelectorAll(".entity-form-input, .entity-form-select").forEach(function (el) {
            if (el.getAttribute("name") === "id") return;
            el.value = "";
          });
        });
        if (theApp.withButtonLoading) theApp.withButtonLoading(saveNewBtn, promise);
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.entityForm = {
    bind: bind
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

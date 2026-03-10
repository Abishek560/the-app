/**
 * Controller: Setup/Settings page – sub-nav tabs (Organization, Modules & fields), org/module edit forms.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var api = theApp.api;

  function refreshSettingsContent() {
    if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
      theApp.controller.app.renderContent();
    }
  }

  function bind(contentEl) {
    if (!contentEl) return;

    // Sub-nav tabs
    contentEl.querySelectorAll(".settings-subnav-btn[data-settings-section]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var section = btn.getAttribute("data-settings-section");
        if (section) {
          state.settingsSection = section;
          refreshSettingsContent();
        }
      });
    });

    // —— Organization ——
    var orgEditBtn = contentEl.querySelector("#settings-org-edit");
    if (orgEditBtn) {
      orgEditBtn.addEventListener("click", function () {
        state.settingsEditingOrg = true;
        refreshSettingsContent();
      });
    }

    var orgCancelBtn = contentEl.querySelector("#settings-org-cancel");
    if (orgCancelBtn) {
      orgCancelBtn.addEventListener("click", function () {
        state.settingsEditingOrg = false;
        refreshSettingsContent();
      });
    }

    var orgForm = contentEl.querySelector("#settings-org-form");
    if (orgForm) {
      orgForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var data = {
          name: (orgForm.querySelector("[name=name]") || {}).value,
          portalName: (orgForm.querySelector("[name=portalName]") || {}).value,
          version: (orgForm.querySelector("[name=version]") || {}).value,
          baseURL: (orgForm.querySelector("[name=baseURL]") || {}).value
        };
        var submitBtn = orgForm.querySelector("#settings-org-save") || orgForm.querySelector('button[type="submit"]');
        if (api && api.updatePortalDetails) {
          var promise = api.updatePortalDetails(data).then(function (updated) {
            if (updated && typeof updated === "object") state.portal = updated;
            state.settingsEditingOrg = false;
            refreshSettingsContent();
          });
          if (theApp.withButtonLoading && submitBtn) theApp.withButtonLoading(submitBtn, promise);
        }
      });
    }

    // —— Module configuration ——
    var moduleAddBtn = contentEl.querySelector("#settings-module-add");
    if (moduleAddBtn) {
      moduleAddBtn.addEventListener("click", function () {
        state.settingsEditingModuleId = "new";
        refreshSettingsContent();
      });
    }

    contentEl.querySelectorAll(".settings-row-edit[data-module-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.settingsEditingModuleId = btn.getAttribute("data-module-id");
        refreshSettingsContent();
      });
    });

    var moduleCancelBtn = contentEl.querySelector("#settings-module-cancel");
    if (moduleCancelBtn) {
      moduleCancelBtn.addEventListener("click", function () {
        state.settingsEditingModuleId = null;
        refreshSettingsContent();
      });
    }

    var moduleForm = contentEl.querySelector("#settings-module-form");
    if (moduleForm) {
      moduleForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var isNew = moduleForm.getAttribute("data-module-is-new") === "true";
        var labelInp = moduleForm.querySelector("#settings-module-label");
        var label = labelInp ? labelInp.value.trim() : "";
        var locale = (theApp.language && theApp.language.getLocale && theApp.language.getLocale()) || "en";

        function refreshModules() {
          if (api.getModules) {
            api.getModules({ locale: locale }).then(function (list) {
              state.modules = list || [];
              state.settingsEditingModuleId = null;
              refreshSettingsContent();
            });
          } else {
            state.settingsEditingModuleId = null;
            refreshSettingsContent();
          }
        }

        var submitBtn = moduleForm.querySelector('button[type="submit"]');
        if (isNew) {
          var idInp = moduleForm.querySelector("#settings-module-id");
          var id = idInp ? String(idInp.value || "").trim().toLowerCase().replace(/\s+/g, "_") : "";
          if (!id) return;
          if (!api || !api.createModule) return;
          var promise = api.createModule(id, { label: label || id }).then(function (created) {
            if (created) refreshModules();
            else refreshSettingsContent();
          });
          if (theApp.withButtonLoading && submitBtn) theApp.withButtonLoading(submitBtn, promise);
          return;
        }

        var moduleId = state.settingsEditingModuleId;
        if (!moduleId || moduleId === "new" || !api || !api.updateModule) return;
        var promise = api.updateModule(moduleId, { label: label }).then(function () {
          refreshModules();
        });
        if (theApp.withButtonLoading && submitBtn) theApp.withButtonLoading(submitBtn, promise);
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.settings = {
    bind: bind
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);

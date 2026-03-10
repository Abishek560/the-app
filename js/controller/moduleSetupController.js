/**
 * Controller: Module setup – add/remove modules and fields, sync from DOM to state, Finish → state.modules + enterMainApp.
 */
(function (global) {
  "use strict";

  var theApp = global.theApp;
  if (!theApp || !theApp.state) return;

  var state = theApp.state;
  var contentEl = document.getElementById("content");

  function syncFromDom() {
    var editEl = contentEl && contentEl.querySelector("#module-setup-edit");
    var block = editEl && editEl.querySelector(".module-setup-block");
    var selectedIdx = state.setupModuleSelectedIndex;
    if (block && selectedIdx != null && selectedIdx >= 0 && state.setupModules && state.setupModules[selectedIdx] != null) {
      var labelInp = block.querySelector("input[name=setup-module-label]");
      var fieldRows = Array.from(block.querySelectorAll(".module-setup-field-row"));
      fieldRows.sort(function (a, b) {
        var ia = parseInt(a.getAttribute("data-field-index"), 10);
        var ib = parseInt(b.getAttribute("data-field-index"), 10);
        return (isNaN(ia) ? 0 : ia) - (isNaN(ib) ? 0 : ib);
      });
      var fields = [];
      var moduleNum = selectedIdx + 1;
      fieldRows.forEach(function (row, j) {
        var labelF = row.querySelector("input[name=setup-field-label]");
        var typeF = row.querySelector("select[name=setup-field-type]");
        if (!typeF) typeF = row.querySelector("input[name=setup-field-type]");
        var refF = row.querySelector("select[name=setup-field-ref-module]");
        var fieldNum = j + 1;
        var fieldType = (typeF && typeF.value) || "text";
        var out = {
          id: "module" + moduleNum + "-field" + fieldNum,
          label: (labelF && labelF.value || "").trim(),
          type: fieldType
        };
        if (fieldType === "module" && refF && refF.value !== "" && refF.value != null) {
          var refIdx = parseInt(refF.value, 10);
          if (!isNaN(refIdx)) out.refModuleIndex = refIdx;
        }
        fields.push(out);
      });
      var templateId = block.getAttribute("data-template-id") || "";
      state.setupModules[selectedIdx] = {
        label: (labelInp && labelInp.value || "").trim(),
        fields: fields,
        templateId: templateId || undefined
      };
      return;
    }
    var list = contentEl && contentEl.querySelector("#module-setup-list");
    if (!list) return;
    var blocks = list.querySelectorAll(".module-setup-block");
    if (blocks.length === 0) return;
    var next = [];
    blocks.forEach(function (b, i) {
      var labelInp = b.querySelector("input[name=setup-module-label]");
      var fieldRows = Array.from(b.querySelectorAll(".module-setup-field-row"));
      fieldRows.sort(function (a, b) {
        var ia = parseInt(a.getAttribute("data-field-index"), 10);
        var ib = parseInt(b.getAttribute("data-field-index"), 10);
        return (isNaN(ia) ? 0 : ia) - (isNaN(ib) ? 0 : ib);
      });
      var fields = [];
      var moduleNum = i + 1;
      fieldRows.forEach(function (row, j) {
        var labelF = row.querySelector("input[name=setup-field-label]");
        var typeF = row.querySelector("select[name=setup-field-type]");
        if (!typeF) typeF = row.querySelector("input[name=setup-field-type]");
        var refF = row.querySelector("select[name=setup-field-ref-module]");
        var fieldNum = j + 1;
        var fieldType = (typeF && typeF.value) || "text";
        var out = {
          id: "module" + moduleNum + "-field" + fieldNum,
          label: (labelF && labelF.value || "").trim(),
          type: fieldType
        };
        if (fieldType === "module" && refF && refF.value !== "" && refF.value != null) {
          var refIdx = parseInt(refF.value, 10);
          if (!isNaN(refIdx)) out.refModuleIndex = refIdx;
        }
        fields.push(out);
      });
      var templateId = b.getAttribute("data-template-id") || "";
      next.push({
        label: (labelInp && labelInp.value || "").trim(),
        fields: fields,
        templateId: templateId || undefined
      });
    });
    state.setupModules = next;
  }

  var locale = function () {
    var lang = theApp.language;
    if (lang && lang.getLocale) return lang.getLocale();
    if (typeof document !== "undefined" && document.documentElement && document.documentElement.lang) return document.documentElement.lang.slice(0, 2);
    return "en";
  };

  function resolveTemplateLabel(val) {
    if (val == null) return "";
    if (typeof val === "string") return val;
    if (typeof val === "object" && (val.en != null || val.ta != null)) return val[locale()] || val.en || val.ta || "";
    return "";
  }

  function getTemplateGroups() {
    return state.moduleSetupTemplates || null;
  }

  function getModuleTemplatesFlat() {
    var groups = getTemplateGroups();
    var flat = {};
    if (groups && groups.groups && Array.isArray(groups.groups)) {
      groups.groups.forEach(function (g) {
        (g.modules || []).forEach(function (m) {
          flat[m.id] = {
            label: m.label,
            fields: Array.isArray(m.fields) ? m.fields.slice() : []
          };
        });
      });
    }
    if (Object.keys(flat).length === 0) {
      var tpl = state.moduleSetupTemplates;
      var allMods = [];
      if (tpl && tpl.groups) tpl.groups.forEach(function (g) { (g.modules || []).forEach(function (m) { allMods.push(m); }); });
      function findMod(id) { return allMods.filter(function (m) { return m.id === id; })[0]; }
      var def = {
        leads: { label: { en: "Leads", ta: "லீட்கள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Customer name", ta: "வாடிக்கையாளர் பெயர்" }, type: "text" }, { label: { en: "Phone", ta: "தொலைபேசி" }, type: "text" }, { label: { en: "Status", ta: "நிலை" }, type: "select" }] },
        contacts: { label: { en: "Contacts", ta: "தொடர்புகள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Name", ta: "பெயர்" }, type: "text" }, { label: { en: "Phone", ta: "தொலைபேசி" }, type: "text" }, { label: { en: "Email", ta: "மின்னஞ்சல்" }, type: "text" }] },
        notes: { label: { en: "Notes", ta: "குறிப்புகள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Title", ta: "தலைப்பு" }, type: "text" }, { label: { en: "Content", ta: "உள்ளடக்கம்" }, type: "text" }] },
        invoice: { label: { en: "Invoice", ta: "விலைப்பட்டியல்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Customer", ta: "வாடிக்கையாளர்" }, type: "text" }, { label: { en: "Amount", ta: "தொகை" }, type: "number" }, { label: { en: "Status", ta: "நிலை" }, type: "select" }] },
        inventory: { label: { en: "Inventory", ta: "சரக்கு" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Item", ta: "பொருள்" }, type: "text" }, { label: { en: "Quantity", ta: "அளவு" }, type: "number" }, { label: { en: "SKU", ta: "SKU" }, type: "text" }] },
        projects: { label: { en: "Projects", ta: "திட்டங்கள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Name", ta: "பெயர்" }, type: "text" }, { label: { en: "Client", ta: "வாடிக்கையாளர்" }, type: "text" }, { label: { en: "Status", ta: "நிலை" }, type: "select" }] },
        appointments: { label: { en: "Appointments", ta: "நேரம் பதிவு" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Customer", ta: "வாடிக்கையாளர்" }, type: "text" }, { label: { en: "Date", ta: "தேதி" }, type: "text" }, { label: { en: "Status", ta: "நிலை" }, type: "select" }] },
        tasks: { label: { en: "Tasks", ta: "பணிகள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Title", ta: "தலைப்பு" }, type: "text" }, { label: { en: "Status", ta: "நிலை" }, type: "select" }, { label: { en: "Due date", ta: "காலக்கெடு" }, type: "text" }] },
        products: { label: { en: "Products", ta: "தயாரிப்புகள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Name", ta: "பெயர்" }, type: "text" }, { label: { en: "Price", ta: "விலை" }, type: "number" }, { label: { en: "SKU", ta: "SKU" }, type: "text" }] },
        services: { label: { en: "Services", ta: "சேவைகள்" }, fields: [{ label: { en: "ID", ta: "ஐடி" }, type: "id" }, { label: { en: "Service name", ta: "சேவை பெயர்" }, type: "text" }, { label: { en: "Price", ta: "விலை" }, type: "number" }, { label: { en: "Duration (mins)", ta: "காலம் (நிமி)" }, type: "number" }] }
      };
      ["leads", "contacts", "notes", "invoice", "inventory", "projects", "appointments", "tasks", "products", "services"].forEach(function (id) { flat[id] = findMod(id) || def[id]; });
    }
    return flat;
  }

  var POPULATE_AND_FINISH_TEMPLATE_IDS = ["leads", "contacts", "notes", "invoice", "inventory", "projects", "appointments"];

  function getPopulateAndFinishModules() {
    var flat = getModuleTemplatesFlat();
    var list = [];
    POPULATE_AND_FINISH_TEMPLATE_IDS.forEach(function (templateId) {
      var tpl = flat[templateId];
      if (tpl) {
        var copy = JSON.parse(JSON.stringify(tpl));
        copy.templateId = templateId;
        copy.label = resolveTemplateLabel(copy.label) || templateId;
        if (copy.fields && copy.fields.length) {
          copy.fields = copy.fields.map(function (f, idx) {
            var out = { id: "module" + (list.length + 1) + "-field" + (idx + 1), label: resolveTemplateLabel(f.label) || f.id || "", type: f.type || "text" };
            if (f.type === "module" && f.refModuleIndex != null) out.refModuleIndex = f.refModuleIndex;
            return out;
          });
        }
        list.push(copy);
      }
    });
    var customLabel1 = (theApp.language && theApp.language.t ? theApp.language.t("custom1") : null) || "Custom 1";
    var customLabel2 = (theApp.language && theApp.language.t ? theApp.language.t("custom2") : null) || "Custom 2";
    var nameLabel = (theApp.language && theApp.language.t ? theApp.language.t("name") : null) || "Name";
    list.push({ label: customLabel1, fields: [{ id: "module8-field1", label: nameLabel, type: "text" }] });
    list.push({ label: customLabel2, fields: [{ id: "module9-field1", label: nameLabel, type: "text" }] });
    return list;
  }

  function reRender(opts) {
    if (!theApp.view.moduleSetup || !contentEl) return;
    var mods = state.setupModules || [];
    if (mods.length > 0 && (state.setupModuleSelectedIndex == null || state.setupModuleSelectedIndex < 0 || state.setupModuleSelectedIndex >= mods.length)) {
      state.setupModuleSelectedIndex = 0;
    }
    var renderOpts = opts || {};
    renderOpts.templateGroups = getTemplateGroups();
    renderOpts.templateSearch = state.templateSearch != null ? state.templateSearch : "";
    contentEl.innerHTML = theApp.view.moduleSetup.render(renderOpts);
    bind(contentEl, renderOpts);
  }

  function addTemplateToSetup(templateId) {
    var flat = getModuleTemplatesFlat();
    var tpl = flat[templateId];
    if (!tpl) return;
    var copy = JSON.parse(JSON.stringify(tpl));
    copy.templateId = templateId;
    copy.label = resolveTemplateLabel(copy.label) || templateId;
    if (copy.fields && copy.fields.length) {
      var baseIdx = (state.setupModules || []).length;
      copy.fields = copy.fields.map(function (f, idx) {
        var out = { id: "module" + (baseIdx + 1) + "-field" + (idx + 1), label: resolveTemplateLabel(f.label) || f.id || "", type: f.type || "text" };
        if (f.type === "module" && f.refModuleIndex != null) out.refModuleIndex = f.refModuleIndex;
        return out;
      });
    }
    state.setupModules.push(copy);
  }

  function updateTemplatePopupAddButton(popup) {
    if (!popup) return;
    var list = popup.querySelector(".module-setup-templates-list");
    var addBtn = popup.querySelector("#module-setup-template-add-selected");
    var countEl = popup.querySelector("#module-setup-template-selection-count");
    var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };
    var addSelectedT = t("addSelected") || "Add selected";
    var addOneModuleT = t("addOneModule") || "Add 1 module";
    var addNModulesT = t("addNModules") || "Add N modules";
    if (!list || !addBtn) return;
    var checked = list.querySelectorAll("input[name=module-setup-template-check]:checked");
    var n = checked.length;
    addBtn.disabled = n === 0;
    if (countEl) countEl.textContent = n === 0 ? "0 selected" : (n === 1 ? "1 selected" : n + " selected");
    addBtn.textContent = n === 0 ? addSelectedT : (n === 1 ? addOneModuleT : addNModulesT.replace("N", String(n)));
  }

  function bind(el, opts) {
    var root = el || contentEl;
    if (!root) return;

    var backBtn = root.querySelector("#module-setup-back");
    if (backBtn) {
      backBtn.addEventListener("click", function () {
        state.showModuleSetup = false;
        if (theApp.controller.app && typeof theApp.controller.app.renderContent === "function") {
          theApp.controller.app.renderContent();
        }
      });
    }

    var popup = root.querySelector("#module-setup-template-popup");
    var popupSearch = root.querySelector("#module-setup-template-popup-search");
    if (popupSearch && popup) {
      popupSearch.addEventListener("input", function () {
        var q = (popupSearch.value || "").trim().toLowerCase();
        var listEl = popup.querySelector(".module-setup-templates-list");
        if (!listEl) return;
        var groups = listEl.querySelectorAll(".module-setup-templates-group");
        if (groups.length > 0) {
          groups.forEach(function (group) {
            var header = group.querySelector(".module-setup-templates-group-header");
            var groupText = (header && header.textContent || "").toLowerCase();
            var anyVisible = false;
            group.querySelectorAll(".module-setup-template-row").forEach(function (row) {
              var labelSpan = row.querySelector("span");
              var rowText = (labelSpan && labelSpan.textContent || row.textContent || "").toLowerCase();
              var match = !q || rowText.indexOf(q) >= 0 || groupText.indexOf(q) >= 0;
              row.classList.toggle("module-setup-template-hidden", !match);
              if (match) anyVisible = true;
            });
            group.classList.toggle("module-setup-template-hidden", !anyVisible);
          });
        } else {
          listEl.querySelectorAll(".module-setup-template-row").forEach(function (row) {
            var labelSpan = row.querySelector("span");
            var rowText = (labelSpan && labelSpan.textContent || row.textContent || "").toLowerCase();
            var match = !q || rowText.indexOf(q) >= 0;
            row.classList.toggle("module-setup-template-hidden", !match);
          });
        }
        updateTemplatePopupAddButton(popup);
      });
    }
    if (popup) {
      var listEl = popup.querySelector(".module-setup-templates-list");
      if (listEl) {
        listEl.addEventListener("change", function () {
          updateTemplatePopupAddButton(popup);
        });
      }
      var addSelectedBtn = popup.querySelector("#module-setup-template-add-selected");
      if (addSelectedBtn) {
        addSelectedBtn.addEventListener("click", function () {
          if (addSelectedBtn.disabled) return;
          syncFromDom();
          var checked = popup.querySelectorAll("input[name=module-setup-template-check]:checked");
          var used = (state.setupModules || []).map(function (m) { return m.templateId || ""; }).filter(Boolean);
          var toAdd = [];
          checked.forEach(function (cb) {
            var id = cb.value || cb.getAttribute("data-template");
            if (id && used.indexOf(id) < 0) toAdd.push(id);
          });
          var firstNewIndex = state.setupModules.length;
          toAdd.forEach(function (templateId) {
            addTemplateToSetup(templateId);
          });
          state.setupModuleSelectedIndex = firstNewIndex;
          if (popup && typeof closeTemplatePopup === "function") closeTemplatePopup();
          reRender({ focusModuleIndex: firstNewIndex });
        });
      }
      var selectAllBtn = popup.querySelector("#module-setup-template-select-all");
      if (selectAllBtn) {
        selectAllBtn.addEventListener("click", function () {
          popup.querySelectorAll(".module-setup-templates-list .module-setup-template-row:not(.module-setup-template-hidden) input[name=module-setup-template-check]:not([disabled])").forEach(function (cb) {
            cb.checked = true;
          });
          updateTemplatePopupAddButton(popup);
        });
      }
      var clearBtn = popup.querySelector("#module-setup-template-clear");
      if (clearBtn) {
        clearBtn.addEventListener("click", function () {
          popup.querySelectorAll("input[name=module-setup-template-check]").forEach(function (cb) {
            cb.checked = false;
          });
          updateTemplatePopupAddButton(popup);
        });
      }
    }

    function doAddModule() {
      syncFromDom();
      state.setupModules.push({ label: "", fields: [{ id: "", label: "", type: "text" }] });
      var newIndex = state.setupModules.length - 1;
      state.setupModuleSelectedIndex = newIndex;
      reRender({ focusModuleIndex: newIndex });
    }
    var addModuleBtn = root.querySelector("#module-setup-add-module");
    if (addModuleBtn) {
      addModuleBtn.addEventListener("click", doAddModule);
    }
    var emptyAddBtn = root.querySelector("#module-setup-empty-add-btn");
    if (emptyAddBtn) {
      emptyAddBtn.addEventListener("click", doAddModule);
    }
    var pickTemplateBtn = root.querySelector("#module-setup-empty-pick-template-btn");
    var pickTemplateHeaderBtn = root.querySelector("#module-setup-pick-template");
    var templatePopup = root.querySelector("#module-setup-template-popup");
    var templatePopupReturnFocus = null;
    function getFocusables(container) {
      if (!container) return [];
      var sel = "button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex=\"0\"]";
      return Array.prototype.filter.call(container.querySelectorAll(sel), function (el) {
        return el.offsetParent !== null && (el.type !== "hidden" || el.getAttribute("type") !== "hidden");
      });
    }
    function openTemplatePopup(returnFocusEl) {
      if (!templatePopup) return;
      templatePopupReturnFocus = returnFocusEl || document.activeElement || pickTemplateBtn || pickTemplateHeaderBtn;
      templatePopup.setAttribute("aria-hidden", "false");
      templatePopup.classList.add("module-setup-template-popup--open");
      templatePopup.querySelectorAll("input[name=module-setup-template-check]").forEach(function (cb) {
        cb.checked = false;
      });
      templatePopup.querySelectorAll(".module-setup-template-hidden").forEach(function (el) { el.classList.remove("module-setup-template-hidden"); });
      updateTemplatePopupAddButton(templatePopup);
      var searchEl = templatePopup.querySelector("#module-setup-template-popup-search");
      if (searchEl) {
        searchEl.value = "";
        setTimeout(function () { searchEl.focus(); }, 0);
      }
    }
    if (pickTemplateBtn && templatePopup) {
      pickTemplateBtn.addEventListener("click", function () {
        openTemplatePopup(pickTemplateBtn);
      });
    }
    if (pickTemplateHeaderBtn && templatePopup) {
      pickTemplateHeaderBtn.addEventListener("click", function () {
        openTemplatePopup(pickTemplateHeaderBtn);
      });
    }
    function closeTemplatePopup() {
      if (templatePopup) {
        templatePopup.setAttribute("aria-hidden", "true");
        templatePopup.classList.remove("module-setup-template-popup--open");
        var returnTo = templatePopupReturnFocus || pickTemplateBtn || pickTemplateHeaderBtn;
        templatePopupReturnFocus = null;
        if (returnTo && returnTo.focus) setTimeout(function () { returnTo.focus(); }, 0);
      }
    }
    if (templatePopup) {
      var dialog = templatePopup.querySelector(".module-setup-template-popup-dialog");
      if (dialog) {
        dialog.addEventListener("keydown", function (e) {
          if (e.key !== "Tab") return;
          var focusables = getFocusables(dialog);
          if (focusables.length === 0) return;
          var first = focusables[0];
          var last = focusables[focusables.length - 1];
          if (e.shiftKey) {
            if (document.activeElement === first) {
              e.preventDefault();
              last.focus();
            }
          } else {
            if (document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        });
      }
      var backdrop = templatePopup.querySelector(".module-setup-template-popup-backdrop");
      var closeBtn = templatePopup.querySelector(".module-setup-template-popup-close");
      if (backdrop) backdrop.addEventListener("click", closeTemplatePopup);
      if (closeBtn) closeBtn.addEventListener("click", closeTemplatePopup);
    }

    root.querySelectorAll(".module-setup-add-field").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-add-field"), 10);
        if (isNaN(i)) return;
        syncFromDom();
        var mods = state.setupModules;
        if (!mods[i]) mods[i] = { label: "", fields: [] };
        if (!mods[i].fields) mods[i].fields = [];
        mods[i].fields.push({ label: "", type: "text" });
        reRender({ focusModuleIndex: i });
      });
    });

    root.querySelectorAll(".module-setup-add-related-field").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-add-related-field"), 10);
        if (isNaN(i)) return;
        syncFromDom();
        var mods = state.setupModules;
        if (!mods[i]) mods[i] = { label: "", fields: [] };
        if (!mods[i].fields) mods[i].fields = [];
        var refDefault = i > 0 ? 0 : (state.setupModules && state.setupModules.length > 1 ? 1 : 0);
        var refMod = mods[refDefault];
        var prefillLabel = (refMod && resolveTemplateLabel(refMod.label)) || "";
        mods[i].fields.push({ label: prefillLabel, type: "module", refModuleIndex: refDefault });
        var newFieldIdx = mods[i].fields.length - 1;
        var block = root.querySelector(".module-setup-block[data-module-index=\"" + i + "\"]");
        var table = block && block.querySelector(".module-setup-related-section .module-setup-fields-table");
        if (block && table && theApp.view.moduleSetup && theApp.view.moduleSetup.buildRelatedFieldRowHTML) {
          var rowHtml = theApp.view.moduleSetup.buildRelatedFieldRowHTML(i, newFieldIdx, mods[i].fields[newFieldIdx], state.setupModules, i);
          var tmp = document.createElement("div");
          tmp.innerHTML = rowHtml;
          var newRow = tmp.firstElementChild;
          table.appendChild(newRow);
          var removeBtn = newRow.querySelector(".module-setup-remove-field");
          if (removeBtn) {
            removeBtn.addEventListener("click", function () {
              var mi = parseInt(removeBtn.getAttribute("data-remove-module"), 10);
              var fi = parseInt(removeBtn.getAttribute("data-remove-field"), 10);
              if (isNaN(mi) || isNaN(fi)) return;
              syncFromDom();
              var mod = state.setupModules[mi];
              if (mod && mod.fields) mod.fields.splice(fi, 1);
              reRender();
            });
          }
          var labelInput = newRow.querySelector("input[name=setup-field-label]");
          if (labelInput) {
            labelInput.addEventListener("blur", function () {
              clearTimeout(blurTimeout);
              blurTimeout = setTimeout(function () { syncFromDom(); }, 150);
            });
            labelInput.focus();
          }
          var refSelect = newRow.querySelector("select[name=setup-field-ref-module]");
          if (refSelect) {
            refSelect.addEventListener("change", function () {
              var opt = refSelect.options[refSelect.selectedIndex];
              var labelInp = newRow.querySelector("input[name=setup-field-label]");
              if (labelInp && (!labelInp.value || !labelInp.value.trim()) && opt && opt.value !== "") {
                labelInp.value = opt.textContent || opt.text || "";
              }
              syncFromDom();
            });
          }
        } else {
          reRender({ focusModuleIndex: i });
        }
      });
    });

    root.addEventListener("change", function (e) {
      if (e.target && e.target.getAttribute("name") === "setup-field-ref-module") {
        var row = e.target.closest(".module-setup-field-row");
        if (!row) return;
        var opt = e.target.options[e.target.selectedIndex];
        var labelInp = row.querySelector("input[name=setup-field-label]");
        if (labelInp && (!labelInp.value || !labelInp.value.trim()) && opt && opt.value !== "") {
          labelInp.value = opt.textContent || opt.text || "";
        }
        syncFromDom();
      }
    });

    var blurTimeout;
    root.querySelectorAll("input[name=setup-field-label]").forEach(function (inp) {
      inp.addEventListener("blur", function () {
        clearTimeout(blurTimeout);
        blurTimeout = setTimeout(function () {
          syncFromDom();
          reRender();
        }, 150);
      });
    });

    root.querySelectorAll(".module-setup-remove-field").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mi = parseInt(btn.getAttribute("data-remove-module"), 10);
        var fi = parseInt(btn.getAttribute("data-remove-field"), 10);
        if (isNaN(mi) || isNaN(fi)) return;
        syncFromDom();
        var mod = state.setupModules[mi];
        if (mod && mod.fields) mod.fields.splice(fi, 1);
        reRender();
      });
    });

    root.querySelectorAll(".module-setup-remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-remove-module"), 10);
        if (isNaN(i)) return;
        syncFromDom();
        state.setupModules.splice(i, 1);
        var sel = state.setupModuleSelectedIndex;
        if (sel !== null) {
          if (sel === i) state.setupModuleSelectedIndex = state.setupModules.length > 0 ? Math.min(sel, state.setupModules.length - 1) : null;
          else if (sel > i) state.setupModuleSelectedIndex = sel - 1;
        }
        reRender();
      });
    });
    root.querySelectorAll(".module-setup-card-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var i = parseInt(btn.getAttribute("data-module-index"), 10);
        if (isNaN(i)) return;
        state.setupModuleSelectedIndex = i;
        reRender();
      });
    });

    var focusIdx = opts && typeof opts.focusModuleIndex === "number" ? opts.focusModuleIndex : -1;
    var focusFieldIdx = opts && typeof opts.focusFieldIndex === "number" ? opts.focusFieldIndex : -1;
    if (focusIdx >= 0) {
      var block = root.querySelector(".module-setup-block[data-module-index=\"" + focusIdx + "\"]");
      if (block) {
        block.scrollIntoView({ behavior: "smooth", block: "nearest" });
        var firstInput;
        if (focusFieldIdx >= 0) {
          var row = block.querySelector(".module-setup-field-row[data-field-index=\"" + focusFieldIdx + "\"]");
          firstInput = row ? row.querySelector("input[name=setup-field-label]") : null;
        }
        if (!firstInput) firstInput = block.querySelector("input[name=setup-module-label]");
        if (firstInput) firstInput.focus();
      }
    }

    var finishBtn = root.querySelector("#module-setup-finish");
    if (finishBtn) {
      finishBtn.addEventListener("click", function () {
        syncFromDom();
        var list = state.setupModules || [];
        var t = theApp.language && theApp.language.t ? theApp.language.t : function (k) { return k; };
        root.querySelectorAll(".module-setup-block--error").forEach(function (el) { el.classList.remove("module-setup-block--error"); });
        if (list.length === 0) {
          var msgEmpty = t("setupAddOneModule") || "Add at least one module.";
          if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(msgEmpty);
          var emptyEl = root.querySelector(".module-setup-empty");
          if (emptyEl) emptyEl.scrollIntoView({ behavior: "smooth", block: "center" });
          return;
        }
        var emptyNameIdx = -1;
        for (var i = 0; i < list.length; i++) {
          if ((list[i].label || "").trim() === "") { emptyNameIdx = i; break; }
        }
        if (emptyNameIdx >= 0) {
          var msgName = t("setupModuleNameRequired") || "Please enter a name for every module.";
          if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(msgName);
          var block = root.querySelector(".module-setup-block[data-module-index=\"" + emptyNameIdx + "\"]");
          if (block) {
            block.classList.add("module-setup-block--error");
            block.scrollIntoView({ behavior: "smooth", block: "center" });
            var inp = block.querySelector("input[name=setup-module-label]");
            if (inp) inp.focus();
            setTimeout(function () { block.classList.remove("module-setup-block--error"); }, 4000);
          }
          return;
        }
        var noFieldIdx = -1;
        for (var j = 0; j < list.length; j++) {
          var validFields = (list[j].fields || []).filter(function (f) { return (f.id || "").trim() && (f.label || "").trim(); });
          if (validFields.length === 0) { noFieldIdx = j; break; }
        }
        if (noFieldIdx >= 0) {
          var msgField = t("setupModuleNeedsField") || "Each module must have at least one field with a label.";
          if (theApp.errorPopup && theApp.errorPopup.show) theApp.errorPopup.show(msgField);
          var blockErr = root.querySelector(".module-setup-block[data-module-index=\"" + noFieldIdx + "\"]");
          if (blockErr) {
            blockErr.classList.add("module-setup-block--error");
            blockErr.scrollIntoView({ behavior: "smooth", block: "center" });
            setTimeout(function () { blockErr.classList.remove("module-setup-block--error"); }, 4000);
          }
          return;
        }
        if (state.testMode) {
          state.setupModules = getPopulateAndFinishModules();
        }
        list = state.setupModules || [];
        var payload = list.map(function (m, i) {
          var fields = (m.fields || []).filter(function (f) { return (f.id || "").trim(); }).map(function (f) {
            var out = { id: (f.id || "").trim(), label: (f.label || f.id || "").trim(), type: (f.type || "text") };
            if (f.type === "module" && f.refModuleIndex != null) out.refModuleIndex = f.refModuleIndex;
            return out;
          });
          return { label: (m.label || "").trim(), fields: fields };
        });
        var api = theApp.api;
        reRender();
        var btnAfterRender = contentEl.querySelector("#module-setup-finish");
        var delayPromise = new Promise(function (resolve) { setTimeout(resolve, 1000); });
        var finishPromise = delayPromise.then(function () {
          if (!api || !api.createModules) {
            var fallback = list.map(function (m, i) {
              var fields = (m.fields || []).filter(function (f) { return (f.id || "").trim(); }).map(function (f) {
                var out = { id: (f.id || "").trim(), label: (f.label || f.id || "").trim(), type: (f.type || "text") };
                if (f.type === "module" && f.refModuleIndex != null) out.moduleId = "module" + (f.refModuleIndex + 1);
                return out;
              });
              return { id: "module" + (i + 1), label: (m.label || "").trim(), fields: fields };
            });
            var ensureStatic = theApp.controller.app && theApp.controller.app.ensureStaticModules;
            state.modules = ensureStatic ? ensureStatic(fallback) : fallback;
            state.showModuleSetup = false;
            state.showOnboarding = false;
            if (theApp.router && theApp.router.navigateTo) {
              var pn = (state.portalName && state.portalName.trim()) || "default";
              theApp.router.navigateTo("#/" + encodeURIComponent(pn) + "/dashboard");
            } else if (theApp.controller.app && theApp.controller.app.enterMainApp) {
              theApp.controller.app.enterMainApp();
            }
            return Promise.resolve();
          }
          return api.createModules(payload).then(function (created) {
            var ensureStatic = theApp.controller.app && theApp.controller.app.ensureStaticModules;
            state.modules = ensureStatic ? ensureStatic(created) : created;
            state.showModuleSetup = false;
            state.showOnboarding = false;
            if (theApp.router && theApp.router.navigateTo) {
              var pn = (state.portalName && state.portalName.trim()) || "default";
              theApp.router.navigateTo("#/" + encodeURIComponent(pn) + "/dashboard");
            } else if (theApp.controller.app && theApp.controller.app.enterMainApp) {
              theApp.controller.app.enterMainApp();
            }
          });
        });
        if (theApp.withButtonLoading && btnAfterRender && finishPromise) theApp.withButtonLoading(btnAfterRender, finishPromise);
      });
    }
  }

  theApp.controller = theApp.controller || {};
  theApp.controller.moduleSetup = {
    bind: bind,
    reRender: reRender
  };

  global.theApp = theApp;
})(typeof window !== "undefined" ? window : this);
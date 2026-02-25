/**
 * Apply saved theme as soon as the script runs so the page does not flash default theme.
 */
(function () {
  try {
    var storedTheme = localStorage.getItem("crm-theme");
    var storedAccent = localStorage.getItem("crm-accent");
    if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
      var effectiveTheme = storedTheme === "system" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : storedTheme === "system" ? "light" : storedTheme;
      document.documentElement.setAttribute("data-theme", effectiveTheme);
    }
    if (storedAccent === "amber" || storedAccent === "blue" || storedAccent === "green") {
      document.documentElement.setAttribute("data-accent", storedAccent);
    }
  } catch (ignore) {}
})();

/**
 * API configuration. Path pattern: api/{version}/portals/{portalName}/{resource}
 * Example: api/v1/portals/abiportal/leads
 */
const API = {
  baseURL: "",
  version: "v1",
  portalName: "abiportal"
};

/**
 * API client: tries fetch first; falls back to MockApi when the script is present and fetch fails.
 */
const Api = (function (API) {
  const resourceNames = { modules: "modules", leads: "leads", contacts: "contacts", me: "me" };

  /** Returns the base path for API requests (e.g. /api/v1/portals/abiportal). */
  function getApiBase() {
    const { baseURL, version, portalName } = API;
    const path = `/api/${version}/portals/${portalName}`;
    return baseURL ? `${baseURL.replace(/\/$/, "")}${path}` : path;
  }

  /**
   * Performs a GET request for the given resource with optional query parameters.
   * Returns parsed JSON, or null on failure. Paginated responses keep { data, meta } shape.
   */
  async function apiGet(resource, queryParams) {
    const basePath = getApiBase();
    let requestPath = `${basePath}/${resource}`;
    if (queryParams && typeof queryParams === "object") {
      const searchParams = new URLSearchParams();
      Object.keys(queryParams).forEach(function (paramKey) {
        const paramValue = queryParams[paramKey];
        if (paramValue != null && paramValue !== "") searchParams.set(paramKey, String(paramValue));
      });
      const queryString = searchParams.toString();
      if (queryString) requestPath += "?" + queryString;
    }
    const fallbackUrl = requestPath.includes("?") ? requestPath : `${basePath}/${resource}.json`;
    try {
      let response = await fetch(requestPath, { method: "GET", headers: { "Accept": "application/json" } });
      if (!response.ok && !requestPath.includes("?")) {
        response = await fetch(fallbackUrl, { method: "GET", headers: { "Accept": "application/json" } });
      }
      if (!response.ok) return null;
      const body = await response.json();
      if (body != null && typeof body === "object" && "data" in body) {
        if (body.meta) return body;
        return body.data;
      }
      return body;
    } catch (ignore) {
      return null;
    }
  }

  /** Returns an empty paginated result when the API and MockApi are both unavailable. */
  function emptyPaginated(pageNumber, pageLimit) {
    return { data: [], meta: { total: 0, page: pageNumber || 1, limit: pageLimit || 25 } };
  }

  return {
    resources: resourceNames,
    async getModules() {
      const data = await apiGet(resourceNames.modules);
      if (Array.isArray(data)) return data;
      if (typeof window.MockApi !== "undefined" && window.MockApi.getModules) return window.MockApi.getModules();
      return [];
    },
    async getLeads(options) {
      const pageNumber = Math.max(1, options?.page ?? 1);
      const pageLimit = Math.max(1, options?.limit ?? 25);
      const search = (options?.search ?? "").trim();
      const filters = options?.filters || {};
      const params = { page: pageNumber, limit: pageLimit };
      if (search) params.search = search;
      if (filters.stage && filters.stage !== "all") params.stage = filters.stage;
      const apiResponse = await apiGet(resourceNames.leads, params);
      if (apiResponse && typeof apiResponse === "object" && Array.isArray(apiResponse.data) && apiResponse.meta) return apiResponse;
      if (Array.isArray(apiResponse)) {
        const totalCount = apiResponse.length;
        const startIndex = (pageNumber - 1) * pageLimit;
        return { data: apiResponse.slice(startIndex, startIndex + pageLimit), meta: { total: totalCount, page: pageNumber, limit: pageLimit } };
      }
      if (typeof window.MockApi !== "undefined" && window.MockApi.getLeads) return window.MockApi.getLeads(options);
      return emptyPaginated(pageNumber, pageLimit);
    },
    async getContacts(options) {
      const pageNumber = Math.max(1, options?.page ?? 1);
      const pageLimit = Math.max(1, options?.limit ?? 25);
      const search = (options?.search ?? "").trim();
      const params = { page: pageNumber, limit: pageLimit };
      if (search) params.search = search;
      const apiResponse = await apiGet(resourceNames.contacts, params);
      if (apiResponse && typeof apiResponse === "object" && Array.isArray(apiResponse.data) && apiResponse.meta) return apiResponse;
      if (Array.isArray(apiResponse)) {
        const totalCount = apiResponse.length;
        const startIndex = (pageNumber - 1) * pageLimit;
        return { data: apiResponse.slice(startIndex, startIndex + pageLimit), meta: { total: totalCount, page: pageNumber, limit: pageLimit } };
      }
      if (typeof window.MockApi !== "undefined" && window.MockApi.getContacts) return window.MockApi.getContacts(options);
      return emptyPaginated(pageNumber, pageLimit);
    },
    async getCurrentUser() {
      const data = await apiGet(resourceNames.me);
      if (data && typeof data === "object" && (data.name != null || data.email != null)) return data;
      if (typeof window.MockApi !== "undefined" && window.MockApi.getCurrentUser) return window.MockApi.getCurrentUser();
      return null;
    }
  };
})(API);

  // ------- SPA state and UI -------

  const THEME_STORAGE_KEY = "crm-theme";
  const ACCENT_STORAGE_KEY = "crm-accent";

  const PAGE_SIZE = 25;

  const state = {
    modules: [],
    activeModule: "leads",
    leads: null,
    leadsTotal: 0,
    contacts: null,
    contactsTotal: 0,
    currentUser: null,
    primaryOrder: [],
    theme: "system",
    accent: "amber",
    leadsSearch: "",
    leadsFilters: {},
    leadsPage: 1,
    contactsSearch: "",
    contactsFilters: {},
    contactsPage: 1,
    leadsSearchDebounceTimer: null,
    contactsSearchDebounceTimer: null
  };

  const SEARCH_DEBOUNCE_MS = 350;

  /** Reads the saved theme from localStorage; returns "system" if missing or invalid. */
  function getStoredTheme() {
    try {
      const storedValue = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedValue === "light" || storedValue === "dark" || storedValue === "system") return storedValue;
    } catch (ignore) {}
    return "system";
  }

  /** Reads the saved accent from localStorage; returns "amber" if missing or invalid. */
  function getStoredAccent() {
    try {
      const storedValue = localStorage.getItem(ACCENT_STORAGE_KEY);
      if (storedValue === "amber" || storedValue === "blue" || storedValue === "green") return storedValue;
    } catch (ignore) {}
    return "amber";
  }

  function getEffectiveTheme() {
    if (state.theme === "light") return "light";
    if (state.theme === "dark") return "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", getEffectiveTheme());
    document.documentElement.setAttribute("data-accent", state.accent);
  }

  function setTheme(mode) {
    state.theme = mode;
    try { localStorage.setItem(THEME_STORAGE_KEY, mode); } catch (_) {}
    applyTheme();
    renderThemeOptions();
  }

  function setAccent(accent) {
    state.accent = accent;
    try { localStorage.setItem(ACCENT_STORAGE_KEY, accent); } catch (_) {}
    applyTheme();
    renderAccentOptions();
  }

  /** Updates the active state of the theme (Light/System/Dark) buttons in the profile panel. */
  function renderThemeOptions() {
    const container = document.getElementById("theme-options");
    if (!container) return;
    container.querySelectorAll(".theme-option").forEach(function (button) {
      const mode = button.getAttribute("data-mode");
      button.classList.toggle("active", state.theme === mode);
      button.setAttribute("aria-pressed", state.theme === mode ? "true" : "false");
    });
  }

  /** Updates the active state of the accent color swatches in the profile panel. */
  function renderAccentOptions() {
    const container = document.getElementById("accent-options");
    if (!container) return;
    container.querySelectorAll(".accent-swatch").forEach(function (button) {
      button.classList.toggle("active", state.accent === button.getAttribute("data-accent"));
    });
  }

  function bindThemeControls() {
    state.theme = getStoredTheme();
    state.accent = getStoredAccent();
    applyTheme();
    renderThemeOptions();
    renderAccentOptions();
    document.getElementById("theme-options") && document.getElementById("theme-options").addEventListener("click", function (event) {
      const button = event.target.closest(".theme-option[data-mode]");
      if (button) setTheme(button.getAttribute("data-mode"));
    });
    document.getElementById("accent-options") && document.getElementById("accent-options").addEventListener("click", function (event) {
      const button = event.target.closest(".accent-swatch[data-accent]");
      if (button) setAccent(button.getAttribute("data-accent"));
    });
    window.matchMedia?.("(prefers-color-scheme: dark)")?.addEventListener("change", () => {
      if (state.theme === "system") applyTheme();
    });
  }

  const navEl = document.getElementById("nav-modules");
  const contentEl = document.getElementById("content");
  const profileBtn = document.getElementById("profile-btn");
  const profilePanel = document.getElementById("profile-panel");
  const profileBackdrop = document.getElementById("profile-backdrop");
  const profileCloseBtn = document.querySelector(".profile-close-btn");
  let moreMenuOpen = false;
  let profileOpen = false;

  // ======== Topbar (module list nav + profile + more menu) ========

  function setActiveModule(id) {
    state.activeModule = id;
    renderNav();
    renderContent();
  }

  function getMaxPrimary() {
    const viewportWidth = window.innerWidth || 1024;
    return viewportWidth < 560
      ? 4
      : viewportWidth < 768
      ? 5
      : viewportWidth < 1024
      ? 7
      : 9;
  }

  /** Computes which module ids are visible in the primary nav (rest go in "More" menu). */
  function getPrimaryIds(maxPrimary) {
    if (!state.primaryOrder || state.primaryOrder.length === 0) {
      state.primaryOrder = state.modules.map(function (module) { return module.id; });
    }

    const moduleIds = new Set(state.modules.map(function (module) { return module.id; }));
    state.primaryOrder = state.primaryOrder.filter(function (id) { return moduleIds.has(id); });

    const primaryIds = state.primaryOrder.slice(0, maxPrimary);
    const missing = state.modules
      .map(function (module) { return module.id; })
      .filter(function (id) { return !primaryIds.includes(id); });

    state.primaryOrder = primaryIds.concat(missing);
    return state.primaryOrder.slice(0, maxPrimary);
  }

  /** Renders the topbar nav: primary module buttons plus a "More" dropdown for the rest. */
  function renderNav() {
    navEl.innerHTML = "";

    const maxPrimary = getMaxPrimary();
    const primaryIds = getPrimaryIds(maxPrimary);
    const primaryIdSet = new Set(primaryIds);

    const primaryModules = state.modules.filter(function (module) { return primaryIdSet.has(module.id); });
    const overflowModules = state.modules.filter(function (module) { return !primaryIdSet.has(module.id); });

    primaryModules.forEach(function (module) {
      const button = document.createElement("button");
      button.textContent = module.label;
      if (module.id === state.activeModule) button.classList.add("active");
      button.addEventListener("click", function () { setActiveModule(module.id); });
      navEl.appendChild(button);
    });

    if (overflowModules.length > 0) {
      const moreWrap = document.createElement("div");
      moreWrap.className = "nav-more";

      const moreButton = document.createElement("button");
      moreButton.className = "more-btn";
      moreButton.type = "button";
      moreButton.textContent = "⋯";
      moreButton.setAttribute("aria-haspopup", "menu");
      moreButton.setAttribute("aria-expanded", "false");
      moreButton.setAttribute("aria-label", "More modules");

      if (overflowModules.some(function (module) { return module.id === state.activeModule; })) {
        moreButton.classList.add("active");
      }

      const menu = document.createElement("div");
      menu.className = "more-menu";
      menu.setAttribute("role", "menu");

      overflowModules.forEach(function (module) {
        const menuItem = document.createElement("button");
        menuItem.type = "button";
        menuItem.setAttribute("role", "menuitem");
        menuItem.textContent = module.label;
        if (module.id === state.activeModule) menuItem.classList.add("active");
        menuItem.addEventListener("click", function () {
          const maxPrimaryForSwap = getMaxPrimary();
          const currentPrimaryIds = getPrimaryIds(maxPrimaryForSwap);
          if (currentPrimaryIds.length > 0) {
            const lastPrimaryId = currentPrimaryIds[currentPrimaryIds.length - 1];
            const clickedModuleId = module.id;
            const remaining = state.primaryOrder.filter(function (id) {
              return !currentPrimaryIds.includes(id) && id !== clickedModuleId && id !== lastPrimaryId;
            });
            state.primaryOrder = currentPrimaryIds.slice(0, -1).concat(clickedModuleId, lastPrimaryId, remaining);
          }
          setActiveModule(module.id);
          closeMoreMenu();
        });
        menu.appendChild(menuItem);
      });

      moreButton.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleMoreMenu(moreWrap, moreButton);
      });

      moreWrap.appendChild(moreButton);
      moreWrap.appendChild(menu);
      navEl.appendChild(moreWrap);
    }
  }
  
  /** Closes the "More" modules dropdown. */
  function closeMoreMenu() {
    const moreWrap = navEl.querySelector(".nav-more");
    const moreButton = navEl.querySelector(".nav-more .more-btn");
    if (!moreWrap || !moreButton) return;
    moreWrap.classList.remove("open");
    moreButton.setAttribute("aria-expanded", "false");
    moreMenuOpen = false;
  }

  /** Toggles the "More" modules dropdown open/closed. */
  function toggleMoreMenu(moreWrap, moreButton) {
    const willOpen = !moreWrap.classList.contains("open");
    if (!willOpen) {
      closeMoreMenu();
      return;
    }
    moreWrap.classList.add("open");
    moreButton.setAttribute("aria-expanded", "true");
    moreMenuOpen = true;
  }

  function openProfilePanel() {
    if (!profilePanel || !profileBackdrop) return;
    if (state.currentUser === null) {
      Api.getCurrentUser().then((user) => {
        state.currentUser = user;
        hydrateProfileFromState();
      });
    }
    profilePanel.classList.add("open");
    profileBackdrop.classList.add("open");
    profilePanel.setAttribute("aria-hidden", "false");
    profileOpen = true;
  }
  
  function closeProfilePanel() {
    if (!profilePanel || !profileBackdrop) return;
    profilePanel.classList.remove("open");
    profileBackdrop.classList.remove("open");
    profilePanel.setAttribute("aria-hidden", "true");
    profileOpen = false;
  }

  function toggleProfilePanel() {
    if (profileOpen) {
      closeProfilePanel();
    } else {
      closeMoreMenu();
      openProfilePanel();
    }
  }

  function hydrateProfileFromState() {
    if (!state.currentUser) return;
    const { name, role, email, initials } = state.currentUser;

    const avatarEl = document.querySelector(".profile-avatar");
    if (avatarEl) {
      const fallbackInitial =
        (initials && initials.trim()[0]) ||
        (name && name.trim()[0]) ||
        "U";
      avatarEl.textContent = fallbackInitial.toUpperCase();
    }

    const nameEl = document.getElementById("profile-name");
    if (nameEl && name) {
      nameEl.textContent = name;
    }

    const roleEl = document.getElementById("profile-role");
    if (roleEl && role) {
      roleEl.textContent = role;
    }

    const emailEl = document.getElementById("profile-email");
    if (emailEl && email) {
      emailEl.textContent = email;
    }

    const subtitleEl = document.getElementById("profile-subtitle");
    if (subtitleEl && name) {
      subtitleEl.textContent = `Signed in as ${name}`;
    }
  }

  // ======== Module (filters + content area) ========

  /** Returns the field config for a module (from mock/API). Falls back to defaults if none. */
  function getModuleFields(moduleId) {
    const module = state.modules.find(function (m) { return m.id === moduleId; });
    if (module && module.fields && module.fields.length > 0) return module.fields;
    if (moduleId === "leads") {
      return [
        { id: "name", label: "Lead name", type: "text", placeholder: "Filter by name" },
        { id: "owner", label: "Owner", type: "text", placeholder: "Filter by owner" },
        { id: "stage", label: "Stage", type: "select", options: ["all", "Open", "Won", "Lost"] },
        { id: "value", label: "Value (min)", type: "number", placeholder: "e.g. 10000" }
      ];
    }
    if (moduleId === "contacts") {
      return [
        { id: "name", label: "Contact name", type: "text", placeholder: "Filter by name" },
        { id: "company", label: "Company", type: "text", placeholder: "Filter by company" },
        { id: "email", label: "Email", type: "text", placeholder: "Filter by email" },
        { id: "phone", label: "Phone", type: "text", placeholder: "Filter by phone" }
      ];
    }
    return [];
  }

  /** Formats a table cell value for display (chip for select, currency for number, else text). */
  function formatCellValue(value, field) {
    if (value == null || value === "") return "";
    if (field.type === "number") {
      const num = Number(value);
      return isNaN(num) ? String(value).replace(/</g, "&lt;") : "$" + num.toLocaleString();
    }
    if (field.type === "select") {
      const str = String(value);
      const chipClass = field.id === "stage" ? str.toLowerCase() : "chip-default";
      return "<span class=\"chip " + chipClass + "\">" + str.replace(/</g, "&lt;") + "</span>";
    }
    return String(value).replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  /** Builds table thead + tbody HTML from fields and data. */
  function buildTableHTML(moduleId, list, emptyMessage) {
    const fields = getModuleFields(moduleId);
    const theadCells = fields.map(function (f) { return "<th>" + (f.label || f.id) + "</th>"; }).join("");
    let tbodyRows;
    if (!list || list.length === 0) {
      tbodyRows = "<tr><td colspan=\"" + fields.length + "\" class=\"muted\">" + (emptyMessage || "No results.") + "</td></tr>";
    } else {
      tbodyRows = list.map(function (row) {
        const cells = fields.map(function (f) {
          const raw = row[f.id];
          const content = formatCellValue(raw, f);
          return "<td>" + content + "</td>";
        }).join("");
        return "<tr>" + cells + "</tr>";
      }).join("");
    }
    return "<thead><tr>" + theadCells + "</tr></thead><tbody>" + tbodyRows + "</tbody>";
  }

  /** Builds filter panel HTML for a module (inputs from field config). */
  function buildFilterFieldsHTML(moduleId, filterPrefix, currentFilters) {
    const fields = getModuleFields(moduleId);
    const parts = [];
    fields.forEach(function (field) {
      const id = filterPrefix + "-filter-" + field.id;
      const value = (currentFilters[field.id] != null ? currentFilters[field.id] : "").replace(/"/g, "&quot;");
      parts.push("<label class=\"filter-field-label\">" + (field.label || field.id) + "</label>");
      if (field.type === "select" && Array.isArray(field.options)) {
        parts.push("<div class=\"filter-radio-group\">");
        field.options.forEach(function (opt) {
          const isAll = opt === "all" || opt === "All";
          const optLabel = isAll ? "All" : opt;
          const checked = (currentFilters[field.id] == null || currentFilters[field.id] === "" || currentFilters[field.id] === "all") ? (opt === "all" ? " checked" : "") : (currentFilters[field.id] === opt ? " checked" : "");
          parts.push("<label class=\"filter-option\"><input type=\"radio\" name=\"" + filterPrefix + "-" + field.id + "\" value=\"" + opt + "\"" + checked + " /> " + optLabel + "</label>");
        });
        parts.push("</div>");
      } else {
        const type = field.type === "number" ? "number" : "text";
        const placeholder = field.placeholder || "Filter...";
        parts.push("<input type=\"" + type + "\" id=\"" + id + "\" class=\"filter-field-input\" placeholder=\"" + (placeholder || "").replace(/"/g, "&quot;") + "\" value=\"" + value + "\" aria-label=\"" + (field.label || field.id).replace(/"/g, "&quot;") + "\" />");
      }
    });
    parts.push("<button type=\"button\" id=\"" + filterPrefix + "-apply-filters\" class=\"filter-apply-btn\">Apply filters</button>");
    return parts.join("");
  }

  /** Builds filter panel HTML for template literal (escaped). */
  function buildFilterFieldsHTMLTemplate(moduleId, filterPrefix, currentFilters) {
    const fields = getModuleFields(moduleId);
    const parts = [];
    fields.forEach(function (field) {
      const value = currentFilters[field.id] != null ? String(currentFilters[field.id]).trim() : "";
      const displayValue = value.replace(/"/g, "&quot;");
      const labelEsc = (field.label || field.id).replace(/"/g, "&quot;");
      parts.push("<label class=\"filter-field-label\">" + (field.label || field.id) + "</label>");
      if (field.type === "select" && Array.isArray(field.options)) {
        parts.push("<div class=\"filter-radio-group\">");
        field.options.forEach(function (opt) {
          const isChecked = (!value || value === "all") ? (opt === "all") : (value === opt);
          parts.push("<label class=\"filter-option\"><input type=\"radio\" name=\"" + filterPrefix + "-" + field.id + "\" value=\"" + String(opt).replace(/"/g, "&quot;") + "\"" + (isChecked ? " checked" : "") + " /> " + (opt === "all" ? "All" : opt) + "</label>");
        });
        parts.push("</div>");
      } else {
        const type = field.type === "number" ? "number" : "text";
        const placeholder = (field.placeholder || "Filter...").replace(/"/g, "&quot;");
        parts.push("<input type=\"" + type + "\" id=\"" + filterPrefix + "-filter-" + field.id + "\" class=\"filter-field-input\" placeholder=\"" + placeholder + "\" value=\"" + displayValue + "\" aria-label=\"" + labelEsc + "\" />");
      }
    });
    parts.push("<button type=\"button\" id=\"" + filterPrefix + "-apply-filters\" class=\"filter-apply-btn\">Apply filters</button>");
    return parts.join("");
  }

  /** Fetches a page of leads from the API and then renders the leads view. */
  function fetchLeadsPage(page) {
    const pageNumber = Math.max(1, page);
    const filtersAlreadyVisible = contentEl.querySelector("#leads-search") !== null;
    const listEl = contentEl.querySelector(".module-list");

    if (filtersAlreadyVisible && listEl) {
      listEl.innerHTML = "<div class=\"entity-list-loading muted\">Loading…</div>";
      Api.getLeads({
        page: pageNumber,
        limit: PAGE_SIZE,
        search: state.leadsSearch,
        filters: state.leadsFilters
      }).then(function (result) {
        state.leads = result.data;
        state.leadsTotal = result.meta != null ? result.meta.total : result.data.length;
        state.leadsPage = result.meta != null ? result.meta.page : pageNumber;
        updateLeadsListOnly();
      });
      return;
    }

    contentEl.innerHTML = `
      <div class="card">
        <div class="module-layout">
          <aside class="module-filters" aria-label="Filter leads">
            <h2 class="module-filters-header">Filter Leads by</h2>
            <div class="module-filters-search">
              <input type="search" id="leads-search" class="search-input" placeholder="Search" value="${(state.leadsSearch || "").replace(/"/g, "&quot;")}" aria-label="Search leads" />
            </div>
            <details class="filter-section" open>
              <summary><span class="filter-section-chevron"></span>Field filters</summary>
              <div class="filter-section-options">
                ${buildFilterFieldsHTMLTemplate("leads", "leads", state.leadsFilters)}
              </div>
            </details>
          </aside>
          <section class="module-list" aria-label="Leads list">
            <div class="entity-list-loading muted">Loading…</div>
          </section>
        </div>
      </div>`;
    bindLeadsFilterListeners();
    Api.getLeads({
      page: pageNumber,
      limit: PAGE_SIZE,
      search: state.leadsSearch,
      filters: state.leadsFilters
    }).then(function (result) {
      state.leads = result.data;
      state.leadsTotal = result.meta != null ? result.meta.total : result.data.length;
      state.leadsPage = result.meta != null ? result.meta.page : pageNumber;
      renderLeads();
    });
  }

  /** Fetches a page of contacts from the API and then renders the contacts view. */
  function fetchContactsPage(page) {
    const pageNumber = Math.max(1, page);
    const filtersAlreadyVisible = contentEl.querySelector("#contacts-search") !== null;
    const listEl = contentEl.querySelector(".module-list");

    if (filtersAlreadyVisible && listEl) {
      listEl.innerHTML = "<div class=\"entity-list-loading muted\">Loading…</div>";
      Api.getContacts({
        page: pageNumber,
        limit: PAGE_SIZE,
        search: state.contactsSearch,
        filters: state.contactsFilters
      }).then(function (result) {
        state.contacts = result.data;
        state.contactsTotal = result.meta != null ? result.meta.total : result.data.length;
        state.contactsPage = result.meta != null ? result.meta.page : pageNumber;
        updateContactsListOnly();
      });
      return;
    }

    contentEl.innerHTML = `
      <div class="card">
        <div class="module-layout">
          <aside class="module-filters" aria-label="Filter contacts">
            <h2 class="module-filters-header">Filter Contacts by</h2>
            <div class="module-filters-search">
              <input type="search" id="contacts-search" class="search-input" placeholder="Search" value="${(state.contactsSearch || "").replace(/"/g, "&quot;")}" aria-label="Search contacts" />
            </div>
            <details class="filter-section" open>
              <summary><span class="filter-section-chevron"></span>Field filters</summary>
              <div class="filter-section-options">
                ${buildFilterFieldsHTMLTemplate("contacts", "contacts", state.contactsFilters)}
              </div>
            </details>
          </aside>
          <section class="module-list" aria-label="Contacts list">
            <div class="entity-list-loading muted">Loading…</div>
          </section>
        </div>
      </div>`;
    bindContactsFilterListeners();
    Api.getContacts({
      page: pageNumber,
      limit: PAGE_SIZE,
      search: state.contactsSearch,
      filters: state.contactsFilters
    }).then(function (result) {
      state.contacts = result.data;
      state.contactsTotal = result.meta != null ? result.meta.total : result.data.length;
      state.contactsPage = result.meta != null ? result.meta.page : pageNumber;
      renderContacts();
    });
  }

  /** Renders the main content area based on the active module. */
  function renderContent() {
    if (state.activeModule === "leads") {
      if (state.leads === null) {
        fetchLeadsPage(1);
        return;
      }
      renderLeads();
      return;
    }
    if (state.activeModule === "contacts") {
      if (state.contacts === null) {
        fetchContactsPage(1);
        return;
      }
      renderContacts();
      return;
    }
    const activeModule = state.modules.find(function (module) { return module.id === state.activeModule; });
    const title = activeModule != null ? activeModule.label : "Module";
    contentEl.innerHTML = `
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">${title}</div>
            <div class="muted">This module is not wired up yet.</div>
          </div>
        </div>
        <div class="muted">Add UI + data for <strong>${title}</strong> in <code>renderContent()</code>.</div>
      </div>
    `;
  }

  /** Binds search, field filters and Apply button for the leads panel. */
  function bindLeadsFilterListeners() {
    const searchInput = document.getElementById("leads-search");
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.leadsSearch = event.target.value;
        if (state.leadsSearchDebounceTimer != null) window.clearTimeout(state.leadsSearchDebounceTimer);
        state.leadsSearchDebounceTimer = window.setTimeout(function () {
          state.leadsSearchDebounceTimer = null;
          fetchLeadsPage(1);
        }, SEARCH_DEBOUNCE_MS);
      });
    }
    const applyBtn = document.getElementById("leads-apply-filters");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        const fields = getModuleFields("leads");
        state.leadsFilters = {};
        fields.forEach(function (field) {
          if (field.type === "select" && Array.isArray(field.options)) {
            const checked = document.querySelector("input[name=\"leads-" + field.id + "\"]:checked");
            state.leadsFilters[field.id] = checked ? checked.value : "all";
          } else {
            const input = document.getElementById("leads-filter-" + field.id);
            state.leadsFilters[field.id] = input ? input.value.trim() : "";
          }
        });
        fetchLeadsPage(1);
      });
    }
  }

  /** Binds search, field filters and Apply button for the contacts panel. */
  function bindContactsFilterListeners() {
    const searchInput = document.getElementById("contacts-search");
    if (searchInput) {
      searchInput.addEventListener("input", function (event) {
        state.contactsSearch = event.target.value;
        if (state.contactsSearchDebounceTimer != null) window.clearTimeout(state.contactsSearchDebounceTimer);
        state.contactsSearchDebounceTimer = window.setTimeout(function () {
          state.contactsSearchDebounceTimer = null;
          fetchContactsPage(1);
        }, SEARCH_DEBOUNCE_MS);
      });
    }
    const applyBtn = document.getElementById("contacts-apply-filters");
    if (applyBtn) {
      applyBtn.addEventListener("click", function () {
        const fields = getModuleFields("contacts");
        state.contactsFilters = {};
        fields.forEach(function (field) {
          if (field.type === "select" && Array.isArray(field.options)) {
            const checked = document.querySelector("input[name=\"contacts-" + field.id + "\"]:checked");
            state.contactsFilters[field.id] = checked ? checked.value : "all";
          } else {
            const input = document.getElementById("contacts-filter-" + field.id);
            state.contactsFilters[field.id] = input ? input.value.trim() : "";
          }
        });
        fetchContactsPage(1);
      });
    }
  }

  // ======== Module > List (entity list: header, table, pagination) ========

  /** Updates only the leads entity list DOM (keeps filter panel intact so search input keeps focus). */
  function updateLeadsListOnly() {
    const listEl = contentEl.querySelector(".module-list");
    if (!listEl) return;
    const leadsList = Array.isArray(state.leads) ? state.leads : [];
    const totalCount = state.leadsTotal || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.max(1, Math.min(state.leadsPage || 1, totalPages));
    const rangeFrom = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const rangeTo = totalCount ? (currentPage - 1) * PAGE_SIZE + leadsList.length : 0;
    const tableHTML = buildTableHTML("leads", leadsList, "No leads match your filters.");
    listEl.innerHTML =
      "<div class=\"module-list-header\">" +
      "<span class=\"pagination-group\">" +
      "<span id=\"leads-prev\" class=\"pagination-arrow" + (currentPage <= 1 ? " disabled" : "") + "\" role=\"button\" aria-label=\"Previous page\" tabindex=\"" + (currentPage <= 1 ? "-1" : "0") + "\">&lt;</span>" +
      "<span class=\"pagination-info\">Page " + currentPage + " of " + totalPages + "</span>" +
      "<span id=\"leads-next\" class=\"pagination-arrow" + (currentPage >= totalPages ? " disabled" : "") + "\" role=\"button\" aria-label=\"Next page\" tabindex=\"" + (currentPage >= totalPages ? "-1" : "0") + "\">&gt;</span>" +
      "</span>" +
      "<span class=\"list-meta\"><span class=\"result-count\" aria-live=\"polite\">Showing " + rangeFrom + "\u2013" + rangeTo + " of " + totalCount + "</span></span>" +
      "</div>" +
      "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>";
    const prevButton = document.getElementById("leads-prev");
    const nextButton = document.getElementById("leads-next");
    if (prevButton) prevButton.addEventListener("click", function () { fetchLeadsPage(state.leadsPage - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { fetchLeadsPage(state.leadsPage + 1); });
  }

  /** Updates only the contacts entity list DOM (keeps filter panel intact so search input keeps focus). */
  function updateContactsListOnly() {
    const listEl = contentEl.querySelector(".module-list");
    if (!listEl) return;
    const contactsList = Array.isArray(state.contacts) ? state.contacts : [];
    const totalCount = state.contactsTotal || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.max(1, Math.min(state.contactsPage || 1, totalPages));
    const rangeFrom = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const rangeTo = totalCount ? (currentPage - 1) * PAGE_SIZE + contactsList.length : 0;
    const tableHTML = buildTableHTML("contacts", contactsList, "No contacts match your search.");
    listEl.innerHTML =
      "<div class=\"module-list-header\">" +
      "<span class=\"pagination-group\">" +
      "<span id=\"contacts-prev\" class=\"pagination-arrow" + (currentPage <= 1 ? " disabled" : "") + "\" role=\"button\" aria-label=\"Previous page\" tabindex=\"" + (currentPage <= 1 ? "-1" : "0") + "\">&lt;</span>" +
      "<span class=\"pagination-info\">Page " + currentPage + " of " + totalPages + "</span>" +
      "<span id=\"contacts-next\" class=\"pagination-arrow" + (currentPage >= totalPages ? " disabled" : "") + "\" role=\"button\" aria-label=\"Next page\" tabindex=\"" + (currentPage >= totalPages ? "-1" : "0") + "\">&gt;</span>" +
      "</span>" +
      "<span class=\"list-meta\"><span class=\"result-count\" aria-live=\"polite\">Showing " + rangeFrom + "\u2013" + rangeTo + " of " + totalCount + "</span></span>" +
      "</div>" +
      "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>";
    const prevButton = document.getElementById("contacts-prev");
    const nextButton = document.getElementById("contacts-next");
    if (prevButton) prevButton.addEventListener("click", function () { fetchContactsPage(state.contactsPage - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { fetchContactsPage(state.contactsPage + 1); });
  }

  /** Renders the leads table with toolbar (search, field filters) and pagination. */
  function renderLeads() {
    const leadsList = Array.isArray(state.leads) ? state.leads : [];
    const totalCount = state.leadsTotal || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.max(1, Math.min(state.leadsPage || 1, totalPages));
    const rangeFrom = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const rangeTo = totalCount ? (currentPage - 1) * PAGE_SIZE + leadsList.length : 0;
    const tableHTML = buildTableHTML("leads", leadsList, "No leads match your filters.");

    contentEl.innerHTML =
      "<div class=\"card\">" +
      "<div class=\"module-layout\">" +
      "<aside class=\"module-filters\" aria-label=\"Filter leads\">" +
      "<h2 class=\"module-filters-header\">Filter Leads by</h2>" +
      "<div class=\"module-filters-search\">" +
      "<input type=\"search\" id=\"leads-search\" class=\"search-input\" placeholder=\"Search\" value=\"" + (state.leadsSearch || "").replace(/"/g, "&quot;") + "\" aria-label=\"Search leads\" />" +
      "</div>" +
      "<details class=\"filter-section\" open>" +
      "<summary><span class=\"filter-section-chevron\"></span>Field filters</summary>" +
      "<div class=\"filter-section-options\">" + buildFilterFieldsHTMLTemplate("leads", "leads", state.leadsFilters) + "</div>" +
      "</details>" +
      "</aside>" +
      "<section class=\"module-list\" aria-label=\"Leads list\">" +
      "<div class=\"module-list-header\">" +
      "<span class=\"pagination-group\">" +
      "<span id=\"leads-prev\" class=\"pagination-arrow" + (currentPage <= 1 ? " disabled" : "") + "\" role=\"button\" aria-label=\"Previous page\" tabindex=\"" + (currentPage <= 1 ? "-1" : "0") + "\">&lt;</span>" +
      "<span class=\"pagination-info\">Page " + currentPage + " of " + totalPages + "</span>" +
      "<span id=\"leads-next\" class=\"pagination-arrow" + (currentPage >= totalPages ? " disabled" : "") + "\" role=\"button\" aria-label=\"Next page\" tabindex=\"" + (currentPage >= totalPages ? "-1" : "0") + "\">&gt;</span>" +
      "</span>" +
      "<span class=\"list-meta\"><span class=\"result-count\" aria-live=\"polite\">Showing " + rangeFrom + "\u2013" + rangeTo + " of " + totalCount + "</span></span>" +
      "</div>" +
      "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>" +
      "</section>" +
      "</div></div>";
    bindLeadsFilterListeners();
    const prevButton = document.getElementById("leads-prev");
    const nextButton = document.getElementById("leads-next");
    if (prevButton) prevButton.addEventListener("click", function () { fetchLeadsPage(state.leadsPage - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { fetchLeadsPage(state.leadsPage + 1); });
  }

  /** Renders the contacts table with search, field filters, and pagination. */
  function renderContacts() {
    const contactsList = Array.isArray(state.contacts) ? state.contacts : [];
    const totalCount = state.contactsTotal || 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    const currentPage = Math.max(1, Math.min(state.contactsPage || 1, totalPages));
    const rangeFrom = totalCount ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
    const rangeTo = totalCount ? (currentPage - 1) * PAGE_SIZE + contactsList.length : 0;
    const tableHTML = buildTableHTML("contacts", contactsList, "No contacts match your search.");

    contentEl.innerHTML =
      "<div class=\"card\">" +
      "<div class=\"module-layout\">" +
      "<aside class=\"module-filters\" aria-label=\"Filter contacts\">" +
      "<h2 class=\"module-filters-header\">Filter Contacts by</h2>" +
      "<div class=\"module-filters-search\">" +
      "<input type=\"search\" id=\"contacts-search\" class=\"search-input\" placeholder=\"Search\" value=\"" + (state.contactsSearch || "").replace(/"/g, "&quot;") + "\" aria-label=\"Search contacts\" />" +
      "</div>" +
      "<details class=\"filter-section\" open>" +
      "<summary><span class=\"filter-section-chevron\"></span>Field filters</summary>" +
      "<div class=\"filter-section-options\">" + buildFilterFieldsHTMLTemplate("contacts", "contacts", state.contactsFilters) + "</div>" +
      "</details>" +
      "</aside>" +
      "<section class=\"module-list\" aria-label=\"Contacts list\">" +
      "<div class=\"module-list-header\">" +
      "<span class=\"pagination-group\">" +
      "<span id=\"contacts-prev\" class=\"pagination-arrow" + (currentPage <= 1 ? " disabled" : "") + "\" role=\"button\" aria-label=\"Previous page\" tabindex=\"" + (currentPage <= 1 ? "-1" : "0") + "\">&lt;</span>" +
      "<span class=\"pagination-info\">Page " + currentPage + " of " + totalPages + "</span>" +
      "<span id=\"contacts-next\" class=\"pagination-arrow" + (currentPage >= totalPages ? " disabled" : "") + "\" role=\"button\" aria-label=\"Next page\" tabindex=\"" + (currentPage >= totalPages ? "-1" : "0") + "\">&gt;</span>" +
      "</span>" +
      "<span class=\"list-meta\"><span class=\"result-count\" aria-live=\"polite\">Showing " + rangeFrom + "\u2013" + rangeTo + " of " + totalCount + "</span></span>" +
      "</div>" +
      "<div class=\"module-list-scroll\"><div class=\"module-list-body\"><table class=\"table\">" + tableHTML + "</table></div></div>" +
      "</section>" +
      "</div></div>";
    bindContactsFilterListeners();
    const prevButton = document.getElementById("contacts-prev");
    const nextButton = document.getElementById("contacts-next");
    if (prevButton) prevButton.addEventListener("click", function () { fetchContactsPage(state.contactsPage - 1); });
    if (nextButton) nextButton.addEventListener("click", function () { fetchContactsPage(state.contactsPage + 1); });
  }

  // ------- Initialization -------

  /**
   * Bootstraps the app: loads theme, fetches modules, renders nav and content, and attaches global listeners.
   */
  async function init() {
    bindThemeControls();

    state.modules = await Api.getModules();
    renderNav();
    renderContent();

    document.addEventListener("click", function (event) {
      if (profileOpen) {
        if (
          profilePanel &&
          profileBackdrop &&
          event.target instanceof Node &&
          (event.target === profileBackdrop || !profilePanel.contains(event.target))
        ) {
          closeProfilePanel();
          return;
        }
      }
      if (!moreMenuOpen) return;
      const moreWrap = navEl.querySelector(".nav-more");
      if (!moreWrap) return;
      if (event.target instanceof Node && moreWrap.contains(event.target)) return;
      closeMoreMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        if (profileOpen) closeProfilePanel();
        else closeMoreMenu();
      }
    });

    if (profileBtn) {
      profileBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleProfilePanel();
      });
    }
    if (profileBackdrop) profileBackdrop.addEventListener("click", closeProfilePanel);
    if (profileCloseBtn) profileCloseBtn.addEventListener("click", closeProfilePanel);

    var resizeTimer;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        closeMoreMenu();
        renderNav();
      }, 120);
    });
  }

  init();
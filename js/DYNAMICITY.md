# Full Dynamicity – Implemented

The app is **data-driven**: modules, fields, list data, filters, sort, display behaviour, and locale come from config/API.

---

## Implemented

### Field config (API / mock)

- **`type: "id"`** – Row ID; not shown in create form; read-only in edit form.
- **`type: "text"` | `"number"` | `"select"` | `"module"`** – List and form: text/number inputs, select with options. Module type = select with options from linked module.
- **`name` / `label`** – String or `{ en, ta }`; resolved by locale in `modulesToArray(locale)` and `getModuleFieldsArray(moduleId, locale)`.
- **`placeholder`** – String or `{ en, ta }` for filter/input placeholders.
- **`format`** – Text: `"phone"` | `"email"`. Number: `"currency"` | `"number"` | `"percent"` for display.
- **`currencyCode`** – Optional (e.g. `"₹"`); used when `format: "currency"`.
- **`chipByValue`** – Select: use option value as chip CSS class.
- **`chipPalette`** – Map option value → chip class; options expanded to `{ value, label, chipClass }`.
- **`sortable`** – Only fields with `sortable: true` show sort in list header.
- **`searchable`** – Mock search only includes fields where `searchable !== false`.
- **`hideInList`** – When `true`, field not shown in table or detail overview.
- **`hideInFilter`** – When `true`, field not shown in filter panel.

### Modules and locale

- **Module labels** – In `modulesObj`, each module has `label` (string or `{ en, ta }`). `getModules({ locale })` returns modules with labels and field labels/placeholders resolved for that locale.
- **Language** – `language.js`: `t(key)` for UI strings; locale from localStorage or config; profile panel language selector confirms and reloads. Dashboard and section titles use labels from `state.modules`.

### Views and flows

- **List** – Table from `getModuleFields(moduleId).filter(f => !f.hideInList)`. Rows are clickable (`entity-list-row`, `data-entity-id`).
- **Filter** – Panel from `getModuleFields(moduleId).filter(f => !f.hideInFilter)`; placeholders localized.
- **Entity detail** – Read-only overview, related list sidebar, Edit / Send Email / more. Back clears `activeEntity` and returns to list.
- **Entity form** – Create (Add from list) and Edit (Edit from detail): image placeholder, “{Module} Information” section, two-column field grid, Cancel / Save and New (create only) / Save. Full-width layout.
- **Dashboard** – One screen with four sections (e.g. Recent leads, Work orders, Customers, Services); section titles from `state.modules` by `moduleId`.

### State and routing

- **activeModule** – Current nav module; list or dashboard.
- **activeEntity** – `{ moduleId, entityId }` when viewing/editing an entity; `null` when on list.
- **entityViewMode** – `"detail"` (read-only) or `"edit"` (form). Set by list click (detail) or Edit button (edit).
- **creatingModule** – `moduleId` when create form is open; `null` otherwise.
- **entityData[moduleId]** – list, total, page, filters, sortBy, sortOrder per module.

### API (mock)

- **getModules(options)** – Returns modules array with resolved labels for `options.locale`.
- **getModuleData(moduleId, options)** – Paginated, filtered, sorted list.
- **getEntity(moduleId, entityId)** – Single entity by id.
- **updateEntity(moduleId, entityId, data)** – Updates entity in mock list; returns updated entity.
- **createEntity(moduleId, data)** – Appends new entity with generated id; returns it.

### Config and bootstrap

- **config.rtl** – Sets `dir` on `<html>` (ltr/rtl).
- **config.localeStorageKey**, **config.defaultLocale** – Language persistence and fallback.
- **document.title** – Set from `state.portal.name` (if set) or `language.t("appName")` and tagline after init and on locale change.

### Module setup templates

During signup, the module setup step offers **predefined templates**: Leads, Contacts, Products, Services, Invoice, Tasks. Users can opt into one or more instead of configuring from scratch. "Start from scratch" adds an empty module.

### Bootstrap: build app from signup/load data

On init (or after signup/login), the app calls **`api.getBootstrap({ locale })`** to load:

- **user** – Current user (name, email, role, initials). Stored in `state.currentUser`.
- **portal** – Organization/portal (name, portalName, version, baseURL). Stored in `state.portal`; used for document title and Settings → Organization.
- **modules** – Full module list (id, label, fields). Stored in `state.modules`; drives nav and all entity flows.

The whole app is then built from this data: topbar nav (from modules), entity lists/forms (from module fields), dashboard sections, Settings.

**Static (common for every app):**

- **Dashboard** – Always present. If the API does not return a module with `id: "dashboard"`, it is injected with a default label and empty fields. Shown in nav and content.
- **Settings** – Always available from the profile panel (Setup: Organization, Staffs, Module configuration, Field configuration).
- **Staffs** – Always present in `state.modules` for Settings → Staffs; not shown in the main nav. If the API does not return `id: "staffs"`, it is injected with minimal fields (id, name, role, email, phone).

**Dynamic:** Everything else (nav modules, entity modules, portal name, user) comes from the bootstrap response. Adding/removing modules in the API (or via Settings → Module configuration) changes the nav and content without code changes.

### API (mock) – bootstrap

- **getBootstrap(options)** – Returns `Promise<{ user, portal, modules }>` (parallel getCurrentUser, getPortalDetails, getModules). Use after signup or on app load to build the app.

---

## Optional (not implemented)

- **Config from API** – e.g. `getPortalConfig()` for pageSize, feature flags.
- **Persist primary nav order** – e.g. user preferences API.
- **Real API endpoints** – Replace mock with fetch to backend for modules, list, entity CRUD.

---

## Summary

Adding or changing modules and fields in the API (or `mock-api.js`) drives list, filters, sort, detail view, create/edit form, dashboard sections, and locale. No hardcoded module or field ids in view/controller logic.

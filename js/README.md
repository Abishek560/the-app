# Frontend – MVC Structure

This folder is organized by **MVC** (Model–View–Controller) and **module segregation** for readability and maintainability.

## Load order (index.html)

Scripts must run in this order (dependencies first):

1. **mock-api.js** – Mock API (modules, list data, getEntity, updateEntity, createEntity). No theApp dependency.
2. **config.js** – Constants (API, pagination, theme, locale keys).
3. **locales/en.js**, **locales/ta.js** – Translation objects per locale.
4. **language.js** – i18n: `t(key)`, `getLocale()`, `setLocale()`, `applyToDocument()`. Merges locales. Module labels come from API.
5. **errorPopup.js** – Custom error popup.
6. **api.js** – API client (uses `theApp.config`). getModules(options), getModuleData(), getEntity(), updateEntity(), createEntity(), getCurrentUser().
7. **model/state.js** – Application state, `getEntityData()`, `getModuleFields()`. State includes `activeModule`, `activeEntity`, `entityViewMode`, `creatingModule`, `entityData`, `modules`, etc.
8. **view/** – All view modules (use `theApp.state`, `theApp.getModuleFields`, etc.).
   - themeView, entityListView, topbarView, contentView, entityModuleView, entityDetailView, entityFormView, settingsView, onboardingView, moduleSetupView, dashboardView.
9. **controller/** – All controllers (use `theApp.state`, `theApp.api`, `theApp.view`).
   - themeController, dashboardController, navController, entityController, entityDetailController, entityFormController, settingsController, onboardingController, moduleSetupController, appController.
10. **main.js** – Applies saved theme immediately, then calls `theApp.controller.app.init()`.

## Responsibilities

| Layer       | Role |
|------------|------|
| **Model**  | `state` = single source of truth; `state.entityData[moduleId]` = list/filters/pagination per module; `state.activeEntity` / `entityViewMode` / `creatingModule` for detail/edit/create; `getModuleFields(moduleId)` = field config from `state.modules`. |
| **View**   | Pure presentation: build HTML, update DOM. No event binding or API calls. |
| **Controller** | User actions: call API, update state, call views, bind events. Entity list, detail, and form flows are dynamic (one controller/view per concern for any module). |

## Namespace

Everything is attached to `window.theApp`:

- `theApp.config` – config (api, pageSize, theme, locale, rtl, etc.)
- `theApp.api` – getModules, getModuleData, getEntity, updateEntity, createEntity, getCurrentUser
- `theApp.state` – modules, activeModule, activeEntity, entityViewMode, creatingModule, entityData, currentUser, primaryOrder, theme, accent
- `theApp.getEntityData`, `theApp.getModuleFields` – model helpers
- `theApp.language` – t, getLocale, setLocale, init, applyToDocument, setOnLocaleChange, notifyLocaleChange
- `theApp.view.theme | topbar | entityList | entityModule | content | entityDetail | entityForm | dashboard` – views
- `theApp.controller.theme | nav | entity | entityDetail | entityForm | dashboard | app` – controllers

## Fully data-driven

**Module names, field labels, placeholders, and list data** come from the API (or `mock-api.js`). The app does not hardcode module or field config.

- **Modules** – `mock-api.js` exposes `modulesObj` (id, label as string or `{ en, ta }`, fields). `getModules({ locale })` returns an array with resolved labels and field labels/placeholders for that locale.
- **To rename a module or field** – Change `label` / `name` / `placeholder` in `modulesObj` (or use `{ en, ta }` for i18n). No change in js/.
- **To add a module** – Add an entry to `modulesObj` and a data array in mock (e.g. `mockDataObj[moduleId]`). Nav and list work for any module id.
- **Entity detail** – Clicking a list row sets `state.activeEntity` and shows read-only detail; Edit opens the form; Back returns to list.
- **Create** – Add button sets `state.creatingModule` and shows the create form. Cancel/Save return to list.

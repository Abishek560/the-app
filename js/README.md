# Frontend – MVC Structure

This folder is organized by **MVC** (Model–View–Controller) and **module segregation** for readability and maintainability.

## Load order (index.html)

Scripts must run in this order (dependencies first):

1. **config.js** – Constants (API, pagination, theme keys).
2. **api.js** – API client (uses `theApp.config`).
3. **model/state.js** – Application state and `getModuleFields()` (uses `theApp.config`).
4. **view/** – All view modules (use `theApp.state`, `theApp.getEntityData`, `theApp.getModuleFields`, `theApp.config`).
   - themeView, entityListView, topbarView, contentView, entityModuleView (dynamic for any module with fields).
5. **controller/** – All controllers (use `theApp.state`, `theApp.api`, `theApp.view`).
   - themeController, navController, entityController (dynamic), appController.
6. **main.js** – Applies saved theme immediately, then calls `theApp.controller.app.init()`.

## Responsibilities

| Layer     | Role |
|----------|------|
| **Model** | `state` = single source of truth; `state.entityData[moduleId]` = list/search/filters per module; `getModuleFields(moduleId)` = field config. |
| **View**  | Pure presentation: build HTML, update DOM. No event binding or API calls. |
| **Controller** | User actions: call API, update state, call views, bind events. Entity flow is dynamic (one controller/view for any module with fields). |

## Namespace

Everything is attached to `window.theApp`:

- `theApp.config` – config
- `theApp.api` – API methods
- `theApp.state` – state object
- `theApp.getModuleFields` – model helper
- `theApp.view.theme | topbar | entityList | entityModule | content` – views
- `theApp.controller.theme | nav | entity | app` – controllers

## Fully data-driven: change strings only

**Module names, field labels, and list data** come only from the API (or `mock-api.js`). The app code does not hardcode any module id or field config.

- **To rename a module:** Change the `label` string in `mock-api.js` → `mockDataObj.modules[].label` (or in your API). No change in api.js or state.js.
- **To add a module:** In `mock-api.js` add one entry to `mockDataObj.modules` (`id`, `label`, `fields`) and a data array `mockDataObj[moduleId]`. No code change in api.js or state.js – `getModuleData(moduleId)` and nav work for any module id.
- **To change field labels/options:** Edit only `mockDataObj.modules[].fields` (or your API). `getModuleFields(moduleId)` reads from `state.modules` only; state.js has no default field lists.
- **Initial tab:** The first module in `modules` is selected on load (`state.activeModule = state.modules[0].id`).

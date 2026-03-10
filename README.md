# The App

A data-driven CRM-style single-page application. Modules, fields, and entity lists are fully configurable via API or mock data—no hardcoded module names in the frontend.

## Features

- **Dashboard** — Overview with configurable sections (e.g. Recent leads, Customers).
- **Entity modules** — Dynamic list, filters, sort, pagination; entity detail view; create/edit forms. Works for any module defined in the API.
- **Settings** — Organization (portal) details; **Modules & fields** tab to add/edit modules and their fields.
- **Onboarding** — Sign up (name, email, organization); optional **Set up your modules** step with template picker (Leads, Contacts, Products, etc.) or start from scratch.
- **Profile panel** — User info, theme (light/dark/system), accent (amber/blue/green), language (English/Tamil).
- **i18n** — UI and module/field labels support locale (`en` / `ta`); language persisted in localStorage.

## Tech stack

- Vanilla JavaScript (no framework). Scripts load in a fixed order (see [Load order](#load-order)).
- HTML5, CSS (custom properties for theming, responsive layout).
- Mock API by default; real API via `fetch` with fallback to mock on failure.

## Getting started

### Run locally

No build step. Open the app in a browser:

```bash
# From project root – open directly (file://)
open index.html

# Or serve over HTTP (recommended if you use fetch to a real API)
npx serve .
# or: python3 -m http.server 8000
```

Then open `http://localhost:3000` (or the port your server uses).  
**Note:** Mock data is loaded from Firebase Realtime Database (or local `data/app-data.json` as fallback). Serve the project over HTTP (e.g. `npx serve .`) so the fetch works. **Firebase writes:** Create, update, and entity edits are persisted to Firebase when the mock API is used. Configure Firebase Realtime Database rules to allow read/write (e.g. `".read": true, ".write": true` for development).

### First run

1. **Onboarding** — Enter name, email, organization; optionally set up modules from templates or add your own.
2. **Finish** — App loads portal + user + modules and shows the dashboard.
3. Use the **topbar** to switch between Dashboard and entity modules; **Profile** (avatar) for theme, language, and Settings.

## Project structure

```
├── index.html              # Shell: topbar, profile panel, content area, scripts in order
├── styles.css              # Global styles, theme variables, layout
├── data/
│   └── app-data.json       # Mock + populate data (fetched via AJAX on load)
├── mock-data.js            # Optional: source for mock data (used to generate app-data.json)
├── populate-data.js        # Optional: source for signup sample + module templates (→ app-data.json)
├── mock-api.js             # Mock API: fetches data/app-data.json, then getModules, getModuleData, …
├── scripts/
│   └── build-app-data.js   # Regenerates data/app-data.json from mock-data.js + populate-data.js
└── js/
    ├── config.js           # API baseURL, portalName, pageSize, theme/locale keys
    ├── main.js             # Entry: apply saved theme, then app.controller.app.init()
    ├── api.js              # API client (fetch first, fallback to MockApi)
    ├── language.js         # i18n: t(), getLocale(), setLocale(), merge en/ta
    ├── errorPopup.js       # Error dialog
    ├── model/
    │   └── state.js        # Application state (modules, activeModule, entityData, portal, …)
    ├── view/               # Views render HTML; no event binding or API calls
    │   ├── themeView.js
    │   ├── topbarView.js
    │   ├── contentView.js
    │   ├── entityListView.js
    │   ├── entityModuleView.js
    │   ├── entityDetailView.js
    │   ├── entityFormView.js
    │   ├── dashboardView.js
    │   ├── settingsView.js
    │   ├── onboardingView.js
    │   └── moduleSetupView.js
    ├── controller/         # Controllers handle events, API, state, and call views
    │   ├── appController.js      # Bootstrap, content routing, topbar mode
    │   ├── navController.js
    │   ├── themeController.js
    │   ├── dashboardController.js
    │   ├── entityController.js
    │   ├── entityDetailController.js
    │   ├── entityFormController.js
    │   ├── settingsController.js
    │   ├── onboardingController.js
    │   └── moduleSetupController.js
    ├── locales/
    │   ├── en.js           # English strings (appName, buttons, labels, …)
    │   └── ta.js           # Tamil strings
    ├── README.md           # MVC, load order, namespace (theApp)
    ├── API.md              # REST API reference (portals, users, modules, entities)
    ├── API_CALL_STACK.md   # API call flow: signup/login, bootstrap, entity CRUD, mock fallback
    └── DYNAMICITY.md       # Data-driven behaviour: field types, state, bootstrap
```

## Load order

Scripts in `index.html` must run in this order:

1. `mock-data.js`, `populate-data.js`, `mock-api.js` — Data and mock API (no `theApp`).
2. `config.js` — Constants.
3. `locales/en.js`, `locales/ta.js`, `language.js` — i18n.
4. `errorPopup.js`, `api.js` — API client.
5. `model/state.js` — State and helpers.
6. All `view/*.js` — Views.
7. All `controller/*.js` — Controllers (`appController.js` last among controllers).
8. `main.js` — Applies saved theme and calls `theApp.controller.app.init()`.

See [js/README.md](js/README.md) for details.

## Configuration

- **js/config.js** — `api.baseURL`, `api.portalName`, `pageSize`, `themeStorageKey`, `localeStorageKey`, `defaultLocale`, `themeModes`, `accentValues`.
- **App name** — Set in locales (`js/locales/en.js`, `js/locales/ta.js`) as `appName`; used in topbar and `document.title`.
- **RTL** — `config.rtl = true` sets `dir="rtl"` on `<html>`.

## API

The app calls a REST-style API for portals, users, modules, and entity CRUD. By default it uses the **mock API** (`mock-api.js`). To use a real backend:

- Set `config.api.baseURL` and ensure CORS if needed.
- Implement the endpoints described in [js/API.md](js/API.md). On failure (e.g. 404 or network error), the client falls back to the mock.
- See [js/API_CALL_STACK.md](js/API_CALL_STACK.md) for the full API call flow from signup/login through entity CRUD.

Bootstrap flow: `getBootstrap({ locale })` → `{ user, portal, modules }` → stored in `state`; nav and content are built from `state.modules`.

## Namespace

Everything is on `window.theApp`:

| Property | Description |
|----------|-------------|
| `theApp.config` | API, pagination, theme/locale keys |
| `theApp.api` | getModules, getModuleData, getEntity, updateEntity, createEntity, getCurrentUser, getBootstrap |
| `theApp.state` | modules, activeModule, activeEntity, entityData, portal, currentUser, theme, accent, settingsOpen, setupModules, … |
| `theApp.getEntityData` | Per-module list/filters/pagination |
| `theApp.getModuleFields` | Field config for a module (from state.modules) |
| `theApp.getModuleLabel` | Display label for a module (locale-aware) |
| `theApp.language` | t(), getLocale(), setLocale(), applyToDocument() |
| `theApp.view.*` | theme, topbar, entityList, entityModule, content, entityDetail, entityForm, dashboard, settings, onboarding, moduleSetup |
| `theApp.controller.*` | theme, nav, entity, entityDetail, entityForm, dashboard, settings, onboarding, moduleSetup, app |

**Regenerating app data:** After editing `mock-data.js` or `populate-data.js`, rebuild `data/app-data.json` with: `node scripts/build-app-data.js`

## Further documentation

- [js/README.md](js/README.md) — MVC, load order, namespace, data-driven modules.
- [js/API.md](js/API.md) — REST API reference (portals, users, modules, entity list/detail/create/update).
- [js/DYNAMICITY.md](js/DYNAMICITY.md) — Field types, state, bootstrap, module-setup templates.

## License

Unlicensed (check repo for any added license file).

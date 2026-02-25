# Full Dynamicity – Implemented

The app is **data-driven**: modules, fields, list data, filters, sort, and display behaviour come from config/API.

---

## Implemented

### Field config (API / mock)

- **`type: "id"`** – Row ID column; mock generates `rowIndex + 1`. No hardcoded field id.
- **`format`** – Text: `"phone"` | `"email"` for mock value generation. Number: `"currency"` | `"number"` | `"percent"` for display.
- **`currencyCode`** – Optional (e.g. `"₹"`); used when `format: "currency"`.
- **`chipByValue`** – Select: use option value as chip CSS class (e.g. "in-progress").
- **`chipPalette`** – Map option value → chip class; options are expanded to `{ value, label, chipClass }` so view can style by data.
- **`sortable`** – Only fields with `sortable: true` show sort in header and are accepted for sort in API.
- **`searchable`** – Mock search only includes fields where `searchable !== false`. Omit or `true` = searchable.
- **`hideInList`** – When `true`, field is not shown in the table.
- **`hideInFilter`** – When `true`, field is not shown in the filter panel.

### View

- **Number format** – `formatCellValue` uses `field.format` and `field.currencyCode` for number columns (currency / number / percent).
- **Chip** – Uses `option.chipClass` when present, else `field.chipByValue` (value as class), else `chip-default`.
- **List** – Table built from `getModuleFields(moduleId).filter(f => !f.hideInList)`.
- **Filter** – Filter panel built from `getModuleFields(moduleId).filter(f => !f.hideInFilter)`.

### Config & bootstrap

- **`config.appName`** – Set in config; `document.title` is set to it after init (appController).

### Optional (not implemented)

- **Config from API** – e.g. `getPortalConfig()` for `pageSize`, feature flags; merge after modules load.
- **Persist primary nav order** – e.g. user preferences API for cross-session order.

---

## Summary

Adding or changing modules and fields in the API (or `mock-api.js`) drives list, filters, sort, search scope, visibility, number format, and chip styling. No hardcoded module or field ids in view/controller logic.

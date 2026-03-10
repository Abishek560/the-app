# API Reference

All API calls use `fetch()` first (visible in browser Network tab). On failure (404, network error), the app falls back to `MockApi`. No server required; requests will fail until you implement the backend.

## Base URLs

- **Top-level**: `/api/v1/{resource}` — for portals, users
- **Portal-scoped**: `/api/v1/portals/{portalName}/{resource}` — for me, portal, modules, entities

Config: `theApp.config.api` — `baseURL`, `version`, `portalName`

---

## Top-level (no portal)

### POST /api/v1/portals

Create a new portal.

**Request body:**
```json
{
  "name": "My Org",
  "portalName": "myportal",
  "version": "v1",
  "baseURL": ""
}
```

**Response:** portal object `{ name, portalName, version, baseURL }`

---

### POST /api/v1/users

Create a user (signup).

**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Manager"
}
```

**Response:** user object `{ id, name, email, role, ... }`

---

## Portal-scoped (/api/v1/portals/{portalName}/)

### GET me

Current user for this portal.

**Response:** `{ id, name, email, role, initials }` or null

---

### GET portal

Portal details.

**Response:** `{ name, portalName, version, baseURL }`

---

### PUT portal

Update portal details.

**Request body:**
```json
{
  "name": "My Org",
  "portalName": "myportal",
  "version": "v1",
  "baseURL": "https://api.example.com"
}
```

---

### GET modules?locale={en|ta}

List modules with labels resolved for locale.

**Response:** array of `{ id, label, fields: [{ id, label, type, ... }] }`

---

### POST modules

Create modules (server assigns IDs).

**Request body:**
```json
{
  "modules": [
    {
      "label": "Customers",
      "fields": [
        { "id": "name", "label": "Name", "type": "text" },
        { "id": "email", "label": "Email", "type": "text" }
      ]
    }
  ]
}
```

**Response:** array of `{ id, label, fields }` with server-assigned `id`

---

### GET {moduleId}?page=1&limit=20&search=&...

Entity list for a module. Pagination, search, filters.

**Response:**
```json
{
  "data": [...],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}
```

---

### GET {moduleId}/{entityId}

Single entity.

---

### POST {moduleId}

Create entity. Body: entity fields (without id; server assigns).

---

### PUT {moduleId}/{entityId}

Update entity. Body: fields to update.

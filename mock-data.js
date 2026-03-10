/**
 * Mock data – app config + CRUD fallback only.
 * Config: currentUser (profile), portal from config.
 * Entity modules (module1…module9) are created at runtime via createModules.
 */
window.__MOCK_DATA__ = {
  "modules": {},
  "mockData": {
    "currentUser": {
      "id": 1,
      "name": "Priya",
      "email": "priya@garage.example.com",
      "initials": "P"
    }
  }
};

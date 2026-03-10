/**
 * Build data/app-data.json from mock-data.js and populate-data.js.
 * Run from project root: node scripts/build-app-data.js
 */
var fs = require("fs");
var path = require("path");

var root = path.resolve(__dirname, "..");
var mockSrc = fs.readFileSync(path.join(root, "mock-data.js"), "utf8");
var popSrc = fs.readFileSync(path.join(root, "populate-data.js"), "utf8");

var mockData = null;
var populateData = null;
try {
  mockData = eval("(" + mockSrc.replace(/window\.__MOCK_DATA__\s*=\s*/, "").replace(/;\s*$/, "") + ")");
} catch (e) {
  console.error("mock-data.js parse error:", e.message);
}
try {
  populateData = eval("(" + popSrc.replace(/window\.__POPULATE_DATA__\s*=\s*/, "").replace(/;\s*$/, "") + ")");
} catch (e) {
  console.error("populate-data.js parse error:", e.message);
}

var out = {
  mockData: mockData || { modules: {}, mockData: { currentUser: {} } },
  populateData: populateData || { signupSample: {}, moduleSetupTemplates: { groups: [] } }
};

var dataDir = path.join(root, "data");
fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(path.join(dataDir, "app-data.json"), JSON.stringify(out, null, 2), "utf8");
console.log("Wrote data/app-data.json");

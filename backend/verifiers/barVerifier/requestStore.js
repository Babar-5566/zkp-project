/**
 * Persistent Request Store
 * -----------------------------------------------------------
 * Stores proof requests on disk so they survive server restarts.
 * Each request is saved as a separate JSON file in data/requests/.
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data", "requests");

// In-memory cache for fast lookups
let requests = {};

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadAllRequests() {
  ensureStorage();
  try {
    const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith(".json"));
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
      const id = path.basename(file, ".json");
      requests[id] = data;
    }
    console.log(`📋 Loaded ${Object.keys(requests).length} proof requests from disk.`);
  } catch (err) {
    console.error("⚠️ Failed to load requests:", err.message);
  }
}

function saveRequest(id, data) {
  ensureStorage();
  requests[id] = data;
  fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(data, null, 2));
}

function getRequest(id) {
  return requests[id] || null;
}

function getAllRequests() {
  return requests;
}

// Load on module import
loadAllRequests();

module.exports = { saveRequest, getRequest, getAllRequests };

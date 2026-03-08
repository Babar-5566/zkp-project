/**
 * Persistent Nullifier Store
 * -----------------------------------------------------------
 * Stores used nullifiers on disk so they survive server restarts.
 * Prevents proof replay attacks (double-spending).
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const NULLIFIER_FILE = path.join(DATA_DIR, "nullifiers.json");

// In-memory Set for fast lookups, backed by file
let usedNullifiers = new Set();

function ensureStorage() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadNullifiers() {
  ensureStorage();
  if (fs.existsSync(NULLIFIER_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(NULLIFIER_FILE, "utf8"));
      usedNullifiers = new Set(data);
      console.log(`🔒 Loaded ${usedNullifiers.size} used nullifiers from disk.`);
    } catch (err) {
      console.error("⚠️ Failed to load nullifiers, starting fresh:", err.message);
      usedNullifiers = new Set();
    }
  }
}

function saveNullifiers() {
  ensureStorage();
  fs.writeFileSync(NULLIFIER_FILE, JSON.stringify([...usedNullifiers], null, 2));
}

function hasNullifier(nullifier) {
  return usedNullifiers.has(nullifier);
}

function addNullifier(nullifier) {
  usedNullifiers.add(nullifier);
  saveNullifiers();
}

// Load on module import
loadNullifiers();

module.exports = { hasNullifier, addNullifier };

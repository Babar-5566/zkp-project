const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "../data");
const DATA_FILE = path.join(DATA_DIR, "accumulator.json");
const TEMP_FILE = path.join(DATA_DIR, "accumulator.tmp.json");

function ensureStorage() {
    // Create folder if missing
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Create file if missing
    if (!fs.existsSync(DATA_FILE)) {
        const initialState = {
            id: "revocation-list-1",
            revokedIndices: [],
            nextIndex: 1
        };

        atomicWrite(initialState);
    }
}

function loadState() {
    ensureStorage();
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw);
}

// ⭐ Atomic write (crash-safe)
function atomicWrite(state) {
    fs.writeFileSync(TEMP_FILE, JSON.stringify(state, null, 2));
    fs.renameSync(TEMP_FILE, DATA_FILE);
}

function saveState(state) {
    atomicWrite(state);
}

function resetAccumulator() {
    const cleanState = {
        id: "revocation-list-1",
        revokedIndices: [],
        nextIndex: 1
    };

    saveState(cleanState);

    console.log("Accumulator reset complete");
}

function allocateIndex() {
    const state = loadState();

    const index = state.nextIndex++;
    saveState(state);

    return index;
}

function revoke(index) {
    const state = loadState();

    if (!state.revokedIndices.includes(index)) {
        state.revokedIndices.push(index);
        saveState(state);
    }
}

function isRevoked(index) {
    const state = loadState();
    return state.revokedIndices.includes(index);
}

function getAccumulatorState() {
    return loadState();
}

module.exports = {
    allocateIndex,
    revoke,
    isRevoked,
    getAccumulatorState,
    resetAccumulator
};
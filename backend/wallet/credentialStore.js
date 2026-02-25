const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const WALLET_PATH = path.join(__dirname, "wallet.json");

function loadWallet() {
    if (!fs.existsSync(WALLET_PATH)) {
        fs.writeFileSync(WALLET_PATH, JSON.stringify({ credentials: [] }, null, 2));
    }

    try {
        return JSON.parse(fs.readFileSync(WALLET_PATH));
    } catch (err) {
        return { credentials: [] };
    }
}

function saveWallet(wallet) {
    fs.writeFileSync(WALLET_PATH, JSON.stringify(wallet, null, 2));
}

function hashCredential(credential) {
    return crypto
        .createHash("sha256")
        .update(JSON.stringify(credential))
        .digest("hex");
}

function storeCredential(credential) {
    const wallet = loadWallet();

    const credentialHash = hashCredential(credential);

    const storedCredential = {
        ...credential,
        credentialHash,
        storedAt: Date.now()
    };

    wallet.credentials.push(storedCredential);
    saveWallet(wallet);

    return storedCredential;
}

function getLatestCredential(documentType = null) {
    const creds = loadWallet().credentials;

    if (!creds.length) return null;

    if (documentType) {
        const filtered = creds
            .filter(c => c.documentType === documentType)
            .sort((a, b) => b.storedAt - a.storedAt);

        return filtered.length ? filtered[0] : null;
    }

    return creds.sort((a, b) => b.storedAt - a.storedAt)[0];
}

module.exports = {
    storeCredential,
    getLatestCredential
};

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
    return crypto.createHash("sha256").update(JSON.stringify(credential)).digest("hex");
}

function storeCredential(credential) {
    const wallet = loadWallet();

    // 🚀 স্মার্ট লজিক: ফ্রন্ট-এন্ড থেকে যে নামেই আসুক, আমরা রুট লেভেলে সেট করে নেব
    const typeName = credential.idType || credential.documentType || credential.data?.idType || credential.credentialSubject?.idType || "Unknown";
    
    // 🚀 DOB টাকেও রুট লেভেলে আনছি যাতে generateProof.js এরর না দেয়
    const extractedDob = credential.dob || credential.data?.dob || credential.credentialSubject?.dob || null;

    const storedCredential = {
        ...credential,
        idType: typeName,
        documentType: typeName,
        dob: extractedDob, 
        credentialHash: hashCredential(credential),
        storedAt: Date.now()
    };

    wallet.credentials.push(storedCredential);
    saveWallet(wallet);

    console.log(`✅ STORED: [${typeName}] in wallet.json`);
    return storedCredential;
}

function getCredentials() {
    return loadWallet().credentials;
}

function getLatestCredential(documentType = null) {
    const creds = loadWallet().credentials;
    console.log(`🔍 SEARCHING: Looking for -> "${documentType}"`);

    if (!creds.length) {
        console.log(`❌ FAILED: Wallet is completely empty!`);
        return null;
    }

    if (documentType) {
        // স্পেস এবং ছোট হাতের/বড় হাতের অক্ষর সব বাদ দিয়ে সার্চ করবে (যেমন "PAN Card" -> "pancard")
        const searchStrAggressive = String(documentType).replace(/\s+/g, '').toLowerCase();

        const filtered = creds.filter(c => {
            const id1 = String(c.idType || "").replace(/\s+/g, '').toLowerCase();
            const id2 = String(c.documentType || "").replace(/\s+/g, '').toLowerCase();
            const id3 = String(c.credentialSubject?.idType || "").replace(/\s+/g, '').toLowerCase();
            const id4 = String(c.data?.idType || "").replace(/\s+/g, '').toLowerCase();
            
            return (id1 === searchStrAggressive || id2 === searchStrAggressive || id3 === searchStrAggressive || id4 === searchStrAggressive);
        }).sort((a, b) => b.storedAt - a.storedAt);

        if (filtered.length > 0) {
            console.log(`✅ MATCH FOUND: Returning ${filtered[0].idType}`);
            return filtered[0];
        } else {
            console.log(`❌ FAILED: Could not find "${documentType}" in wallet.json`);
            return null;
        }
    }

    return creds.sort((a, b) => b.storedAt - a.storedAt)[0];
}

module.exports = {
    storeCredential,
    getLatestCredential,
    getCredentials 
};
const fs = require("fs");
const path = require("path");
const nodeCrypto = require("crypto");
const { generateBls12381G2KeyPair } = require("@mattrglobal/bbs-signatures");

const KEY_PATH = path.join(__dirname, "issuerKeys.json");
const ALGORITHM = "aes-256-cbc";

let keyPair;

/**
 * Encrypt a string using AES-256-CBC with the KEY_PASSPHRASE from .env
 */
function encryptSecret(plainBase64) {
  const passphrase = process.env.KEY_PASSPHRASE;
  if (!passphrase) throw new Error("KEY_PASSPHRASE not set in .env");

  const key = nodeCrypto.scryptSync(passphrase, "issuer-key-salt", 32);
  const iv = nodeCrypto.randomBytes(16);
  const cipher = nodeCrypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainBase64, "utf8", "hex");
  encrypted += cipher.final("hex");

  return { encrypted, iv: iv.toString("hex") };
}

/**
 * Decrypt an encrypted secret key back to base64
 */
function decryptSecret(encryptedHex, ivHex) {
  const passphrase = process.env.KEY_PASSPHRASE;
  if (!passphrase) throw new Error("KEY_PASSPHRASE not set in .env");

  const key = nodeCrypto.scryptSync(passphrase, "issuer-key-salt", 32);
  const iv = Buffer.from(ivHex, "hex");
  const decipher = nodeCrypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}

async function initializeKeys() {
  if (fs.existsSync(KEY_PATH)) {
    const stored = JSON.parse(fs.readFileSync(KEY_PATH));

    // Handle encrypted format (new)
    if (stored.encryptedSecretKey) {
      const secretKeyBase64 = decryptSecret(stored.encryptedSecretKey, stored.iv);
      keyPair = {
        publicKey: Buffer.from(stored.publicKey, "base64"),
        secretKey: Buffer.from(secretKeyBase64, "base64")
      };
      console.log("🔐 Issuer keys loaded (secret key decrypted from disk).");
    }
    // Handle plain format (legacy — auto-migrate)
    else if (stored.secretKey) {
      keyPair = {
        publicKey: Buffer.from(stored.publicKey, "base64"),
        secretKey: Buffer.from(stored.secretKey, "base64")
      };

      // Auto-migrate: encrypt and re-save
      const { encrypted, iv } = encryptSecret(stored.secretKey);
      fs.writeFileSync(KEY_PATH, JSON.stringify({
        publicKey: stored.publicKey,
        encryptedSecretKey: encrypted,
        iv
      }, null, 2));

      console.log("🔐 Issuer keys migrated: secret key now encrypted on disk.");
    }
  } else {
    keyPair = await generateBls12381G2KeyPair();

    const publicKeyBase64 = Buffer.from(keyPair.publicKey).toString("base64");
    const secretKeyBase64 = Buffer.from(keyPair.secretKey).toString("base64");

    const { encrypted, iv } = encryptSecret(secretKeyBase64);

    fs.writeFileSync(KEY_PATH, JSON.stringify({
      publicKey: publicKeyBase64,
      encryptedSecretKey: encrypted,
      iv
    }, null, 2));

    console.log("🔐 Issuer keys generated (secret key encrypted on disk).");
  }
}

function getKeyPair() {
  return keyPair;
}

module.exports = {
  initializeKeys,
  getKeyPair
};

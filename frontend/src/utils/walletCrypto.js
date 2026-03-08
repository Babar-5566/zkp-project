/**
 * Wallet Crypto Utilities
 * -----------------------------------------------------------
 * Encrypts/decrypts credential data in localStorage using
 * AES-256-GCM via the Web Crypto API.
 *
 * The encryption key is derived from the holderSecret using
 * PBKDF2 with a fixed salt (since we need deterministic key
 * derivation from the same secret).
 */

const SALT = new TextEncoder().encode("zkp-wallet-salt-v1");
const STORAGE_KEY = "credentials_encrypted";

/**
 * Derive an AES-256-GCM key from a hex string secret using PBKDF2.
 */
async function deriveKey(secretHex) {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretHex),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: SALT,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt credentials array and store in localStorage.
 * @param {Array} credentials - The credentials array to encrypt
 * @param {string} secretHex - The holder secret (hex string)
 */
export async function encryptAndStore(credentials, secretHex) {
  try {
    const key = await deriveKey(secretHex);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const plaintext = new TextEncoder().encode(JSON.stringify(credentials));

    const ciphertext = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      plaintext
    );

    // Store IV + ciphertext together as base64
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);

    localStorage.setItem(STORAGE_KEY, btoa(String.fromCharCode(...combined)));

    // Remove old unencrypted credentials if they exist
    localStorage.removeItem("credentials");
  } catch (err) {
    console.error("Encryption failed, falling back to plain storage:", err);
    localStorage.setItem("credentials", JSON.stringify(credentials));
  }
}

/**
 * Decrypt credentials from localStorage.
 * @param {string} secretHex - The holder secret (hex string)
 * @returns {Array} Decrypted credentials array
 */
export async function decryptFromStore(secretHex) {
  try {
    // Check for encrypted data first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const key = await deriveKey(secretHex);
      const combined = Uint8Array.from(atob(stored), c => c.charCodeAt(0));

      const iv = combined.slice(0, 12);
      const ciphertext = combined.slice(12);

      const plaintext = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        ciphertext
      );

      return JSON.parse(new TextDecoder().decode(plaintext));
    }

    // Fallback: migrate old unencrypted credentials
    const plain = localStorage.getItem("credentials");
    if (plain) {
      const creds = JSON.parse(plain);
      // Migrate: encrypt and re-store
      if (creds.length > 0) {
        await encryptAndStore(creds, secretHex);
      }
      return creds;
    }

    return [];
  } catch (err) {
    console.error("Decryption failed:", err);
    // If decryption fails (e.g., secret changed), return empty
    return [];
  }
}

const { blsSign } = require("@mattrglobal/bbs-signatures");
const { getKeyPair } = require("../config/keys");

/**
 * Sign attributes using BBS+ for selective disclosure
 * @param {Array} attributes - array of strings like ["fullName:Alice", "dob:2000-01-01"]
 * @param {String} context - domain label like "DrivingLicense"
 * @returns Base64 encoded signature
 */
async function signAttributes(attributes, context = "Default") {
  try {
    const keyPair = getKeyPair();

    if (!keyPair || !keyPair.publicKey || !keyPair.secretKey) {
      throw new Error("Issuer key pair is not initialized");
    }

    // 1️⃣ Sort attributes to ensure deterministic signature
    const sortedAttributes = [...attributes].sort();

    // 2️⃣ Encode attributes as Uint8Array
    const messages = sortedAttributes.map(attr => new TextEncoder().encode(attr));

    // 3️⃣ Encode context as Uint8Array (prevents cross-domain misuse)
    const contextEncoded = new TextEncoder().encode(context);

    // 4️⃣ Generate BBS+ signature
    const signature = await blsSign({
      keyPair,
      messages,
      context: contextEncoded
    });

    // 5️⃣ Return signature as Base64 string for easy storage/transmission
    return Buffer.from(signature).toString("base64");

  } catch (err) {
    console.error("Error in signAttributes:", err);
    throw new Error(`BBS+ signing failed: ${err.message}`);
  }
}

module.exports = { signAttributes };

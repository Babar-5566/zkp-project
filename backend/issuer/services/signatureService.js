const { blsSign } = require("@mattrglobal/bbs-signatures");
const { getKeyPair } = require("../config/keys");

/**
 * Sign attributes using BBS+ for selective disclosure
 * @param {Array} attributes - ["fullName:Alice", "dob:2000-01-01"]
 * @param {String} context - domain label like "AadhaarCard"
 */
async function signAttributes(attributes, context = "Default") {
  try {
    const keyPair = getKeyPair();

    if (!keyPair || !keyPair.publicKey || !keyPair.secretKey) {
      throw new Error("Issuer key pair is not initialized");
    }

    // 1️⃣ Deterministic ordering
    const sortedAttributes = [...attributes].sort();

    // 2️⃣ Encode messages
    const messages = sortedAttributes.map(attr =>
      new TextEncoder().encode(attr)
    );

    // 3️⃣ Encode context
    const contextEncoded = new TextEncoder().encode(context);

    // 4️⃣ Sign
    const signature = await blsSign({
      keyPair,
      messages,
      context: contextEncoded
    });

    // ✅ IMPORTANT: return full signing metadata
    return {
      signature: Buffer.from(signature).toString("base64"),
      messages: sortedAttributes,
      context
    };

  } catch (err) {
    console.error("Error in signAttributes:", err);
    throw new Error(`BBS+ signing failed: ${err.message}`);
  }
}

module.exports = { signAttributes };
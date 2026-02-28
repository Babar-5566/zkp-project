const fs = require("fs");
const path = require("path");
const { generateBls12381G2KeyPair } = require("@mattrglobal/bbs-signatures");

const KEY_PATH = path.join(__dirname, "issuerKeys.json");

let keyPair;

async function initializeKeys() {
  if (fs.existsSync(KEY_PATH)) {
    const stored = JSON.parse(fs.readFileSync(KEY_PATH));
    keyPair = {
      publicKey: Buffer.from(stored.publicKey, "base64"),
      secretKey: Buffer.from(stored.secretKey, "base64")
    };
    console.log(keyPair);   /!!! Remove later !!!/
    console.log("Issuer keys loaded from file.");
  } else {
    keyPair = await generateBls12381G2KeyPair();

    fs.writeFileSync(KEY_PATH, JSON.stringify({
      publicKey: Buffer.from(keyPair.publicKey).toString("base64"),
      secretKey: Buffer.from(keyPair.secretKey).toString("base64")
    }));

    console.log("Issuer keys generated and saved.");
  }
}

function getKeyPair() {
  return keyPair;
}

module.exports = {
  initializeKeys,
  getKeyPair
};

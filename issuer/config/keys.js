const { generateBls12381G2KeyPair } = require("@mattrglobal/bbs-signatures");

let keyPair;

async function initializeKeys() {
  keyPair = await generateBls12381G2KeyPair();
  console.log("Issuer key pair generated.");
}

function getKeyPair() {
  return keyPair;
}

module.exports = {
  initializeKeys,
  getKeyPair
};

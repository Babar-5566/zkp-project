const { blsSign } = require("@mattrglobal/bbs-signatures");
const { getKeyPair } = require("../config/keys");

async function signAttributes(attributes) {

  const keyPair = getKeyPair();

  const messages = attributes.map(attr =>
    new TextEncoder().encode(attr)
  );

  const signature = await blsSign({
    keyPair,
    messages
  });

  return Buffer.from(signature).toString("base64");
}

module.exports = { signAttributes };

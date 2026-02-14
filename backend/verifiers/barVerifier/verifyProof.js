const { checkAgePredicate } = require("./policy");

async function verifyProof(data) {
  const { zkSignatureProof, predicateProof, nonce } = data;

  // TODO: verify BBS proof here
  const signatureValid = true; // placeholder

  const predicateValid = checkAgePredicate(predicateProof);

  return {
    verified: signatureValid && predicateValid
  };
}

module.exports = { verifyProof };

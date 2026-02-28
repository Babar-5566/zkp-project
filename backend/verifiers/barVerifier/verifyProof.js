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

<<<<<<< Updated upstream
module.exports = { verifyProof };
=======
const snarkjs = require("snarkjs");
const fs = require("fs").promises;
const path = require("path");

async function verifyCombinedProof(data) {

    let bbsValid = true;
    let zkValid = true;

    if (data.bbsProof) {
        bbsValid = await blsVerifyProof(data.bbsProof);
    }

    if (data.zkProof) {
        const vk = JSON.parse(
            await fs.readFile(
                path.join(__dirname, "../../zk-factory/vk.json"),
                "utf-8"
            )
        );

        zkValid = await snarkjs.groth16.verify(
            vk,
            data.publicSignals,
            data.zkProof
        );
    }

    return { verified: bbsValid && zkValid };
}

module.exports = { verifyCombinedProof };
>>>>>>> Stashed changes

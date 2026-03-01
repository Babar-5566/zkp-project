const { blsVerifyProof } = require("@mattrglobal/bbs-signatures");

function base64ToUint8Array(base64) {
  if (!base64) throw new Error("Empty base64 string");
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

async function verifyProof({ proofs, nonce, request }) {

  if (!proofs || !Array.isArray(proofs)) {
    return { verified: false };
  }
  const issuerPublicKeyBase64 = request.issuer_pubkey;

  const publicKeyBytes = base64ToUint8Array(issuerPublicKeyBase64);
  const nonceBytes = base64ToUint8Array(nonce);

  let allValid = true;

  for (const proofObj of proofs) {
    try {
      const proofBytes = base64ToUint8Array(proofObj.proof);

      // const messageBytes = proofObj.messages.map(msg =>
      //   new TextEncoder().encode(msg)
      // );

      const verified = await blsVerifyProof({
        proof: proofBytes,
        publicKey: publicKeyBytes,
        // messages: "messageBytes",
        nonce: nonceBytes
      });

      if (!verified) {
        console.log("❌ BBS proof failed for:", proofObj.attribute);
        allValid = false;
        break;
      }

      console.log("✅ BBS proof valid for:", proofObj.attribute);

    } catch (err) {
      console.error("Verification error:", err);
      allValid = false;
      break;
    }
  }

  return { verified: allValid };
}

module.exports = { verifyProof };
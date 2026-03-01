// const { blsVerifyProof } = require("@mattrglobal/bbs-signatures");
// const snarkjs = require("snarkjs")
// const vk = require("../zk/vk.json")

// async function verifyGroth(proof, publicSignals) {
//   return await snarkjs.groth16.verify(vk, publicSignals, proof)
// }

// function base64ToUint8Array(base64) {
//   if (!base64) throw new Error("Empty base64 string");
//   return Uint8Array.from(Buffer.from(base64, "base64"));
// }

// // async function verifyProof({ proofs, nonce, request }) {

// //   if (!proofs || !Array.isArray(proofs)) {
// //     return { verified: false };
// //   }
// //   const issuerPublicKeyBase64 = request.issuer_pubkey;

// //   const publicKeyBytes = base64ToUint8Array(issuerPublicKeyBase64);
// //   const nonceBytes = base64ToUint8Array(nonce);

// //   let allValid = true;

// //   for (const proofObj of proofs) {
// //     try {
// //       const proofBytes = base64ToUint8Array(proofObj.proof);

// //       // const messageBytes = proofObj.messages.map(msg =>
// //       //   new TextEncoder().encode(msg)
// //       // );

// //       const verified = await blsVerifyProof({
// //         proof: proofBytes,
// //         publicKey: publicKeyBytes,
// //         // messages: "messageBytes",
// //         nonce: nonceBytes
// //       });

// //       if (!verified) {
// //         console.log("❌ BBS proof failed for:", proofObj.attribute);
// //         allValid = false;
// //         break;
// //       }

// //       console.log("✅ BBS proof valid for:", proofObj.attribute);

// //     } catch (err) {
// //       console.error("Verification error:", err);
// //       allValid = false;
// //       break;
// //     }
// //   }

// //   return { verified: allValid };
// // }

// async function verifyProof({ proofs, nonce, request }) {

//   let bbsValid = true
//   let zkValid = true

//   if (proofs.bbsProofs) {
//     for (const p of proofs.bbsProofs) {
//       const ok = await blsVerifyProof(...)
//       if (!ok) bbsValid = false
//     }
//   }

//   if (proofs.zkProofs) {
//     for (const zk of proofs.zkProofs) {
//       const ok = await verifyGroth(
//         zk.proof,
//         zk.publicSignals
//       )
//       if (!ok) zkValid = false
//     }
//   }

//   return { verified: bbsValid && zkValid }
// }

// console.log("Incoming proofs:", proofs)

// module.exports = { verifyProof };

const { blsVerifyProof } = require("@mattrglobal/bbs-signatures");
const snarkjs = require("snarkjs");
const vk = require("./zk-files/vk.json");

function base64ToUint8Array(base64) {
  if (!base64) throw new Error("Empty base64 string");
  return Uint8Array.from(Buffer.from(base64, "base64"));
}

async function verifyGroth(proof, publicSignals) {
  try {
    const ok = await snarkjs.groth16.verify(vk, publicSignals, proof);

    if (ok) {
      console.log("✅ Groth proof valid");
    } else {
      console.log("❌ Groth proof invalid");
    }

    return ok;
  } catch (err) {
    console.error("Groth verification error:", err);
    return false;
  }
}

async function verifyProof({ proofs, nonce, request }) {

  console.log("Incoming proofs:", proofs);

  let bbsValid = true;
  let zkValid = true;

  // ======================
  // 🔐 VERIFY BBS PROOFS
  // ======================
  if (proofs?.bbsProofs?.length) {

    const publicKeyBytes = base64ToUint8Array(request.issuer_pubkey);
    const nonceBytes = base64ToUint8Array(nonce);

    console.log("🔎 Verifying BBS proofs...");

    for (const p of proofs.bbsProofs) {
      try {

        const proofBytes = base64ToUint8Array(p.proof);

        const ok = await blsVerifyProof({
          proof: proofBytes,
          publicKey: publicKeyBytes,
          nonce: nonceBytes
        });

        if (!ok) {
          console.log("❌ BBS proof failed");
          bbsValid = false;
        } else {
          console.log("✅ BBS proof valid");
        }

      } catch (err) {
        console.error("BBS verification error:", err);
        bbsValid = false;
      }
    }
  }

  function mapFrontendPredicate(rule) {

    switch (rule.predicate) {

      case "equality":
        return {
          type: "EQUALS",
          field: rule.name,
          value: rule.value
        }

      case "numeric/range":
        return {
          type: "AGE_GREATER_OR_EQUAL",
          field: rule.name,
          value: Number(rule.value)
        }

      case "existence":
        return {
          type: "EXISTS",
          field: rule.name
        }

      case "hash":
        return {
          type: "HASH_MATCH",
          field: rule.name,
          hash: rule.value
        }

      case "string match":
        return {
          type: "STRING_EQUALS",
          field: rule.name,
          value: rule.value
        }

      case "date comparison":

        if (!rule.value)
          throw new Error("Date comparison missing value")

        return {
          type: "DATE_BEFORE",
          field: rule.name,
          value: rule.value
        }

      default:
        throw new Error("Unsupported predicate: " + rule.predicate)
    }
  }

  const { evaluatePredicate } = require("../../wallet/predicateEvaluator")

  // ======================
  // 🔐 VERIFY ZK PROOFS
  // ======================
  if (proofs?.zkProofs?.length) {

    console.log("🔎 Verifying zkSNARK proofs...");

    for (const zk of proofs.zkProofs) {

      const ok = await verifyGroth(
        zk.proof,
        zk.publicSignals
      );

      if (!ok) zkValid = false;
    }
  }

  // After crypto verification

  const credentialData = proofs.revealedData || {}

  if (request?.requested_predicates?.length) {

    console.log("🔎 Evaluating predicates...")

    for (const rule of request.requested_predicates) {

      const mappedRule = mapFrontendPredicate(rule)
      const ok = evaluatePredicate(mappedRule, credentialData)

      if (!ok) {
        console.log("❌ Predicate failed:", rule)
        return { verified: false }
      }

      console.log("✅ Predicate satisfied:", rule)
    }
  }

  // ======================
  // FINAL RESULT
  // ======================
  const verified = bbsValid && zkValid;

  if (verified) {
    console.log("🎉 All proofs valid");
  } else {
    console.log("❌ Some proofs failed");
  }

  return { verified };
}

module.exports = { verifyProof };
import { createProof } from "@mattrglobal/bbs-signatures";
import { blsCreateProof } from "@mattrglobal/bbs-signatures";

/**
 * Convert a base64 string to Uint8Array safely.
 * Removes whitespace/newlines for browser compatibility.
 */
export function base64ToUint8Array(base64) {
  if (!base64) throw new Error("Empty input");
  base64 = base64.replace(/\s+/g, ""); // remove newlines/whitespace
  const binary = atob(base64);
  return Uint8Array.from([...binary].map(c => c.charCodeAt(0)));
}

/**
 * Generate BBS+ selective disclosure proof from a Verifiable Credential
 * @param {Object} vc - Verifiable Credential
 * @param {Array} predicates - Array of predicate objects to reveal [{attribute: "fullName", type: "reveal"}]
 * @param {String} context - Optional context, defaults to "Default"
 * @returns {Object} proof object with proof string, reveal indices, and messages
 */
export async function generateBbsProof({ mapping, request, context = "Default" }) {
  try {

    if (!mapping || Object.keys(mapping).length === 0) {
      throw new Error("No credential mapping provided")
    }
    if (!request.nonce) {
      throw new Error("Request nonce missing")
    }

    const proofs = []

    // Loop through each attribute → VC pair
    for (const [attribute, vc] of Object.entries(mapping)) {

      if (!vc || !vc.proof || !vc.proof.signature) {
        throw new Error(`Invalid VC for ${attribute}`)
      }

      // console.log(vc);

      const messageBytes = vc.proof.signature.messages.map(attr =>
        new TextEncoder().encode(attr)
      )

      // Use public key from proof request, fallback to credential (backward compat)
      const pubKeyBase64 = request.issuer_pubkey || vc.publicKey;
      if (!pubKeyBase64) {
        throw new Error(`No public key available — not in proof request or credential for ${attribute}`);
      }
      const publicKey = base64ToUint8Array(pubKeyBase64)
      const signature = base64ToUint8Array(vc.proof.signature.signature)

      const contextBytes = new TextEncoder().encode(context)

      // Find predicates related to this attribute
      const predicates = request.requested_predicates.filter(
        p => p.name === attribute
      )

      // Also check requested_attributes for 'reveal' type
      const revealAttrs = (request.requested_attributes || []).filter(
        a => a.name === attribute
      )

      const revealIndices = []
      const revealedValues = {}

      // Handle predicates
      predicates.forEach(p => {
        if (p.predicate === "reveal") {
          // REVEAL: add index to revealed set + capture value
          const idx = vc.proof.signature.messages.findIndex(m =>
            m.startsWith(`${attribute}:`)
          )
          if (idx !== -1) {
            revealIndices.push(idx)
            // Extract the value part after "attribute:"
            const msg = vc.proof.signature.messages[idx]
            revealedValues[attribute] = msg.split(':').slice(1).join(':')
          }
        }
        // EXISTENCE: do NOT add to revealIndices
        // BBS+ proof inherently proves all signed messages exist
        // without needing to reveal them
      })

      // Handle requested_attributes (also treated as reveal)
      revealAttrs.forEach(a => {
        if (a.predicate === "reveal") {
          const idx = vc.proof.signature.messages.findIndex(m =>
            m.startsWith(`${attribute}:`)
          )
          if (idx !== -1 && !revealIndices.includes(idx)) {
            revealIndices.push(idx)
            const msg = vc.proof.signature.messages[idx]
            revealedValues[attribute] = msg.split(':').slice(1).join(':')
          }
        }
      })

      // if (revealIndices.length === 0) revealIndices.push(0)

      const nonceBytes = base64ToUint8Array(request.nonce)

      const proof = await blsCreateProof({
        signature,
        publicKey,
        messages: messageBytes,
        revealed: revealIndices,
        nonce: nonceBytes,
        context: contextBytes
      })

      proofs.push({
        attribute,
        proof: btoa(String.fromCharCode(...proof)),
        revealIndices,
        revealedValues,
        messages: revealIndices.map(i => vc.proof.signature.messages[i])
      })
    }

    return proofs

  } catch (err) {
    console.error("BBS+ proof generation failed:", err)
    throw err
  }
}

/**
 * Generate a zk-SNARK proof for numeric/range predicates (e.g., age >= 18)
 * Runs entirely in the browser using snarkjs — private input never leaves the device.
 * @param {string} dob - Date of birth in DD/MM/YYYY format
 * @param {number} threshold - Minimum age required
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
export async function generateZkSnarkProof(dob, threshold) {
  // Import the in-browser ZK prover (uses snarkjs + wasm/zkey from /zk/)
  const { generateZkProofInBrowser } = await import("./plonkProver.js")

  try {
    const { proof, publicSignals } = await generateZkProofInBrowser(dob, threshold)
    return { proof, publicSignals }
  } catch (err) {
    console.error("zk-SNARK proof generation failed (in-browser):", err)
    throw err
  }
}

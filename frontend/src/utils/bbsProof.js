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

      console.log(vc);

      const messageBytes = vc.proof.signature.messages.map(attr =>
        new TextEncoder().encode(attr)
      )

      const publicKey = base64ToUint8Array(vc.publicKey)
      const signature = base64ToUint8Array(vc.proof.signature.signature)

      const contextBytes = new TextEncoder().encode(context)

      // Find predicates related to this attribute
      const predicates = request.requested_predicates.filter(
        p => p.name === attribute
      )

      const revealIndices = []

      predicates.forEach(p => {
        if (p.predicate === "existence" || p.predicate === "reveal") {
          const idx = vc.proof.signature.messages.findIndex(m =>
            m.startsWith(`${attribute}:`)
          )

          if (idx !== -1) revealIndices.push(idx)
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
        // messages: vc.proof.signature.messages
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
 * Calls wallet backend to generate Groth16 proof server-side
 * @param {string} dob - Date of birth in DD/MM/YYYY format
 * @param {number} threshold - Minimum age required
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
export async function generateZkSnarkProof(dob, threshold) {
  try {
    const response = await fetch("http://localhost:5000/wallet/zkproof", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dob, threshold: parseInt(threshold) })
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.error || "zk-SNARK proof generation failed")
    }

    const { proof, publicSignals } = await response.json()
    return { proof, publicSignals }
  } catch (err) {
    console.error("zk-SNARK proof generation failed:", err)
    throw err
  }
}
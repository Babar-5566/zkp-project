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
export async function generateBbsProof({ vc, predicates, context = "Default" }) {
    try {
        if (!vc || !vc.proof || !vc.proof.signature) {
            throw new Error("Invalid VC or missing proof");
        }

        // Convert messages to Uint8Array
        const messageBytes = vc.proof.signature.messages.map(attr =>
            new TextEncoder().encode(attr)
        );

        // Decode public key and signature
        const publicKey = base64ToUint8Array(vc.publicKey);
        const signature = base64ToUint8Array(vc.proof.signature.signature);;

        // Encode context
        const contextBytes = new TextEncoder().encode(context);

        // Determine reveal indices
        const revealIndices = [];
        predicates.forEach(p => {
            if (p.type === "equality" || p.type === "reveal") {
                const idx = messages.findIndex(m => m.startsWith(`${p.attribute}:`));
                if (idx !== -1) revealIndices.push(idx);
            }
        });

        // If nothing selected, reveal at least index 0
        if (revealIndices.length === 0) revealIndices.push(0);

        // Generate a random nonce for proof
        const nonce = crypto.getRandomValues(new Uint8Array(32));

        const publicKeyBytes = Uint8Array.from(Buffer.from(publicKey, "base64"));

        // Create BBS+ selective disclosure proof
        const proof = await blsCreateProof({
            signature,
            publicKey: publicKeyBytes,
            messages: messageBytes,
            revealed: revealIndices,
            nonce,
            context: contextBytes
        });

        // Return proof as base64 string for transport/storage
        return {
            proof: btoa(String.fromCharCode(...proof)),
            revealIndices,
            messages : vc.proof.signature.messages
        };

    } catch (err) {
        console.error("BBS+ proof generation failed:", err);
        throw new Error("Failed to create proof: " + err.message);
    }
}
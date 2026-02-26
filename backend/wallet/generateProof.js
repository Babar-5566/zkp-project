const { v4: uuidv4 } = require("uuid");
const { getLatestCredential } = require("./credentialStore");
const { blsCreateProof } = require("@mattrglobal/bbs-signatures");
const snarkjs = require("snarkjs");
const path = require("path");

function calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

async function generateProof(documentType, requestedAttributes, rangeChecks = []) {

    const cred = getLatestCredential(documentType);
    if (!cred) throw new Error(`No credential stored for ${documentType}`);

    // Canonicalize attributes alphabetically (must match issuer)
    const attrs = Object.keys(cred).filter(k => typeof cred[k] !== "object");
    const sortedAttrs = attrs.sort();

    const allMessages = sortedAttrs.map(attr => {
        return new TextEncoder().encode(`${attr}:${cred[attr]}`);
    });

    const revealIndices = requestedAttributes
        .map(attr => sortedAttrs.indexOf(attr))
        .filter(i => i >= 0);

    if (!revealIndices.length) throw new Error("No valid attributes to reveal");

    const nonce = uuidv4();

    const proofBytes = await blsCreateProof({
        signature: Buffer.from(cred.proof.signature, "base64"),
        publicKey: Buffer.from(cred.publicKey, "base64"),
        messages: allMessages,
        revealed: revealIndices,
        context: new TextEncoder().encode(documentType),
        nonce: new TextEncoder().encode(nonce)
    });

    let zkProofs = {};

    for (const check of rangeChecks) {
        if (check.attribute === "age") {

            const age = calculateAge(cred.dob);

            const wasmPath = path.join(__dirname, "../circuits/ageCheck_js/ageCheck.wasm");
            const zkeyPath = path.join(__dirname, "../circuits/ageCheck_js/ageCheck_final.zkey");

            const { proof, publicSignals } = await snarkjs.groth16.fullProve(
                { age, threshold: check.threshold },
                wasmPath,
                zkeyPath
            );

            zkProofs.ageProof = { proof, publicSignals };
        }
    }

    return {
        documentType,
        nonce,
        revealedAttributes: requestedAttributes.reduce((o, k) => {
            o[k] = cred[k];
            return o;
        }, {}),
        bbsProof: Buffer.from(proofBytes).toString("base64"),
        zkProofs,
        issuer: cred.issuer
    };
}

module.exports = { generateProof };
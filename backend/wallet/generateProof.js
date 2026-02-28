const { v4: uuidv4 } = require("uuid");
const { getLatestCredential } = require("./credentialStore");
<<<<<<< Updated upstream
const { blsCreateProof } = require("@mattrglobal/bbs-signatures");
const snarkjs = require("snarkjs");
const path = require("path");
=======
const snarkjs = require("snarkjs");
const path = require("path");
const { createProof } = require("@mattrglobal/bbs-signatures");
>>>>>>> Stashed changes

function calculateAge(dobString) {
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
}

<<<<<<< Updated upstream
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
=======
function splitPredicates(predicates = []) {
    const bbs = [];
    const zk = [];

    predicates.forEach(p => {
        const t = (p.predicate || p.type || "").toLowerCase();

        if (
            t.includes("range") ||
            t.includes("numeric") ||
            t.includes("date") ||
            t.includes("greater") ||
            t.includes("less")
        ) zk.push(p);
        else bbs.push(p);
    });

    return { bbs, zk };
}

async function generateUnifiedProof(request) {

    const cred = getLatestCredential(request.documentType);
    if (!cred) throw new Error("Credential not found");

    const { bbs, zk } = splitPredicates([
        ...(request.requested_predicates || []),
        ...(request.requested_attributes || [])
    ]);

    /* ---------- BBS PROOF ---------- */
    let bbsProof = null;
    let revealed = {};

    if (bbs.length) {
        const messages = Object.entries(cred)
            .map(([k, v]) => new TextEncoder().encode(`${k}:${v}`));

        bbs.forEach(p => {
            if (cred[p.name]) revealed[p.name] = cred[p.name];
        });

        bbsProof = await createProof({
            signature: Buffer.from(cred.signature, "base64"),
            publicKey: Buffer.from(cred.publicKey, "base64"),
            messages,
            revealed: bbs.map((_, i) => i),
            context: new TextEncoder().encode(request.documentType)
        });
    }

    /* ---------- ZK PROOF ---------- */
    let zkProof = null;
    let publicSignals = null;

    if (zk.length) {

        const dob = cred.dob;
        if (!dob) throw new Error("DOB missing for ZK predicate");

        const age = calculateAge(dob);

        const wasm = path.join(__dirname, "../zk-factory/age_proof_js/age_proof.wasm");
        const zkey = path.join(__dirname, "../zk-factory/circuit_final.zkey");

        const { proof, publicSignals: signals } =
            await snarkjs.groth16.fullProve(
                {
                    age: age,
                    requiredAge: Number(zk[0].value || 18)
                },
                wasm,
                zkey
            );

        zkProof = proof;
        publicSignals = signals;
    }
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
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
=======
        request_id: request.id,
        nonce: request.nonce,
        revealed,
        bbsProof,
        zkProof,
        publicSignals,
        timestamp: new Date().toISOString()
    };
}

module.exports = { generateUnifiedProof };
>>>>>>> Stashed changes

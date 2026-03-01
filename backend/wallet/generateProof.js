const { v4: uuidv4 } = require("uuid");
const { getLatestCredential } = require("./credentialStore");

// --- New imports for ZK-SNARK ---
const snarkjs = require("snarkjs");
const path = require("path");
// --------------------------------

/* Placeholder for real BBS+ verification */
async function verifyBbsSignature(credential) {
    // TODO: replace with real BBS+ verify call
    // Example future call:
    // return await bbs.verify({ publicKey, signature, messages });

    return credential.signature ? true : false;
}

function calculateAge(dobString) {
    if (!dobString) return null;

    const dob = new Date(dobString);
    const today = new Date();

    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age;
}

const docAttributes = {
    Aadhaar: [
        "fullName", "dob", "gender", "address", "photoVerified",
        "aadhaarLast4", "issuer", "issuanceDate", "documentAuthVerified"
    ],
    PAN: [
        "fullName", "guardianName", "dob", "panID",
        "issuer", "issuanceDate", "documentAuthVerified"
    ],
    Passport: [
        "fullName", "dob", "passportID", "nationality",
        "expiryDate", "issuer", "documentAuthVerified"
    ],
    DrivingLicense: [
        "fullName", "dob", "licenseID", "issueDate",
        "expiryDate", "issuer", "documentAuthVerified"
    ],
    BirthCertificate: [
        "fullName", "dob", "placeOfBirth", "fatherName",
        "motherName", "issuer", "issuanceDate", "documentAuthVerified"
    ],
    "12thMarksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer", "issuanceDate"],
    "12thAdmit": ["fullName", "dob", "school", "board", "rollNumber", "issuer", "issuanceDate"],
    "10thMarksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer", "issuanceDate"],
    "10thAdmit": ["fullName", "dob", "school", "board", "rollNumber", "issuer", "issuanceDate"]
};

/**
 * Generate selective disclosure proof for requested attributes
 * @param {String} documentType - type of credential (Aadhaar, PAN, etc.)
 * @param {Array<String>} requestedAttributes - list of attributes to prove
 * @returns proof object
 */

async function generateProof(documentType, requestedAttributes) {
    const cred = getLatestCredential(documentType);

    if (!cred) {
        throw new Error(`No credential of type ${documentType} stored in wallet`);
    }

    const validAttrs = docAttributes[documentType];
    if (!validAttrs) {
        throw new Error(`Unknown document type: ${documentType}`);
    }

    // Validate requested attributes
    const attrsToReveal = requestedAttributes.filter(attr => validAttrs.includes(attr));
    if (attrsToReveal.length === 0) {
        throw new Error("No valid attributes requested for proof");
    }

    // Convert attribute values to messages (Uint8Array)
    const messages = attrsToReveal.map(attr => {
        const value = cred[attr];
        if (value === undefined || value === null) {
            throw new Error(`Attribute ${attr} missing in credential`);
        }
        return new TextEncoder().encode(`${attr}:${value}`);
    });

    // Context ensures proof cannot be used in other domains
    const context = new TextEncoder().encode(documentType);

    // Generate BBS+ selective disclosure proof
    const proofBytes = await createProof({
        signature: cred.signature instanceof Buffer ? cred.signature : Buffer.from(cred.signature, "base64"),
        publicKey: Buffer.from(cred.publicKey, "base64"),
        messages,
        revealed: messages.map((_, i) => i),
        context
    });

    // UUID nonce for unlinkability
    const nonce = uuidv4();

    return {
        documentType,
        revealedAttributes: attrsToReveal.reduce((obj, key) => {
            obj[key] = cred[key];
            return obj;
        }, {}),
        proof: Buffer.from(proofBytes).toString("base64"),
        nonce,
        credentialHash: cred.credentialHash,
        issuer: cred.issuer
    };
}


// ==============================================================
// 🚀 NEW: ZK-SNARK Age Verification Proof (Added dynamically)
// ==============================================================
async function generateZKAgeProof(documentType, requiredAgeThreshold = 18) {
    console.log(`\n🔐 Wallet: Generating Zero-Knowledge Age Proof...`);
    
    // 1. Fetch user data from the credential
    const cred = getLatestCredential(documentType);
    if (!cred) {
        throw new Error(`No credential of type ${documentType} stored in wallet`);
    }
    if (!cred.dob) {
        throw new Error(`Date of Birth (dob) missing in ${documentType}`);
    }

    // 2. Calculate the actual age using your existing calculateAge function
    const realAge = calculateAge(cred.dob);
    console.log(`🤫 Secret Age calculated from DOB: ${realAge} (Will NOT be revealed)`);

    // ==============================================================
    // 🚀 NEW BLOCK ADDED HERE: Handling DD/MM/YYYY format safely
    // If realAge is NaN, we manually calculate the exact age!
    // ==============================================================
    let safeAge = realAge;
    if (isNaN(safeAge) && cred.dob) {
        const parts = String(cred.dob).split('/');
        if (parts.length === 3) {
            const bDay = parseInt(parts[0], 10);
            const bMonth = parseInt(parts[1], 10);
            const bYear = parseInt(parts[2], 10);
            const today = new Date();
            
            safeAge = today.getFullYear() - bYear;
            if (today.getMonth() + 1 < bMonth || (today.getMonth() + 1 === bMonth && today.getDate() < bDay)) {
                safeAge--;
            }
            console.log(`🛠️ Fixed NaN issue! Manually calculated Age: ${safeAge}`);
        } else {
            throw new Error("Invalid Date of Birth format. Expected DD/MM/YYYY.");
        }
    }
    // ==============================================================

    // 3. Prepare inputs for the ZK circuit
    // 🚀 OLD CODE COMMENTED OUT TO PRESERVE HISTORY:
    // const inputs = {
    //     age: BigInt(realAge),
    //     requiredAge: BigInt(requiredAgeThreshold)
    // };
    
    // 🚀 NEW CODE ADDED:
    const inputs = {
        age: BigInt(safeAge), // Using safeAge so BigInt never gets NaN
        requiredAge: BigInt(requiredAgeThreshold)
    };

    // 4. Paths to the Zero-Knowledge artifacts we generated earlier
    const wasmPath = path.join(process.cwd(), 'zk-files', 'age_proof.wasm');
    const zkeyPath = path.join(process.cwd(), 'zk-files', 'circuit_final.zkey');

    try {
        // 5. Generate the proof using the Groth16 algorithm
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, wasmPath, zkeyPath);
        
        console.log('✅ ZK AGE PROOF GENERATED SUCCESSFULLY!');
        
        return {
            documentType,
            proofType: "ZK-SNARK-Age-Proof",
            proof: proof,
            publicSignals: publicSignals,
            nonce: uuidv4(),
            issuer: cred.issuer
        };
    } catch (error) {
        console.error("❌ ZK Proof Generation Failed:", error);
        throw new Error("Failed to generate ZK proof");
    }
}

// Export both functions
module.exports = {
    generateProof,
    generateZKAgeProof
};
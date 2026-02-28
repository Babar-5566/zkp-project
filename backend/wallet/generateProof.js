const { v4: uuidv4 } = require("uuid");
const { getLatestCredential } = require("./credentialStore");

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

module.exports = {
    generateProof
};

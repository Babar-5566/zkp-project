const { v4: uuidv4 } = require("uuid");
const { signAttributes } = require("../services/signatureService");
const { validateDocument, getAllowedFields } = require("../utils/validator");
const { getKeyPair } = require("../config/keys");
const { allocateIndex } = require("../services/revocationStore");

async function issueCredential(req, res) {
    try {
        const { idType, data } = req.body;

        // Validate document
        const validation = validateDocument(idType, data);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // 🛡️ Sanitize: only allow whitelisted fields (prevents injection of extra fields)
        const allowedFields = getAllowedFields(idType);
        const sanitizedData = {};
        for (const key of allowedFields) {
            if (data[key] !== undefined) {
                sanitizedData[key] = data[key];
            }
        }

        // Prepare attributes array for signing (using sanitized data only)
        const attributes = Object.entries(sanitizedData).map(
            ([key, value]) => `${key}:${typeof value === "object" ? JSON.stringify(value) : value}`
        );

        // Generate BBS+ signature
        const signature = await signAttributes(attributes);

        // const digitalID = {
        //     id: uuidv4(),
        //     idType,
        //     issuedAt: new Date().toISOString(),
        //     issuer: process.env.ISSUER_NAME,
        //     attributes,
        //     signature,
        //     publicKey: Buffer.from(getKeyPair().publicKey).toString("base64")
        // };

        const issuerDid = "did:example:gov-india";
        const holderDid = `did:example:${uuidv4()}`; // demo holder identity
        const revocationIndex = allocateIndex();   // Allocate revocation index

        const verifiableCredential = {
            "@context": [
                "https://www.w3.org/2018/credentials/v1"
            ],

            id: `urn:uuid:${uuidv4()}`, // generate internally

            type: [
                "VerifiableCredential",
                idType.replace(/\s+/g, "") + "Credential"
            ],

            issuer: issuerDid,

            holderCommitment: sanitizedData.holderCommitment,

            issuanceDate: new Date().toISOString(),

            credentialSubject: {
                id: holderDid,
                ...sanitizedData
            },

            credentialStatus: {
                id: `https://example.com/status/${revocationIndex}`,
                type: "AccumulatorStatus",
                accumulatorId: "revocation-list-1",
                index: revocationIndex
            },

            proof: {
                type: "BbsBlsSignature2020",
                created: new Date().toISOString(),
                proofPurpose: "assertionMethod",
                verificationMethod: `${issuerDid}#key-1`,
                signature,
            }
        };

        // Send output to frontend
        res.json(verifiableCredential);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Issuance failed" });
    }
}


module.exports = { issueCredential };

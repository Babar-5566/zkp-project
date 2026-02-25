const { v4: uuidv4 } = require("uuid");
const { signAttributes } = require("../services/signatureService");
const { validateDocument } = require("../utils/validator");
const { getKeyPair } = require("../config/keys");
const { allocateIndex } = require ("../services/revocationStore");

async function issueCredential(req, res) {
    try {
        console.log("Received documentType:", req.body.documentType);
        console.log("Received data:", req.body.data);

        const { idType, data } = req.body;

        // Validate document
        const validation = validateDocument(idType, data);
        console.log("Validation result:", validation);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // Prepare attributes array for signing
        const attributes = Object.entries(data).map(
            ([key, value]) => `${key}:${typeof value === "object" ? JSON.stringify(value) : value}`
        );
        
        console.log("attributes: "+attributes);
        
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

            issuanceDate: new Date().toISOString(),

            credentialSubject: {
                id: holderDid,
                ...data
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
                
            },

            publicKey: Buffer.from(getKeyPair().publicKey).toString("base64")
        };

        console.log("Converted:", JSON.stringify(verifiableCredential, null, 2));
        console.log("publicKey:", Buffer.from(getKeyPair().publicKey).toString("base64"));
        
        // 🔥 Send output to frontend
        res.json(verifiableCredential);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Issuance failed" });
    }
}


module.exports = { issueCredential };

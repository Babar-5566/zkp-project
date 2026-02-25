const { v4: uuidv4 } = require("uuid");
const { signAttributes } = require("../services/signatureService");
const { validateDocument } = require("../utils/validator");
const { getKeyPair } = require("../config/keys");

async function issueCredential(req, res) {
    try {
        const { documentType, data } = req.body;

        // Validate document
        const validation = validateDocument(documentType, data);
        if (!validation.valid) {
            return res.status(400).json({ error: validation.error });
        }

        // Prepare attributes array for signing
        const attributes = Object.entries(data).map(
            ([key, value]) => `${key}:${typeof value === "object" ? JSON.stringify(value) : value}`
        );

        // Generate BBS+ signature
        const signature = await signAttributes(attributes);

        const digitalID = {
            id: uuidv4(),
            documentType,
            issuedAt: new Date().toISOString(),
            issuer: process.env.ISSUER_NAME,
            attributes,
            signature,
            publicKey: Buffer.from(getKeyPair().publicKey).toString("base64")
        };

        // 🔥 Send output to frontend
        res.json(digitalID);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Issuance failed" });
    }
}


module.exports = { issueCredential };

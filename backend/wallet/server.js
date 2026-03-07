const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

/* ================= IMPORT WALLET MODULES ================= */

const { storeCredential } = require("./credentialStore");
const { generateProof } = require("./generateProof");

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
    res.send("ZKP Identity Backend Running");
});

/* ================= WALLET ROUTES ================= */

/**
 * Store Aadhaar-like credential in wallet
 */
app.post("/wallet/storeAadhaar", (req, res) => {
    try {
        const credential = {
            fullName: req.body.fullName,
            dob: req.body.dob,
            gender: req.body.gender,
            address: req.body.address,
            photoVerified: req.body.photoVerified,
            aadhaarLast4: req.body.aadhaarLast4,
            tokenId: req.body.tokenId,
            enrolmentId: req.body.enrolmentId,
            qrValid: req.body.qrValid,
            issuer: req.body.issuer || "UIDAI",
            issuanceDate: req.body.issuanceDate,
            lastUpdate: req.body.lastUpdate,
            authenticityFlag: req.body.authenticityFlag === true,

            // BBS+ signature from issuer
            signature: req.body.signature || null
        };

        const stored = storeCredential(credential);

        res.json({
            message: "Credential stored in wallet",
            credentialHash: stored.credentialHash
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});



/* ================= SERVER START ================= */

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

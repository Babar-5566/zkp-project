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

/**
 * Generate predicate proof (age >= 18)
 */
app.get("/wallet/proveAge", async (req, res) => {
    try {
        const proof = await generateProof();
        res.json(proof);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

/**
 * [DEPRECATED] Generate zk-SNARK proof (age >= threshold)
 * ZK proof generation has moved to the FRONTEND (in-browser via snarkjs).
 * This endpoint is kept for backward compatibility only.
 * Body: { dob: "DD/MM/YYYY", threshold: 18 }
 */
const { generateAgeProof } = require("./prover");

app.post("/wallet/zkproof", async (req, res) => {
    try {
        const { dob, threshold } = req.body;

        if (!dob || !threshold) {
            return res.status(400).json({ error: "Missing dob or threshold" });
        }

        // Calculate age from dob string (DD/MM/YYYY)
        const parts = dob.split("/");
        const birthDate = new Date(
            parseInt(parts[2]),      // year
            parseInt(parts[1]) - 1,  // month (0-indexed)
            parseInt(parts[0])       // day
        );
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        console.log(`🔐 zk-SNARK: Generating proof for age=${age}, threshold=${threshold}`);

        const { proof, publicSignals } = await generateAgeProof(age, parseInt(threshold));

        res.json({ proof, publicSignals });

    } catch (err) {
        console.error("zk-SNARK proof generation failed:", err);
        res.status(500).json({ error: "zk-SNARK proof generation failed: " + err.message });
    }
});

/* ================= SERVER START ================= */

const PORT = 5001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

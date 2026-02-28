const express = require("express");
const cors = require("cors");

const { storeCredential, getCredentials } = require("./credentialStore");
const { generateUnifiedProof } = require("./generateProof");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Wallet running");
});

app.post("/wallet/store", (req, res) => {
    try {
        const stored = storeCredential(req.body);
        res.json({ success: true, credentialHash: stored.credentialHash });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/wallet/list", (req, res) => {
    res.json(getCredentials());
});

/* 🔐 UNIFIED PROOF ROUTE */
app.post("/wallet/generate-proof", async (req, res) => {
    try {
        const proof = await generateUnifiedProof(req.body);
        res.json(proof);
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message });
    }
});

app.listen(5051, () => console.log("Wallet running on 5051"));
const express = require("express");
const { verifyProof } = require("./verifyProof");

const app = express();
app.use(express.json());

const { v4: uuidv4 } = require('uuid');

// In-memory store for nonces (for demo purposes)
const nonces = {};

// Endpoint to get a new nonce
app.get('/nonce', (req, res) => {
  const nonce = uuidv4();
  nonces[nonce] = Date.now(); // store timestamp (optional)
  res.json({ nonce });
});

// Verify endpoint
app.post("/verify", async (req, res) => {
  try {
    const { nonce } = req.body;

    // 1️⃣ Check nonce
    if (!nonce || !nonces[nonce]) {
      return res.status(400).json({ error: "Invalid or expired nonce" });
    }

    // 2️⃣ Delete nonce after use
    delete nonces[nonce];

    // 3️⃣ Call your existing proof verification
    const result = await verifyProof(req.body);

    if (result.verified) {
      return res.json({ access: "GRANTED" });
    } else {
      return res.json({ access: "DENIED" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.listen(3003, () => {
  console.log("Bar Verifier running on port 3003");
});

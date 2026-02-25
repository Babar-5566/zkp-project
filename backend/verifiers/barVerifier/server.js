const express = require("express");
const crypto = require("crypto");
require("dotenv").config();

const { verifyProof } = require("./verifyProof");

const app = express();
app.use(express.json());

/* ---------------- NONCE STORE ---------------- */

const nonces = {}; // { nonce : expiryTimestamp }

/* ---------------- HELPERS ---------------- */

// Generate secure random ID (UUID alternative)
function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

// Generate expiry timestamp (seconds)
function expiry(seconds = 300) {
  return Math.floor(Date.now() / 1000) + seconds;
}

// Build proof request object
function buildBbsProofRequest({
  requested_attributes = [],
  requested_predicates = [],
  nonce
}) {
  return {
    version: "1.0",
    id: generateId(),
    type: "BbsProofRequest",

    credential_type: "identity_credential",
    issuer_pubkey: process.env.ISSUER_PUBLIC_KEY_PATH,

    scope_id: process.env.VERIFIER_DOMAIN,

    nonce,
    context: "Default",

    requested_attributes,
    requested_predicates,

    zk: {
      circuit_id: "age_check_v1",
      verification_key_id: "vk_01"
    },

    response_uri: process.env.DEFAULT_RESPONSE_URI,
    expires_at: expiry(300)
  };
}

/* ---------------- ROUTES ---------------- */

// 🔹 Get a fresh nonce
app.get("/nonce", (req, res) => {
  const nonce = generateId();
  nonces[nonce] = expiry(300);
  res.json({ nonce });
});

// 🔹 Build proof request
app.post("/proof-request", (req, res) => {
  try {
    const { requested_attributes = [], requested_predicates = [] } = req.body;

    const nonce = generateId();
    nonces[nonce] = expiry(300);

    const proofRequest = buildBbsProofRequest({
      requested_attributes,
      requested_predicates,
      nonce
    });

    res.json({
      response_uri: proofRequest.response_uri,
      proof_request: proofRequest   // remove later in production
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to build proof request" });
  }
});

// 🔹 Verify proof
app.post("/verify", async (req, res) => {
  try {
    const { nonce } = req.body;

    // Check nonce exists
    if (!nonce || !nonces[nonce]) {
      return res.status(400).json({ error: "Invalid or expired nonce" });
    }

    // Check expiry
    if (nonces[nonce] < Math.floor(Date.now() / 1000)) {
      delete nonces[nonce];
      return res.status(400).json({ error: "Nonce expired" });
    }

    // Remove nonce (one-time use)
    delete nonces[nonce];

    // Run verification
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

/* ---------------- START SERVER ---------------- */

app.listen(3003, () => {
  console.log("ZKP Verifier running on port 3003");
});

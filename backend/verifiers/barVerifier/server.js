const express = require("express");
<<<<<<< Updated upstream
const crypto = require("crypto");
require("dotenv").config();

=======
const cors = require("cors");
>>>>>>> Stashed changes
const { verifyProof } = require("./verifyProof");
const { v4: uuidv4 } = require("uuid");

const app = express();
<<<<<<< Updated upstream
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
=======
app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("Verifier backend running");
});
const fs = require("fs");
const path = require("path");

/* ---------------- STORAGE ---------------- */

const nonces = {};
const proofRequests = {};
const receivedProofs = {};

/* ---------------- ROUTES ---------------- */

/* ✔ NONCE ROUTE (used by BBS proof generation) */
>>>>>>> Stashed changes
app.get("/nonce", (req, res) => {
  const nonce = uuidv4();
  nonces[nonce] = true;
  res.json({ nonce });
});

<<<<<<< Updated upstream
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
=======
/* ✔ CREATE PROOF REQUEST (Verifier → Holder QR) */
app.post("/create-proof-request", (req, res) => {
  try {
    const id = uuidv4();

    const request = {
      id,
      nonce: uuidv4(),
      response_uri: "http://localhost:3001/submit-proof",
      requested_attributes: req.body.requested_attributes || [],
      requested_predicates: req.body.requested_predicates || []
    };

    proofRequests[id] = request;

    const request_uri = `http://localhost:3001/request/${id}`;

    res.json({
      id,
      request_uri
    });

  } catch (err) {
    console.error("create-proof-request error:", err);
    res.status(500).json({ error: "Failed to create proof request" });
  }
});

/* ✔ HOLDER SCANS THIS QR */
app.get("/request/:id", (req, res) => {
  const request = proofRequests[req.params.id];
  if (!request) return res.status(404).json({ error: "Request not found" });

  res.json(request);
});

/* ✔ HOLDER SENDS PROOF HERE */
app.post("/submit-proof", async (req, res) => {
  try {
    const { id, proofs } = req.body;

    if (!id || !proofs) {
      return res.status(400).json({ error: "Missing proof or id" });
    }

    const request = proofRequests[id];
    if (!request) {
      return res.status(404).json({ error: "Unknown request id" });
    }

    const result = await verifyProof(proofs);

    receivedProofs[id] = result;

    res.json({ status: "received" });

  } catch (err) {
    console.error("submit-proof error:", err);
>>>>>>> Stashed changes
    res.status(500).json({ error: "Verification failed" });
  }
});

<<<<<<< Updated upstream
/* ---------------- START SERVER ---------------- */

app.listen(3003, () => {
  console.log("ZKP Verifier running on port 3003");
});
=======
/* ✔ VERIFIER FRONTEND POLLS RESULT */
app.get("/verification-result/:id", (req, res) => {
  const result = receivedProofs[req.params.id];
  if (!result) return res.json({ status: "pending" });

  res.json(result);
});

/* ---------------- START SERVER ---------------- */

app.listen(3001, () => {
  console.log("Verifier server running on port 3001");
});
>>>>>>> Stashed changes

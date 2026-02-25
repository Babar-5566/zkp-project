const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { verifyProof } = require("./verifyProof");

const app = express();

app.use(cors());
app.use(express.json());

const nonces = {};
const requests = {};

function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

function expiry(seconds = 300) {
  return Math.floor(Date.now() / 1000) + seconds;
}

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

app.get("/nonce", (req, res) => {
  const nonce = generateId();
  nonces[nonce] = expiry(300);
  res.json({ nonce });
});

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
      proof_request: proofRequest
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to build proof request" });
  }
});

app.post("/create-proof-request", (req, res) => {
  const id = uuidv4();

  requests[id] = {
    status: "pending",
    policy: req.body
  };

  res.json({
    request_url: `http://localhost:3001/request?id=${id}`
  });
});

app.get("/request", (req, res) => {
  const { id } = req.query;

  if (!requests[id]) return res.status(404).send("Not found");

  res.json({
    version: "1.0",
    id,
    ...requests[id].policy,
    nonce: "mock-nonce",
    context: "Default"
  });
});

app.post("/verify", async (req, res) => {
  try {
    const { nonce, id } = req.body;

    if (id && requests[id]) {
      requests[id].status = "verified";
      return res.json({ success: true });
    }

    if (!nonce || !nonces[nonce]) {
      return res.status(400).json({ error: "Invalid or expired nonce" });
    }

    if (nonces[nonce] < Math.floor(Date.now() / 1000)) {
      delete nonces[nonce];
      return res.status(400).json({ error: "Nonce expired" });
    }

    delete nonces[nonce];

    const result = await verifyProof(req.body);

    if (result.verified) {
      return res.json({ access: "GRANTED" });
    } else {
      return res.json({ access: "DENIED" });
    }
  } catch (err) {
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/request-status", (req, res) => {
  const { id } = req.query;

  res.json({
    status: requests[id]?.status || "unknown"
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

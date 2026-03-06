const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const { verifyProof } = require("./verifyProof");

const fs = require("fs");
const path = require("path");
const usedNullifiers = new Set();

const app = express();

app.use(cors());
app.use(express.json());

const nonces = {};
const requests = {};

function generateId() {
  return crypto.randomBytes(16).toString("hex");
}

function expiry(seconds) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function buildBbsProofRequest({
  requested_attributes = [],
  requested_predicates = [],
  nonce
}) {
  const id = generateId();

  const issuerKeys = JSON.parse(
    fs.readFileSync(path.join(__dirname, "../../issuer/config/issuerKeys.json"))
  );

  const ISSUER_PUBLIC_KEY = issuerKeys.publicKey;
  return {
    version: "1.0",
    id,
    type: "BbsProofRequest",
    credential_type: "identity_credential",
    issuer_pubkey: ISSUER_PUBLIC_KEY,
    scope_id: "localhost_verifier",
    nonce,
    context: "Default",
    requested_attributes,
    requested_predicates,
    zk: {
      circuit_id: "age_check_v1",
      verification_key_id: "vk_01"
    },
    request_uri: `http://localhost:3001/request?id=${id}`,
    response_uri: `http://localhost:3001/verify`,
    expires_at: expiry(300)
  };
}

app.get("/nonce", (req, res) => {
  const nonce = generateId();
  nonces[nonce] = expiry(300);
  res.json({ nonce });
});

app.post("/create-proof-request", (req, res) => {
  try {
    const { requested_attributes = [], requested_predicates = [] } = req.body;
    const nonce = generateId();
    nonces[nonce] = expiry(300);

    const proofRequest = buildBbsProofRequest({
      requested_attributes,
      requested_predicates,
      nonce
    });

    requests[proofRequest.id] = {
      ...proofRequest,
      status: "pending",
      verifiedUsers: [],
      failedUsers: []
    };

    res.json(proofRequest);
  } catch (err) {
    console.log(err);

    res.status(500).json({ error: "Failed to build proof request" });
  }
});

app.post("/create-proof-request-mock", (req, res) => {
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

  if (!requests[id]) return res.status(404).send("Not found Hey");

  res.json(requests[id]);
});

// === Server Metrics for Telemetry ===
let lastVerifyTiming = null;

app.get("/metrics", (req, res) => {
  const mem = process.memoryUsage();
  const startCpu = process.cpuUsage();
  const startTime = Date.now();
  setTimeout(() => {
    const endCpu = process.cpuUsage(startCpu);
    const elapsed = (Date.now() - startTime) * 1000;
    const cpuPercent = ((endCpu.user + endCpu.system) / elapsed * 100).toFixed(1);
    res.json({
      cpuPercent,
      memoryMB: (mem.rss / 1024 / 1024).toFixed(1),
      uptime: process.uptime(),
      lastVerifyTiming
    });
  }, 100);
});

app.post("/verify", async (req, res) => {
  const verifyStart = Date.now();
  try {
    console.log(req.body.messages);

    const { id, nonce, proofs, nullifier, zkProof, verificationFailed, failureReason } = req.body;

    if (!nullifier) {
      return res.status(400).json({ error: "Nullifier is required." });
    }

    // Check korche aage ei proof use hoiche kina
    if (usedNullifiers.has(nullifier)) {
      console.log("❌ Double-spending detected! This proof was already used.");
      return res.status(400).json({ error: "This proof has already been used." });
    }

    // Notun proof hole Set e add kore nebe
    usedNullifiers.add(nullifier);
    console.log("✅ Nullifier accepted. Verifying proof...");

    // 1️⃣ Validate request ID
    if (!id || !requests[id]) {
      console.log("Invalid request ID");

      return res.status(400).json({ error: "Invalid request ID" });
    }

    const request = requests[id];

    // 2️⃣ Check request expiry
    if (Date.now() > new Date(request.expires_at).getTime()) {
      console.log("Request expired");
      request.status = "expired";
      return res.status(400).json({ error: "Request expired" });
    }

    // 3️⃣ Validate nonce matches the original request nonce
    if (!nonce || nonce !== request.nonce) {
      console.log("Invalid nonce");
      return res.status(400).json({ error: "Invalid nonce" });
    }

    // 🛑 Handle pre-failed submissions (holder already knows it failed)
    if (verificationFailed) {
      console.log("❌ Pre-failed verification received:", failureReason);
      request.failedUsers = request.failedUsers || [];
      request.failedUsers.push({
        subjectId: nullifier,
        timestamp: new Date().toISOString(),
        reason: failureReason || "Unknown failure"
      });
      return res.json({ access: "DENIED", reason: failureReason || "Unknown failure", nullifier });
    }

    // 4️⃣ Validate proofs exist
    if (!proofs || !Array.isArray(proofs) || proofs.length === 0) {
      console.log("No proofs provided");
      return res.status(400).json({ error: "No proofs provided" });
    }

    // 5️⃣ Cryptographically verify BBS+ proofs
    const result = await verifyProof({
      proofs,
      nonce,
      request
    });

    if (!result.verified) {
      console.log("❌ BBS+ proof verification failed!");
      request.failedUsers = request.failedUsers || [];
      request.failedUsers.push({
        subjectId: nullifier,
        timestamp: new Date().toISOString(),
        reason: "BBS+ proof verification failed"
      });
      return res.json({ access: "DENIED", reason: "BBS+ proof verification failed", nullifier });
    }

    // 5.5️⃣ Verify zk-SNARK proof (if present)
    if (zkProof && zkProof.proof && zkProof.publicSignals) {
      console.log("🔐 zk-SNARK proof received. Verifying...");
      const { verifyAgeProof } = require("./zkVerifier");
      const zkResult = await verifyAgeProof(zkProof.proof, zkProof.publicSignals);

      if (!zkResult.valid) {
        const zkReason = zkResult.reason || "zk-SNARK proof invalid";
        console.log("❌ zk-SNARK proof verification failed:", zkReason);
        request.failedUsers = request.failedUsers || [];
        request.failedUsers.push({
          subjectId: nullifier,
          timestamp: new Date().toISOString(),
          reason: zkReason
        });
        return res.json({ access: "DENIED", reason: zkReason, nullifier });
      }
      console.log("✅ zk-SNARK proof verified successfully!");
    }

    // 6️⃣ Mark request as verified
    request.status = "verified";
    const verifyTimeMs = Date.now() - verifyStart;
    lastVerifyTiming = { verifyTimeMs, timestamp: new Date().toISOString() };

    request.verifiedUsers.push({
      subjectId: proofs[0]?.subjectId || nullifier,
      timestamp: new Date().toISOString()
    });

    return res.json({ access: "GRANTED", verifyTimeMs });

  } catch (err) {
    console.error("Verification failed:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

app.get("/request-status", (req, res) => {
  const { id } = req.query;

  const request = requests[id];

  if (!request) {
    return res.json({ status: "unknown", verifiedUsers: [] });
  }
  res.json({
    status: request.status || "pending",
    verifiedUsers: request.verifiedUsers || [],
    failedUsers: request.failedUsers || []
  });
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

const issuerRoutes = require("./routes/issuerRoutes");
const revokeRoutes = require("./routes/revocationRoutes");
const revocationRoutes = require("./routes/revocationRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/issuer", issuerRoutes);
app.use("/api/revocation", revokeRoutes);
app.use("/api/revocation", revocationRoutes);

const PORT = process.env.PORT || 5000;
const { initializeKeys } = require("./config/keys");

initializeKeys();

// === Server Metrics for Telemetry ===
let lastProofTiming = null;

app.get("/metrics", (req, res) => {
  const mem = process.memoryUsage();
  // Sample CPU over 100ms for actual percentage
  const startCpu = process.cpuUsage();
  const startTime = Date.now();
  setTimeout(() => {
    const endCpu = process.cpuUsage(startCpu);
    const elapsed = (Date.now() - startTime) * 1000; // microseconds
    const cpuPercent = ((endCpu.user + endCpu.system) / elapsed * 100).toFixed(1);
    res.json({
      cpuPercent,
      memoryMB: (mem.rss / 1024 / 1024).toFixed(1),
      uptime: process.uptime(),
      lastProofTiming
    });
  }, 100);
});

app.post("/wallet/zkproof", async (req, res) => {
  try {
    const { dob, threshold } = req.body;

    if (!dob || !threshold) {
      return res.status(400).json({ error: "Missing dob or threshold" });
    }

    // Calculate age from dob string (DD/MM/YYYY)
    const parts = dob.split("/");
    const birthDate = new Date(
      parseInt(parts[2]),
      parseInt(parts[1]) - 1,
      parseInt(parts[0])
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    console.log(`🔐 zk-SNARK: Generating proof for age=${age}, threshold=${threshold}`);

    const startTime = Date.now();

    const wasmPath = path.resolve(__dirname, "../zk-factory/build/age_check_js/age_check.wasm");
    const zkeyPath = path.resolve(__dirname, "../zk-factory/build/age_check_final.zkey");

    const input = { age: age, ageThreshold: parseInt(threshold) };
    const { proof, publicSignals } = await snarkjs.groth16.fullProve(input, wasmPath, zkeyPath);

    const proofTimeMs = Date.now() - startTime;
    lastProofTiming = { proofTimeMs, timestamp: new Date().toISOString() };

    console.log(`✅ zk-SNARK proof generated in ${proofTimeMs}ms. Public signals: ${publicSignals}`);
    res.json({ proof, publicSignals, proofTimeMs });

  } catch (err) {
    console.error("zk-SNARK proof generation failed:", err);
    res.status(500).json({ error: "zk-SNARK proof generation failed: " + err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

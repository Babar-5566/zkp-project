require("dotenv").config();
const express = require("express");
const cors = require("cors");


const issuerRoutes = require("./routes/issuerRoutes");
const revokeRoutes = require("./routes/revocationRoutes");
// const revocationRoutes = require("./routes/revocationRoutes");

const app = express();

app.use(cors({
  origin: function (origin, callback) {
    // Allow any localhost origin (any port) or no origin (same-origin/Postman)
    if (!origin || origin.match(/^http:\/\/localhost:\d+$/)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));

app.use("/api/issuer", issuerRoutes);
app.use("/api/revocation", revokeRoutes);
// app.use("/api/revocation", revocationRoutes);

const PORT = process.env.PORT || 5000;
const { initializeKeys, getKeyPair } = require("./config/keys");

initializeKeys();

// Public key endpoint — verifier fetches this instead of reading key file directly
app.get("/api/issuer/public-key", (req, res) => {
  const kp = getKeyPair();
  if (!kp) return res.status(503).json({ error: "Keys not initialized" });
  res.json({ publicKey: Buffer.from(kp.publicKey).toString("base64") });
});

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



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

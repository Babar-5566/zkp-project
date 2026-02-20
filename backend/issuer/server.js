require("dotenv").config();
const express = require("express");
const cors = require("cors");

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

require("dotenv").config();
const express = require("express");
const cors = require("cors");

const issuerRoutes = require("./routes/issuerRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/issuer", issuerRoutes);

const PORT = process.env.PORT || 5000;
const { initializeKeys } = require("./config/keys");

initializeKeys();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

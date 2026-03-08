const express = require("express");
const router = express.Router();

const { revokeCredential } = require("../controllers/revokeCredential");
const { getRevocationState } = require("../controllers/getRevocationState");
const { authenticateIssuer } = require("../middleware/auth");

router.post("/revoke", authenticateIssuer, revokeCredential);
router.get("/state", getRevocationState);  // Public — verifier needs to read this

module.exports = router;
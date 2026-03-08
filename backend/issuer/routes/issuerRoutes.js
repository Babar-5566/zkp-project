const express = require("express");
const router = express.Router();
const { issueCredential } = require("../controllers/issuerController");
const { authenticateIssuer } = require("../middleware/auth");

router.post("/issue", authenticateIssuer, issueCredential);

module.exports = router;

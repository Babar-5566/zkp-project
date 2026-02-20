const express = require("express");
const router = express.Router();

const { revokeCredential } = require("../controllers/revokeCredential");
const { getRevocationState } = require("../controllers/getRevocationState");

router.post("/revoke", revokeCredential);
router.get("/state", getRevocationState);

module.exports = router;
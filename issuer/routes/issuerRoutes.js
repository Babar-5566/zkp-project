const express = require("express");
const router = express.Router();
const { issueCredential } = require("../controllers/issuerController");

router.post("/issue", issueCredential);

module.exports = router;

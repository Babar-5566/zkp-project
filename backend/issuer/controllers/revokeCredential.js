const { revoke } = require("../services/revocationStore");

async function revokeCredential(req, res) {
    try {
        const { index } = req.body;

        if (index === undefined) {
            return res.status(400).json({ error: "Missing index" });
        }

        revoke(index);

        res.json({
            success: true,
            message: `Credential at index ${index} revoked`
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Revocation failed" });
    }
}

module.exports = { revokeCredential };
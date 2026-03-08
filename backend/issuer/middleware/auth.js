/**
 * API Key authentication middleware for the Issuer server.
 * Protects sensitive endpoints (issue, revoke) from unauthorized access.
 * 
 * The API key is read from the ISSUER_API_KEY environment variable.
 * Clients must send it in the `x-api-key` header.
 */

function authenticateIssuer(req, res, next) {
  const apiKey = req.headers["x-api-key"];
  const expectedKey = process.env.ISSUER_API_KEY;

  if (!expectedKey) {
    console.warn("⚠️ ISSUER_API_KEY not set in .env — all requests will be rejected.");
    return res.status(500).json({ error: "Server misconfiguration: API key not set" });
  }

  if (!apiKey || apiKey !== expectedKey) {
    return res.status(403).json({ error: "Unauthorized — invalid or missing API key" });
  }

  next();
}

module.exports = { authenticateIssuer };

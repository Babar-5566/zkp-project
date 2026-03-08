# 🔐 ZKP Identity System — Security Audit Report

> **Audited on**: 2026-03-08  
> **Scope**: Full codebase — issuer backend, verifier backend, frontend (React + BBS+ + PLONK)

---

## Summary

| Severity | Count |
|----------|-------|
| 🔴 **Critical** | 4 |
| 🟠 **High** | 5 |
| 🟡 **Medium** | 4 |
| 🔵 **Low** | 3 |

---

## 🔴 Critical Vulnerabilities

### 1. Private Key Logged to Console - solved

**File**: [keys.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/config/keys.js#L16)

```js
console.log(keyPair);   /!!! Remove later !!!/
```

The issuer's **BLS12-381 secret key** is printed to stdout on every server start. If logs are captured (cloud hosting, CI/CD pipelines, log aggregation), the private key is exposed. An attacker with the secret key can **forge any credential**.

**Hackathon attack**: "Can you show me your server logs?" → instant compromise.

**Solution**:
```diff
- console.log(keyPair);   /!!! Remove later !!!/
+ // Never log key material
  console.log("Issuer keys loaded from file.");
```

Also remove similar debug logs in [signatureService.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/services/signatureService.js#L35-L37):
```diff
- console.log("sinature:"+signature);
- console.log("messages: "+messages);
- console.log("context: "+contextEncoded);
```

---

### 2. No Authentication on Issuer API — Anyone Can Issue Credentials - solved

**File**: [issuerRoutes.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/routes/issuerRoutes.js)

```js
router.post("/issue", issueCredential);  // No auth middleware!
```

There is **zero authentication** on the `/api/issuer/issue` endpoint. Anyone who can reach the server can issue valid, signed credentials for any identity.

**Hackathon attack**: `curl -X POST http://localhost:5000/api/issuer/issue -H "Content-Type: application/json" -d '{"idType":"Aadhaar Card","data":{"fullName":"FakeHacker","aadhaarNumber":"999999999999","dob":"01/01/2000","gender":"Male","address":"Fake","photoVerified":"Yes"}}'`

**Solution**: Add API key or JWT authentication middleware:
```js
// middleware/auth.js
function authenticateIssuer(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.ISSUER_API_KEY) {
    return res.status(403).json({ error: "Unauthorized" });
  }
  next();
}

// In routes:
router.post("/issue", authenticateIssuer, issueCredential);
```

---

### 3. No Authentication on Revocation API — Anyone Can Revoke Any Credential - solved

**File**: [revocationRoutes.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/routes/revocationRoutes.js)

```js
router.post("/revoke", revokeCredential);  // No auth!
```

**Hackathon attack**: An attacker can revoke **any credential by index** with a simple POST request, causing denial of service for legitimate holders.

**Solution**: Same auth middleware as #2, plus add validation that the revocation is authorized:
```js
router.post("/revoke", authenticateIssuer, revokeCredential);
```

---

### 4. Credentials Stored in localStorage — Vulnerable to XSS - solved

**File**: [WalletContext.jsx](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/frontend/src/context/WalletContext.jsx#L40-L47)

```js
const getStoredCredentials = () => {
  const stored = localStorage.getItem("credentials");
  return stored ? JSON.parse(stored) : [];
};
```

**Both credentials AND the holder secret** are stored in plain `localStorage`. Any XSS vulnerability (even from a third-party library) can steal all credentials and the holder's private secret.

**Hackathon attack**: "What if a malicious browser extension reads localStorage?"

**Solution**: Use **IndexedDB with encryption** or the **Web Crypto API** to encrypt before storage:
```js
// Encrypt credentials before storing
async function encryptAndStore(credentials, password) {
  const key = await deriveKey(password);
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: crypto.getRandomValues(new Uint8Array(12)) },
    key,
    new TextEncoder().encode(JSON.stringify(credentials))
  );
  localStorage.setItem("credentials_encrypted", btoa(String.fromCharCode(...new Uint8Array(encrypted))));
}
```

For hackathon scope, at minimum mention this as a **known limitation** and that production would use secure enclave / hardware-backed storage.

---

## 🟠 High Vulnerabilities

### 5. Wildcard CORS — Any Website Can Call Your APIs - solved

**Files**: [issuer/server.js:L12](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/server.js#L12), [verifier/server.js:L19](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/verifiers/barVerifier/server.js#L19)

```js
app.use(cors());  // Allows ALL origins
```

Any website can call your issuer and verifier APIs. A phishing page could issue credentials or submit fake proofs.

**Solution**:
```js
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  methods: ["GET", "POST"],
  credentials: true
}));
```

---

### 6. In-Memory Nullifier Storage — Lost on Server Restart - solved

**File**: [verifier/server.js:L10](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/verifiers/barVerifier/server.js#L10)

```js
const usedNullifiers = new Set();  // Gone on restart!
```

If the verifier server restarts, **all nullifiers are lost**, allowing **proof replay attacks** (double-spending). The same proof can be re-verified after a restart.

**Solution**: Persist nullifiers to a file or database:
```js
const NULLIFIER_FILE = path.join(__dirname, "data/nullifiers.json");

function loadNullifiers() {
  if (fs.existsSync(NULLIFIER_FILE)) {
    return new Set(JSON.parse(fs.readFileSync(NULLIFIER_FILE)));
  }
  return new Set();
}

function saveNullifier(nullifier) {
  usedNullifiers.add(nullifier);
  fs.writeFileSync(NULLIFIER_FILE, JSON.stringify([...usedNullifiers]));
}
```

---

### 7. In-Memory Request Storage — Proof Requests Lost on Restart - solved

**File**: [verifier/server.js:L23](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/verifiers/barVerifier/server.js#L23)

```js
const requests = {};  // All pending requests gone on restart
```

All proof requests, verification results, and audit trails are lost on server restart.

**Solution**: Use a file-based store (similar to [accumulator.json](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/data/accumulator.json)) or SQLite:
```js
// Minimal file-based persistence
function persistRequest(id, data) {
  const dir = path.join(__dirname, "data/requests");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${id}.json`), JSON.stringify(data, null, 2));
}
```

---

### 8. Verifier Reads Issuer Private Keys Directly from Filesystem - solved

**File**: [verifier/server.js:L40-L41](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/verifiers/barVerifier/server.js#L40-L41)

```js
const issuerKeys = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../../issuer/config/issuerKeys.json"))
);
```

The verifier reads the **full issuer key file** (which contains BOTH public AND secret keys) from the filesystem. Although it only uses `publicKey`, the secret key is loaded into memory unnecessarily.

**Hackathon attack**: "Your verifier has access to the issuer's secret key — that breaks the trust model."

**Solution**: 
1. Create a separate `issuerPublicKey.json` that only contains the public key
2. Or fetch it via API: `GET http://localhost:5000/api/issuer/public-key`

```js
// Option A: Read only public key file
const ISSUER_PUB_KEY = fs.readFileSync(
  path.join(__dirname, "../../issuer/config/issuerPublicKey.json"), "utf-8"
);

// Option B: Fetch from issuer API
app.get("/api/issuer/public-key", (req, res) => {
  res.json({ publicKey: Buffer.from(getKeyPair().publicKey).toString("base64") });
});
```

---

### 9. No Request Body Size Limit — Denial of Service - solved

**Files**: Both servers use `express.json()` without size limits.

```js
app.use(express.json());  // Accepts unlimited size payloads
```

An attacker can send a massive JSON payload (e.g., 100MB) to crash the server.

**Solution**:
```js
app.use(express.json({ limit: '1mb' }));
```

---

## 🟡 Medium Vulnerabilities

### 10. Nullifier is Deterministic and Predictable

**File**: [Verifier.jsx:L360-L367](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/frontend/src/pages/Verifier.jsx)

```js
const data = encoder.encode(holderSecret + proofRequest.id)
const hashBuffer = await crypto.subtle.digest("SHA-256", data)
```

The nullifier is `SHA-256(holderSecret + requestId)`. If the `holderSecret` is compromised (see #4), anyone can predict nullifiers and precompute them.

**Solution**: Add randomness (salt) to the nullifier:
```js
const salt = crypto.getRandomValues(new Uint8Array(16));
const data = encoder.encode(holderSecret + proofRequest.id + Array.from(salt).join(''));
```

---

### 11. Private Key Stored in Plain JSON on Filesystem - solved

**File**: [issuerKeys.json](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/config/issuerKeys.json)

The BLS secret key is stored as plain base64 in a JSON file. No encryption, no file permissions enforcement.

**Solution**: For production, use environment variables or a secrets manager:
```js
// Load from environment variable instead
const secretKey = Buffer.from(process.env.ISSUER_SECRET_KEY, "base64");
```

For hackathon, mention this as a known limitation and state that production would use HSM (Hardware Security Module) or AWS KMS.

---

### 12. No Input Sanitization on Credential Data - solved

**File**: [issuerController.js:L63-L66](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/controllers/issuerController.js#L63-L66)

```js
credentialSubject: {
  id: holderDid,
  ...data  // Raw user input spread directly into credential
}
```

User-supplied data is spread directly into the credential without sanitization. A malicious user could inject extra fields (e.g., `"admin": true`, `"type": "malicious"`).

**Solution**: Whitelist allowed fields per document type:
```js
const ALLOWED_FIELDS = {
  'Aadhaar Card': ['fullName', 'aadhaarNumber', 'dob', 'gender', 'address', 'photoVerified'],
  // ... etc
};

const sanitized = {};
const allowed = ALLOWED_FIELDS[idType] || [];
for (const key of allowed) {
  if (data[key] !== undefined) sanitized[key] = data[key];
}
```

---

### 13. Nonces Never Cleaned Up — Memory Leak - solved

**File**: [verifier/server.js:L22](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/verifiers/barVerifier/server.js#L22)

```js
const nonces = {};  // Grows forever
```

Nonces are created but never removed after use or expiry. Over time this causes a memory leak.

**Solution**: Clean up expired nonces periodically:
```js
// Clean up every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [nonce, expiry] of Object.entries(nonces)) {
    if (now > new Date(expiry).getTime()) delete nonces[nonce];
  }
  // Also clean up old requests & rate limit trackers
  for (const [id, tracker] of Object.entries(requestAttempts)) {
    if (now - tracker.firstAttemptAt > RATE_LIMIT_WINDOW_MS * 10) delete requestAttempts[id];
  }
}, 5 * 60 * 1000);
```

---

## 🔵 Low Vulnerabilities

### 14. Debug Console Logs Leak Sensitive Data in Production - solved

**Multiple files** contain `console.log` statements that output credential data, proof details, and internal state:

| File | Line | Leaked Data |
|------|------|-------------|
| [issuerController.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/controllers/issuerController.js#L87) | 87 | Full VC with signature |
| [signatureService.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/services/signatureService.js#L35) | 35-37 | Signature, messages |
| [bbsProver.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/frontend/src/utils/bbsProver.js#L41) | 41 | Full VC object |
| [Verifier.jsx](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/frontend/src/pages/Verifier.jsx) | Multiple | Proof data, nullifiers |

**Solution**: Use a proper logging library with log levels:
```js
const logger = require('pino')({ level: process.env.LOG_LEVEL || 'info' });
// Replace console.log with logger.debug() for sensitive data
```

---

### 15. Duplicate Route Registration - solved

**File**: [issuer/server.js:L7-L8, L16-L17](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/server.js#L7-L17)

```js
const revokeRoutes = require("./routes/revocationRoutes");
const revocationRoutes = require("./routes/revocationRoutes");  // Duplicate!

app.use("/api/revocation", revokeRoutes);
app.use("/api/revocation", revocationRoutes);  // Duplicate!
```

The revocation routes are registered twice — each request hits the handlers twice.

**Solution**: Remove the duplicate:
```diff
  const revokeRoutes = require("./routes/revocationRoutes");
- const revocationRoutes = require("./routes/revocationRoutes");

  app.use("/api/revocation", revokeRoutes);
- app.use("/api/revocation", revocationRoutes);
```

---

### 16. Public Key Sent in Every Credential Response - solved

**File**: [issuerController.js:L84](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/controllers/issuerController.js#L84)

```js
publicKey: Buffer.from(getKeyPair().publicKey).toString("base64")
```

The issuer's public key is embedded in every credential. While not a vulnerability per se, it means the public key is distributed widely. In a production system, the public key would be fetched from a DID Document or a well-known endpoint.

**Solution**: Provide a public key endpoint instead:
```js
app.get("/api/issuer/.well-known/public-key", (req, res) => {
  res.json({ publicKey: Buffer.from(getKeyPair().publicKey).toString("base64") });
});
```

---

## 🏗️ Architectural Concerns for Hackathon Judges

### A. Trust Model Violation

The verifier directly reads the issuer's key file from the filesystem. In a real SSI system, the issuer and verifier are **separate entities** that communicate only through:
- Public key registries (DID methods)
- Verifiable Data Registries (blockchain)

**Judge question**: "How does the verifier trust the issuer's public key?"

**Answer to prepare**: "In our prototype, we use a shared filesystem for simplicity. In production, we would use a DID method (e.g., `did:web` or `did:ethr`) where the issuer publishes their public key to a verifiable registry, and the verifier resolves it independently."

---

### B. No Holder Binding

There is no cryptographic binding between the holder and the credential. Once issued, **anyone** who has the credential JSON can present it. The `holderCommitment` field exists but is never verified during proof presentation.

**Judge question**: "What prevents credential sharing or theft?"

**Solution to propose**: Implement holder binding using the holderCommitment:
```
1. During issuance: holder sends commitment = hash(holderSecret)
2. During presentation: holder proves knowledge of holderSecret via ZK proof
3. Verifier checks: commitment in credential matches the proof
```

---

### C. No Credential Expiry Enforcement

Credentials have an `issuanceDate` but no `expirationDate`. Once issued, a credential is valid forever (unless manually revoked).

**Solution**: Add expiry to credentials and check during verification:
```js
// In issuerController.js
expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

// In verifier
if (new Date(credential.expirationDate) < new Date()) {
  return { access: "DENIED", reason: "Credential expired" };
}
```

---

### D. Revocation Check Depends on Issuer Being Online

**File**: [verifier/server.js:L277](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/verifiers/barVerifier/server.js#L277)

The verifier calls `http://localhost:5000/api/revocation/state` during verification. If the issuer is down, verification fails (fail-closed, which is good — but makes the system fragile).

**Solution**: Cache the revocation list with a TTL:
```js
let cachedRevocationList = null;
let lastFetched = 0;
const CACHE_TTL = 60000; // 1 minute

async function getRevocationList() {
  if (cachedRevocationList && Date.now() - lastFetched < CACHE_TTL) {
    return cachedRevocationList;
  }
  const res = await fetch("http://localhost:5000/api/revocation/state");
  cachedRevocationList = await res.json();
  lastFetched = Date.now();
  return cachedRevocationList;
}
```

---

## ✅ Quick Wins (Fix Before Demo)

These are changes you can make in **under 30 minutes** that dramatically improve security posture:

1. **Remove `console.log(keyPair)`** from [keys.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/config/keys.js) — 5 seconds
2. **Remove debug console.logs** from [signatureService.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/services/signatureService.js) — 10 seconds
3. **Fix duplicate routes** in [issuer/server.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project/backend/issuer/server.js) — 10 seconds
4. **Add CORS whitelist** to both servers — 2 minutes
5. **Add `express.json({ limit: '1mb' })` body size limit** — 30 seconds
6. **Add basic API key auth** to issuer routes — 10 minutes
7. **Persist nullifiers to file** — 15 minutes

---

## 🎯 Responses to Potential Judge Questions

| Question | Prepared Answer |
|----------|----------------|
| "How do you prevent credential forgery?" | "BBS+ signatures — only the issuer with the private key can sign. The verifier independently verifies using the public key." |
| "What prevents double-usage of proofs?" | "Nullifier scheme — SHA-256(holderSecret + requestId) is stored after first use. We acknowledge the current in-memory implementation needs persistence for production." |
| "How do you handle key compromise?" | "We have a revocation mechanism via an accumulator. Compromised credentials can be revoked by index. For key rotation, we would re-issue all credentials — this is a known limitation." |
| "Is the holder truly anonymous?" | "BBS+ provides unlinkability — proofs from the same credential can't be correlated. The nullifier is request-specific, so different verifiers see different nullifiers." |
| "Where are the ZK circuits trusted setup?" | "We use PLONK (universal setup) via snarkjs. The trusted setup ceremony is done once per circuit type, not per user." |

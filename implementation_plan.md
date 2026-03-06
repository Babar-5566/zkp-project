# Revocation Check in Verifier Backend

Add a revocation cross-check step in the verifier's `/verify` endpoint so that when a proof is submitted, the verifier queries the issuer's accumulator to verify the credential has not been revoked — **before** granting access.

## Proposed Changes

### Frontend — Include `revocationIndex` in verify payload

#### [MODIFY] [Verifier.jsx](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project-local/frontend/src/pages/Verifier.jsx)

In **both** proof-submission flows ([handleMappingConfirm](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project-local/frontend/src/pages/Verifier.jsx#229-411) and [startGeneration](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project-local/frontend/src/pages/Verifier.jsx#412-667)), the `verifyPayload` must include the `revocationIndex` from the selected credential's `credentialStatus`:

```diff
 const verifyPayload = {
   id: proofRequest.id,
   nonce: proofRequest.nonce,
   proofs: proof,
-  nullifier
+  nullifier,
+  revocationIndex: vc?.credentialStatus?.index ?? null
 }
```

Same change applies in both the QR-scan-based flow ([handleMappingConfirm](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project-local/frontend/src/pages/Verifier.jsx#229-411), ~line 366) and the direct flow ([startGeneration](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project-local/frontend/src/pages/Verifier.jsx#412-667), ~line 612). We also include it in the failure payloads.

---

### Verifier Backend — Check revocation before granting access

#### [MODIFY] [server.js](file:///c:/Users/sk%20babar%20ali/Desktop/Coding/Babar%20Coding/zkp-project-local/Backend/verifiers/barVerifier/server.js)

Add a new step **between the zk-SNARK verification (step 5.5) and the final "GRANTED" response (step 6)**:

**Step 5.6 — Revocation check:**
1. Extract `revocationIndex` from `req.body`
2. If `revocationIndex` is present (non-null):
   - Fetch `GET http://localhost:5000/api/revocation/state` from the issuer
   - Check if the index exists in the returned `revokedIndices` array
   - If revoked → return `{ access: "DENIED", reason: "Credential has been revoked" }`
3. If `revocationIndex` is `null`/missing → skip check (backward compatible with old credentials)

Also extract `revocationIndex` from the destructured `req.body` at line 140.

## Verification Plan

### Manual Verification

1. **Restart servers** after making changes:
   - Restart issuer: `node server.js` in `Backend/issuer/`  
   - Restart verifier: `node server.js` in `Backend/verifiers/barVerifier/`
   - Restart frontend: `npm run dev` in `frontend/`

2. **Test: Non-revoked credential passes**
   - Issue a new credential via the Issuer page
   - Generate & submit a proof via the Verifier page
   - Expected: `access: "GRANTED"` (revocation check passes since index is not in `revokedIndices`)

3. **Test: Revoked credential is blocked**
   - Note the `credentialStatus.index` of a credential (check browser console or wallet)
   - Revoke it: `curl -X POST http://localhost:5000/api/revocation/revoke -H "Content-Type: application/json" -d "{\"index\": <THE_INDEX>}"`
   - Try to generate & submit a proof with that credential
   - Expected: `access: "DENIED"` with reason `"Credential has been revoked"`
   - The verifier server console should log ❌ Credential revoked

4. **Test: Old credentials without status still work**
   - If any credential lacks `credentialStatus`, it should still be verified normally (backward compatible)

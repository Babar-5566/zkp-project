# 1️⃣ Protocol Description

## 1. System Overview

This system implements a privacy-preserving digital identity framework using Zero-Knowledge Proofs (ZKP).

The architecture follows a decentralized identity model consisting of three main entities:

- Issuer
- Holder (Wallet)
- Verifier

The system allows a holder to prove specific attributes of a credential without revealing the entire credential, ensuring privacy, integrity, and unforgeability.

The protocol ensures:

- Selective disclosure
- Unlinkability
- Unforgeability
- Integrity
- Zero-knowledge privacy

---

## 2. Entities

### 2.1 Issuer

The Issuer is a trusted authority responsible for:

- Verifying real-world identity or attributes
- Generating digital credentials
- Signing credentials using its private key

The issuer holds:

- Public key (shared)
- Private key (secret)

Only the issuer can generate valid credentials.

---

### 2.2 Holder (Wallet)

The Holder is the user who:

- Receives credential from issuer
- Stores credential securely in wallet
- Generates zero-knowledge proofs when required

The holder never reveals the full credential unless required.

---

### 2.3 Verifier

The Verifier is an entity that:

- Requests proof of specific attributes
- Verifies the zero-knowledge proof
- Does not learn hidden attributes

The verifier uses the issuer's public key to validate authenticity.

---

## 3. Credential Issuance Flow

**Step 1: Identity Verification**  
Issuer verifies holder’s real-world information.

**Step 2: Credential Creation**  
Issuer creates credential:

```bash
Credential = {
id,
attributes,
issuanceDate,
issuerID
}
```
  
**Step 3: Digital Signature**  
Issuer signs credential using private key:

```bash
Signature = Sign_privateKey(Hash(Credential))
```

**Step 4: Delivery**  
Signed credential is securely transmitted to Holder.

**Step 5: Storage**  
Holder stores credential in wallet.

**Security Properties Achieved:**

- Integrity
- Unforgeability
- Authenticity

---

## 4. Proof Generation Flow (Selective Disclosure)

When a verifier requests proof:

**Example request:**

```bash
Prove age ≥ 18
```

**Step 1:** Holder selects required attribute  
**Step 2:** Holder generates Zero-Knowledge Proof:

```bash
Proof = ZKP(credential, hidden_attributes, disclosed_attributes)
```

**Step 3:** Proof includes:

- Selectively disclosed attributes
- Cryptographic proof
- Issuer signature reference

**Important:**  
Holder does NOT reveal entire credential.

**Security Properties:**

- Zero-knowledge
- Selective disclosure
- Unlinkability

---

## 5. Verification Flow

**Step 1:** Verifier receives:

- Disclosed attributes
- ZKP proof

**Step 2:** Verifier checks:

- Signature validity using issuer public key
- Correctness of ZKP

**Step 3:**  
If verification succeeds → Access granted  
Else → Access denied

Verifier learns:

- Only requested attributes
- Nothing about hidden fields

---

## 6. Cryptographic Primitives Used

### 1. Digital Signatures

Used for credential authenticity and selective disclosure.

- BBS+ Signatures (for signing credentials and generating selective disclosure proofs)

---

### 2. Hash Function

Used to ensure data integrity and for ZK circuit proofs.

- Poseidon Hash (used inside PLONK circuits, ~250 constraints vs ~28,000 for SHA-256)

---

### 3. Zero-Knowledge Proof System

Used to prove possession of credential attributes without revealing full data.

- PLONK (zk-SNARK) — used for equality, numeric/range, date comparison, and set membership proofs
- BBS+ selective disclosure — used for existence and reveal predicates

---

```bash
Issuer → Holder : Signed Credential
Holder → Verifier : Selective ZKP Proof
Verifier → Holder : Verification Result
```

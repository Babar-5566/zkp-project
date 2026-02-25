# 2️⃣ Working Prototype (Issuer, Holder, Verifier)
## 1. System Implementation Overview

The working prototype implements a functional Zero-Knowledge Credential system consisting of:

- Issuer Service (Backend)

- Holder Wallet (Frontend)

- Verifier Service (Frontend/Backend)

- Automated Demo Script

The prototype demonstrates:

- Credential issuance

- Secure storage in wallet

- Selective disclosure proof generation

- Cryptographic verification

- Privacy-preserving authentication flow

Technologies Used

- JavaScript / Node.js (Backend)

- React (Frontend)

- Cryptographic libraries (BBS+, Schnorr, or chosen ZKP scheme)

___

## 2. System Architecture
## 2. System Architecture

```text
+------------+        +------------+        +-------------+
|   Issuer   | -----> |   Holder   | -----> |   Verifier  |
|  (Server)  |        |  (Wallet)  |        |  (Service)  |
+------------+        +------------+        +-------------+
     |                       |                    |
     |--- Signed Credential->|                    |
                             |--- ZK Proof ------>|
                                                  |
                                      Verification Result
``` 
___
## 3. Issuer Component
### 3.1 Responsibilities

The Issuer:

* Verifies real-world identity

* Creates digital credential

* Signs credential using private key

* Returns signed credential to holder

### 3.2 API Endpoint

POST /issue-credential

Input
{
  "id": "12345",
  "name": "John Doe",
  "age": 21,
  "citizenship": "Indian"
}
Process

1. Create credential object

2. Hash credential

3. Sign using issuer private key

4. Return signed credential

Output
{
  "credential": {...},
  "signature": "0xABC123..."
}

___
## 4. Holder (Wallet) Component
### 4.1 Responsibilities

The Holder:

* Receives signed credential

* Stores credential securely

* Selects attributes to disclose

* Generates Zero-Knowledge Proof

### 4.2 Wallet Features

- View stored credentials

- Selective disclosure UI

- Generate proof button

- Show raw proof (optional debug mode)

### 4.3 Proof Generation Logic

When verifier requests:

Example:
Prove age ≥ 18

Holder performs:

Proof = GenerateZKP(
    credential,
    disclosed_fields,
    hidden_fields,
    issuer_signature
)

Proof contains:

* Disclosed attributes

* ZK cryptographic proof

* Signature reference

The full credential is never revealed.

___
## 5. Verifier Component
### 5.1 Responsibilities

The Verifier:

* Requests specific attributes

* Receives ZKP proof

* Verifies authenticity and correctness

### 5.2 Verification Steps

* Validate issuer signature using public key

* Verify zero-knowledge proof

- Check requested predicate (e.g., age ≥ 18)

### 5.3 Output
Verification Result:
✔ Valid Proof → Access Granted
✖ Invalid Proof → Access Denied
___
## 6. Automated Demo Script

To demonstrate the complete workflow automatically:

### 6.1 Demo Flow

1. Start Issuer Server

2. Start Wallet (Holder)

3. Start Verifier

4. Then automatically:

* Issue credential

* Store in wallet

* Generate proof for age ≥ 18

* Send proof to verifier

* Display verification result

### 6.2 Demo Execution Example
#### Start backend
npm run server

#### Start frontend
npm run dev

#### Run automated demo
node demo.js
### 6.3 Automated Script Logic (Pseudo-code)
async function runDemo() {
  const credential = await issueCredential(userData);
  storeInWallet(credential);

  const proof = generateProof({
    predicate: "age >= 18"
  });

  const result = await verifyProof(proof);

  console.log("Verification Result:", result);
}

___
## 7. Security Guarantees Demonstrated

The working prototype proves:

✔ Selective Disclosure

✔ Zero-Knowledge Privacy

✔ Signature-based Authenticity

✔ Unforgeability

✔ Integrity Protection

✔ Predicate Proof (e.g., age ≥ 18)
___

## 8. Privacy Properties Observed in Demo
Property	Demonstrated
Selective Disclosure ------	Yes  
Unlinkability ------ Yes  
Hidden Attribute Protection ------	Yes  
Issuer Signature Validation ------	Yes  
Zero-Knowledge Proof Correctness ------	Yes  

___
## 9. Implementation Notes

* Issuer private key is securely stored

* Public key is shared with verifier

* Proof generation occurs client-side (Holder)

* Verifier does not access full credential

* Raw proof inspection mode available for debugging

___
## 10. Summary

The working prototype successfully demonstrates a complete end-to-end Zero-Knowledge Credential system with:

* Issuance

* Secure storage

* Selective disclosure

* Privacy-preserving verification

* Automated demonstration

___


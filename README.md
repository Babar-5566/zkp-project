# ZKP Multi-System Attribute Verification Prototype

## Overview
This project is a decentralized prototype for an e-ID and attribute verification system using **Zero-Knowledge Proofs (ZKP)**. It allows users to store credentials locally and generate cryptographic proofs on the frontend, ensuring **data privacy** and **non-linkability**.

## Key Features
- **Issuer Module:** Handles e-ID application flows and generates digitally signed credentials.
- **Wallet Module:** Securely stores user data in local storage and executes ZKP generation directly on the frontend.
- **Verifier Module:** Utilizes a QR scanner system to request specific attributes and verifies the submitted proofs.
- **Anti-Replay Security:** Implements a nullifier system to securely track verification requests.
- **Selective Disclosure:** Uses BBS+ signatures for exact value disclosures and existence checks.

## System Architecture & Workflow

### 1. Architecture Overview
The system is divided into three main decentralized modules:

- **Issuer:** Generates and digitally signs user credentials (e-ID).  
- **Wallet:** Stores data locally on the user's device and generates proofs on the frontend.  
- **Verifier:** Requests specific attributes via a scanner and verifies the cryptographic proof.  


### 2. Step-by-Step Workflow

#### Phase A: Credential Issuance
1. **User Request:** User fills out the e-ID form on the Issuer platform.  
2. **Signature Generation:** Issuer digitally signs the verified attributes.  
3. **Local Storage:** The signed credential is sent to the user and stored securely in their local Wallet (Decentralized).  

#### Phase B: Proof Request
4. **Request Generation:** Verifier creates a verification request (specifying required attributes and a nonce) and displays it as a QR code.  
5. **Scan & Parse:** User scans the QR code using their Wallet scanner to read the request.  

#### Phase C: Frontend Proof Generation
6. **Predicate Routing:** The Wallet identifies the required cryptographic function:  
   - **BBS+:** Used for selective disclosure (`existence`, `reveal`).  
   - **PLONK:** Used for zero-knowledge predicate proofs (`equality`, `numeric/range`, `date comparison`, `set membership`).  
7. **Local Execution:** The Wallet generates the Zero-Knowledge Proof directly on the frontend, ensuring raw data never leaves the device.  
8. **Nullifier Creation:** A unique nullifier is generated for this specific transaction to prevent replay attacks.  

#### Phase D: Verification & Access
9. **Submission:** The Wallet sends the generated ZK Proof and Nullifier to the Verifier's backend.  
10. **Validation:** The Verifier checks the proof's validity and ensures the nullifier hasn't been used before.  
11. **Result:** The Verifier grants or denies access based on the cryptographic response.  

### 3. Visual Workflow Chart
#### Roles :-
- Justin as User (Wallet / Frontend)
- Gov. of India as Issuer
- Bar Security as Verifier (Backend)

#### Phase A: Issuance
- Justin->>Gov. of India: Submit e-ID Form Data

![Submitting e-ID](images/SelectDoc.png)
![Submitting e-ID](images/UserFormToIssuer.png)
- Gov. of India-->>Justin: Return Digitally Signed Credential
- Note over Justin: Store data in Local Storage

![Empty Wallet](images/EmptyWallet.png)
![Wallet](images/Wallet.png)

#### Phase B: Proof Request
- Bar Security->>Justin: Display QR Code (Attributes required + Nonce)

![Verifier](images/Verifier.png)
![Searching Attributes](images/VerifierSearch.png)
![QR Generated](images/QRCodeByVerifier.png)
- Justin->>Justin: Scan QR Code & Parse

![Scan QR](images/ScanQRCode.png)

#### Phase C: Frontend Proof Generation
- Justin->>Justin: Route to BBS+ or PLONK
- Justin->>Justin: Generate ZK Proof locally
- Justin->>Justin: Generate Nullifier

![Select Credential](images/SelectDocForProof.png)
![Proof Generated](images/ProofGenerated.png)

#### Bar Security: Phase D: Verification
- Justin->>Bar Security: Send ZK Proof + Nullifier

![Proof Sent to verifier](images/ProofGenerated.png)
- Bar Security->>Bar Security: Validate Proof & Check Nullifier
- Bar Security-->>Justin: Grant/Deny Access Result

![Verified Users](images/ListOfVerifiedUsers.png)
    
### Predicate Mapping
**Handled by BBS+ :**
- `existence`: Proves the Issuer signed the attribute without revealing its value.  
- `reveal`: Reveals the attribute value to the Verifier (selective disclosure).  
**Handled by PLONK (zk-SNARK) :**
- `equality`: Proves a categorical field matches the expected value without revealing it (e.g., gender, board).  
- `numeric/range`: Proves a numeric value satisfies a threshold (e.g., age ≥ 18, marks ≥ 60).  
- `date comparison`: Proves a date satisfies a comparison without revealing the actual date (e.g., expiry date is in the future).  
- `set membership`: Proves a value belongs to an allowed set without revealing which one (e.g., nationality ∈ {India, USA}).  

### Tech Stack
- **Frontend:** React  
- **Backend:** Node.js, Express.js  
- **Security & Environment:** CORS, dotenv  
- **Cryptography:** BBS+ Signatures, PLONK (zk-SNARK)  
- **Repository:** `Babar-5566/zkp-project.git`

___


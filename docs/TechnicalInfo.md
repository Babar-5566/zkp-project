# Techninal Informations used in the project 
---
## Installation and Setup :-
### Prerequisites
- Node.js installed on the machine
### 1. Issuer Backend Setup
```bash
cd backend/issuer
```
```bash
npm init -y
```
```bash
npm install @mattrglobal/bbs-signatures cors dotenv express uuid        OR         npm install i
```
```bash
node server.js
```
### 2. Verifier Backend Setup
```bash
cd backend/verifiers/barVerifier
```
```bash
npm init -y
```
```bash
npm install @mattrglobal/bbs-signatures cors dotenv express uuid        OR         npm install i
```
```bash
node server.js
```
### Frontend Setup
```bash
cd frontend
```
```bash
npm install @mattrglobal/bbs-signatures axios buffer clsx framer-motion html5-qrcode lucide-react process qrcode.react tailwind-merge react react-dom        OR         npm install i
```
```bash
npm install
```
```bash
npm run dev
```
---
## Schema for different certificates :-
```  bash
- Aadhaar: [
        "fullName", "aadhaarNumber", "dob", "gender", "address", "photoVerified",
        "issuer",
    ],
- PAN: [
        "fullName", "panID", "guardianName", "dob",
        "issuer",
    ],
- Passport: [
        "fullName", "passportID", "nationality", "dob",
        "expiryDate", "issuer",
    ],
- DrivingLicense: [
        "fullName", "licenseID", "dob", "issueDate",
        "expiryDate", "issuer", 
    ],
- BirthCertificate: [
        "fullName", "dob", "placeOfBirth", "fatherName",
        "motherName", "issuer",
    ],
- "12thMarksheet": ["fullName", "board", "rollNumber", "marks", "school", "dob", "issuer"],
- "12thAdmit": ["fullName", "board", "rollNumber", "school", "dob", "issuer"],
- "10thMarksheet": ["fullName", "board", "rollNumber", "marks", "school", "dob", "issuer"],
- "10thAdmit": ["fullName", "board", "rollNumber", "school", "dob", "issuer"],
- UniversityDegree: ["fullName", "university", "rollNumber", "passingYear", "issuer"]
```
---
## Types of predicate :-
```bash
fullName	existence, reveal
aadhaarNumber	existence, reveal
dob	existence, reveal, date comparison, numeric/range
gender	existence, reveal, equality, set membership
address	existence, reveal
photoVerified	existence, reveal, equality, set membership
panID	existence, reveal
guardianName	existence, reveal
passportID	existence, reveal
nationality	existence, reveal, equality, set membership
expiryDate	existence, reveal, date comparison
licenseID	existence, reveal
issueDate	existence, reveal, date comparison
placeOfBirth	existence, reveal
fatherName / motherName	existence, reveal
board	existence, reveal, equality, set membership
rollNumber	existence, reveal
school	existence, reveal
marks	existence, reveal, numeric/range
university	existence, reveal
passingYear	existence, reveal, numeric/range
```

# Predicate Behavior Details

This document describes how different predicates are handled across **BBS+ proofs** and **PLONK circuits**.

---

# 1. `existence` — BBS+

## Behavior
- Do **NOT** add the attribute index to `revealIndices` in `bbsProver.js`.
- A **BBS+ proof already proves that all signed messages exist** without revealing them.

## Implementation
Skip adding the attribute index for the `existence` predicate.

```js
// Do nothing for existence predicate
// BBS+ proof inherently proves all signed messages exist
// without needing to reveal them
```

## Result
- Attribute existence is proven.
- Attribute value remains hidden.

---

# 2. `reveal` — BBS+

## Behavior
- Add the attribute index to `revealIndices`.
- Return the revealed message values inside the proof response.

## Backend Handling
The backend stores revealed attributes inside:

```
verifiedUsers
```

records.

## Frontend Handling
`VerificationResults.jsx` displays the revealed attributes.

## Schema Requirement
Add `reveal` to every field's predicate list in:

```
schema.js
```

Example:

```js
predicates: ["existence", "reveal"]
```

## Result
- Attribute value is revealed to the verifier.
- Value is verified against the issuer signature.

---

# 3. `equality` — PLONK Circuit

## Supported Fields

Categorical fields:

- `gender`
- `board`
- `nationality`
- `photoVerified` (boolean folded in)

## Encoding Strategy

Strings are converted to integers using encoding tables in `plonkProver.js`.

```bash
EQUALITY_ENCODINGS = {
    gender: { "Male": 1, "Female": 2, "Other": 3 },
    photoVerified: { "Yes": 1, "No": 0 },
    nationality: { "India": 1, "USA": 2, "UK": 3, "Canada": 4, "Australia": 5 },
    board: {
        "WBBSE (West Bengal Board of Secondary Education)": 1,
        "WBCHSE (West Bengal Council of Higher Secondary Education)": 2,
        "CBSE (Central Board of Secondary Education)": 3,
        "ICSE (Council for the Indian School Certificate Examinations)": 4,
        "ISC (Indian School Certificate)": 5,
        "NIOS (National Institute of Open Schooling)": 6
    }
}
```

## Circuit Logic

Constraint enforced:

```
value == expected
```

Circuit: `equality_check.circom`

## Result
- Verifier confirms equality.
- Actual value remains hidden.

---

# 4. `numeric / range` — PLONK Circuit

## 4.1 `dob → age`

Circuit: `age_check.circom`

Constraint:

```
age ≥ threshold
```

Age is computed from DOB (DD/MM/YYYY) on the client side before proving.

---

## 4.2 `marks`

Circuit: `range_check.circom`

Constraint:

```
marks ≥ threshold
```

Implementation:

- 8-bit comparator
- Range: **0 – 100**

---

## 4.3 `passingYear`

Circuit: `year_check.circom`

Constraint:

```
passingYear ≤ threshold
```

Implementation:

```
LessEqThan(16)
```

---

# 5. `date comparison` — PLONK Circuit

## Step 1: Convert Date → Integer

Convert dates into **epoch-days** using UTC to avoid timezone issues.

```js
const utcMs = Date.UTC(year, month - 1, day);
Math.floor(utcMs / 86400000);
```

## Circuit Logic

Circuit: `date_check.circom`

Constraint:

```
dateValue > dateThreshold
```

Uses `epochThreshold - 1` internally to achieve `>=` semantics (same-day passes).

## Implementation

- 32-bit comparator

## Supported Fields

- `expiryDate`
- `issueDate`

---

# 6. `set membership` — PLONK Circuit

## Behavior
- Proves a value belongs to an allowed set without revealing which value it is.
- Set holds up to **8** values (padded with 0).

## Circuit Logic

Circuit: `set_membership.circom`

```
value ∈ {set[0], set[1], ..., set[7]}
```

## Encoding
Uses the same `EQUALITY_ENCODINGS` table as equality predicate.

## Supported Fields

- `gender`
- `nationality`
- `photoVerified`
- `board`

## Result
- Verifier confirms value is in the allowed set.
- Actual value remains hidden.

---

# Summary

| Predicate | System Used | Purpose |
|---|---|---|
| existence | BBS+ | Prove attribute exists |
| reveal | BBS+ | Reveal attribute value |
| equality | PLONK | Check categorical equality |
| numeric/range | PLONK | Check numeric thresholds |
| date comparison | PLONK | Compare dates |
| set membership | PLONK | Prove value is in allowed set |

## Predicate → Proof System Mapping
```bash
Existence → BBS+ only
Reveal → BBS+ only
Equality → PLONK (zk-SNARK)
Numeric/Range → PLONK (zk-SNARK)
Date Comparison → PLONK (zk-SNARK)
Set Membership → PLONK (zk-SNARK)
```
---
## REQUEST SCHEMAS
### Verifier requests from the user (or wallet) :-
```bash
(Verifier → Wallet)
{
  "version": "1.0",
  "id": "request-uuid",
  "type": "BbsProofRequest",

  "credential_type": "identity_credential",
  "issuer_pubkey": "issuer-key",

  "scope_id": "verifier.example.com",

  "nonce": "random-challenge",
  "context": "Default",

  "requested_attributes": [
    { "name": "fullName", "predicate": "reveal" }
  ],

  "requested_predicates": [
    { "name": "age", "predicate": "range", "min": 18 }
  ],

  "zk": {
    "circuit_id": "age_check_v1",
    "verification_key_id": "vk_01"
  },

  "response_uri": "https://verifier.com/api/verify",
  "expires_at": 1710000000,

  "status":"pending",
  "verifiedUsers":[
    {
      "subjectId":"fc153fa1aa058b3e6104426d2344136dd9fdde9dbcd8165e12db0141608c1397",
      "timestamp":"2026-03-02T00:18:10.142Z"
    }
  ]

}
```
Example :-
```bash
{
  "version": "1.0",
  "id": "fa1e98e3fae3c31a1caf93f8cbf12466",
  "type": "BbsProofRequest",
  "credential_type": "identity_credential",
  "issuer_pubkey": "txyTIDnBfboTY/b/ADO1++12ACwcYWWuJNG/jDAQVd3mwz1zgE0b/QmLmUiWOb0NAxNZMHUU53BDiM/+t5H/56lIF6y5woIvhY1CmL4nWJ455WDLLJG21zbVzsjFiLH2",
  "scope_id": "localhost_verifier",
  "nonce": "3c9657eda42d19c52aba00b7c0ad2b41",
  "context": "Default",
  "requested_attributes": [],
  "requested_predicates": [
    {
      "name": "fullName",
      "predicate": "existence"
    }
  ],
  "zk": {
    "circuit_id": "age_check_v1",
    "verification_key_id": "vk_01"
  },
  "request_uri": "http://localhost:3001/request?id=fa1e98e3fae3c31a1caf93f8cbf12466",
  "response_uri": "http://localhost:3001/verify",
  "expires_at": "2026-03-02T00:22:47.130Z",
  "status": "verified",
  "verifiedUsers": [
    {
      "subjectId": "fc153fa1aa058b3e6104426d2344136dd9fdde9dbcd8165e12db0141608c1397",
      "timestamp": "2026-03-02T00:18:10.142Z"
    }
  ]
}
```
## RESPONSE SCHEMAS
### Issuer responses to the user (or wallet) :-
```bash
(Issuer → Wallet)
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "id": "urn:uuid:78f05520-25c8-4679-afad-d2f98b2d4ab2",
  "type": [
    "VerifiableCredential",
    "AadhaarCardCredential"
  ],
  "issuer": "did:example:gov-india",
  "issuanceDate": "2026-02-20T08:44:25.526Z",
  "credentialSubject": {
    "id": "did:example:703719d7-ce1d-4882-8f96-59df97daf82a",
    "idType": "Aadhaar Card",
    "fullName": "htrbd",
    "aadhaarNumber": "241414131241",
    "dob": "07/02/2026",
    "gender": "Other",
    "address": "25234526webrvg",
    "photoVerified": "No",
    "issuer": "Govt. of India",
    holderCommitment: 'b797beb8067c9...8fd28b5aecf2b6034d9'       
  },
  "credentialStatus": {
    "id": "https://example.com/status/3",
    "type": "AccumulatorStatus",
    "accumulatorId": "revocation-list-1",
    "index": 3
  },
  "proof": {
    "type": "BbsBlsSignature2020",
    "created": "2026-02-20T08:44:25.526Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:example:gov-india#key-1",
    "signature": "roGEQIUg6TjfxnkHJxbKUik4ZIYMyrE3Ukdx9bnv5DI1lHb//+w4wLgCR14+vuwbMKVg9X44OT7IyqxonIH7xLuNJjBkG7KYma9urLMBCo4x5JoTWPaG1p7URXapIpy1ng+avITVXJin9XQoxPxyNA=="
  },
  "publicKey": "txyTIDnBfboTY/b/ADO1++12ACwcYWWuJNG/jDAQVd3mwz1zgE0b/QmLmUiWOb0NAxNZMHUU53BDiM/+t5H/56lIF6y5woIvhY1CmL4nWJ455WDLLJG21zbVzsjFiLH2"
}
```
Example :-
```bash
{
  '@context': [ 'https://www.w3.org/2018/credentials/v1' ],
  id: 'urn:uuid:72bcf780-29d3-448d-815c-2ef11f0285d1',
  type: [ 'VerifiableCredential', 'BirthCertificateCredential' ],
  issuer: 'did:example:gov-india',
  holderCommitment: 'e9e5dafd8e9cb797beb8067c98fd28b5aecf2b6034d9c72d2cf2ddcd06fde946',
  issuanceDate: '2026-03-02T00:36:12.959Z',
  credentialSubject: {
    id: 'did:example:a790fda4-ccb6-412b-bb43-04b43219a7cd',
    idType: 'Birth Certificate',
    fullName: 'Rahul',
    dob: '03/02/2020',
    placeOfBirth: 'Kolkata',
    fatherName: 'Raju',
    motherName: 'Rani',
    issuer: 'Govt. of India',
    holderCommitment: 'e9e5dafd8e9cb797beb8067c98fd28b5aecf2b6034d9c72d2cf2ddcd06fde946'        
  },
  credentialStatus: {
    id: 'https://example.com/status/56',
    type: 'AccumulatorStatus',
    accumulatorId: 'revocation-list-1',
    index: 56
  },
  proof: {
    type: 'BbsBlsSignature2020',
    created: '2026-03-02T00:36:12.959Z',
    proofPurpose: 'assertionMethod',
    verificationMethod: 'did:example:gov-india#key-1',
    signature: {
      signature: 'jzO6nTdStsiyVXCvwrL0k0XJzz1dzqxplqkrb5owil+iZV9YDSAKpWfVrHh28ctTYUHlKfzccE4m7waZyoLEkBLFiK2g54Q2i+CdtYBgDdkUDsoULSBMcH1MwGHwdjfXpldFNFrHFx/IAvLVniyeMQ==',
      messages: [Array],
      context: 'Default'
    }
  },
  publicKey: 'txyTIDnBfboTY/b/ADO1++12ACwcYWWuJNG/jDAQVd3mwz1zgE0b/QmLmUiWOb0NAxNZMHUU53BDiM/+t5H/56lIF6y5woIvhY1CmL4nWJ455WDLLJG21zbVzsjFiLH2'
}
```
### Wallet responses to the verifier :-
```bash
(Wallet → Verifier)
{
  "id": "8e3fae3c3...caf93f8cbf",
  "nonce": "da42d19c52...aba00b7c0a",
  "nullifier": "fc153f...1608c1397",
  "proofs": [
    {
      "attribute": "panNumber",
      "proof": "AAgABJVS...31AVIGEpHY0EZEA=",
      "revealIndices": [5]
    }
  ]
}
```
Example :-
```bash
{
  "id": "fa1e98e3fae3c31a1caf93f8cbf12466",
  "nonce": "3c9657eda42d19c52aba00b7c0ad2b41",
  "nullifier": "fc153fa1aa058b3e6104426d2344136dd9fdde9dbcd8165e12db0141608c1397",
  "proofs": [
    {
      "attribute": "fullName",
      "proof": "AAgABJVSc/3r9PlorB5Sx4l1YwpUekWAVs/gImRMG1ymGh04ga…mapCjWACp4N/mPE+grZJibaV45bKEK9A731AVIGEpHY0EZEA=",
      "revealIndices": [0]
    }
  ]
}
```

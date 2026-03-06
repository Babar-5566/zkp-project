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
npm install @mattrglobal/bbs-signatures cors dotenv express uuid
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
npm install @mattrglobal/bbs-signatures cors dotenv express uuid
```
```bash
node server.js
```
### Frontend Setup
```bash
cd frontend
```
```bash
npm install @mattrglobal/bbs-signatures axios buffer clsx framer-motion html5-qrcode lucide-react process qrcode.react tailwind-merge react react-dom
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
        "fullName", "dob", "gender", "address", "photoVerified",
        "aadhaarLast4", "issuer",
    ],
- PAN: [
        "fullName", "guardianName", "dob", "panID",
        "issuer",
    ],
- Passport: [
        "fullName", "dob", "passportID", "nationality",
        "expiryDate", "issuer",
    ],
- DrivingLicense: [
        "fullName", "dob", "licenseID", "issueDate",
        "expiryDate", "issuer", 
    ],
- BirthCertificate: [
        "fullName", "dob", "placeOfBirth", "fatherName",
        "motherName", "issuer", "issuanceDate",
    ],
- "12thMarksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer",],
- "12thAdmit": ["fullName", "dob", "school", "board", "rollNumber", "issuer"],
- "10thMarksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer"],
- "10thAdmit": ["fullName", "dob", "school", "board", "rollNumber", "issuer",]
```
---
## Types of predicate :-
```bash
fullName	existence, reveal, hash
aadhaarNumber	existence, reveal, hash
dob	existence, reveal, date comparison, numeric/range
gender	existence, reveal, equality
address	existence, reveal, hash
photoVerified	existence, reveal, equality
panID	existence, reveal, hash
guardianName	existence, reveal, hash
passportID	existence, reveal, hash
nationality	existence, reveal, equality
expiryDate	existence, reveal, date comparison
licenseID	existence, reveal, hash
issueDate	existence, reveal, date comparison
placeOfBirth	existence, reveal
fatherName / motherName	existence, reveal, hash
board	existence, reveal, equality
rollNumber	existence, reveal, hash
school	existence, reveal
marks	existence, reveal, numeric/range
university	existence, reveal
passingYear	existence, reveal, numeric/range
```
Older One (Needs Removal) :-
```bash

  "Aadhaar": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "gender": ["existence", "equality", "set membership"],
    "address": ["existence", "string match"],
    "photoVerified": ["existence", "boolean"],
    "aadhaarLast4": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "PAN": {
    "fullName": ["existence", "equality", "cross-field"],
    "guardianName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "panID": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "Passport": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "passportID": ["existence", "equality"],
    "nationality": ["existence", "equality", "set membership"],
    "expiryDate": ["existence", "date comparison"],
    "issuer": ["existence", "equality"]
  },
  "DrivingLicense": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "licenseID": ["existence", "equality"],
    "issueDate": ["existence", "date comparison"],
    "expiryDate": ["existence", "date comparison"],
    "issuer": ["existence", "equality"]
  },
  "BirthCertificate": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "placeOfBirth": ["existence", "equality", "string match"],
    "fatherName": ["existence", "equality"],
    "motherName": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "12thMarksheet": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "marks": ["existence", "numeric/range"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "12thAdmit": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "10thMarksheet": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "marks": ["existence", "numeric/range"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "10thAdmit": {
    "fullName": ["existence", "equality", "cross-field"],
    "dob": ["existence", "numeric/range", "date comparison", "cross-field"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  }

```

## Predicate → Recommended Proof System
```bash
Existence → BBS+ only
Equality → zk-SNARK or BBS+
Cross-field → zk-SNARK
Range → zk-SNARK only
String match → BBS+ preferred
Hash → BBS+ preferred
Selective disclosure → BBS+ only
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

Starting on 14.2.26
# 19.2.26
- follow DID + VC format (Do not change the working of the system, just create a function that converts the object or cred structure we use to the standard structure of storing creds. Create a button to show the cred in that format and allow the user to download the .json file which contains the proof in that format)\n
{What's done : backend converts received data to desired DID+VC+REVOCATION structure}
- two verifiers should not able to track or link a proof (or user).
- revocaion handling (used accumalator way to solve this\n
{What's done : accumulator.json being generated in data folder}
# Cuurent Schema for different certificates :-
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

# Types of predicate :-
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

# FINAL PROOF REQUEST SCHEMA
```bash
(Verifier → Wallet)
{
  "request_id": "string",
  "credential_type": "string",

  "issuer_pubkey": "string",

  "scope_id": "verifier_unique_identifier",

  "challenge": "random_nonce",

  "disclosures": ["attribute"],

  "predicates": [
    {
      "attribute": "string",
      "type": "range | equals | set | hash | boolean | date",
      "params": {}
    }
  ],

  "zk": {
    "circuit_id": "string",
    "verification_key_id": "string"
  },

  "expires_at": "ISO_timestamp"
}


example:
{
  "request_id": "req_8891",
  "credential_type": "university_id",

  "issuer_pubkey": "pk_issuer_xyz",

  "scope_id": "verifier_A.example.com",

  "challenge": "6fa81c9aaf8d9e",

  "disclosures": ["university"],

  "predicates": [
    {
      "attribute": "age",
      "type": "range",
      "params": { "min": 18 }
    },
    {
      "attribute": "degree",
      "type": "equals",
      "params": { "value": "BTech" }
    }
  ],

  "zk": {
    "circuit_id": "age_degree_v3",
    "verification_key_id": "vk_2026_v3"
  },

  "expires_at": "2026-02-17T16:30:00Z"
}
```
# FINAL PROOF RESPONSE SCHEMA
```bash
(Wallet → Verifier)
{
  "request_id": "string",
  "timestamp": "ISO_timestamp",

  "scope": {
    "id": "string",
    "pseudonym": "hex"
  },

  "disclosed_attributes": {
    "attribute": "value"
  },

  "bbs_proof": {
    "proof": "base64",
    "issuer_pubkey": "string",
    "nonce": "string"
  },

  "zk_proof": {
    "protocol": "groth16 | plonk",
    "curve": "bn128 | bls12-381",

    "pi_a": ["hex", "hex"],
    "pi_b": [["hex","hex"],["hex","hex"]],
    "pi_c": ["hex", "hex"]
  },

  "public_inputs": {
    "predicate_inputs": {},
    "credential_commitment": "hex",
    "scope_pseudonym": "hex",
    "challenge": "string"
  },

  "binding": {
    "proof_hash": "hex",
    "credential_hash": "hex",
    "circuit_id": "string"
  }
}

example:{
  "request_id": "req_8891",
  "timestamp": "2026-02-17T16:02:11Z",

  "scope": {
    "id": "verifier_A.example.com",
    "pseudonym": "0x91abf23981de"
  },

  "disclosed_attributes": {
    "university": "XYZ University"
  },

  "bbs_proof": {
    "proof": "b64:8hfj29fh29fh29fh29fh...",
    "issuer_pubkey": "pk_issuer_xyz",
    "nonce": "6fa81c9aaf8d9e"
  },

  "zk_proof": {
    "protocol": "groth16",
    "curve": "bn128",
    "pi_a": ["0x1c4b8c7...", "0x0ab3e91..."],
    "pi_b": [
      ["0x091aa...", "0x2c9fa..."],
      ["0x31fae...", "0x5b83d..."]
    ],
    "pi_c": ["0x9182f...", "0x55fa1..."]
  },

  "public_inputs": {
    "predicate_inputs": {
      "age_min": 18,
      "degree_hash": "0x8fa1e22d9f..."
    },
    "credential_commitment": "0x6ab83f91...",
    "scope_pseudonym": "0x91abf23981de",
    "challenge": "6fa81c9aaf8d9e"
  },

  "binding": {
    "proof_hash": "0xa9281abf...",
    "credential_hash": "0x3ab81ff1...",
    "circuit_id": "age_degree_v3"
  }
}


```

# Predicates checking with payload examples:-
``` bash
- Equality check
{
  "documentType": "Aadhaar",
  "predicateType": "equality",
  "predicate": "gender == Male",
  "value": "Male",
  "expected": "Male",
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-1",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Numeric comparison
{
  "documentType": "Aadhaar",
  "predicateType": "numeric",
  "predicate": "age >= 18",
  "value": 22,
  "operator": ">=",
  "compareTo": 18,
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-2",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Range check
{
  "documentType": "Aadhaar",
  "predicateType": "range",
  "predicate": "18 <= age <= 60",
  "value": 35,
  "min": 18,
  "max": 60,
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-3",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Set membership
{
  "documentType": "Aadhaar",
  "predicateType": "set",
  "predicate": "state in approved list",
  "value": "WB",
  "set": ["WB", "OD", "AS", "BR"],
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-4",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Boolean check
{
  "documentType": "Aadhaar",
  "predicateType": "boolean",
  "predicate": "photo verified",
  "value": true,
  "expected": true,
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-5",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Date comparison
{
  "documentType": "Aadhaar",
  "predicateType": "date",
  "predicate": "issued after 2020",
  "value": "2022-03-01",
  "operator": ">",
  "compareTo": "2020-01-01",
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-6",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- String match
{
  "documentType": "Aadhaar",
  "predicateType": "string",
  "predicate": "issuer name match",
  "value": "UIDAI",
  "expected": "UIDAI",
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-7",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Hash match
{
  "documentType": "Aadhaar",
  "predicateType": "hash",
  "predicate": "token hash match",
  "value": "abc123hash",
  "expectedHash": "abc123hash",
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-8",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Existence check
{
  "documentType": "Aadhaar",
  "predicateType": "existence",
  "predicate": "address exists",
  "value": "Kolkata",
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-9",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Cross-field consistency check
{
  "documentType": "Aadhaar",
  "predicateType": "cross-field",
  "predicate": "dob matches age",
  "dob": "2000-01-01",
  "age": 25,
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-10",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

- Derived predicates
{
  "documentType": "Aadhaar",
  "predicateType": "derived",
  "predicate": "income eligibility",
  "income": 600000,
  "threshold": 500000,
  "citizenship": "India",
  "result": true,
  "proof": "BASE64_PROOF_STRING_12345",
  "nonce": "uuid-11",
  "issuer": "UIDAI",
  "credentialHash": "hash123"
}

```

# Some Questions 
```bash
Q How ZKP handles privacy vs trust tradeoff
```
```bash
Q Why not just use database login?
```
```bash
Q Why ZKP is called “trust minimization”
```
```bash
Q How decentralized identity works
```
```bash
Q Real attacks ZKP prevents
```
```bash
Q How to justify your architecture
```
```bash
Q How to justify your architecture
```

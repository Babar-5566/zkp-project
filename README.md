Starting on 14.2.26

# Types of predicate :-
```bash
  "Aadhaar": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "gender": ["existence", "equality", "set membership"],
    "address": ["existence", "string match"],
    "photoVerified": ["existence", "boolean"],
    "aadhaarLast4": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "PAN": {
    "fullName": ["existence", "equality"],
    "guardianName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "panID": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "Passport": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "passportID": ["existence", "equality"],
    "nationality": ["existence", "equality", "set membership"],
    "expiryDate": ["existence", "date comparison"],
    "issuer": ["existence", "equality"]
  },
  "DrivingLicense": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "licenseID": ["existence", "equality"],
    "issueDate": ["existence", "date comparison"],
    "expiryDate": ["existence", "date comparison"],
    "issuer": ["existence", "equality"]
  },
  "BirthCertificate": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "placeOfBirth": ["existence", "equality", "string match"],
    "fatherName": ["existence", "equality"],
    "motherName": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "12thMarksheet": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "marks": ["existence", "numeric/range"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "12thAdmit": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "10thMarksheet": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "marks": ["existence", "numeric/range"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
  },
  "10thAdmit": {
    "fullName": ["existence", "equality"],
    "dob": ["existence", "numeric/range", "date comparison"],
    "school": ["existence", "equality", "string match"],
    "board": ["existence", "equality", "string match"],
    "rollNumber": ["existence", "equality"],
    "issuer": ["existence", "equality"]
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

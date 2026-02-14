function validateDocument(documentType, data) {
    const requiredFields = {
        Aadhaar: [
            "fullName",
            "dob",
            "gender",
            "address",
            "photoVerified",
            "aadhaarLast4",
            "issuer",
            "issuanceDate",
            "documentAuthVerified"
        ],
        PAN: [
            "fullName",
            "guardianName",
            "dob",
            "panID",
            "issuer",
            "issuanceDate",
            "documentAuthVerified"
        ],
        Passport: [
            "fullName",
            "dob",
            "passportID",
            "nationality",
            "expiryDate",
            "issuer",
            "documentAuthVerified"
        ],
        DrivingLicense: [
            "fullName",
            "dob",
            "licenseID",
            "issueDate",
            "expiryDate",
            "issuer",
            "documentAuthVerified"
        ],
        BirthCertificate: [
            "fullName",
            "dob",
            "placeOfBirth",
            "fatherName",
            "motherName",
            "issuer",
            "issuanceDate",
            "documentAuthVerified"
        ],
        "12thMarksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer", "issuanceDate"],
        "12thAdmit": ["fullName", "dob", "school", "board", "rollNumber", "issuer", "issuanceDate"],
        "10thMarksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer", "issuanceDate"],
        "10thAdmit": ["fullName", "dob", "school", "board", "rollNumber", "issuer", "issuanceDate"]
    };

    const fields = requiredFields[documentType];
    if (!fields) return { valid: false, error: "Unknown document type" };

    const missingFields = fields.filter(f => {
        if (f.includes(".")) {
            // for nested fields like address.city
            const parts = f.split(".");
            let temp = data;
            for (let p of parts) {
                if (!temp[p]) return true;
                temp = temp[p];
            }
            return false;
        } else {
            return data[f] === undefined || data[f] === null;
        }
    });

    if (missingFields.length > 0) {
        return {
            valid: false,
            error: `Missing required fields: ${missingFields.join(", ")}`
        };
    }

    return { valid: true };
}


module.exports = { validateDocument };

function validateDocument(documentType, data) {
    const requiredFields = {
        "Aadhaar Card": [
            "fullName",
            "aadhaarNumber",
            "dob",
            "gender",
            "address",
            "photoVerified",
            "issuer"
        ],

        "PAN Card": [
            "fullName",
            "guardianName",
            "dob",
            "panID",
            "issuer"
        ],

        "Passport": [
            "fullName",
            "dob",
            "passportID",
            "nationality",
            "expiryDate",
            "issuer"
        ],

        "Driving Licence": [
            "fullName",
            "dob",
            "licenseID",
            "issueDate",
            "expiryDate",
            "issuer"
        ],

        "Birth Certificate": [
            "fullName",
            "dob",
            "placeOfBirth",
            "fatherName",
            "motherName",
            "issuer"
        ],

        "10th Admit Card": [
            "fullName",
            "dob",
            "school",
            "board",
            "rollNumber",
            "issuer"
        ],

        "12th Admit Card": [
            "fullName",
            "dob",
            "school",
            "board",
            "rollNumber",
            "issuer"
        ],

        "10th Marksheet": [
            "fullName",
            "dob",
            "school",
            "board",
            "marks",
            "rollNumber",
            "issuer"
        ],

        "12th Marksheet": [
            "fullName",
            "dob",
            "school",
            "board",
            "marks",
            "rollNumber",
            "issuer"
        ],

        "University Degree": [
            "fullName",
            "university",
            "rollNumber",
            "passingYear",
            "issuer"
        ]
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

/**
 * Returns the full set of allowed fields for a document type.
 * Used as a whitelist to strip any injected/extra fields.
 */
function getAllowedFields(documentType) {
    const requiredFields = {
        "Aadhaar Card": ["fullName", "aadhaarNumber", "dob", "gender", "address", "photoVerified", "issuer"],
        "PAN Card": ["fullName", "guardianName", "dob", "panID", "issuer"],
        "Passport": ["fullName", "dob", "passportID", "nationality", "expiryDate", "issuer"],
        "Driving Licence": ["fullName", "dob", "licenseID", "issueDate", "expiryDate", "issuer"],
        "Birth Certificate": ["fullName", "dob", "placeOfBirth", "fatherName", "motherName", "issuer"],
        "10th Admit Card": ["fullName", "dob", "school", "board", "rollNumber", "issuer"],
        "12th Admit Card": ["fullName", "dob", "school", "board", "rollNumber", "issuer"],
        "10th Marksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer"],
        "12th Marksheet": ["fullName", "dob", "school", "board", "marks", "rollNumber", "issuer"],
        "University Degree": ["fullName", "university", "rollNumber", "passingYear", "issuer"]
    };

    // Common fields allowed for all document types
    const commonFields = ["holderCommitment", "idType"];

    const typeFields = requiredFields[documentType] || [];
    return [...new Set([...typeFields, ...commonFields])];
}


module.exports = { validateDocument, getAllowedFields };

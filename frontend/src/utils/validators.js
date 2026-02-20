/**
 * CIPHERTRUST VALIDATION SUITE
 * ----------------------------------------------------------------------
 * This module enforces strict data integrity rules before any data is sent
 * to the backend. It aligns with the team's requirement for zero-null
 * and type-specific constraints.
 */

// 1. Validate Strings (Name, City, etc.) - Must not be empty or contain numbers
export const validateName = (name) => {
  if (!name || name.trim() === "") {
    return { isValid: false, message: "Field cannot be null or empty." };
  }
  // Regex: Only alphabets and spaces allowed
  const nameRegex = /^[a-zA-Z\s]+$/;
  if (!nameRegex.test(name)) {
    return { isValid: false, message: "Must contain only alphabets (String)." };
  }
  return { isValid: true, message: "" };
};

// 2. Validate Age - Must be Integer and > 0
export const validateAge = (dob) => {
  if (!dob) return { isValid: false, message: "Date of Birth is required." };

  const birthDate = new Date(dob);
  const today = new Date();
  
  // Calculate age
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Logic: Age must be an integer > 0
  if (age <= 0) {
    return { isValid: false, message: "Age must be greater than 0." };
  }
  
  if (!Number.isInteger(age)) {
    return { isValid: false, message: "Age must be a valid integer." };
  }

  return { isValid: true, message: "" };
};

// 3. Validate ID Numbers (Aadhaar/PAN) - Prevents Null & Format Errors
export const validateID = (id, type) => {
  if (!id || id.trim() === "") {
    return { isValid: false, message: "ID Number cannot be null." };
  }

  // Example: Aadhaar must be numeric and > 4 digits (for last 4 digits logic)
  if (type === 'Aadhaar Card' && (!/^\d+$/.test(id) || id.length < 4)) {
    return { isValid: false, message: "Invalid Aadhaar format (Numeric required)." };
  }

  return { isValid: true, message: "" };
};

// 4. General Required Field Check
export const validateRequired = (value) => {
  if (value === null || value === undefined || value === "") {
    return { isValid: false, message: "This attribute is mandatory." };
  }
  return { isValid: true, message: "" };
};
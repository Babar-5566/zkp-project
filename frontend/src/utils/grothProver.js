import * as snarkjs from "snarkjs";

// ============================================
// GENERIC GROTH16 PROOF HELPER
// ============================================

/**
 * Generic Groth16 proof generator for any circuit.
 * Handles artifact fetching and snarkjs.groth16.fullProve.
 *
 * @param {string} circuitName - Name of the circuit (e.g., "age_check", "equality_check")
 * @param {Object} input - Circuit inputs
 * @param {string} [label] - Human-readable label for logging
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
async function generateGroth16Proof(circuitName, input, label = circuitName) {
    const wasmUrl = `/zk/${circuitName}.wasm`;
    const zkeyUrl = `/zk/${circuitName}_final.zkey`;

    // Verify circuit artifacts exist
    try {
        const [wasmRes, zkeyRes] = await Promise.all([
            fetch(wasmUrl, { method: "HEAD" }),
            fetch(zkeyUrl, { method: "HEAD" })
        ]);

        if (!wasmRes.ok) {
            throw new Error(`Circuit WASM not found: ${wasmUrl} (HTTP ${wasmRes.status})`);
        }
        if (!zkeyRes.ok) {
            throw new Error(`Circuit zkey not found: ${zkeyUrl} (HTTP ${zkeyRes.status})`);
        }
    } catch (fetchError) {
        if (fetchError.message.includes("not found")) throw fetchError;
        throw new Error(`Cannot reach ${label} circuit artifacts: ${fetchError.message}`);
    }

    // Generate proof
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input, wasmUrl, zkeyUrl
        );

        console.log(`✅ [Browser] ${label} proof generated successfully!`);
        console.log("📊 Public signals:", publicSignals);

        return { proof, publicSignals };
    } catch (error) {
        console.error(`❌ [Browser] ${label} proof generation failed:`, error);

        if (error.message?.includes("Assert Failed")) {
            throw new Error(`Circuit constraint failed for ${label}. The statement is false.`);
        }
        throw new Error(`${label} proof generation failed: ${error.message}`);
    }
}

// ============================================
// AGE CHECK (existing — refactored to use helper)
// ============================================

/**
 * Generate zk-SNARK proof for age >= threshold.
 * @param {string} dob - Date of birth in DD/MM/YYYY format
 * @param {number} threshold - Minimum age required (e.g. 18)
 */
export async function generateZkSnarkProof(dob, threshold) {
    const parts = dob.split("/");

    if (parts.length !== 3) {
        throw new Error(`Invalid DOB format: "${dob}". Expected DD/MM/YYYY`);
    }

    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    if (isNaN(day) || isNaN(month) || isNaN(year) || year < 1900 || year > 2100) {
        throw new Error(`Cannot parse DOB: "${dob}". Expected DD/MM/YYYY with valid values`);
    }

    const birthDate = new Date(year, month - 1, day);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    const thresholdNum = parseInt(threshold);

    console.log(`🔐 [Browser] Generating age proof: age=${age}, threshold=${thresholdNum}`);

    if (age < thresholdNum) {
        throw new Error(
            `Age ${age} does not meet the required threshold of ${thresholdNum}. ` +
            `Cannot generate a zero-knowledge proof for a false statement.`
        );
    }

    return generateGroth16Proof("age_check", {
        age: age,
        ageThreshold: thresholdNum
    }, "Age Check");
}

// ============================================
// EQUALITY CHECK (categorical fields)
// ============================================

/**
 * Encoding tables for categorical fields.
 * Both holder and verifier MUST use the same encoding.
 */
export const EQUALITY_ENCODINGS = {
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
};

/**
 * Generate zk-SNARK proof: value == expected (for categorical fields).
 * @param {string} fieldName - Field name (e.g., "gender", "board")
 * @param {string} actualValue - The actual value from the credential (e.g., "Male")
 * @param {string} expectedValue - The verifier's expected value (e.g., "Male")
 */
export async function generateEqualityProof(fieldName, actualValue, expectedValue) {
    const encoding = EQUALITY_ENCODINGS[fieldName];

    if (!encoding) {
        throw new Error(`No encoding table for field "${fieldName}". Equality only works for categorical fields.`);
    }

    const encodedActual = encoding[actualValue];
    const encodedExpected = encoding[expectedValue];

    if (encodedActual === undefined) {
        throw new Error(`Unknown value "${actualValue}" for field "${fieldName}"`);
    }
    if (encodedExpected === undefined) {
        throw new Error(`Unknown expected value "${expectedValue}" for field "${fieldName}"`);
    }

    console.log(`🔐 [Browser] Generating equality proof: ${fieldName}=${encodedActual}, expected=${encodedExpected}`);

    if (encodedActual !== encodedExpected) {
        throw new Error(
            `Value "${actualValue}" does not match expected "${expectedValue}". ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generateGroth16Proof("equality_check", {
        value: encodedActual,
        expected: encodedExpected
    }, `Equality Check (${fieldName})`);
}

// ============================================
// RANGE CHECK (marks >= threshold)
// ============================================

/**
 * Generate zk-SNARK proof: value >= threshold (for numeric fields like marks).
 * @param {number|string} value - The actual numeric value (e.g., 85 for 85%)
 * @param {number|string} threshold - The minimum threshold
 */
export async function generateRangeProof(value, threshold) {
    const numValue = parseInt(value);
    const numThreshold = parseInt(threshold);

    if (isNaN(numValue) || isNaN(numThreshold)) {
        throw new Error(`Invalid numeric values: value=${value}, threshold=${threshold}`);
    }

    console.log(`🔐 [Browser] Generating range proof: value=${numValue}, threshold=${numThreshold}`);

    if (numValue < numThreshold) {
        throw new Error(
            `Value ${numValue} does not meet threshold ${numThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generateGroth16Proof("range_check", {
        value: numValue,
        threshold: numThreshold
    }, "Range Check");
}

// ============================================
// YEAR CHECK (passingYear <= threshold)
// ============================================

/**
 * Generate zk-SNARK proof: year <= yearThreshold (for passingYear).
 * Proves "I passed on or before year X".
 * @param {number|string} year - The actual passing year
 * @param {number|string} yearThreshold - The threshold year (e.g., 2026)
 */
export async function generateYearProof(year, yearThreshold) {
    const numYear = parseInt(year);
    const numThreshold = parseInt(yearThreshold);

    if (isNaN(numYear) || isNaN(numThreshold)) {
        throw new Error(`Invalid year values: year=${year}, threshold=${yearThreshold}`);
    }

    console.log(`🔐 [Browser] Generating year proof: year=${numYear}, threshold=${numThreshold}`);

    if (numYear > numThreshold) {
        throw new Error(
            `Year ${numYear} is after threshold ${numThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generateGroth16Proof("year_check", {
        year: numYear,
        yearThreshold: numThreshold
    }, "Year Check");
}

// ============================================
// DATE CHECK (dateValue > dateThreshold)
// ============================================

/**
 * Convert a date string to epoch days (days since Unix epoch).
 * Used for circuit input encoding.
 * @param {string} dateStr - Date in DD/MM/YYYY or YYYY-MM-DD format
 * @returns {number} epoch days
 */
function dateToEpochDays(dateStr) {
    let date;

    // Try DD/MM/YYYY format
    if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        date = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
        // YYYY-MM-DD format (from date input)
        date = new Date(dateStr);
    }

    if (isNaN(date.getTime())) {
        throw new Error(`Cannot parse date: "${dateStr}"`);
    }

    return Math.floor(date.getTime() / 86400000);
}

/**
 * Generate zk-SNARK proof: dateValue > dateThreshold.
 * Proves a date is after a threshold date (e.g., expiry is in the future).
 * @param {string} dateValue - The actual date from the credential
 * @param {string} dateThreshold - The verifier's comparison date
 */
export async function generateDateProof(dateValue, dateThreshold) {
    const epochValue = dateToEpochDays(dateValue);
    const epochThreshold = dateToEpochDays(dateThreshold);

    console.log(`🔐 [Browser] Generating date proof: date=${epochValue} (${dateValue}), threshold=${epochThreshold} (${dateThreshold})`);

    if (epochValue <= epochThreshold) {
        throw new Error(
            `Date ${dateValue} does not satisfy comparison with ${dateThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generateGroth16Proof("date_check", {
        dateValue: epochValue,
        dateThreshold: epochThreshold
    }, "Date Check");
}

// ============================================
// HASH CHECK (Poseidon preimage proof)
// ============================================

/**
 * Convert a string to a field element for Poseidon hashing.
 * Uses a simple encoding: sum of (charCode * 256^position) mod p.
 * Both holder and verifier MUST use this same encoding.
 * @param {string} str - The string to encode
 * @returns {bigint} field element
 */
export function stringToFieldElement(str) {
    // BN128 field prime
    const p = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");

    let result = BigInt(0);
    for (let i = 0; i < str.length; i++) {
        result = (result * BigInt(256) + BigInt(str.charCodeAt(i))) % p;
    }
    return result;
}

/**
 * Generate zk-SNARK proof: Poseidon(preimage) == expectedHash.
 * Proves knowledge of a value whose hash matches, without revealing it.
 * @param {string} preimageStr - The actual string value (e.g., "Alex")
 * @param {string} expectedHashStr - The expected Poseidon hash (as decimal string)
 */
export async function generateHashProof(preimageStr, expectedHashStr) {
    const preimage = stringToFieldElement(preimageStr).toString();

    console.log(`🔐 [Browser] Generating hash proof: preimage="${preimageStr}" → field=${preimage}`);

    return generateGroth16Proof("hash_check", {
        preimage: preimage,
        expectedHash: expectedHashStr
    }, "Hash Check");
}


import * as snarkjs from "snarkjs";

// ============================================
// GENERIC PLONK PROOF HELPER
// ============================================

/**
 * Generic PLONK proof generator for any circuit.
 * Handles artifact fetching and snarkjs.plonk.fullProve.
 *
 * @param {string} circuitName - Name of the circuit (e.g., "age_check", "equality_check")
 * @param {Object} input - Circuit inputs
 * @param {string} [label] - Human-readable label for logging
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
async function generatePlonkProof(circuitName, input, label = circuitName) {
    const wasmUrl = `/zk/${circuitName}.wasm`;
    const zkeyUrl = `/zk/${circuitName}.zkey`;

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
        const { proof, publicSignals } = await snarkjs.plonk.fullProve(
            input, wasmUrl, zkeyUrl
        );

        console.log(`✅ [Browser] ${label} PLONK proof generated successfully!`);
        console.log("📊 Public signals:", publicSignals);

        return { proof, publicSignals };
    } catch (error) {
        console.error(`❌ [Browser] ${label} PLONK proof generation failed:`, error);

        if (error.message?.includes("Assert Failed")) {
            throw new Error(`Circuit constraint failed for ${label}. The statement is false.`);
        }
        throw new Error(`${label} PLONK proof generation failed: ${error.message}`);
    }
}

// ============================================
// AGE CHECK (existing — refactored to use helper)
// ============================================

/**
 * Generate PLONK proof for age >= threshold.
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

    console.log(`🔐 [Browser] Generating PLONK age proof: age=${age}, threshold=${thresholdNum}`);

    if (age < thresholdNum) {
        throw new Error(
            `Age ${age} does not meet the required threshold of ${thresholdNum}. ` +
            `Cannot generate a zero-knowledge proof for a false statement.`
        );
    }

    return generatePlonkProof("age_check", {
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
 * Generate PLONK proof: value == expected (for categorical fields).
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

    console.log(`🔐 [Browser] Generating PLONK equality proof: ${fieldName}=${encodedActual}, expected=${encodedExpected}`);

    if (encodedActual !== encodedExpected) {
        throw new Error(
            `Value "${actualValue}" does not match expected "${expectedValue}". ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generatePlonkProof("equality_check", {
        value: encodedActual,
        expected: encodedExpected
    }, `Equality Check (${fieldName})`);
}

// ============================================
// RANGE CHECK (marks >= threshold)
// ============================================

/**
 * Generate PLONK proof: value >= threshold (for numeric fields like marks).
 * @param {number|string} value - The actual numeric value (e.g., 85 for 85%)
 * @param {number|string} threshold - The minimum threshold
 */
export async function generateRangeProof(value, threshold) {
    const numValue = parseInt(value);
    const numThreshold = parseInt(threshold);

    if (isNaN(numValue) || isNaN(numThreshold)) {
        throw new Error(`Invalid numeric values: value=${value}, threshold=${threshold}`);
    }

    console.log(`🔐 [Browser] Generating PLONK range proof: value=${numValue}, threshold=${numThreshold}`);

    if (numValue < numThreshold) {
        throw new Error(
            `Value ${numValue} does not meet threshold ${numThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generatePlonkProof("range_check", {
        value: numValue,
        threshold: numThreshold
    }, "Range Check");
}

// ============================================
// YEAR CHECK (passingYear <= threshold)
// ============================================

/**
 * Generate PLONK proof: year <= yearThreshold (for passingYear).
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

    console.log(`🔐 [Browser] Generating PLONK year proof: year=${numYear}, threshold=${numThreshold}`);

    if (numYear > numThreshold) {
        throw new Error(
            `Year ${numYear} is after threshold ${numThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generatePlonkProof("year_check", {
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
    let year, month, day;

    // Try DD/MM/YYYY format
    if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        day = parseInt(parts[0]);
        month = parseInt(parts[1]);
        year = parseInt(parts[2]);
    } else {
        // YYYY-MM-DD format (from date input)
        const parts = dateStr.split("-");
        year = parseInt(parts[0]);
        month = parseInt(parts[1]);
        day = parseInt(parts[2]);
    }

    if (isNaN(year) || isNaN(month) || isNaN(day)) {
        throw new Error(`Cannot parse date: "${dateStr}"`);
    }

    // Use Date.UTC to avoid timezone offset issues
    const utcMs = Date.UTC(year, month - 1, day);
    return Math.floor(utcMs / 86400000);
}

/**
 * Generate PLONK proof: dateValue > dateThreshold.
 * Proves a date is after a threshold date (e.g., expiry is in the future).
 * @param {string} dateValue - The actual date from the credential
 * @param {string} dateThreshold - The verifier's comparison date
 */
export async function generateDateProof(dateValue, dateThreshold) {
    const epochValue = dateToEpochDays(dateValue);
    const epochThreshold = dateToEpochDays(dateThreshold);

    console.log(`🔐 [Browser] Generating PLONK date proof: date=${epochValue} (${dateValue}), threshold=${epochThreshold} (${dateThreshold})`);

    // Pre-check: credential date must be on or after the threshold date
    if (epochValue < epochThreshold) {
        throw new Error(
            `Date ${dateValue} is before threshold ${dateThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    // Circuit uses strict GreaterThan, so subtract 1 from threshold
    // to achieve >= semantics (same-day passes)
    return generatePlonkProof("date_check", {
        dateValue: epochValue,
        dateThreshold: epochThreshold - 1
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
 * Generate PLONK proof: Poseidon(preimage) == expectedHash.
 * Proves knowledge of a value whose hash matches, without revealing it.
 * @param {string} preimageStr - The actual string value (e.g., "Alex")
 * @param {string} expectedHashStr - The expected Poseidon hash (as decimal string)
 */
export async function generateHashProof(preimageStr, expectedHashStr) {
    const preimage = stringToFieldElement(preimageStr).toString();

    console.log(`🔐 [Browser] Generating PLONK hash proof: preimage="${preimageStr}" → field=${preimage}`);

    return generatePlonkProof("hash_check", {
        preimage: preimage,
        expectedHash: expectedHashStr
    }, "Hash Check");
}

// ============================================
// SET MEMBERSHIP (value ∈ allowed set)
// ============================================

/**
 * Generate PLONK proof: value ∈ {allowed values}.
 * The set holds up to 8 values (pad with 0).
 * @param {string} fieldName - Field name (e.g., "nationality")
 * @param {string} actualValue - The actual value from credential
 * @param {string[]} allowedValues - Array of allowed values (max 8)
 */
export async function generateSetMembershipProof(fieldName, actualValue, allowedValues) {
    const encoding = EQUALITY_ENCODINGS[fieldName];
    if (!encoding) {
        throw new Error(`No encoding table for field "${fieldName}".`);
    }

    // Case-insensitive lookup helper
    const findEncoding = (val) => {
        if (encoding[val] !== undefined) return { key: val, code: encoding[val] };
        // Try case-insensitive match
        const match = Object.keys(encoding).find(k => k.toLowerCase() === val.toLowerCase());
        if (match) return { key: match, code: encoding[match] };
        return null;
    };

    const actualMatch = findEncoding(actualValue);
    if (!actualMatch) {
        throw new Error(`Unknown value "${actualValue}" for field "${fieldName}". Valid values: ${Object.keys(encoding).join(', ')}`);
    }

    // Encode allowed values, pad to 8 with 0
    const setArray = new Array(8).fill(0);
    for (let i = 0; i < Math.min(allowedValues.length, 8); i++) {
        const match = findEncoding(allowedValues[i]);
        if (!match) {
            throw new Error(`Unknown allowed value "${allowedValues[i]}" for field "${fieldName}". Valid values: ${Object.keys(encoding).join(', ')}`);
        }
        setArray[i] = match.code;
    }

    console.log(`🔐 [Browser] Generating PLONK set membership proof: ${fieldName}=${actualMatch.code}, set=[${setArray}]`);

    if (!setArray.includes(actualMatch.code)) {
        throw new Error(
            `Value "${actualValue}" is not in the allowed set. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generatePlonkProof("set_membership", {
        value: actualMatch.code,
        set: setArray
    }, `Set Membership (${fieldName})`);
}

// ============================================
// STRING MATCH (Poseidon hash equality)
// ============================================

/**
 * Generate PLONK proof: Poseidon(actual) == Poseidon(expected).
 * Both values are hashed inside the circuit. Neither is revealed.
 * @param {string} actualStr - The actual string from credential
 * @param {string} expectedStr - The verifier's expected string
 */
export async function generateStringMatchProof(actualStr, expectedStr) {
    const actualField = stringToFieldElement(actualStr).toString();
    const expectedField = stringToFieldElement(expectedStr).toString();

    console.log(`🔐 [Browser] Generating PLONK string match proof: "${actualStr}" vs "${expectedStr}"`);

    if (actualStr !== expectedStr) {
        throw new Error(
            `String "${actualStr}" does not match expected "${expectedStr}". ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generatePlonkProof("string_match", {
        actual: actualField,
        expected: expectedField
    }, "String Match");
}

// ============================================
// CROSS-FIELD (valueA + valueB >= threshold)
// ============================================

/**
 * Generate PLONK proof: valueA + valueB >= threshold.
 * Proves a combined constraint across two numeric fields.
 * @param {number|string} valueA - First field value
 * @param {number|string} valueB - Second field value
 * @param {number|string} threshold - Combined threshold
 */
export async function generateCrossFieldProof(valueA, valueB, threshold) {
    const numA = parseInt(valueA);
    const numB = parseInt(valueB);
    const numThreshold = parseInt(threshold);

    if (isNaN(numA) || isNaN(numB) || isNaN(numThreshold)) {
        throw new Error(`Invalid values: A=${valueA}, B=${valueB}, threshold=${threshold}`);
    }

    console.log(`🔐 [Browser] Generating PLONK cross-field proof: ${numA} + ${numB} >= ${numThreshold}`);

    if (numA + numB < numThreshold) {
        throw new Error(
            `Sum ${numA + numB} does not meet threshold ${numThreshold}. ` +
            `Cannot generate a proof for a false statement.`
        );
    }

    return generatePlonkProof("cross_field", {
        valueA: numA,
        valueB: numB,
        threshold: numThreshold
    }, "Cross-Field Check");
}

// ============================================
// EXTRACT LOCATION (utility — no circuit)
// ============================================

/**
 * Extract city/state from an address string.
 * NOT a ZK proof — just a utility function.
 * @param {string} address - Full address string
 * @returns {{city: string, state: string, raw: string}}
 */
export function extractLocation(address) {
    if (!address || typeof address !== 'string') {
        return { city: '', state: '', raw: address || '' };
    }

    // Split by commas and clean up
    const parts = address.split(',').map(p => p.trim()).filter(Boolean);

    if (parts.length >= 3) {
        return {
            city: parts[parts.length - 3] || '',
            state: parts[parts.length - 2] || '',
            raw: address
        };
    } else if (parts.length === 2) {
        return { city: parts[0], state: parts[1], raw: address };
    } else {
        return { city: address, state: '', raw: address };
    }
}


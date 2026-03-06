const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

// ============================================
// GENERIC GROTH16 VERIFICATION HELPER
// ============================================

/**
 * Generic Groth16 proof verification.
 * @param {string} vkeyFileName - Name of the verification key file (e.g., "age_check_vkey.json")
 * @param {Object} proof - The cryptographic proof
 * @param {Array} publicSignals - The public signals
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
async function verifyGroth16(vkeyFileName, proof, publicSignals) {
    const vKeyPath = path.resolve(__dirname, `../../zk-factory/build/${vkeyFileName}`);

    if (!fs.existsSync(vKeyPath)) {
        return { valid: false, reason: `Verification key not found: ${vkeyFileName}` };
    }

    const vKey = JSON.parse(fs.readFileSync(vKeyPath, "utf-8"));

    try {
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);

        if (!isValid) {
            return { valid: false, reason: "Cryptographic proof verification failed" };
        }

        return { valid: true };
    } catch (error) {
        console.error(`Groth16 verification failed (${vkeyFileName}):`, error);
        return { valid: false, reason: error.message };
    }
}

// ============================================
// AGE CHECK — age >= threshold
// ============================================

async function verifyAgeProof(proof, publicSignals, expectedThreshold) {
    // Use vk_01.json for backward compatibility, fall back to age_check_vkey.json
    const vkeyFile = fs.existsSync(path.resolve(__dirname, "../../zk-factory/build/vk_01.json"))
        ? "vk_01.json"
        : "age_check_vkey.json";

    const result = await verifyGroth16(vkeyFile, proof, publicSignals);
    if (!result.valid) return result;

    // publicSignals[0] = isEligible, publicSignals[1] = ageThreshold
    if (publicSignals[0] !== "1") {
        return { valid: false, reason: `isEligible signal is ${publicSignals[0]}, expected 1` };
    }

    if (expectedThreshold !== undefined && expectedThreshold !== null) {
        const provenThreshold = parseInt(publicSignals[1]);
        if (provenThreshold !== parseInt(expectedThreshold)) {
            return {
                valid: false,
                reason: `Threshold mismatch: proof=${provenThreshold}, requested=${expectedThreshold}`
            };
        }
    }

    return { valid: true };
}

// ============================================
// EQUALITY CHECK — value == expected
// ============================================

async function verifyEqualityProof(proof, publicSignals, expectedValue) {
    const result = await verifyGroth16("equality_check_vkey.json", proof, publicSignals);
    if (!result.valid) return result;

    // publicSignals[0] = isEqual, publicSignals[1] = expected (public input)
    if (publicSignals[0] !== "1") {
        return { valid: false, reason: `Equality check failed: values do not match` };
    }

    return { valid: true };
}

// ============================================
// RANGE CHECK — value >= threshold
// ============================================

async function verifyRangeProof(proof, publicSignals, expectedThreshold) {
    const result = await verifyGroth16("range_check_vkey.json", proof, publicSignals);
    if (!result.valid) return result;

    // publicSignals[0] = isValid, publicSignals[1] = threshold
    if (publicSignals[0] !== "1") {
        return { valid: false, reason: `Range check failed: value below threshold` };
    }

    if (expectedThreshold !== undefined) {
        const provenThreshold = parseInt(publicSignals[1]);
        if (provenThreshold !== parseInt(expectedThreshold)) {
            return {
                valid: false,
                reason: `Threshold mismatch: proof=${provenThreshold}, requested=${expectedThreshold}`
            };
        }
    }

    return { valid: true };
}

// ============================================
// YEAR CHECK — year <= threshold
// ============================================

async function verifyYearProof(proof, publicSignals, expectedThreshold) {
    const result = await verifyGroth16("year_check_vkey.json", proof, publicSignals);
    if (!result.valid) return result;

    // publicSignals[0] = isValid, publicSignals[1] = yearThreshold
    if (publicSignals[0] !== "1") {
        return { valid: false, reason: `Year check failed: year exceeds threshold` };
    }

    if (expectedThreshold !== undefined) {
        const provenThreshold = parseInt(publicSignals[1]);
        if (provenThreshold !== parseInt(expectedThreshold)) {
            return {
                valid: false,
                reason: `Year threshold mismatch: proof=${provenThreshold}, requested=${expectedThreshold}`
            };
        }
    }

    return { valid: true };
}

// ============================================
// DATE CHECK — dateValue > dateThreshold
// ============================================

async function verifyDateProof(proof, publicSignals, expectedThreshold) {
    const result = await verifyGroth16("date_check_vkey.json", proof, publicSignals);
    if (!result.valid) return result;

    // publicSignals[0] = isValid, publicSignals[1] = dateThreshold
    if (publicSignals[0] !== "1") {
        return { valid: false, reason: `Date check failed: date does not satisfy comparison` };
    }

    return { valid: true };
}

// ============================================
// HASH CHECK — Poseidon(preimage) == expectedHash
// ============================================

async function verifyHashProof(proof, publicSignals) {
    const result = await verifyGroth16("hash_check_vkey.json", proof, publicSignals);
    if (!result.valid) return result;

    // publicSignals[0] = isValid, publicSignals[1] = expectedHash
    if (publicSignals[0] !== "1") {
        return { valid: false, reason: `Hash check failed: preimage does not match expected hash` };
    }

    return { valid: true };
}

// ============================================
// VERIFY ALL ZK PROOFS (dispatcher)
// ============================================

/**
 * Verify all zkProofs in the map.
 * Keys follow the pattern: ageProof, yearProof, rangeProof, eq_{field}, date_{field}, hash_{field}
 * @param {Object} zkProofs - Map of proof name → { proof, publicSignals }
 * @returns {Promise<{valid: boolean, reason?: string}>}
 */
async function verifyAllZkProofs(zkProofs) {
    for (const [key, zkProof] of Object.entries(zkProofs)) {
        if (!zkProof || !zkProof.proof || !zkProof.publicSignals) continue;

        let result;

        if (key === "ageProof" || key.startsWith("age_")) {
            result = await verifyAgeProof(zkProof.proof, zkProof.publicSignals);
        } else if (key === "yearProof") {
            result = await verifyYearProof(zkProof.proof, zkProof.publicSignals);
        } else if (key === "rangeProof") {
            result = await verifyRangeProof(zkProof.proof, zkProof.publicSignals);
        } else if (key.startsWith("eq_")) {
            result = await verifyEqualityProof(zkProof.proof, zkProof.publicSignals);
        } else if (key.startsWith("date_")) {
            result = await verifyDateProof(zkProof.proof, zkProof.publicSignals);
        } else if (key.startsWith("hash_")) {
            result = await verifyHashProof(zkProof.proof, zkProof.publicSignals);
        } else {
            console.warn(`Unknown zk proof type: ${key}, skipping`);
            continue;
        }

        if (!result.valid) {
            return { valid: false, reason: `${key}: ${result.reason}` };
        }

        console.log(`✅ zk-SNARK proof verified: ${key}`);
    }

    return { valid: true };
}

module.exports = {
    verifyAgeProof,
    verifyEqualityProof,
    verifyRangeProof,
    verifyYearProof,
    verifyDateProof,
    verifyHashProof,
    verifyAllZkProofs
};


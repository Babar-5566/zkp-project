const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

/**
 * Generate a zk-SNARK proof for the age_check circuit.
 * @param {number} age - The user's actual age (private)
 * @param {number} threshold - The required minimum age (public)
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
async function generateAgeProof(age, threshold) {
    const wasmPath = path.resolve(__dirname, "../zk-factory/build/age_check_js/age_check.wasm");
    const zkeyPath = path.resolve(__dirname, "../zk-factory/build/age_check.zkey");

    // The inputs need to match the signals in your age_check.circom
    const input = {
        age: age,
        ageThreshold: threshold
    };

    try {
        const { proof, publicSignals } = await snarkjs.plonk.fullProve(input, wasmPath, zkeyPath);
        return { proof, publicSignals };
    } catch (error) {
        console.error("Proof generation failed:", error);
        throw error;
    }
}

module.exports = {
    generateAgeProof
};

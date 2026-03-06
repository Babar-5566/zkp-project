import * as snarkjs from "snarkjs";

/**
 * Generate a zk-SNARK proof entirely in the browser.
 * Uses the age_check circuit artifacts served from /zk/.
 *
 * @param {string} dob - Date of birth in DD/MM/YYYY format
 * @param {number} threshold - Minimum age required (e.g. 18)
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
export async function generateZkProofInBrowser(dob, threshold) {
    // 1️⃣ Calculate age from DOB
    const parts = dob.split("/");
    const birthDate = new Date(
        parseInt(parts[2]),      // year
        parseInt(parts[1]) - 1,  // month (0-indexed)
        parseInt(parts[0])       // day
    );
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    console.log(`🔐 [Browser] Generating zk-SNARK proof: age=${age}, threshold=${threshold}`);

    // 2️⃣ Circuit inputs (age is private, ageThreshold is public)
    const input = {
        age: age,
        ageThreshold: parseInt(threshold)
    };

    // 3️⃣ Fetch WASM and zkey from the public/ directory
    const wasmUrl = "/zk/age_check.wasm";
    const zkeyUrl = "/zk/age_check_final.zkey";

    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmUrl,
            zkeyUrl
        );

        console.log("✅ [Browser] zk-SNARK proof generated successfully!");
        console.log("📊 Public signals:", publicSignals);

        return { proof, publicSignals };
    } catch (error) {
        console.error("❌ [Browser] zk-SNARK proof generation failed:", error);
        throw error;
    }
}

import * as snarkjs from "snarkjs";

/**
 * Generate a zk-SNARK proof entirely in the browser.
 * Uses the age_check circuit artifacts served from /zk/.
 *
 * @param {string} dob - Date of birth in DD/MM/YYYY format
 * @param {number} threshold - Minimum age required (e.g. 18)
 * @returns {Promise<{proof: Object, publicSignals: Array}>}
 */
export async function generateZkSnarkProof(dob, threshold) {
    // 1️⃣ Calculate age from DOB
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

    console.log(`🔐 [Browser] Generating zk-SNARK proof: age=${age}, threshold=${thresholdNum}`);

    // 2️⃣ Pre-flight check: If age < threshold, the circuit constraint will reject
    //    (gte.out === 1 enforces age >= ageThreshold). Throw a clear error instead
    //    of a cryptic WASM assertion failure.
    if (age < thresholdNum) {
        throw new Error(
            `Age ${age} does not meet the required threshold of ${thresholdNum}. ` +
            `Cannot generate a zero-knowledge proof for a false statement.`
        );
    }

    // 3️⃣ Verify circuit artifacts are accessible before attempting proof generation
    const wasmUrl = "/zk/age_check.wasm";
    const zkeyUrl = "/zk/age_check_final.zkey";

    try {
        const [wasmRes, zkeyRes] = await Promise.all([
            fetch(wasmUrl, { method: "HEAD" }),
            fetch(zkeyUrl, { method: "HEAD" })
        ]);

        if (!wasmRes.ok) {
            throw new Error(`Circuit WASM file not found at ${wasmUrl} (HTTP ${wasmRes.status})`);
        }
        if (!zkeyRes.ok) {
            throw new Error(`Circuit zkey file not found at ${zkeyUrl} (HTTP ${zkeyRes.status})`);
        }
    } catch (fetchError) {
        if (fetchError.message.includes("not found")) throw fetchError;
        throw new Error(`Cannot reach circuit artifacts: ${fetchError.message}`);
    }

    // 4️⃣ Circuit inputs (age is private, ageThreshold is public)
    const input = {
        age: age,
        ageThreshold: thresholdNum
    };

    // 5️⃣ Generate proof
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

        // Provide a more helpful error message for common failures
        if (error.message?.includes("Assert Failed")) {
            throw new Error(
                `Circuit constraint failed: age=${age} does not satisfy threshold=${thresholdNum}`
            );
        }

        throw new Error(`zk-SNARK proof generation failed: ${error.message}`);
    }
}

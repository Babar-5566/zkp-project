const snarkjs = require("snarkjs");
const path = require("path");

async function test() {
    const wasmPath = path.resolve(__dirname, "build/age_check_js/age_check.wasm");
    const zkeyPath = path.resolve(__dirname, "build/age_check.zkey");
    const vkPath = path.resolve(__dirname, "build/vk_01.json");

    // Test 1: Valid proof (age 25 >= 18)
    console.log("=== Test 1: age=25, threshold=18 ===");
    try {
        const { proof, publicSignals } = await snarkjs.plonk.fullProve(
            { age: 25, ageThreshold: 18 },
            wasmPath,
            zkeyPath
        );
        console.log("Proof generated OK");
        console.log("Public signals:", publicSignals);

        // Verify
        const vk = require(vkPath);
        const valid = await snarkjs.plonk.verify(vk, publicSignals, proof);
        console.log("Verification:", valid ? "PASS" : "FAIL");
    } catch (e) {
        console.error("FAILED:", e.message);
    }

    // Test 2: Invalid (age 16 < 18 — should fail at constraint)
    console.log("\n=== Test 2: age=16, threshold=18 (should fail) ===");
    try {
        await snarkjs.plonk.fullProve(
            { age: 16, ageThreshold: 18 },
            wasmPath,
            zkeyPath
        );
        console.log("Proof generated (unexpected!)");
    } catch (e) {
        console.log("Correctly failed:", e.message);
    }
}

test().then(() => console.log("\nDone."));

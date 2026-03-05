const { generateAgeProof } = require("../wallet/prover");
const { verifyAgeProof } = require("../verifiers/barVerifier/zkVerifier");

async function runTests() {
    console.log("=== Testing Valid Proof (age: 25, threshold: 18) ===");
    try {
        const { proof, publicSignals } = await generateAgeProof(25, 18);
        console.log("Proof successfully generated!");
        console.log("Public Signals:", publicSignals);

        const isValid = await verifyAgeProof(proof, publicSignals);
        console.log(`Verification Result: ${isValid ? 'SUCCESS' : 'FAILURE'}`);
    } catch (e) {
        console.error("Error during valid test:", e);
    }

    console.log("\n=== Testing Invalid Proof (age: 16, threshold: 18) ===");
    try {
        const { proof, publicSignals } = await generateAgeProof(16, 18);
        console.log("Proof successfully generated! (Wait, this shouldn't happen!)");

        const isValid = await verifyAgeProof(proof, publicSignals);
        console.log(`Verification Result: ${isValid ? 'SUCCESS' : 'FAILURE'}`);
    } catch (e) {
        console.log("Error during proof generation (Expected because constraint gte.out === 1 fails)!");
        console.log("Error message:", e.message);
    }
}

runTests().then(() => {
    console.log("\nTests finished.");
});

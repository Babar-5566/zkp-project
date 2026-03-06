pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// Proves: Poseidon(preimage) == expectedHash
// Used for string equality in ZK without revealing the actual value
// E.g., proves "I know a name whose Poseidon hash is 0xabc..."
// Both holder and verifier must use the same Poseidon implementation
template HashCheck() {
    signal input preimage;       // private: the actual field value (encoded as field element)
    signal input expectedHash;   // public: the Poseidon hash the verifier expects

    signal output isValid;

    // Compute Poseidon hash of the preimage
    component hasher = Poseidon(1);
    hasher.inputs[0] <== preimage;

    // Enforce: computed hash MUST equal the expected hash
    component eq = IsEqual();
    eq.in[0] <== hasher.out;
    eq.in[1] <== expectedHash;

    eq.out === 1;

    isValid <== eq.out;
}

// preimage is private, expectedHash is public
component main {public [expectedHash]} = HashCheck();

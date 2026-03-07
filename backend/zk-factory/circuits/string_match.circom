pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

// String Match: proves Poseidon(actualValue) == Poseidon(expectedValue)
// Both sides are hashed inside the circuit — the verifier provides the
// expected string (as a field element), and the prover provides the actual.
// Neither raw value is revealed; only the match result.
template StringMatch() {
    signal input actual;      // field element of actual string (private)
    signal input expected;    // field element of expected string (public)
    signal output isMatch;

    // Hash actual value
    component hashActual = Poseidon(1);
    hashActual.inputs[0] <== actual;

    // Hash expected value
    component hashExpected = Poseidon(1);
    hashExpected.inputs[0] <== expected;

    // Compare hashes
    component eq = IsEqual();
    eq.in[0] <== hashActual.out;
    eq.in[1] <== hashExpected.out;
    isMatch <== eq.out;

    // Enforce match
    isMatch === 1;
}

component main {public [expected]} = StringMatch();

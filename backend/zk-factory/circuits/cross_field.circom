pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Cross-Field: proves valueA + valueB >= threshold
// Useful for combined constraints like "marks + passingYear >= X"
// or proving relationships between two credential fields.
template CrossField() {
    signal input valueA;       // first field value (private)
    signal input valueB;       // second field value (private)
    signal input threshold;    // combined threshold (public)
    signal output isValid;

    signal sum;
    sum <== valueA + valueB;

    // Check sum >= threshold
    component gte = GreaterEqThan(32);
    gte.in[0] <== sum;
    gte.in[1] <== threshold;
    isValid <== gte.out;

    // Enforce constraint
    isValid === 1;
}

component main {public [threshold]} = CrossField();

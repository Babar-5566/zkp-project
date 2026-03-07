pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Proves: value >= threshold (generic range check)
// Reusable for marks (0-100), or any numeric comparison
template RangeCheck() {
    signal input value;          // private: actual numeric value (e.g., marks percentage)
    signal input threshold;      // public: verifier's minimum threshold

    signal output isValid;

    // 8-bit comparator: supports values 0-255 (enough for marks 0-100)
    component gte = GreaterEqThan(8);
    gte.in[0] <== value;
    gte.in[1] <== threshold;

    // Enforce the constraint: value MUST be >= threshold
    gte.out === 1;

    isValid <== gte.out;
}

// value is private, threshold is public
component main {public [threshold]} = RangeCheck();

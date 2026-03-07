pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Proves: value == expected (for categorical/enumerable fields)
// Both value and expected are encoded as integers using a shared encoding table
// e.g., Male=1, Female=2, Other=3 | CBSE=1, ICSE=2, etc.
template EqualityCheck() {
    signal input value;          // private: actual field value (encoded as integer)
    signal input expected;       // public: verifier's expected value

    signal output isEqual;

    component eq = IsEqual();
    eq.in[0] <== value;
    eq.in[1] <== expected;

    // Enforce the constraint: value MUST equal expected
    eq.out === 1;

    isEqual <== eq.out;
}

// value is private, expected is public
component main {public [expected]} = EqualityCheck();

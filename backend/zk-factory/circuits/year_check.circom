pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Proves: year <= threshold (passingYear check)
// E.g., "I passed on or before 2026"
template YearCheck() {
    signal input year;           // private: actual passing year
    signal input yearThreshold;  // public: verifier's threshold year (e.g., 2026)

    signal output isValid;

    // 16-bit comparator: supports years up to 65535
    component lte = LessEqThan(16);
    lte.in[0] <== year;
    lte.in[1] <== yearThreshold;

    // Enforce the constraint: year MUST be <= threshold
    lte.out === 1;

    isValid <== lte.out;
}

// year is private, yearThreshold is public
component main {public [yearThreshold]} = YearCheck();

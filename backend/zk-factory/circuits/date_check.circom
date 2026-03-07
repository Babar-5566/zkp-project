pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Proves: dateValue > dateThreshold (date comparison)
// Both dates are encoded as epoch days (days since Unix epoch)
// Encoding: Math.floor(new Date(date).getTime() / 86400000)
// E.g., proves "expiry date is after today" or "issue date is before X"
template DateCheck() {
    signal input dateValue;      // private: actual date in epoch days
    signal input dateThreshold;  // public: verifier's comparison date in epoch days

    signal output isValid;

    // 32-bit comparator: supports epoch days up to ~11.7 million years
    component gt = GreaterThan(32);
    gt.in[0] <== dateValue;
    gt.in[1] <== dateThreshold;

    // Enforce the constraint: dateValue MUST be > dateThreshold
    gt.out === 1;

    isValid <== gt.out;
}

// dateValue is private, dateThreshold is public
component main {public [dateThreshold]} = DateCheck();

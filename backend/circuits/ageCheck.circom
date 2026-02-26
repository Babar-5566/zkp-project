pragma circom 2.0.0;

// Circom er built-in math library (GreaterEqThan er jonne)
include "../node_modules/circomlib/circuits/comparators.circom";

template AgeCheck() {
    // Inputs
    signal input age;        // Private input (Wallet theke asbe)
    signal input ageLimit;   // Public input (Verifier/Zomato er requirement, eg: 21)

    // Output
    signal output isOfAge;

    // Constraint Logic (age >= ageLimit check kora)
    component geq = GreaterEqThan(8); // 8-bit number comparison
    geq.in[0] <== age;
    geq.in[1] <== ageLimit;

    isOfAge <== geq.out;

    // Strict rule: condition true (1) hotei hobe
    isOfAge === 1; 
}

// ageLimit take public declare kora hocche
component main {public [ageLimit]} = AgeCheck();
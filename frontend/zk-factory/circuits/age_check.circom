pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

template AgeCheck() {
    signal input age;
    signal input ageThreshold;
    signal output isEligible;

    component gte = GreaterEqThan(8); // 8-bit comparator is enough for age up to 255
    gte.in[0] <== age;
    gte.in[1] <== ageThreshold;
    
    // Ensure that the output of the GreaterEqThan component is 1
    gte.out === 1;
    
    isEligible <== gte.out;
}

// age is private, ageThreshold is public
component main {public [ageThreshold]} = AgeCheck();

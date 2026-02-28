pragma circom 2.1.6;

include "node_modules/circomlib/circuits/comparators.circom";

template AgeProof() {
    signal input age;
    signal input requiredAge;
    signal output valid;

    component geq = GreaterEqThan(8);
    geq.in[0] <== age;
    geq.in[1] <== requiredAge;
    valid <== geq.out;
}

component main { public [requiredAge] } = AgeProof();
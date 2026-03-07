pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/comparators.circom";

// Set Membership: proves value ∈ {set[0], set[1], ..., set[N-1]}
// Pad unused set slots with 0 (value must not be 0).
template SetMembership(N) {
    signal input value;
    signal input set[N];
    signal output isInSet;

    // For each element, check if value == set[i]
    component eq[N];
    signal matches[N];

    for (var i = 0; i < N; i++) {
        eq[i] = IsEqual();
        eq[i].in[0] <== value;
        eq[i].in[1] <== set[i];
        matches[i] <== eq[i].out;  // 1 if match, 0 if not
    }

    // Sum all matches — at least one must be 1
    signal sums[N];
    sums[0] <== matches[0];
    for (var i = 1; i < N; i++) {
        sums[i] <== sums[i-1] + matches[i];
    }

    // isInSet = 1 if sums[N-1] >= 1
    component gte = GreaterEqThan(8);
    gte.in[0] <== sums[N-1];
    gte.in[1] <== 1;
    isInSet <== gte.out;

    // Enforce: must be in the set (constraint)
    isInSet === 1;
}

component main {public [set]} = SetMembership(8);

const {
  allocateIndex,
  revoke,
  isRevoked,
  getAccumulatorState,
  resetAccumulator
} = require("./services/revocationStore");

resetAccumulator();

// console.log("---- TEST START ----");

// // Allocate new index (simulate issuing credential)
// const index = allocateIndex();
// console.log("Allocated index:", index);

// // Check before revocation
// console.log("Is revoked before revoke?", isRevoked(index)); // false

// // Revoke credential
// revoke(index);
// console.log("Revoked index:", index);

// // Check after revocation
// console.log("Is revoked after revoke?", isRevoked(index)); // true

// // View accumulator state
// console.log("Accumulator:", getAccumulatorState());

// console.log("---- TEST END ----");
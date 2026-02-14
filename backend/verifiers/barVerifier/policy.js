function checkAgePredicate(predicateProof) {
  return predicateProof.statement === "age >= 18" &&
         predicateProof.result === true;
}

module.exports = { checkAgePredicate };

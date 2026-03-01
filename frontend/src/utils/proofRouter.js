export function chooseProofSystem(fieldType, predicate) {

  // GROTH RULES
  if (
    predicate === "numeric/range" ||
    predicate === "cross-field" ||
    predicate === "date comparison"
  ) return "groth"

  // Optional equality via SNARK for numbers
  if (predicate === "equality" && fieldType === "numeric")
    return "groth"

  // DEFAULT → BBS
  return "bbs"
}
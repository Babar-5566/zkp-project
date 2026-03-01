const crypto = require("crypto");

function hashValue(value) {
  return crypto.createHash("sha256").update(String(value)).digest("hex");
}

function calculateAge(dob) {
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function evaluatePredicate(rule, credential) {
  switch (rule.type) {

    // ✅ Equality check
    case "EQUALS":
      return credential[rule.field] === rule.value;

    // ✅ Numeric comparison
    case "GREATER_THAN":
      return credential[rule.field] > rule.value;

    case "LESS_THAN":
      return credential[rule.field] < rule.value;

    case "GREATER_OR_EQUAL":
      return credential[rule.field] >= rule.value;

    case "LESS_OR_EQUAL":
      return credential[rule.field] <= rule.value;

    // ✅ Range check
    case "IN_RANGE":
      return (
        credential[rule.field] >= rule.min &&
        credential[rule.field] <= rule.max
      );

    // ✅ Set membership
    case "IN_SET":
      return rule.set.includes(credential[rule.field]);

    // ✅ Boolean check
    case "BOOLEAN":
      return credential[rule.field] === rule.value;

    // ✅ Date comparison
    case "DATE_BEFORE":
      return new Date(credential[rule.field]) < new Date(rule.value);

    case "DATE_AFTER":
      return new Date(credential[rule.field]) > new Date(rule.value);

    // ✅ String match
    case "STRING_EQUALS":
      return String(credential[rule.field]) === String(rule.value);

    case "STRING_CONTAINS":
      return String(credential[rule.field]).includes(rule.value);

    case "STRING_STARTS_WITH":
      return String(credential[rule.field]).startsWith(rule.value);

    // ✅ Hash match
    case "HASH_MATCH":
      return hashValue(credential[rule.field]) === rule.hash;

    // ✅ Existence check
    case "EXISTS":
      return credential[rule.field] !== undefined && credential[rule.field] !== null;

    // ✅ Cross-field consistency
    case "FIELD_EQUALS_FIELD":
      return credential[rule.fieldA] === credential[rule.fieldB];

    case "FIELD_GREATER_THAN_FIELD":
      return credential[rule.fieldA] > credential[rule.fieldB];

    // ✅ Derived predicates
    case "AGE_GREATER_THAN":
      return calculateAge(credential.dob) > rule.value;

    case "AGE_GREATER_OR_EQUAL":
      return calculateAge(credential.dob) >= rule.value;

    default:
      throw new Error("Unknown predicate type: " + rule.type);
  }
}

module.exports = { evaluatePredicate };

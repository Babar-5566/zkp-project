/* utils/predicateCheckers.js */
// Not being used
/* ================= PREDICATE FUNCTIONS ================= */

// Existence check
function checkExistence(payload) {
    return payload.value !== undefined && payload.value !== null && payload.value !== "";
}

// Equality check
function checkEquality(payload) {
    return payload.value === payload.expected;
}

// Numeric comparison / Range check
function checkNumeric(payload) {
    const { value, operator, compareTo, min, max } = payload;

    if (operator) {
        switch (operator) {
            case ">": return value > compareTo;
            case "<": return value < compareTo;
            case ">=": return value >= compareTo;
            case "<=": return value <= compareTo;
            case "==": return value == compareTo;
            default: return false;
        }
    }

    if (min !== undefined && max !== undefined) {
        return value >= min && value <= max;
    }

    return false;
}

// Date comparison
function checkDate(payload) {
    const val = new Date(payload.value);
    const cmp = new Date(payload.compareTo);

    switch (payload.operator) {
        case ">": return val > cmp;
        case "<": return val < cmp;
        case ">=": return val >= cmp;
        case "<=": return val <= cmp;
        case "==": return val.getTime() === cmp.getTime();
        default: return false;
    }
}

// Boolean check
function checkBoolean(payload) {
    return payload.value === payload.expected;
}

// String match
function checkString(payload) {
    if (payload.partial) {
        return payload.value.includes(payload.expected);
    }
    return payload.value === payload.expected;
}

// Hash match
function checkHash(payload) {
    return payload.value === payload.expectedHash;
}

// Set membership
function checkSetMembership(payload) {
    return Array.isArray(payload.set) && payload.set.includes(payload.value);
}

// Cross-field consistency (example: dob consistent with age)
function checkCrossField(payload) {
    if (!payload.fields || !payload.fields.dob || !payload.fields.age) return false;
    const year = new Date(payload.fields.dob).getFullYear();
    const current = new Date().getFullYear();
    return current - year === payload.fields.age;
}

// Derived predicates (example combining multiple fields)
function checkDerived(payload) {
    if (!payload.fields) return false;
    // Example: income > threshold AND citizenship == India
    const { income, threshold, citizenship } = payload.fields;
    return income > threshold && citizenship === "India";
}

// Extract city/state from address
function extractLocation(payload) {
    if (!payload.value || typeof payload.value !== "string") return null;
    // Simple regex-based example (comma-separated address)
    const parts = payload.value.split(",");
    const city = parts[parts.length - 2]?.trim();
    const state = parts[parts.length - 1]?.trim();
    return { city, state };
}

export const generateFakeProof = () => {
  const now = new Date().toISOString();
  const randomHex = (len = 16) =>
    '0x' + Array.from({ length: len }, () => Math.floor(Math.random() * 16).toString(16)).join('');

  return {
    request_id: `req_${Math.floor(Math.random() * 10000)}`,
    timestamp: now,
    scope: {
      id: "verifier_A.example.com",
      pseudonym: randomHex(8)
    },
    disclosed_attributes: disclosedFields.reduce((acc, field) => {
      const [name, val] = field.split(':');
      acc[name] = val;
      return acc;
    }, {}),
    bbs_proof: {
      proof: `b64:${randomHex(32)}`,
      issuer_pubkey: "pk_issuer_xyz",
      nonce: randomHex(8)
    },
    zk_proof: {
      protocol: "groth16",
      curve: "bn128",
      pi_a: [randomHex(8), randomHex(8)],
      pi_b: [[randomHex(8), randomHex(8)], [randomHex(8), randomHex(8)]],
      pi_c: [randomHex(8), randomHex(8)]
    },
    public_inputs: {
      predicate_inputs: disclosedFields.reduce((acc, field) => {
        const [name, val] = field.split(':');
        acc[name] = val;
        return acc;
      }, {}),
      credential_commitment: randomHex(16),
      scope_pseudonym: randomHex(8),
      challenge: randomHex(8)
    },
    binding: {
      proof_hash: randomHex(16),
      credential_hash: randomHex(16),
      circuit_id: "age_degree_v3"
    }
  };
};


// module.exports = {
//     checkExistence,
//     checkEquality,
//     checkNumeric,
//     checkDate,
//     checkBoolean,
//     checkString,
//     checkHash,
//     checkSetMembership,
//     checkCrossField,
//     checkDerived,
//     extractLocation,
//     generateFakeProof
// };

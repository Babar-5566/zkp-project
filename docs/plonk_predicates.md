# PLONK Predicates — Field Support Matrix

## All Predicates (9 total — all implemented)

| Predicate | Type | Circuit | Input Required |
|---|---|---|---|
| existence | BBS+ | — | No |
| reveal | BBS+ | — | No |
| hash | PLONK | `hash_check.circom` | Expected hash |
| equality | PLONK | `equality_check.circom` | Expected value |
| numeric/range | PLONK | `age_check` / `range_check` / `year_check` | Threshold |
| date comparison | PLONK | `date_check.circom` | Comparison date |
| set membership | PLONK | `set_membership.circom` | Allowed values (comma-separated) |
| string match | PLONK | `string_match.circom` | Expected string |
| cross-field | PLONK | `cross_field.circom` | Sum threshold |
| extract location | Utility | — (JS only) | No |

## Field → Predicate Mapping

| Field | Predicates |
|---|---|
| fullName | existence, reveal, hash |
| aadhaarNumber | existence, reveal, hash |
| dob | existence, reveal, date comparison, numeric/range |
| gender | existence, reveal, equality, **set membership** |
| address | existence, reveal, hash, **string match**, **extract location** |
| photoVerified | existence, reveal, equality, **set membership** |
| panID | existence, reveal, hash |
| guardianName | existence, reveal, hash |
| passportID | existence, reveal, hash |
| nationality | existence, reveal, equality, **set membership** |
| expiryDate | existence, reveal, date comparison |
| licenseID | existence, reveal, hash |
| issueDate | existence, reveal, date comparison |
| placeOfBirth | existence, reveal, **string match** |
| fatherName / motherName | existence, reveal, hash |
| board | existence, reveal, equality, **set membership** |
| rollNumber | existence, reveal, hash |
| school | existence, reveal, **string match** |
| marks | existence, reveal, numeric/range, **cross-field** |
| university | existence, reveal, **string match** |
| passingYear | existence, reveal, numeric/range |

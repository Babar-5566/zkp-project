import {
  Hash, MapPin, Users, GraduationCap,
  Calendar, CreditCard, Flag, UserCheck,
  Car, Plane, BookOpen, FileText, Building2,
  ShieldCheck, User
} from 'lucide-react';

// --- SMART DATA LISTS ---
// export const COUNTRIES = ["India", "USA", "UK", "Canada", "Australia", "Germany", "France", "Japan", "Bangladesh", "Nepal", "Sri Lanka"];
export const COUNTRIES = ["India"];

export const BOARDS = [
  "WBBSE (West Bengal Board of Secondary Education)",
  "WBCHSE (West Bengal Council of Higher Secondary Education)",
  "CBSE (Central Board of Secondary Education)",
  "ICSE (Council for the Indian School Certificate Examinations)",
  "ISC (Indian School Certificate)",
  "NIOS (National Institute of Open Schooling)"
];

export const UNIVERSITIES = [
  "University of Calcutta", "Jadavpur University", "University of Burdwan",
  "University of North Bengal", "Kalyani University", "Vidyasagar University",
  "Aliah University", "Presidency University", "Sidho Kanho Birsha University",
  "Cooch Behar Panchanan Barma University", "University of Delhi",
  "Jawaharlal Nehru University", "Banaras Hindu University", "University of Hyderabad",
  "Aligarh Muslim University", "IIT Bombay", "IIT Delhi", "IIT Kharagpur",
  "Indian Institute of Science (IISc)", "AIIMS Delhi", "MAKAUT (WBUT)"
];

export const ID_TYPES = [
  'Aadhaar Card', 'PAN Card', 'Passport', 'Driving Licence', 'Birth Certificate',
  '10th Admit Card', '10th Marksheet', '12th Admit Card', '12th Marksheet',
  'University Degree'
];

export const getAllSchemaFields = () => {
  const map = new Map()

  ID_TYPES.forEach(type => {
    const fields = getFieldsByIdType(type)

    fields.forEach(field => {
      if (!map.has(field.name)) {
        map.set(field.name, field)
      }
    })
  })

  return Array.from(map.values())
}

const getToday = () => new Date().toISOString().split('T')[0];
const getCurrentYear = () => new Date().getFullYear();

export const getFieldsByIdType = (idType) => {
  const commonAuth = [
    { name: 'issuer', label: 'Issuer Authority', type: 'text', icon: Flag, defaultValue: 'Govt. of India', readOnly: true },
    // { name: 'issuanceDate', label: 'Date of Issue', type: 'date', icon: Calendar, defaultValue: getToday(), readOnly: true },
    // { name: 'documentAuthVerified', label: 'Digital Signature', type: 'badge', icon: ShieldCheck, defaultValue: 'VERIFIED', readOnly: true }
  ];

  switch (idType) {
    case 'Aadhaar Card':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'number', icon: Hash, placeholder: '1234 5678 XXXX', required: true, maxLength: 12, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        { name: 'gender', label: 'Gender', type: 'custom-select', options: ['Male', 'Female', 'Other'], icon: Users, required: true, predicates: ['existence', 'reveal', 'equality', 'set membership'] },
        { name: 'address', label: 'Address', type: 'text', icon: MapPin, required: true, predicates: ['existence', 'reveal', 'hash', 'string match', 'extract location'] },
        { name: 'photoVerified', label: 'Photo KYC', type: 'custom-select', options: ['Yes', 'No'], icon: UserCheck, required: true, predicates: ['existence', 'reveal', 'equality', 'set membership'] },
        ...commonAuth
      ];

    case 'PAN Card':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'panID', label: 'PAN Number', type: 'text', icon: CreditCard, placeholder: 'ABCDE1234F', required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'guardianName', label: 'Father/Guardian Name', type: 'text', icon: Users, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        ...commonAuth
      ];

    case 'Passport':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'passportID', label: 'Passport Number', type: 'text', icon: Plane, placeholder: 'A1234567', required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'nationality', label: 'Nationality', type: 'text', icon: Flag, defaultValue: "India", required: true, readOnly: true, options: ["India"], predicates: ['existence', 'reveal', 'equality', 'set membership'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        { name: 'expiryDate', label: 'Date of Expiry', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison'] },
        ...commonAuth
      ];

    case 'Driving Licence':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'licenseID', label: 'License Number', type: 'text', icon: Car, placeholder: 'DL-1420110012345', required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        { name: 'issueDate', label: 'Issue Date', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison'] },
        { name: 'expiryDate', label: 'Valid Till', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison'] },
        ...commonAuth
      ];

    case 'Birth Certificate':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', icon: MapPin, required: true, predicates: ['existence', 'reveal', 'string match'] },
        { name: 'fatherName', label: "Father's Name", type: 'text', icon: Users, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'motherName', label: "Mother's Name", type: 'text', icon: Users, required: true, predicates: ['existence', 'reveal', 'hash'] },
        ...commonAuth
      ];

    // --- SCHOOL LEVEL ---
    case '10th Admit Card':
    case '12th Admit Card':
      return [
        { name: 'fullName', label: 'Student Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'board', label: 'Board Name', type: 'custom-board', icon: BookOpen, placeholder: 'Select Board', options: BOARDS, required: true, predicates: ['existence', 'reveal', 'equality', 'set membership'] },
        { name: 'rollNumber', label: 'Roll Number', type: 'text', icon: UserCheck, required: true, simulateVerify: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'school', label: 'School Name', type: 'text', icon: Building2, required: true, predicates: ['existence', 'reveal', 'string match'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        ...commonAuth
      ];

    case '10th Marksheet':
    case '12th Marksheet':
      return [
        { name: 'fullName', label: 'Student Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'board', label: 'Board Name', type: 'custom-board', icon: BookOpen, options: BOARDS, required: true, predicates: ['existence', 'reveal', 'equality', 'set membership'] },
        { name: 'rollNumber', label: 'Roll Number', type: 'text', icon: UserCheck, required: true, simulateVerify: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'marks', label: 'Total Marks (%)', type: 'text', icon: FileText, placeholder: 'e.g. 85%', required: true, predicates: ['existence', 'reveal', 'numeric/range', 'cross-field'] },
        { name: 'school', label: 'School Name', type: 'text', icon: Building2, required: true, predicates: ['existence', 'reveal', 'string match'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'reveal', 'date comparison', 'numeric/range'] },
        ...commonAuth
      ];

    // --- UNIVERSITY LEVEL ---
    case 'University Degree':
      return [
        { name: 'fullName', label: 'Student Name', type: 'text', icon: User, required: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'university', label: 'University Name', type: 'custom-uni', icon: GraduationCap, placeholder: 'Select University', required: true, predicates: ['existence', 'reveal', 'string match'] },
        { name: 'rollNumber', label: 'Registration / Roll No', type: 'text', icon: UserCheck, required: true, simulateVerify: true, predicates: ['existence', 'reveal', 'hash'] },
        { name: 'passingYear', label: 'Year of Passing', type: 'custom-year', icon: Calendar, required: true, defaultValue: getCurrentYear, predicates: ['existence', 'reveal', 'numeric/range'] },
        ...commonAuth
      ];

    default: return [];
  }
};

export const predicateInfo = {
  existence: {
    message: "Proves this field exists in the credential WITHOUT revealing its value.",
    requiresInput: false,
    inputType: null
  },

  reveal: {
    message: "Reveals the actual value of this field to the verifier (BBS+ selective disclosure).",
    requiresInput: false,
    inputType: null
  },

  equality: {
    message: "PLONK proof — proves the categorical field matches the expected value (e.g., gender, board) without revealing it.",
    requiresInput: true,
    inputType: "text"
  },

  "numeric/range": {
    message: "PLONK proof — enter threshold. Proves value satisfies comparison (age ≥ X, marks ≥ X, year ≤ X) without revealing actual value.",
    requiresInput: true,
    inputType: "numeric"
  },

  "date comparison": {
    message: "PLONK proof — proves the date satisfies a comparison without revealing the actual date.",
    requiresInput: true,
    inputType: "date"
  },

  hash: {
    message: "PLONK proof — proves the field matches a Poseidon hash without revealing the value. Use for string equality in ZK.",
    requiresInput: true,
    inputType: "hash"   // hex only
  },

  // --- PLONK predicates (ready for future circuit implementation) ---
  "set membership": {
    message: "PLONK proof — proves value belongs to an allowed set without revealing which one. Select one of the following values.",
    requiresInput: true,
    inputType: "text"
  },

  "string match": {
    message: "PLONK proof — proves a string field matches an expected value via Poseidon hashing without revealing either.",
    requiresInput: true,
    inputType: "text"
  },

  "cross-field": {
    message: "PLONK proof — proves marks + passingYear >= threshold (combined constraint). Enter the sum threshold.",
    requiresInput: true,
    inputType: "numeric"
  },

  "extract location": {
    message: "Extracts city/state from address — not a ZK proof, utility only. No input needed.",
    requiresInput: false,
    inputType: null
  },
};
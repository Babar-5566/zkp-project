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
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'aadhaarNumber', label: 'Aadhaar Number', type: 'number', icon: Hash, placeholder: '1234 5678 XXXX', required: true, maxLength: 12, predicates: ['existence', 'equality', 'hash'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        { name: 'gender', label: 'Gender', type: 'custom-select', options: ['Male', 'Female', 'Other'], icon: Users, required: true, predicates: ['existence', 'equality', 'set membership'] },
        { name: 'address', label: 'Address', type: 'text', icon: MapPin, required: true, predicates: ['existence', 'string match', 'extract location'] },
        { name: 'photoVerified', label: 'Photo KYC', type: 'custom-select', options: ['Yes', 'No'], icon: UserCheck, required: true, predicates: ['existence', 'boolean'] },
        ...commonAuth
      ];

    case 'PAN Card':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'panID', label: 'PAN Number', type: 'text', icon: CreditCard, placeholder: 'ABCDE1234F', required: true, predicates: ['existence', 'equality', 'hash'] },
        { name: 'guardianName', label: 'Father/Guardian Name', type: 'text', icon: Users, required: true, predicates: ['existence', 'equality'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        ...commonAuth
      ];

    case 'Passport':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'passportID', label: 'Passport Number', type: 'text', icon: Plane, placeholder: 'A1234567', required: true, predicates: ['existence', 'equality', 'hash'] },
        { name: 'nationality', label: 'Nationality', type: 'text', icon: Flag, defaultValue: "India", required: true, readOnly: true, predicates: ['existence', 'equality', 'set membership'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        { name: 'expiryDate', label: 'Date of Expiry', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison'] },
        ...commonAuth
      ];

    case 'Driving Licence':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'licenseID', label: 'License Number', type: 'text', icon: Car, placeholder: 'DL-1420110012345', required: true, predicates: ['existence', 'equality', 'hash'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        { name: 'issueDate', label: 'Issue Date', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison'] },
        { name: 'expiryDate', label: 'Valid Till', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison'] },
        ...commonAuth
      ];

    case 'Birth Certificate':
      return [
        { name: 'fullName', label: 'Full Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        { name: 'placeOfBirth', label: 'Place of Birth', type: 'text', icon: MapPin, required: true, predicates: ['existence', 'string match'] },
        { name: 'fatherName', label: "Father's Name", type: 'text', icon: Users, required: true, predicates: ['existence', 'equality'] },
        { name: 'motherName', label: "Mother's Name", type: 'text', icon: Users, required: true, predicates: ['existence', 'equality'] },
        ...commonAuth
      ];

    // --- SCHOOL LEVEL ---
    case '10th Admit Card':
    case '12th Admit Card':
      return [
        { name: 'fullName', label: 'Student Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'board', label: 'Board Name', type: 'custom-board', icon: BookOpen, placeholder: 'Select Board', required: true, predicates: ['existence', 'set membership', 'equality'] },
        { name: 'rollNumber', label: 'Roll Number', type: 'text', icon: UserCheck, required: true, simulateVerify: true, predicates: ['existence', 'equality', 'hash'] },
        { name: 'school', label: 'School Name', type: 'text', icon: Building2, required: true, predicates: ['existence', 'string match', 'equality'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        ...commonAuth
      ];

    case '10th Marksheet':
    case '12th Marksheet':
      return [
        { name: 'fullName', label: 'Student Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'board', label: 'Board Name', type: 'custom-board', icon: BookOpen, required: true, predicates: ['existence', 'set membership', 'equality'] },
        { name: 'rollNumber', label: 'Roll Number', type: 'text', icon: UserCheck, required: true, simulateVerify: true, predicates: ['existence', 'equality', 'hash'] },
        { name: 'marks', label: 'Total Marks (%)', type: 'text', icon: FileText, placeholder: 'e.g. 85%', required: true, predicates: ['existence', 'numeric/range'] },
        { name: 'school', label: 'School Name', type: 'text', icon: Building2, required: true, predicates: ['existence', 'string match', 'equality'] },
        { name: 'dob', label: 'Date of Birth', type: 'custom-date', icon: Calendar, required: true, predicates: ['existence', 'date comparison', 'numeric/range', 'cross-field'] },
        ...commonAuth
      ];

    // --- UNIVERSITY LEVEL ---
    case 'University Degree':
      return [
        { name: 'fullName', label: 'Student Name', type: 'text', icon: User, required: true, predicates: ['existence', 'equality', 'cross-field'] },
        { name: 'university', label: 'University Name', type: 'custom-uni', icon: GraduationCap, placeholder: 'Select University', required: true, predicates: ['existence', 'string match', 'equality'] },
        { name: 'rollNumber', label: 'Registration / Roll No', type: 'text', icon: UserCheck, required: true, simulateVerify: true, predicates: ['existence', 'equality', 'hash'] },
        { name: 'passingYear', label: 'Year of Passing', type: 'custom-year', icon: Calendar, required: true, defaultValue: getCurrentYear, predicates: ['existence', 'numeric/range', 'cross-field'] },
        ...commonAuth
      ];

    default: return [];
  }
};

export const predicateInfo = {
  existence: { message: "It checks whether this field exists in the digital credential.", requiresInput: false },
  equality: { message: "It checks whether this field matches the input value in the digital credential.", requiresInput: true },
  "cross-field": { message: "It checks the relation between multiple fields in the credential.", requiresInput: false },
  "numeric/range": { message: "It checks whether the numeric value satisfies the specified range.", requiresInput: true },
  "date comparison": { message: "It checks whether the date satisfies the specified comparison.", requiresInput: true },
  "string match": { message: "It checks whether the field matches the given string or pattern.", requiresInput: true },
  hash: { message: "It checks whether the field matches the provided hash.", requiresInput: true },
  "selective disclosure": { message: "It reveals only this field in the proof.", requiresInput: false },
};
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ChevronDown, User, Cpu,
  Calendar, CheckCircle2, Loader2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { getFieldsByIdType, ID_TYPES, COUNTRIES, BOARDS, UNIVERSITIES } from '../utils/schema';
// import {  } from '../context/WalletContext';

const Issuer = () => {
  const { formData, setFormData, issueCredential, setActiveTab, isDocIssuedAndSigned, getInitialFormData } = useWallet();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePicker, setActivePicker] = useState(null);
  const [selectedIdType, setSelectedIdType] = useState("");

  // Advanced Calendar State
  const [calView, setCalView] = useState('days'); // 'days' | 'years'
  const [tempDate, setTempDate] = useState(new Date());

  // Lists & Filtering
  const [filteredCountries, setFilteredCountries] = useState(COUNTRIES);
  const [filteredBoards, setFilteredBoards] = useState(BOARDS);
  const [filteredUnis, setFilteredUnis] = useState(UNIVERSITIES);
  const yearsList = Array.from({ length: 81 }, (_, i) => 2030 - i); // 2030 down to 1950

  // Validation States
  const [errorFields, setErrorFields] = useState([]); // Array of field names with errors
  const [shake, setShake] = useState(false);
  const [verifyingField, setVerifyingField] = useState(null);
  const [verifiedFields, setVerifiedFields] = useState({});

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Auto-Format
    if (['panID', 'passportID', 'licenseID', 'rollNumber'].includes(name)) finalValue = value.toUpperCase();
    if (name === 'aadhaarNumber') finalValue = value.replace(/\D/g, '').slice(0, 12); // Limit to 12

    setFormData(prev => ({ ...prev, [name]: finalValue }));

    // Remove error when user types
    if (errorFields.includes(name)) {
      setErrorFields(prev => prev.filter(f => f !== name));
    }
    if (verifiedFields[name]) setVerifiedFields(prev => ({ ...prev, [name]: false }));

    // Filter Logic
    const lowerVal = value.toLowerCase();
    if (name === 'nationality') setFilteredCountries(COUNTRIES.filter(c => c.toLowerCase().includes(lowerVal)));
    if (name === 'board') setFilteredBoards(BOARDS.filter(b => b.toLowerCase().includes(lowerVal)));
    if (name === 'university') setFilteredUnis(UNIVERSITIES.filter(u => u.toLowerCase().includes(lowerVal)));
  };

  // --- CALENDAR HELPERS ---
  const handleDateSelect = (fieldName, date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const formatted = `${d}/${m}/${date.getFullYear()}`;
    setFormData(prev => ({ ...prev, [fieldName]: formatted }));
    setActivePicker(null);
    setCalView('days'); // Reset view
    if (errorFields.includes(fieldName)) setErrorFields(prev => prev.filter(f => f !== fieldName));
  };

  // --- STRICT VALIDATION & SUBMIT ---
  const validateAndSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);
    if (isDocIssuedAndSigned(formData.idType)) {
      alert("This document is already issued and signed.");
      return;
    }

    const currentFields = getFieldsByIdType(formData.idType);
    let newErrors = [];

    // 1. Check Empty Fields
    currentFields.forEach(field => {
      if (field.required && !field.readOnly && !formData[field.name]) {
        newErrors.push(field.name);
      }
    });

    // 2. Strict Pattern Check
    if (formData.idType === 'Aadhaar Card') {
      if (formData.aadhaarNumber?.length !== 12) newErrors.push('aadhaarNumber');
    }
    if (formData.idType === 'PAN Card') {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panID)) newErrors.push('panID');
    }
    if (formData.idType === 'Passport') {
      if (!/^[A-Z0-9]{8,9}$/.test(formData.passportID)) newErrors.push('passportID');
    }
    if (formData.idType === 'Driving Licence') {
      if (!/^[A-Z0-9-]{10,20}$/.test(formData.licenseID)) newErrors.push('licenseID');
    }
    console.log(newErrors);
    if (newErrors.length > 0) {
      setErrorFields(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      console.log(formData);
      return; // STOP HERE
    }

    // --- Now call backend ---
    setIsSubmitting(true);
    await issueCredential(); // async, handles loading & tab switch internally
    setIsSubmitting(false);

    // const payload = {
    //   idType: formData.idType,
    //   data: {
    //     ...formData,
    //     issuer: "Govt. of India"
    //   },
    // };


    // try {
    //   const response = await fetch("http://localhost:5000/api/issuer/issue", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({
    //       idType: payload.idType,
    //       data: payload.data
    //     })
    //   });

    //   const data = await response.json();
    //   console.log("Backend response:", data);

    //   if (data && data.id) {
    //     // Add this issued credential to the wallet
    //     addCredential(data); // or whatever property backend returns
    //     setIsSubmitting(false);
    //     setActiveTab('holder'); // switch tab to see the credential
    //   } else {
    //     // Show an error to the user
    //     alert(data.error || "Failed to issue credential");
    //   }

    // } catch (error) {
    //   console.error("Error:", error);
    // }

    // setTimeout(() => {
    //   issueCredential();
    //   setActiveTab('holder');
    // }, 1500);
  };

  // Blur Handler for Roll No
  const handleBlur = (field) => {
    if (field.simulateVerify && formData[field.name]?.length > 2) {
      setVerifyingField(field.name);
      setTimeout(() => {
        setVerifyingField(null);
        setVerifiedFields(prev => ({ ...prev, [field.name]: true }));
      }, 1200);
    }
  };

  const currentFields = getFieldsByIdType(formData.idType);

  return (
    <div className="max-w-lg mx-auto px-4 pb-24 pt-8" onClick={() => setActivePicker(null)}>

      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">CipherTrust</h2>
        <div className="flex justify-center items-center gap-2 mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-[3px]">Official Gateway</p>
        </div>
      </motion.div>

      <form onSubmit={validateAndSubmit} className="space-y-5 relative z-10" onClick={(e) => e.stopPropagation()}>

        {/* DOC TYPE */}
        <div className="space-y-1 relative">
          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Document Type</label>
          <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-[#0B101B] border border-slate-800 rounded-xl py-3 px-4 flex justify-between items-center cursor-pointer hover:border-cyan-500/30 text-slate-200 text-sm font-bold transition-all">
            {formData.idType || "Select Document"}
            <ChevronDown className="text-slate-500" size={16} />
          </div>
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="absolute w-full mt-1 bg-[#0F1623] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                {ID_TYPES.map((type) => {
                  const issued = isDocIssuedAndSigned(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={issued}
                      onClick={() => {
                        if (!issued) {
                          setSelectedIdType(type);
                          setFormData(getInitialFormData(type));
                          setIsDropdownOpen(false);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 text-sm flex justify-between items-center ${issued
                          ? "text-slate-500 cursor-not-allowed"
                          : "text-slate-300 hover:bg-slate-700"
                        }`}
                    >
                      <span>{type}</span>

                      {issued && (
                        <span className="text-xs text-green-400 font-bold">
                          Issued ✓
                        </span>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* FIELDS */}
        <AnimatePresence mode='wait'>
          <motion.div key={formData.idType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {currentFields.map((field) => (
              <div key={field.name} className="space-y-1 relative">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">{field.label}</label>

                {/* 1. READ ONLY */}
                {field.readOnly ? (
                  <div className={`w-full bg-[#0B101B]/50 border border-slate-800/50 rounded-xl py-3 pl-4 pr-4 text-xs font-bold flex items-center gap-3 select-none ${field.type === 'badge' ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' : 'text-slate-500'}`}>
                    {field.icon && <field.icon size={16} />}
                    {field.defaultValue || "Auto-Generated"}
                    {field.name === 'documentAuthVerified' && <ShieldCheck size={16} className="text-emerald-500 ml-auto" />}
                  </div>
                )

                  /* 2. ADVANCED DATE PICKER */
                  : (field.type === 'custom-date' || field.type === 'date') ? (
                    <div className="relative group">
                      <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                      <input type="text" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} placeholder="DD/MM/YYYY"
                        className={`w-full bg-[#0B101B] border rounded-xl py-3 pl-10 pr-12 text-sm text-slate-200 focus:outline-none font-bold ${errorFields.includes(field.name) ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-800 focus:border-cyan-500/50'}`} />

                      <button type="button" onClick={() => { setActivePicker(activePicker === field.name ? null : field.name); setCalView('days'); }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform shadow-lg z-20">
                        <Calendar size={16} className="text-black" />
                      </button>

                      <AnimatePresence>
                        {activePicker === field.name && (
                          <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute top-full right-0 mt-2 w-64 bg-[#0F1623] border border-slate-700 rounded-2xl shadow-2xl p-4 z-[100]" onClick={(e) => e.stopPropagation()}>

                            {/* CALENDAR HEADER (Click to switch view) */}
                            <div className="flex justify-between items-center mb-4 text-white text-xs font-bold">
                              {calView === 'days' && <button type="button" onClick={() => setTempDate(new Date(tempDate.setMonth(tempDate.getMonth() - 1)))} className="p-1 hover:bg-slate-800 rounded"><ChevronLeft size={16} /></button>}

                              <button type="button" onClick={() => setCalView(calView === 'days' ? 'years' : 'days')} className="uppercase tracking-widest hover:text-cyan-400 transition-colors">
                                {calView === 'days' ? tempDate.toLocaleString('default', { month: 'short', year: 'numeric' }) : 'Select Year'}
                              </button>

                              {calView === 'days' && <button type="button" onClick={() => setTempDate(new Date(tempDate.setMonth(tempDate.getMonth() + 1)))} className="p-1 hover:bg-slate-800 rounded"><ChevronRight size={16} /></button>}
                            </div>

                            {/* DAYS VIEW */}
                            {calView === 'days' ? (
                              <div className="grid grid-cols-7 gap-1 mb-2 text-center">
                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="text-[9px] text-slate-500 font-bold">{d}</span>)}
                                {Array.from({ length: new Date(tempDate.getFullYear(), tempDate.getMonth(), 1).getDay() }).map((_, i) => <div key={`e-${i}`} />)}
                                {Array.from({ length: new Date(tempDate.getFullYear(), tempDate.getMonth() + 1, 0).getDate() }).map((_, i) => (
                                  <button type="button" key={i} onClick={() => handleDateSelect(field.name, new Date(tempDate.getFullYear(), tempDate.getMonth(), i + 1))} className={`h-7 w-7 rounded-lg text-[10px] font-bold ${tempDate.getDate() === i + 1 ? 'bg-white text-black shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>{i + 1}</button>
                                ))}
                              </div>
                            ) : (
                              /* YEARS VIEW (Scrollable Grid) */
                              <div className="grid grid-cols-4 gap-2 h-40 overflow-y-auto custom-scrollbar">
                                {yearsList.map(y => (
                                  <button key={y} type="button" onClick={() => { setTempDate(new Date(y, tempDate.getMonth(), 1)); setCalView('days'); }} className={`py-2 rounded-lg text-[10px] font-bold ${tempDate.getFullYear() === y ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>{y}</button>
                                ))}
                              </div>
                            )}

                            {calView === 'days' && (
                              <div className="text-center pt-2 border-t border-slate-800">
                                <button type="button" onClick={() => handleDateSelect(field.name, new Date())} className="text-[9px] font-black text-cyan-400 uppercase tracking-widest hover:text-white">Select Today</button>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )

                    /* 3. CUSTOM SELECT (GENDER) */
                    : field.type === 'custom-select' ? (
                      <div className="relative">
                        <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                        <div onClick={() => setActivePicker(activePicker === field.name ? null : field.name)}
                          className={`w-full bg-[#0B101B] border rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 cursor-pointer flex justify-between items-center ${errorFields.includes(field.name) ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-800'}`}>
                          <span>{formData[field.name] || `Select ${field.label}`}</span>
                          <ChevronDown size={14} className={`transition-transform ${activePicker === field.name ? 'rotate-180 text-cyan-400' : 'text-slate-600'}`} />
                        </div>
                        <AnimatePresence>
                          {activePicker === field.name && (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute w-full mt-2 bg-[#0F1623] border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                              {field.options.map(opt => (
                                <div key={opt} onClick={() => { setFormData({ ...formData, [field.name]: opt }); setActivePicker(null); if (errorFields.includes(field.name)) setErrorFields(prev => prev.filter(f => f !== field.name)); }} className="px-4 py-3 hover:bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer border-b border-slate-800/50 flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${formData[field.name] === opt ? 'bg-cyan-400' : 'bg-slate-600'}`}></div>
                                  {opt}
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )

                      /* 4. YEAR SCROLL (White Button) */
                      : field.type === 'custom-year' ? (
                        <div className="relative group">
                          <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                          <input type="number" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} placeholder="YYYY"
                            className={`w-full bg-[#0B101B] border rounded-xl py-3 pl-10 pr-12 text-sm text-slate-200 focus:outline-none font-bold ${errorFields.includes(field.name) ? 'border-red-500' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                          <button type="button" onClick={() => setActivePicker(field.name)} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-lg flex items-center justify-center hover:scale-105 transition-transform shadow-lg z-20">
                            <ChevronDown size={18} className="text-black" />
                          </button>
                          <AnimatePresence>
                            {activePicker === field.name && (
                              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="absolute w-full mt-2 bg-[#0F1623] border border-slate-700 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
                                {yearsList.map(y => (
                                  <button key={y} type="button" onClick={() => { setFormData({ ...formData, [field.name]: y }); setActivePicker(null); }} className={`w-full text-left px-5 py-2.5 text-xs font-bold border-b border-slate-800/50 hover:bg-slate-800 ${formData[field.name] == y ? 'text-cyan-400 bg-cyan-900/10' : 'text-slate-400'}`}>{y}</button>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )

                        /* 5. SEARCHABLE PICKER (Country/Board) */
                        : (field.type === 'custom-country' || field.type === 'custom-board' || field.type === 'custom-uni') ? (
                          <div className="relative group">
                            <field.icon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                            <input type="text" name={field.name} value={formData[field.name] || ''} onChange={handleInputChange} onFocus={() => setActivePicker(field.name)} placeholder={field.placeholder}
                              className={`w-full bg-[#0B101B] border rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none font-bold ${errorFields.includes(field.name) ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'border-slate-800 focus:border-cyan-500/50'}`} />
                            {activePicker === field.name && (
                              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute w-full mt-1 bg-[#0F1623] border border-slate-700 rounded-xl shadow-xl z-50 max-h-40 overflow-y-auto custom-scrollbar">
                                {(field.type === 'custom-country' ? filteredCountries : field.type === 'custom-board' ? filteredBoards : filteredUnis).map(item => (
                                  <div key={item} onMouseDown={() => { setFormData({ ...formData, [field.name]: item }); setActivePicker(null); if (errorFields.includes(field.name)) setErrorFields(prev => prev.filter(f => f !== field.name)); }} className="px-4 py-2 hover:bg-slate-800 text-xs font-medium text-slate-300 cursor-pointer border-b border-slate-800/50">{item}</div>
                                ))}
                              </motion.div>
                            )}
                          </div>
                        )

                          /* 6. STANDARD INPUT */
                          : (
                            <div className="relative group">
                              <field.icon className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${errorFields.includes(field.name) ? 'text-red-500' : 'text-slate-600'}`} size={16} />
                              <motion.input
                                animate={shake && errorFields.includes(field.name) ? { x: [-10, 10, -10, 10, 0] } : {}}
                                type="text" name={field.name} value={formData[field.name] || ''}
                                onChange={handleInputChange} onBlur={() => handleBlur(field)} placeholder={field.placeholder}
                                className={`w-full bg-[#0B101B] border rounded-xl py-3 pl-10 pr-10 text-sm text-slate-200 focus:outline-none font-bold transition-all ${errorFields.includes(field.name) ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : verifiedFields[field.name] ? 'border-emerald-500/50' : 'border-slate-800 focus:border-cyan-500/50'}`}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                {verifyingField === field.name && <Loader2 size={16} className="text-cyan-400 animate-spin" />}
                                {verifiedFields[field.name] && !verifyingField && <CheckCircle2 size={16} className="text-emerald-500" />}
                              </div>
                            </div>
                          )}
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isSubmitting} className={`w-full py-4 rounded-xl font-black text-xs uppercase tracking-[3px] flex items-center justify-center gap-2 mt-6 transition-all ${isSubmitting ? 'bg-slate-800' : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'}`}>
          {isSubmitting ? <Cpu className="animate-spin" size={16} /> : <ShieldCheck size={16} />} {isSubmitting ? "ENCRYPTING..." : "ISSUE ID"}
        </motion.button>
      </form>
    </div>
  );
};
export default Issuer;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Fingerprint, Lock, ChevronRight, CheckSquare, Square,
  Play, Server, RefreshCw, Code, ChevronLeft,
  ShieldCheck // 🚀 NEW LINE ADDED: Added ShieldCheck for our new UI
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { getFieldsByIdType } from "../utils/schema";
import { predicateInfo } from "../utils/schema";
import { generateBbsProof } from "../utils/bbsProof";
import { getAllSchemaFields } from "../utils/schema";
import { QRCodeCanvas } from "qrcode.react";
import ScannerPage from './ScannerPage';
import CredentialSelectorModal from "../components/CredentialSelectorModal";
import VerificationResults from "../components/VerificationResults";
import MessageBox from "../components/MessageBox";

// 🚀 NEW BLOCK ADDED HERE: Importing our API service
import apiService from '../api/apiService';

const Verifier = () => {
  const { credentials, setActiveTab } = useWallet();

  // FIXED: State declared at top level to prevent ReferenceError
  const [step, setStep] = useState(0);
  const [selectedCard, setSelectedCard] = useState(null);
  const [disclosedFields, setDisclosedFields] = useState([]);
  const [logs, setLogs] = useState([]);
  const [status, setStatus] = useState('idle');
  const [showRawProof, setShowRawProof] = useState(false);
  const [proofData, setProofData] = useState(null);
  const [predicateInputs, setPredicateInputs] = useState({});
  // e.g., { "fullName:equality": "Alice Babar", "age:numeric/range": "18" }
  const [verifierSelections, setVerifierSelections] = useState([])
  const allFields = getAllSchemaFields()
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredFields, setFilteredFields] = useState(allFields)
  const [qrLink, setQrLink] = useState(null)
  const [loadingQR, setLoadingQR] = useState(false)

  // Scanner States
  const [scannedProofData, setScannedProofData] = useState('');
  const [showScanner, setShowScanner] = useState(false);

  const [proofRequest, setProofRequest] = useState(null)
  const [autoFlow, setAutoFlow] = useState(false)

  const [showSelector, setShowSelector] = useState(false)
  const [requestForModal, setRequestForModal] = useState(null)

  const [mapping, setMapping] = useState(null)

  const [activeRequestId, setActiveRequestId] = useState(null)

  const [messageBox, setMessageBox] = useState({
    isOpen: false,
    type: "error",
    title: "",
    message: "",
    onConfirm: null,
    onCancel: null
  });

  // --- Button Handlers ---
  const handleGenerateProofClick = () => {
    if (step === 3 && status === "success") {
      setMessageBox({
        isOpen: true,
        type: "warning",
        title: "Important Terminal Data",
        message:
          "The terminal contains important proof logs. Going back will clear this information. Are you sure you want to continue?",
        confirmText: "Continue",
        cancelText: "Stay",
        onConfirm: () => {
          setMessageBox(prev => ({ ...prev, isOpen: false }));
          resetFlow();
        },
        onCancel: () =>
          setMessageBox(prev => ({ ...prev, isOpen: false }))
      });

      return;
    }

    resetFlow();
  };
  const resetFlow = () => {
    setStep(1);
    setSelectedCard(null);
    setDisclosedFields([]);
    setLogs([]);
    setStatus("idle");
  };

  const resetForNewVerify = () => {
    setStep(1);
    setStatus("idle");
    setLogs([]);
    setProofData(null);
  };

  useEffect(() => {
    if (!proofRequest || !autoFlow) return

    const selections = []

    proofRequest.requested_attributes?.forEach(attr => {
      selections.push(`${attr.name}:reveal`)
    })

    proofRequest.requested_predicates?.forEach(pred => {
      selections.push(`${pred.name}:${pred.predicate}`)
    })

    setDisclosedFields(selections)

  }, [proofRequest, autoFlow])

  const findMatchingCredentials = (data) => {
    const request = data.proofRequest ?? data

    const requestedFields = [
      ...(request.requested_attributes || []).map(a => a.name),
      ...(request.requested_predicates || []).map(p => p.name)
    ]

    return credentials.filter(vc =>
      requestedFields.every(field =>
        vc.credentialSubject?.[field] !== undefined
      )
    )
  }

  useEffect(() => {
    if (!proofRequest) return

    const matches = findMatchingCredentials(proofRequest)

    if (matches.length === 1) {
      setSelectedCard(matches[0])
      setStep(2)
    }

  }, [proofRequest])

  useEffect(() => {
    if (autoFlow && selectedCard && disclosedFields.length > 0) {
      startGeneration()
    }
  }, [autoFlow, selectedCard])

  // search handler
  useEffect(() => {
    const q = searchQuery.toLowerCase()

    setFilteredFields(
      allFields.filter(field =>
        field.name.toLowerCase().includes(q) ||
        field.label.toLowerCase().includes(q)
      )
    )
  }, [searchQuery])

  const toggleVerifierPredicate = (fieldName, pred) => {
    const key = `${fieldName}:${pred}`

    setVerifierSelections(prev =>
      prev.includes(key)
        ? prev.filter(x => x !== key)
        : [...prev, key]
    )
  }

  const handleVerifyProofClick = () => {
    setStep(4)
  };

  const isVerifyValid = verifierSelections.every((selection) => {
    const pred = selection.split(':')[1]
    const info = predicateInfo[pred] || {}

    // If input required → must be filled
    if (info.requiresInput) {
      return predicateInputs[selection]?.trim()
    }

    return true
  }) && verifierSelections.length > 0

  const isGenerateValid =
    disclosedFields.length > 0 &&
    disclosedFields.every((selection) => {
      const pred = selection.split(':')[1]
      const info = predicateInfo[pred] || {}

      if (info.requiresInput) {
        return predicateInputs[selection]?.trim()
      }

      return true
    })

  const logsEndRef = useRef(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const buildPredicatesFromUI = () => {
    return disclosedFields.map(field => {
      const [attribute, predicate] = field.split(':')

      return {
        attribute,
        type: predicate.toLowerCase(),
        value: predicateInputs[field] || null
      }
    })
  }

  const handleMappingConfirm = async (selectedMapping) => {
    try {
      setShowSelector(false)
      setMapping(selectedMapping)

      setStep(3)
      setLogs([])
      setStatus("idle")

      const addLog = (msg, type) =>
        setLogs(prev => [...prev, { msg, type }])

      addLog("Preparing proof request...")

      const proof = await generateBbsProof({
        mapping: selectedMapping,
        request: proofRequest.proofRequest ?? proofRequest
      })

      // 🔐 Generate nullifier
      const holderSecret = localStorage.getItem("holderSecret")

      if (!holderSecret) {
        throw new Error("Holder secret missing")
      }

      const encoder = new TextEncoder()
      const data = encoder.encode(holderSecret + proofRequest.id)

      const hashBuffer = await crypto.subtle.digest("SHA-256", data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const nullifier = hashArray
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')

      addLog("Proof generated successfully ✅", "success")

      setProofData(proof)
      setStatus("success")

      console.log(proof);
      console.log(proofRequest);

      // send proof to verifier backend
      const response = await fetch(
        (proofRequest.proofRequest ?? proofRequest).response_uri,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: proofRequest.id,
            nonce: proofRequest.nonce,
            proofs: proof,
            nullifier
          })
        }
      );

      const result = await response.json();

      if (!response.ok) {
        addLog("Verifier rejected proof ❌", "error");

        setMessageBox({
          isOpen: true,
          type: "error",
          title: "Verification Failed",
          message: result.error || "Unknown verifier error occurred.",
          onConfirm: () =>
            setMessageBox(prev => ({ ...prev, isOpen: false }))
        });

        return; // stop here
      }

      addLog("Proof sent to verifier 📡", "success");
      addLog(`Show to verifier: ${nullifier.substring(0, 5)}...${nullifier.substring(nullifier.length - 5)}`, "success");

    } catch (err) {
      console.error(err)
      setStatus("error")
    }
  }

  const startGeneration = async () => {
    setStep(3)
    setLogs([])
    setStatus('idle')
    setShowRawProof(false)

    const addLog = (msg, type) =>
      setLogs(prev => [...prev, { msg, type }])

    try {

      addLog("Loading credential from wallet...")
      await new Promise(r => setTimeout(r, 600))

      const vc = selectedCard
      if (!vc) throw new Error("No credential selected")

      addLog("Parsing attributes...")
      await new Promise(r => setTimeout(r, 600))

      const bbsProofs = []
      const zkProofs = []

      for (const selection of disclosedFields) {

        const [field, predicate] = selection.split(":")

        // SIMPLE ROUTING LOGIC
        const isGroth =
          predicate === "numeric/range" ||
          predicate === "date comparison" ||
          predicate === "cross-field"

        if (isGroth) {
          addLog(`Routing ${field} → zkSNARK`)

          // Example: age from DOB
          const dob = vc.credentialSubject.dob
          const age =
            new Date().getFullYear() -
            new Date(dob).getFullYear()

          const requiredAge =
            Number(predicateInputs[selection] || 18)

          const zk = await window.generateAgeProof(age, requiredAge)

          zkProofs.push({
            field,
            proof: zk.proof,
            publicSignals: zk.publicSignals
          })

        } else {
          addLog(`Routing ${field} → BBS`)

          const proof = await generateBbsProof({
            mapping,
            request: proofRequest.proofRequest ?? proofRequest
          })

          bbsProofs.push(proof)
        }
      }

      addLog("Proof generated successfully ✅", "success")

      setProofData({
        bbsProofs,
        zkProofs
      })

      setStatus('success')

    } catch (err) {
      console.error(err)
      addLog("Proof generation failed ❌", "error")
      setStatus("error")
    }
  }

  const startVerification = async () => {
    try {
      setActiveRequestId(null)
      setQrLink(null)

      setLoadingQR(true)

      // Convert selections → schema format
      const requested_attributes = []
      const requested_predicates = []

      verifierSelections.forEach((item) => {
        const [name, pred] = item.split(":")

        if (pred === "reveal") {
          requested_attributes.push({
            name,
            predicate: "reveal"
          })
        } else {
          requested_predicates.push({
            name,
            predicate: pred,
            ...(predicateInputs[item] && { value: predicateInputs[item] })
          })
        }
      })

      const res = await fetch("http://localhost:3001/create-proof-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          requested_attributes,
          requested_predicates
        })
      })

      const data = await res.json()
      console.log(data);

      setQrLink(data.request_uri)
      setActiveRequestId(data.id)   // ✅ VERY IMPORTANT

    } catch (err) {
      console.error("Failed to start verification", err)
    } finally {
      setLoadingQR(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto w-full pb-24 px-4 pt-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Verifier</h2>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[4px]">Selective Disclosure</p>
      </div>

      <div className="flex gap-4 mt-6 mb-6">

        {/* Generate Proof Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#22d3ee" }} // slightly grow + color change
          whileTap={{ scale: 0.95 }} // click effect
          transition={{ type: "spring", stiffness: 300 }}
          onClick={handleGenerateProofClick}
          className="flex-1 py-3 bg-cyan-600 rounded-xl font-black text-white text-[10px] uppercase tracking-[3px] shadow-lg"
        >
          Generate Proof
        </motion.button>

        {/* Verify Proof Button */}
        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: "#f97316" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
          onClick={() => {
            if (step === 3 && status === "success") {
              setMessageBox({
                isOpen: true,
                type: "warning",
                title: "Terminal Contains Proof Data",
                message:
                  "The terminal contains important verification logs. Verifying again may overwrite this data. Do you want to continue?",
                confirmText: "Continue",
                cancelText: "Stay",
                onConfirm: () => {
                  setMessageBox(prev => ({ ...prev, isOpen: false }));
                  handleVerifyProofClick(); // proceed
                },
                onCancel: () =>
                  setMessageBox(prev => ({ ...prev, isOpen: false }))
              });

              return;
            }

            handleVerifyProofClick();
          }}
          className="flex-1 py-3 bg-orange-600 rounded-xl font-black text-white text-[10px] uppercase tracking-[3px] shadow-lg"
        >
          Verify Proof
        </motion.button>

      </div>

      {/* --- QR SCANNER TOGGLE & UI (ONLY VISIBLE IN GENERATE PROOF FLOW) --- */}
      <AnimatePresence>
        {(step === 1 || step === 2) && credentials && credentials.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <motion.button
              whileHover={{ scale: 1.02, backgroundColor: "#0f172a" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowScanner(!showScanner)}
              className={`w-full py-3 rounded-xl font-black text-[10px] uppercase tracking-[3px] shadow-lg border transition-all ${showScanner
                ? "bg-slate-800 border-red-500/50 text-red-400 hover:bg-slate-700"
                : "bg-slate-900 border-cyan-500/30 text-cyan-400 hover:bg-slate-800"
                }`}
            >
              {showScanner ? "Close Scanner" : "Scan QR Code"}
            </motion.button>

            <AnimatePresence>
              {showScanner && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="bg-[#020617] p-4 rounded-xl border border-cyan-500/30 flex justify-center flex-col items-center">
                    <ScannerPage
                      onScanSuccess={async (url) => {
                        try {
                          setShowScanner(false)

                          console.log("Scanning request URL:", url)

                          const res = await fetch(url)
                          const request = await res.json()

                          console.log("Proof request:", request)

                          setProofRequest(request)
                          setRequestForModal(request.proofRequest ?? request)
                          setShowSelector(true)

                        } catch (err) {
                          console.error("Failed to load proof request", err)
                        }
                      }}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Display Scanned Data if available */}
            {scannedProofData && !showScanner && (
              <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 text-xs text-center break-all w-full">
                <strong>Scanned Request:</strong> {scannedProofData}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {/* ------------------------------------------------------------------- */}

      <AnimatePresence mode="wait">

        {/* STEP 1: SELECT */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {(!credentials || credentials.length === 0) ? (

              // 🔥 EMPTY STATE ONLY INSIDE STEP 1
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-[40vh] text-center px-6"
              >
                <Lock size={40} className="text-slate-600 mb-4" />
                <h3 className="text-xl font-black text-white">No Credentials</h3>
                <p className="text-slate-500 text-xs mb-6">
                  Issue an ID first.
                </p>
                <button
                  onClick={() => setActiveTab('issuer')}
                  className="px-6 py-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cyan-500/20"
                >
                  Go to Issuer
                </button>
              </motion.div>

            ) : (

              credentials.map((card) => (
                <div
                  key={card.id}
                  onClick={() => { setSelectedCard(card); setStep(2); }}
                  className="bg-[#0B101B] border border-slate-800 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-cyan-500/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-900 p-2 rounded text-cyan-400">
                      <Fingerprint size={18} />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-sm">
                        {card.credentialSubject?.idType || "Unknown Document"}
                      </h4>
                      <p className="text-slate-400 text-xs">
                        {card.credentialSubject?.fullName || "No Name"} • Issued: {new Date(card.issuanceDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-600" />
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* STEP 2: DISCLOSE */}
        {step === 2 && selectedCard && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* BACK BUTTON */}
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 mb-6 group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-white transition-all">
                <ChevronLeft size={16} />
              </div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white">
                Back to List
              </span>
            </button>

            <div className="bg-[#0B101B] border border-slate-800 rounded-3xl p-6">
              <h3 className="text-white font-black mb-6">Select Predicates for Each Field</h3>

              <div className="space-y-4 mb-8">
                {getFieldsByIdType(selectedCard.credentialSubject?.idType).map((field) => {
                  const isExpanded = disclosedFields.some((x) => x.startsWith(`${field.name}:`));

                  return (
                    <motion.div
                      key={field.name}
                      layout
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-hidden"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {field.icon && <field.icon size={16} className="text-cyan-400" />}
                          <span className="text-[10px] font-bold text-slate-300 uppercase">{field.label}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{selectedCard.credentialSubject?.[field.name]}</span>
                      </div>

                      {/* Predicates */}
                      <div className="flex flex-wrap gap-2">
                        {field.predicates?.map((pred) => (
                          <button
                            key={pred}
                            onClick={() =>
                              setDisclosedFields((prev) =>
                                prev.includes(`${field.name}:${pred}`)
                                  ? prev.filter((x) => x !== `${field.name}:${pred}`)
                                  : [...prev, `${field.name}:${pred}`]
                              )
                            }
                            className={`px-2 py-1 text-[9px] font-bold rounded-md border transition-all ${disclosedFields.includes(`${field.name}:${pred}`)
                              ? "bg-cyan-500/20 border-cyan-500 text-cyan-400"
                              : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                              }`}
                          >
                            {pred}
                          </button>
                        ))}
                      </div>

                      {/* Instruction & Input */}
                      {disclosedFields
                        .filter((x) => x.startsWith(`${field.name}:`))
                        .map((selected) => {
                          const pred = selected.split(':')[1];
                          const info = predicateInfo[pred];

                          return (
                            <div
                              key={selected}
                              className="mt-2 transition-all duration-300 ease-in-out"
                            >
                              {/* Predicate label */}
                              <span className="inline-block bg-slate-700 text-cyan-400 text-[8px] px-2 py-0.5 rounded uppercase mb-1">
                                {pred}
                              </span>

                              {/* Message */}
                              <p className="text-[9px] text-slate-400 italic">{info.message}</p>

                              {/* Input if required */}
                              {info.requiresInput && (
                                <input
                                  type="text"
                                  value={predicateInputs[selected] || ""}
                                  onChange={(e) =>
                                    setPredicateInputs((prev) => ({
                                      ...prev,
                                      [selected]: e.target.value
                                    }))
                                  }
                                  placeholder="Enter value"
                                  className="mt-1 w-full bg-slate-800 text-white rounded px-2 py-1 text-[10px]"
                                />
                              )}
                            </div>
                          );
                        })}
                    </motion.div>
                  );
                })}
              </div>

              {/* GENERATE PROOF BUTTON */}
              <button
                disabled={!isGenerateValid}
                onClick={startGeneration}
                className="w-full py-4 bg-cyan-600 rounded-xl font-black text-white text-[10px] uppercase tracking-[3px] disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Generate Proof
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: TERMINAL */}
        {step === 3 && (
          <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="bg-[#050912] border border-slate-800 rounded-2xl p-6 h-[300px] overflow-y-auto no-scrollbar font-mono text-[10px]">
              {logs.map((l, i) => <div key={i} className={`mb-2 text-sm leading-relaxed ${l.type === 'success'
                ? 'text-emerald-400 font-semibold'
                : l.type === 'error'
                  ? 'text-red-400 font-semibold'
                  : 'text-slate-400'
                }`}>
                {`> ${l.msg}`}
              </div>)}
              <div ref={logsEndRef} />
            </div>
            {status === 'success' && (
              <div className="flex gap-3 mt-4">
                <button onClick={() => setShowRawProof(true)} className="flex-1 py-3 bg-slate-800 rounded-xl text-[10px] font-bold text-slate-400 uppercase">View Proof</button>
                <button
                  onClick={() => {
                    if (step === 3 && status === "success") {
                      setMessageBox({
                        isOpen: true,
                        type: "warning",
                        title: "Terminal Contains Proof Data",
                        message:
                          "The terminal contains important verification logs. Starting a new verification will clear this data. Do you want to continue?",
                        confirmText: "Continue",
                        cancelText: "Stay",
                        onConfirm: () => {
                          setMessageBox(prev => ({ ...prev, isOpen: false }));
                          resetForNewVerify();
                        },
                        onCancel: () =>
                          setMessageBox(prev => ({ ...prev, isOpen: false }))
                      });

                      return;
                    }

                    resetForNewVerify();
                  }}
                  className="flex-1 py-3 bg-emerald-600 rounded-xl text-[10px] font-bold text-white uppercase"
                >
                  New Verify
                </button>
              </div>
            )}
            {/* Raw Proof Modal */}
            {showRawProof && (
              <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-6" onClick={() => setShowRawProof(false)}>
                <div className="bg-slate-900 p-6 rounded-2xl max-w-sm w-full border border-slate-700">
                  <h3 className="text-white font-bold mb-4">Proof Data</h3>
                  <p className="text-[9px] font-mono text-emerald-500 break-all">
                    {JSON.stringify(proofData, null, 2)}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}


        {/* STEP 4: UNIVERSAL VERIFIER */}
        {step === 4 && (
          qrLink ? (
            <div className="flex flex-col items-center justify-center p-10">
              <h3 className="text-white font-black mb-6">
                Scan to Verify
              </h3>

              <QRCodeCanvas value={qrLink} size={260} />

              {/* 👇 THIS is correct now */}
              <VerificationResults requestId={activeRequestId} />
            </div>
          ) : (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* BACK BUTTON */}
              <button
                onClick={() => setStep(0)}
                className="flex items-center gap-2 mb-6 group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all">
                  <ChevronLeft size={16} />
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-white">
                  Back
                </span>
              </button>

              <div className="bg-[#0B101B] border border-slate-800 rounded-3xl p-6">
                <h3 className="text-white font-black mb-6">
                  Verifier — Select Predicates
                </h3>

                {/* search option */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search attributes..."
                    className="flex-1 bg-slate-800 text-white rounded px-3 py-2 text-sm"
                  />

                  {/* <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-orange-600 rounded font-bold text-white text-xs uppercase"
                >
                  Search
                </button> */}
                  {/* no need of button, input change will make the search query run automatically as used useEffect */}
                </div>

                <div className="space-y-4 mb-8">

                  {filteredFields.map((field) => {

                    return (
                      <motion.div
                        key={field.name}
                        layout
                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 overflow-hidden"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {field.icon && <field.icon size={16} className="text-orange-400" />}
                            <span className="text-[10px] font-bold text-slate-300 uppercase">
                              {field.label}
                            </span>
                          </div>
                        </div>

                        {/* Predicates */}
                        <div className="flex flex-wrap gap-2">
                          {field.predicates?.map((pred) => (
                            <button
                              key={pred}
                              onClick={() =>
                                setVerifierSelections((prev) =>
                                  prev.includes(`${field.name}:${pred}`)
                                    ? prev.filter((x) => x !== `${field.name}:${pred}`)
                                    : [...prev, `${field.name}:${pred}`]
                                )
                              }
                              className={`px-2 py-1 text-[9px] font-bold rounded-md border transition-all ${verifierSelections.includes(`${field.name}:${pred}`)
                                ? "bg-orange-500/20 border-orange-500 text-orange-400"
                                : "bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700"
                                }`}
                            >
                              {pred}
                            </button>
                          ))}
                        </div>

                        {/* INFO PANEL — SAME BEHAVIOR */}
                        {verifierSelections
                          .filter((x) => x.startsWith(`${field.name}:`))
                          .map((selected) => {
                            const pred = selected.split(':')[1]
                            const info = predicateInfo[pred] || {}

                            return (
                              <div
                                key={selected}
                                className="mt-2 transition-all duration-300 ease-in-out"
                              >
                                <span className="inline-block bg-slate-700 text-orange-400 text-[8px] px-2 py-0.5 rounded uppercase mb-1">
                                  {pred}
                                </span>

                                <p className="text-[9px] text-slate-400 italic">
                                  {info.message}
                                </p>

                                {info.requiresInput && (
                                  <input
                                    type="text"
                                    value={predicateInputs[selected] || ""}
                                    onChange={(e) =>
                                      setPredicateInputs((prev) => ({
                                        ...prev,
                                        [selected]: e.target.value
                                      }))
                                    }
                                    placeholder="Enter value"
                                    className="mt-1 w-full bg-slate-800 text-white rounded px-2 py-1 text-[10px]"
                                  />
                                )}
                              </div>
                            )
                          })}

                      </motion.div>
                    )
                  })}

                </div>

                <button
                  onClick={startVerification}
                  disabled={!isVerifyValid}
                  className="w-full py-4 bg-orange-600 rounded-xl font-black text-white text-[10px] uppercase tracking-[3px] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Build Verification Policy
                </button>

              </div>
            </motion.div>
          )
        )}
      </AnimatePresence>

      <CredentialSelectorModal
        isOpen={showSelector}
        request={requestForModal}
        credentials={credentials}
        onConfirm={handleMappingConfirm}
        onClose={() => setShowSelector(false)}
      />

      <MessageBox
        {...messageBox}
      />
    </div>

  );
};
export default Verifier;
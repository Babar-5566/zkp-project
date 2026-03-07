import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Fingerprint, Lock, ChevronRight, CheckSquare, Square,
  Play, Server, RefreshCw, Code, ChevronLeft
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { getFieldsByIdType } from "../utils/schema";
import { predicateInfo } from "../utils/schema";
import { generateBbsProof } from "../utils/bbsProver";
import {
  generateZkSnarkProof,
  generateEqualityProof,
  generateRangeProof,
  generateYearProof,
  generateDateProof,
  generateHashProof,
  generateSetMembershipProof,
  generateStringMatchProof,
  generateCrossFieldProof,
  extractLocation
} from "../utils/plonkProver";
import { useTelemetry } from '../context/TelemetryContext';
import { getAllSchemaFields } from "../utils/schema";
import { QRCodeCanvas } from "qrcode.react";
import ScannerPage from './ScannerPage';
import CredentialSelectorModal from "../components/CredentialSelectorModal";
import VerificationResults from "../components/VerificationResults";
import MessageBox from "../components/MessageBox";

const Verifier = () => {
  const { credentials, setActiveTab } = useWallet();
  const telemetry = useTelemetry();

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
    telemetry.clearHistory();
  };

  const resetForNewVerify = () => {
    setStep(1);
    setStatus("idle");
    setLogs([]);
    setProofData(null);
    telemetry.clearHistory();
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
    telemetry.clearHistory()
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

      const e2eStart = performance.now()
      let zkSnarkTime = 0

      addLog("Preparing proof request...")

      const bbsStart = performance.now()
      const proof = await generateBbsProof({
        mapping: selectedMapping,
        request: proofRequest.proofRequest ?? proofRequest
      })
      const bbsTime = performance.now() - bbsStart

      // 🔐 Generate zk-SNARK proofs for ALL PLONK predicates
      const zkProofs = {}
      let zkFailed = false
      const currentRequest = proofRequest.proofRequest ?? proofRequest
      const grothPredicates = (currentRequest.requested_predicates || []).filter(
        p => ['numeric/range', 'equality', 'date comparison', 'hash', 'set membership', 'string match', 'cross-field', 'extract location'].includes(p.predicate)
      )

      for (const pred of grothPredicates) {
        try {
          const vc = selectedMapping[pred.name]
          const fieldVal = vc?.credentialSubject?.[pred.name]

          if (pred.predicate === 'numeric/range' && pred.name === 'dob') {
            addLog(`Generating PLONK proof (age check)...`)
            const threshold = Math.abs(parseInt(pred.value || '18'))
            if (fieldVal) {
              zkProofs.ageProof = await generateZkSnarkProof(fieldVal, threshold)
              addLog('Age proof generated ✅', 'success')
            }
          } else if (pred.predicate === 'numeric/range' && pred.name === 'passingYear') {
            addLog(`Generating PLONK proof (year check)...`)
            zkProofs.yearProof = await generateYearProof(fieldVal, pred.value)
            addLog('Year proof generated ✅', 'success')
          } else if (pred.predicate === 'numeric/range' && pred.name === 'marks') {
            addLog(`Generating PLONK proof (marks range check)...`)
            zkProofs.rangeProof = await generateRangeProof(fieldVal, pred.value)
            addLog('Range proof generated ✅', 'success')
          } else if (pred.predicate === 'numeric/range') {
            addLog(`Generating PLONK proof (age check for ${pred.name})...`)
            const threshold = Math.abs(parseInt(pred.value || '18'))
            if (fieldVal) {
              zkProofs[`age_${pred.name}`] = await generateZkSnarkProof(fieldVal, threshold)
              addLog(`Age proof for ${pred.name} generated ✅`, 'success')
            }
          } else if (pred.predicate === 'equality') {
            addLog(`Generating PLONK proof (equality: ${pred.name})...`)
            zkProofs[`eq_${pred.name}`] = await generateEqualityProof(pred.name, fieldVal, pred.value)
            addLog(`Equality proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'date comparison') {
            addLog(`Generating PLONK proof (date: ${pred.name})...`)
            zkProofs[`date_${pred.name}`] = await generateDateProof(fieldVal, pred.value)
            addLog(`Date proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'hash') {
            addLog(`Generating PLONK proof (hash: ${pred.name})...`)
            zkProofs[`hash_${pred.name}`] = await generateHashProof(fieldVal, pred.value)
            addLog(`Hash proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'set membership') {
            addLog(`Generating PLONK proof (set membership: ${pred.name})...`)
            const allowedValues = (pred.value || '').split(',').map(v => v.trim()).filter(Boolean)
            zkProofs[`setmem_${pred.name}`] = await generateSetMembershipProof(pred.name, fieldVal, allowedValues)
            addLog(`Set membership proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'string match') {
            addLog(`Generating PLONK proof (string match: ${pred.name})...`)
            zkProofs[`strmatch_${pred.name}`] = await generateStringMatchProof(fieldVal, pred.value)
            addLog(`String match proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'cross-field') {
            addLog(`Generating PLONK proof (cross-field: ${pred.name})...`)
            const marksVal = vc?.credentialSubject?.marks
            const yearVal = vc?.credentialSubject?.passingYear
            zkProofs[`crossfield_${pred.name}`] = await generateCrossFieldProof(marksVal, yearVal, pred.value)
            addLog(`Cross-field proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'extract location') {
            const location = extractLocation(fieldVal)
            addLog(`📍 Extracted location: city=${location.city}, state=${location.state}`, 'success')
          }
        } catch (zkErr) {
          addLog(`zk-SNARK proof for ${pred.name}:${pred.predicate} failed ❌`, 'error')
          addLog(zkErr.message || 'Unknown zk-SNARK error')
          zkFailed = true
        }
      }

      // backward compat: set zkProof for the age check
      const zkProof = zkProofs.ageProof || null

      // 🔐 Generate nullifier FIRST (needed for both success and failure flows)
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

      // If any zk-SNARK was required but failed, still notify verifier
      if (grothPredicates.length > 0 && zkFailed) {
        const failureReason = "zk-SNARK proof could not be generated — constraint not satisfied"

        // Send failure info to verifier with nullifier
        const failPayload = {
          id: proofRequest.id,
          nonce: proofRequest.nonce,
          proofs: proof,
          nullifier,
          revocationIndex: selectedMapping[Object.keys(selectedMapping)[0]]?.credentialStatus?.index ?? null,
          verificationFailed: true,
          failureReason
        };

        try {
          await fetch(
            (proofRequest.proofRequest ?? proofRequest).response_uri,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(failPayload)
            }
          );
          addLog(`Failure reported to verifier ❌`, "error");
          addLog(`Reason: ${failureReason}`);
          addLog(`Nullifier: ${nullifier.substring(0, 5)}...${nullifier.substring(nullifier.length - 5)}`);
        } catch (sendErr) {
          console.error("Failed to send failure to verifier:", sendErr);
          addLog("Could not reach verifier to report failure", "error");
        }

        setStatus("error")
        return
      }

      addLog("BBS+ Proof generated successfully ✅", "success")

      setProofData(proof)
      setStatus("success")

      console.log(proof);
      console.log(
        "id:" + proofRequest.id +
        "nonce:" + proofRequest.nonce +
        "proofs:" + proof +
        "nullifier:" + nullifier
      );

      // Calculate proof type display correct string
      const numAttributes = (currentRequest.requested_attributes || []).length
      const numZk = Object.keys(zkProofs).length
      let proofTypeStr = 'BBS+ Only'
      if (numAttributes > 0 && numZk > 0) {
        proofTypeStr = `BBS+ + zk-SNARK (PLONK × ${numZk})`
      } else if (numZk > 0) {
        proofTypeStr = `zk-SNARK (PLONK × ${numZk})`
      }

      // Calculate proof size and timing
      const proofSizeBytes = JSON.stringify(proof).length + (Object.keys(zkProofs).length > 0 ? JSON.stringify(zkProofs).length : 0)
      const proverTimeMs = Math.round(bbsTime + zkSnarkTime)
      const e2eMs = Math.round(performance.now() - e2eStart)

      // send proof to verifier backend
      const verifyPayload = {
        id: proofRequest.id,
        nonce: proofRequest.nonce,
        proofs: proof,
        nullifier,
        revocationIndex: selectedMapping[Object.keys(selectedMapping)[0]]?.credentialStatus?.index ?? null,
        proverTimeMs,
        proofSizeBytes,
        e2eMs,
        proofType: proofTypeStr
      }
      if (Object.keys(zkProofs).length > 0) {
        verifyPayload.zkProof = zkProof  // backward compat for age
        verifyPayload.zkProofs = zkProofs  // all proofs
      }

      const response = await fetch(
        (proofRequest.proofRequest ?? proofRequest).response_uri,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(verifyPayload)
        }
      );

      const result = await response.json();

      if (!response.ok || result.access !== "GRANTED") {
        addLog("Verifier rejected proof ❌", "error");

        setMessageBox({
          isOpen: true,
          type: "error",
          title: "Verification Failed",
          message: result.error || result.reason || "Proof verification failed.",
          onConfirm: () =>
            setMessageBox(prev => ({ ...prev, isOpen: false }))
        });

        return; // stop here
      }

      addLog("Proof verified by verifier ✅", "success");
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
      const e2eStart = performance.now()
      let zkSnarkTime = 0
      addLog("Loading credential from wallet...")
      await new Promise(r => setTimeout(r, 600))

      const vc = selectedCard
      console.log("VC :", vc)
      if (!vc) throw new Error("No credential selected")

      addLog("Parsing attributes...")
      await new Promise(r => setTimeout(r, 600))

      const predicates = buildPredicatesFromUI()

      if (!predicates.length) {
        throw new Error("No attributes selected for proof")
      }

      addLog("Preparing BBS proof request...")
      await new Promise(r => setTimeout(r, 800))

      // Build a synthetic proof request if proofRequest is null (direct Generate Proof flow)
      let effectiveRequest = proofRequest ? (proofRequest.proofRequest ?? proofRequest) : null

      if (!effectiveRequest) {
        // Generate a random nonce for the synthetic request
        const nonceArray = new Uint8Array(16)
        crypto.getRandomValues(nonceArray)
        const syntheticNonce = Array.from(nonceArray).map(b => b.toString(16).padStart(2, '0')).join('')

        const requested_attributes = []
        const requested_predicates = []

        disclosedFields.forEach(field => {
          const [name, pred] = field.split(':')
          if (pred === 'reveal') {
            requested_attributes.push({ name, predicate: 'reveal' })
          } else {
            requested_predicates.push({
              name,
              predicate: pred,
              value: predicateInputs[field] || null
            })
          }
        })

        effectiveRequest = {
          nonce: syntheticNonce,
          requested_attributes,
          requested_predicates
        }
      }

      // Build mapping from vc if not already set
      const effectiveMapping = mapping || {}
      if (Object.keys(effectiveMapping).length === 0 && vc) {
        disclosedFields.forEach(field => {
          const [attribute] = field.split(':')
          effectiveMapping[attribute] = vc
        })
      }

      addLog("Generating selective disclosure proof...")

      // Start fetching server metrics CONCURRENTLY with proof generation
      // so we capture CPU/RAM while servers are actively working
      const metricsPromise = Promise.allSettled([
        fetch("http://localhost:5000/metrics").then(r => r.json()),
        fetch("http://localhost:3001/metrics").then(r => r.json())
      ]).catch(() => [])

      const bbsStart = performance.now()
      const proof = await generateBbsProof({
        mapping: effectiveMapping,
        request: effectiveRequest
      })
      const bbsTime = performance.now() - bbsStart

      // 🔐 Generate zk-SNARK proofs for ALL PLONK predicates
      const zkProofsLocal = {}
      let zkFailedLocal = false
      const grothPredsLocal = (effectiveRequest.requested_predicates || []).filter(
        p => ['numeric/range', 'equality', 'date comparison', 'hash', 'set membership', 'string match', 'cross-field', 'extract location'].includes(p.predicate)
      )

      for (const pred of grothPredsLocal) {
        try {
          const fieldVal = vc?.credentialSubject?.[pred.name] || effectiveMapping[pred.name]?.credentialSubject?.[pred.name]

          if (pred.predicate === 'numeric/range' && pred.name === 'dob') {
            addLog('Generating zk-SNARK proof (age check)...')
            const thresholdVal = Math.abs(parseInt(pred.value || '18'))
            if (fieldVal) {
              const zkStart = performance.now()
              zkProofsLocal.ageProof = await generateZkSnarkProof(fieldVal, thresholdVal)
              zkSnarkTime += performance.now() - zkStart
              addLog('Age proof generated ✅', 'success')
            } else {
              addLog('No DOB found in credential, skipping age check', 'warn')
            }
          } else if (pred.predicate === 'numeric/range' && pred.name === 'passingYear') {
            addLog('Generating zk-SNARK proof (year check)...')
            const zkStart = performance.now()
            zkProofsLocal.yearProof = await generateYearProof(fieldVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog('Year proof generated ✅', 'success')
          } else if (pred.predicate === 'numeric/range' && pred.name === 'marks') {
            addLog('Generating zk-SNARK proof (marks range check)...')
            const zkStart = performance.now()
            zkProofsLocal.rangeProof = await generateRangeProof(fieldVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog('Range proof generated ✅', 'success')
          } else if (pred.predicate === 'numeric/range') {
            addLog(`Generating zk-SNARK proof (age check for ${pred.name})...`)
            const thresholdVal = Math.abs(parseInt(pred.value || '18'))
            if (fieldVal) {
              const zkStart = performance.now()
              zkProofsLocal[`age_${pred.name}`] = await generateZkSnarkProof(fieldVal, thresholdVal)
              zkSnarkTime += performance.now() - zkStart
              addLog(`Age proof for ${pred.name} generated ✅`, 'success')
            }
          } else if (pred.predicate === 'equality') {
            addLog(`Generating zk-SNARK proof (equality: ${pred.name})...`)
            const zkStart = performance.now()
            zkProofsLocal[`eq_${pred.name}`] = await generateEqualityProof(pred.name, fieldVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog(`Equality proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'date comparison') {
            addLog(`Generating zk-SNARK proof (date: ${pred.name})...`)
            const zkStart = performance.now()
            zkProofsLocal[`date_${pred.name}`] = await generateDateProof(fieldVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog(`Date proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'hash') {
            addLog(`Generating PLONK proof (hash: ${pred.name})...`)
            const zkStart = performance.now()
            zkProofsLocal[`hash_${pred.name}`] = await generateHashProof(fieldVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog(`Hash proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'set membership') {
            addLog(`Generating PLONK proof (set membership: ${pred.name})...`)
            const allowedValues = (pred.value || '').split(',').map(v => v.trim()).filter(Boolean)
            const zkStart = performance.now()
            zkProofsLocal[`setmem_${pred.name}`] = await generateSetMembershipProof(pred.name, fieldVal, allowedValues)
            zkSnarkTime += performance.now() - zkStart
            addLog(`Set membership proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'string match') {
            addLog(`Generating PLONK proof (string match: ${pred.name})...`)
            const zkStart = performance.now()
            zkProofsLocal[`strmatch_${pred.name}`] = await generateStringMatchProof(fieldVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog(`String match proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'cross-field') {
            addLog(`Generating PLONK proof (cross-field: ${pred.name})...`)
            const marksVal = vc?.credentialSubject?.marks || effectiveMapping[pred.name]?.credentialSubject?.marks
            const yearVal = vc?.credentialSubject?.passingYear || effectiveMapping[pred.name]?.credentialSubject?.passingYear
            const zkStart = performance.now()
            zkProofsLocal[`crossfield_${pred.name}`] = await generateCrossFieldProof(marksVal, yearVal, pred.value)
            zkSnarkTime += performance.now() - zkStart
            addLog(`Cross-field proof for ${pred.name} generated ✅`, 'success')
          } else if (pred.predicate === 'extract location') {
            const location = extractLocation(fieldVal)
            addLog(`📍 Extracted location: city=${location.city}, state=${location.state}`, 'success')
          }
        } catch (zkE) {
          addLog(`zk-SNARK proof for ${pred.name}:${pred.predicate} failed ❌`, 'error')
          addLog(zkE.message || 'Unknown error')
          zkFailedLocal = true
        }
      }

      // backward compat
      const zkProofResult = zkProofsLocal.ageProof || null

      // If zk-SNARK was required but failed, report to verifier if possible
      if (grothPredsLocal.length > 0 && zkFailedLocal) {
        addLog("Proof generation failed — zk-SNARK required but could not be generated ❌", "error")

        // If there's a real verifier endpoint, report the failure with nullifier
        const responseUri = effectiveRequest?.response_uri || (proofRequest?.proofRequest ?? proofRequest)?.response_uri
        if (responseUri && proofRequest) {
          try {
            // Generate nullifier for failure reporting
            const holderSecret = localStorage.getItem("holderSecret")
            if (holderSecret) {
              const encoder = new TextEncoder()
              const data = encoder.encode(holderSecret + (proofRequest.id || ""))
              const hashBuffer = await crypto.subtle.digest("SHA-256", data)
              const hashArray = Array.from(new Uint8Array(hashBuffer))
              const failNullifier = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

              await fetch(responseUri, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  id: proofRequest.id,
                  nonce: effectiveRequest.nonce,
                  proofs: proof,
                  nullifier: failNullifier,
                  revocationIndex: vc?.credentialStatus?.index ?? null,
                  verificationFailed: true,
                  failureReason: "zk-SNARK proof could not be generated — constraint not satisfied"
                })
              })
              addLog("Failure reported to verifier with nullifier", "error")
            }
          } catch (sendErr) {
            console.error("Failed to send failure to verifier:", sendErr)
          }
        }

        setStatus("error")
        return
      }

      await new Promise(r => setTimeout(r, 800))

      addLog("Proof generated successfully ✅", "success")

      // Calculate proof size
      const proofSizeBytes = JSON.stringify(proof).length + (Object.keys(zkProofsLocal).length > 0 ? JSON.stringify(zkProofsLocal).length : 0)
      const proofSizeKB = (proofSizeBytes / 1024).toFixed(1)

      const endToEndMs = performance.now() - e2eStart

      // Calculate accurate proof type string
      const numAttributesLocal = (effectiveRequest.requested_attributes || []).length
      const numZkLocal = Object.keys(zkProofsLocal).length
      let proofTypeStrLocal = 'BBS+ Only'
      if (numAttributesLocal > 0 && numZkLocal > 0) {
        proofTypeStrLocal = `BBS+ + zk-SNARK (PLONK × ${numZkLocal})`
      } else if (numZkLocal > 0) {
        proofTypeStrLocal = `zk-SNARK (PLONK × ${numZkLocal})`
      }

      // Collect the server metrics that were fetched concurrently
      let serverCpu = 2.5, serverRam = 45
      try {
        const results = await metricsPromise
        const issuer = results[0]?.status === 'fulfilled' ? results[0].value : {}
        const verifier = results[1]?.status === 'fulfilled' ? results[1].value : {}
        const cpuI = parseFloat(issuer.cpuPercent) || 0
        const cpuV = parseFloat(verifier.cpuPercent) || 0
        const ramI = parseFloat(issuer.memoryMB) || 0
        const ramV = parseFloat(verifier.memoryMB) || 0
        serverCpu = Math.max(cpuI, cpuV, 2.0) // min 2% when active
        serverRam = ramI + ramV
      } catch (e) { /* fallback values used */ }

      // Record real-time telemetry
      telemetry.setMetrics({
        proverTime: Math.round(bbsTime + zkSnarkTime) + 'ms',
        verifierTime: 'Awaiting Scan...',
        proofSize: proofSizeKB + 'KB',
        latency: Math.round(endToEndMs) + 'ms',
        cpuUsage: serverCpu.toFixed(1),
        ramUsage: serverRam.toFixed(1),
        proofGeneratedBy: vc?.type?.find(t => t !== 'VerifiableCredential')?.replace('Credential', '')?.replace(/([A-Z])/g, ' $1')?.trim() || 'Unknown Card',
        proofType: proofTypeStrLocal
      })

      setProofData(proof)
      setStatus('success')

    } catch (err) {
      console.error("BBS ERROR:", err)
      addLog("Proof generation failed ❌", "error")
      setMessageBox({
        isOpen: true,
        type: "error",
        title: "Proof Generation Failed",
        message:
          "The proof could not be generated or sent to the verifier. Please check your credential selection or try again.",
        onConfirm: () =>
          setMessageBox(prev => ({ ...prev, isOpen: false }))
      });
      addLog(err.message || "Unknown error")
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
                        <span className="text-[9px] text-slate-400">••••••</span>
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
                                  type={info.inputType === "numeric" ? "number" : "text"}
                                  value={predicateInputs[selected] || ""}
                                  onChange={(e) => {
                                    setPredicateInputs((prev) => ({
                                      ...prev,
                                      [selected]: e.target.value
                                    }))
                                  }}
                                  placeholder={info.inputType === "numeric" ? "Enter minimum age" : "Enter value"}
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

              {/* <div className="relative p-[6px] rounded-2xl bg-gradient-to-r from-orange-500 to-cyan-500 animate-pulse"> */}
              <div className="relative p-[6px] rounded-2xl bg-gradient-to-r from-orange-500 to-cyan-500">
                <div className="bg-white rounded-xl p-4">
                  <QRCodeCanvas value={qrLink} size={260} />
                </div>
              </div>

              {/* 👇 NEW BUTTON TO GO BACK TO THE FORM */}
              <button
                onClick={() => { setQrLink(null); telemetry.clearHistory(); }}
                className="mt-10 mb-10 px-6 py-3 bg-slate-800/50 border border-slate-700 hover:border-orange-500 rounded-xl font-bold text-slate-300 hover:text-orange-400 text-[10px] uppercase tracking-[2px] transition-all flex items-center gap-2 group"
              >
                <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                New Request
              </button>

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
                                    type={
                                      info.inputType === "date"
                                        ? "date"
                                        : info.inputType === "numeric"
                                          ? "number"
                                          : "text"
                                    }
                                    min={undefined}
                                    value={predicateInputs[selected] || ""}
                                    onChange={(e) => {
                                      let value = e.target.value

                                      // 🟠 Only apply numeric rule if explicitly numeric
                                      if (info.inputType === "numeric") {
                                        if (!/^\d*$/.test(value)) return
                                      }

                                      // 🟠 Only apply hash rule if explicitly hash
                                      if (info.inputType === "hash") {
                                        value = value.replace(/[^0-9a-fA-F]/g, "")
                                      }

                                      setPredicateInputs((prev) => ({
                                        ...prev,
                                        [selected]: value
                                      }))
                                    }}
                                    placeholder={
                                      info.inputType === "numeric"
                                        ? "Enter minimum age"
                                        : info.inputType === "hash"
                                          ? "Enter hex hash"
                                          : info.inputType === "date"
                                            ? "Select date"
                                            : "Enter value"
                                    }
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
/**
 * UPDATED WALLET CONTEXT
 * ----------------------------------------------------------------------
 * Fix: Individual credential deletion logic.
 * Update: Added rollNumber to initial state.
 */

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { encryptAndStore, decryptFromStore } from '../utils/walletCrypto';
// import { setIsSubmitting } from "../pages/Issuer"

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('issuer');
  const [logs, setLogs] = useState([]);
  const [credentials, setCredentials] = useState([]);

  const initialForm = {
    idType: '',
  };

  const getInitialFormData = (type) => {
    return {
      ...initialForm,  // start from base
      idType: type,    // set selected document type
    };
  };

  const [formData, setFormData] = useState(initialForm);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev]);
  };

  // Storing of creds in localStorage (AES-256-GCM encrypted)

  // Ref to hold the secret for encryption operations
  const secretRef = useRef(null);

  // Utility to save credentials (encrypted)
  const saveCredentials = async (creds) => {
    const secret = secretRef.current || localStorage.getItem("holderSecret");
    if (secret) {
      await encryptAndStore(creds, secret);
    } else {
      // Fallback if no secret yet (first launch before issuing)
      localStorage.setItem("credentials", JSON.stringify(creds));
    }
  };

  // On component mount, load and decrypt credentials from localStorage
  useEffect(() => {
    const loadCredentials = async () => {
      const secret = localStorage.getItem("holderSecret");
      if (secret) {
        secretRef.current = secret;
        const stored = await decryptFromStore(secret);
        if (stored.length > 0) setCredentials(stored);
      } else {
        // No secret yet — check for plain credentials (first-time user)
        const plain = localStorage.getItem("credentials");
        if (plain) {
          const creds = JSON.parse(plain);
          if (creds.length > 0) setCredentials(creds);
        }
      }
    };
    loadCredentials();
  }, []);

  // lock engine for only showing the documents not signed or deleted signed
  const isDocIssuedAndSigned = (idType) => {
    return credentials.some(
      cred =>
        cred?.credentialSubject?.idType === idType &&
        cred?.proof?.signature
    );
  };

  // ------------------------------
  // HOLDER SECRET MANAGEMENT
  // ------------------------------

  const getOrCreateHolderSecret = async () => {
    let secret = localStorage.getItem("holderSecret");

    if (!secret) {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      secret = Array.from(array)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      localStorage.setItem("holderSecret", secret);
    }

    secretRef.current = secret;

    return secret;
  };

  const sha256 = async (message) => {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  // --- CORE FUNCTIONS ---

  const issueCredential = async () => {
    if (!formData.idType) return; // safety check

    // 1️⃣ Get holder secret
    const holderSecret = await getOrCreateHolderSecret();

    // 2️⃣ Compute holder commitment
    const holderCommitment = await sha256(holderSecret);

    const payload = {
      idType: formData.idType,
      data: {
        ...formData,
        issuer: "Govt. of India",
        holderCommitment, 
        ...(formData.idType === "Passport" && { nationality: "India" }) // force nationality
      }
    };

    console.log(payload);

    try {
      // setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/api/issuer/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "zkp-issuer-secret-key-2026"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (data?.id && data?.proof?.signature) {
        // Add ORIGINAL credential to state
        setCredentials(prev => {
          const newCreds = [data, ...prev];
          // Save original format to localStorage
          saveCredentials(newCreds);
          return newCreds;
        });

        // Reset UI
        setFormData(initialForm);
        setActiveTab('holder');

        // Safe logging using new structure
        const idType = data?.credentialSubject?.idType || "Credential";
        const shortId = data.id?.substring(9, 17) || "";

        addLog(`Issued: ${idType} (ID: ${shortId})`);

      } else {
        alert(data.error || "Failed to issue credential");
      }

    } catch (error) {
      console.error("Error issuing credential:", error);
      alert("Something went wrong while issuing credential.");
    } finally {
      // setIsSubmitting(false);
    }
  };

  // FIXED: Improved deletion logic
  const deleteCredential = (idToDelete) => {
    setCredentials(prev => {
      const updated = prev.filter(card => card.id !== idToDelete);
      saveCredentials(updated);
      return updated;
    });

    addLog(`Deleted credential with ID: ${idToDelete.substring(11, 19)}`);
  };

  const clearAllData = () => {
    setCredentials(prev => {
      const count = prev.length;       // count of deleted credentials
      saveCredentials([]);             // persist empty state
      addLog(`Purged all vault data. Deleted ${count} credential(s).`);
      return [];
    });
  };

  return (
    <WalletContext.Provider value={{
      activeTab, setActiveTab,
      formData, setFormData,
      logs, addLog,
      credentials,
      issueCredential,
      deleteCredential,
      clearAllData,
      isDocIssuedAndSigned,
      getInitialFormData
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
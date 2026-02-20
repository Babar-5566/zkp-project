/**
 * UPDATED WALLET CONTEXT
 * ----------------------------------------------------------------------
 * Fix: Individual credential deletion logic.
 * Update: Added rollNumber to initial state.
 */

import { createContext, useContext, useState, useEffect } from 'react';
// import { setIsSubmitting } from "../pages/Issuer"

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('issuer');
  const [logs, setLogs] = useState([]);
  const [credentials, setCredentials] = useState([]);

  const initialForm = {
    // fullName: '', 
    idType: '',
    // enrolmentId: '',
    // address: '',
    // timeOfBirth: '', 
    // placeOfBirth: '',
    // parentNames: '',
    // nationality: 'Indian',
    // board: '',
    // rollNumber: '',
    // subjects: '',
    // passingYear: '',
    // fatherName: '',
    // panType: 'Individual'
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

  // Storing of creds in local storage :-

  // Utility to get stored credentials
  const getStoredCredentials = () => {
    const stored = localStorage.getItem("credentials");
    return stored ? JSON.parse(stored) : [];
  };

  // Utility to save credentials
  const saveCredentials = (creds) => {
    localStorage.setItem("credentials", JSON.stringify(creds));
  };

  // On component mount, load credentials from localStorage
  useEffect(() => {
    const stored = getStoredCredentials();
    if (stored.length > 0) setCredentials(stored);
  }, []);

  // lock engine for only showing the documents not signed or deleted signed
  const isDocIssuedAndSigned = (idType) => {
    return credentials.some(
      cred =>
        cred?.credentialSubject?.idType === idType &&
        cred?.proof?.signature
    );
  };

  // --- CORE FUNCTIONS ---

  const issueCredential = async () => {
    if (!formData.idType) return; // safety check

    const payload = {
      idType: formData.idType,
      data: {
        ...formData,
        issuer: "Govt. of India",
        ...(formData.idType === "Passport" && { nationality: "India" }) // force nationality
      }
    };

    console.log(payload);

    try {
      // setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/api/issuer/issue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
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
    setCredentials([]);
    addLog("Purged all vault data.");
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
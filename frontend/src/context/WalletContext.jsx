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
    idType: 'Aadhaar Card',
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

  // --- CORE FUNCTIONS ---

  const transformAttributes = (backendData) => {
    const attrObj = {};
    backendData.attributes.forEach(attr => {
      const [key, value] = attr.split(":");
      attrObj[key] = value;
    });
    return { ...backendData, ...attrObj }; // keeps id, issuedAt, signature, publicKey
  };

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

      if (data && data.id) {
        // Add the backend-issued credential to state
        // console.log(data);
        // setCredentials(prev => [data, ...prev]);
        // console.log(credentials);
        // setCredentials(prev => {
        //   const newState = [data, ...prev];
        //   console.log("New credentials inside setter:", newState);
        //   return newState;
        // });

        // Transform attributes to make fields directly accessible
        const transformedData = transformAttributes(data);

        // Add the transformed credential to state
        setCredentials(prev => {
          const newCreds = [transformedData, ...prev];
          // Also save to localStorage
          saveCredentials(newCreds);
          return newCreds;
        });

        setFormData(initialForm); // Reset the form
        setActiveTab('holder');   // Switch to holder tab
        addLog(`Issued: ${data.idType} (ID: ${data.id.substring(11, 19)})`);
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
    setCredentials(prev => prev.filter(card => card.id !== idToDelete));
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
      clearAllData
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
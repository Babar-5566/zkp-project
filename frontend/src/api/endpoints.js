// src/api/endpoints.js

// Defining Base URLs for the two backend servers
export const WALLET_BASE_URL = "http://localhost:5051";
export const VERIFIER_BASE_URL = "http://localhost:3001";

// Mapping specific API paths for easy access across the app
export const ENDPOINTS = {
    // Wallet Services (Handle Data Storage and Proving)
    STORE_AADHAAR: `${WALLET_BASE_URL}/wallet/storeAadhaar`,
    GENERATE_ZK_PROOF: `${WALLET_BASE_URL}/wallet/prove-age-zk`,
    GET_WALLET_LIST: `${WALLET_BASE_URL}/wallet/list`,

    // Verifier Services (Handle Mathematical Validation)
    VERIFY_PROOF: `${VERIFIER_BASE_URL}/verify`,
};
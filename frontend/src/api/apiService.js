// src/api/apiService.js
import axiosClient from './axiosClient';
import { ENDPOINTS } from './endpoints';

const apiService = {
    storeAadhaar: async (data) => {
        
        return await axiosClient.post('/wallet/storeAadhaar', data); 
    },

    getWalletList: async () => {
        return await axiosClient.get(ENDPOINTS.GET_WALLET_LIST);
    },

    generateAgeProof: async (documentType, requiredAge = 18) => {
        return await axiosClient.post(ENDPOINTS.GENERATE_ZK_PROOF, {
            documentType,
            requiredAge
        });
    },

    verifyProof: async (proofObject) => {
        return await axiosClient.post(ENDPOINTS.VERIFY_PROOF, proofObject);
    }
};

export default apiService;
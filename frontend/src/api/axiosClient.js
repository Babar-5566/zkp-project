// src/api/axiosClient.js
import axios from 'axios';

/**
 * Creating a custom axios instance
 * This allows us to set default behaviors for all our API calls.
 */
const axiosClient = axios.create({
    // 🚀 NEW: ম্যাজিক লাইন! এটা না থাকায় ডেটা 5173 পোর্টে হারিয়ে যাচ্ছিল।
    baseURL: 'http://localhost:5051', 
    
    headers: {
        'Content-Type': 'application/json',
    },
    // You can add a timeout here if the ZK proof generation takes too long
    timeout: 30000, 
});

/**
 * Response Interceptor
 * This helps us catch and format errors globally before they reach the UI.
 */
axiosClient.interceptors.response.use(
    (response) => {
        // Return only the data part of the response
        return response.data;
    },
    (error) => {
        // Standardizing the error message for the frontend
        const message = error.response?.data?.error || "Something went wrong with the server connection";
        console.error("API Error:", message);
        return Promise.reject(message);
    }
);

export default axiosClient;
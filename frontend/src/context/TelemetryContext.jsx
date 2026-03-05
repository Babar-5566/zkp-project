import React, { createContext, useContext, useState, useCallback } from 'react';

const TelemetryContext = createContext(null);

export const useTelemetry = () => {
    const ctx = useContext(TelemetryContext);
    if (!ctx) throw new Error("useTelemetry must be used inside TelemetryProvider");
    return ctx;
};

export const TelemetryProvider = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCollecting, setIsCollecting] = useState(false);
    const [metrics, setMetrics] = useState(null);
    const [history, setHistory] = useState([]);

    const recordMetrics = useCallback((newMetrics) => {
        const entry = {
            ...newMetrics,
            timestamp: new Date().toISOString()
        };
        setMetrics(entry);
        setHistory(prev => [entry, ...prev].slice(0, 20)); // keep last 20
    }, []);

    const clearMetrics = useCallback(() => {
        setMetrics(null);
    }, []);

    const openTelemetry = useCallback(() => setIsOpen(true), []);
    const closeTelemetry = useCallback(() => setIsOpen(false), []);

    // Fetch CPU/RAM from backend
    const fetchServerMetrics = useCallback(async () => {
        try {
            const [issuerRes, verifierRes] = await Promise.allSettled([
                fetch("http://localhost:5000/metrics").then(r => r.json()),
                fetch("http://localhost:3001/metrics").then(r => r.json())
            ]);

            const issuer = issuerRes.status === 'fulfilled' ? issuerRes.value : {};
            const verifier = verifierRes.status === 'fulfilled' ? verifierRes.value : {};

            return {
                cpuUsage: Math.max(issuer.cpuPercent || 0, verifier.cpuPercent || 0).toFixed(1),
                ramUsage: ((issuer.memoryMB || 0) + (verifier.memoryMB || 0)).toFixed(1),
                network: `${issuer.uptime ? 'Issuer ' + Math.floor(issuer.uptime) + 's' : ''} • ${verifier.uptime ? 'Verifier ' + Math.floor(verifier.uptime) + 's' : ''}`
            };
        } catch {
            return { cpuUsage: '0', ramUsage: '0', network: 'Unavailable' };
        }
    }, []);

    return (
        <TelemetryContext.Provider value={{
            isOpen, setIsOpen, openTelemetry, closeTelemetry,
            isCollecting, setIsCollecting,
            metrics, setMetrics: recordMetrics, clearMetrics,
            history,
            fetchServerMetrics
        }}>
            {children}
        </TelemetryContext.Provider>
    );
};

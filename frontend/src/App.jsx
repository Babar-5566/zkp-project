import React from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import Issuer from './pages/Issuer';
import Wallet from './pages/Wallet';
import Verifier from './pages/Verifier';
import Welcome from './pages/Welcome';

// 🚀 NEW IMPORTS ADDED HERE FOR GLOBAL TELEMETRY
import BenchmarkModal from './components/BenchmarkModal';
import { BarChart3 } from 'lucide-react';

// Tab Button Component
const TabButton = ({ isActive, onClick, label }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[3px] transition-all relative ${
      isActive ? 'text-white' : 'text-slate-600 hover:text-slate-400'
    }`}
  >
    {label}
    {isActive && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-cyan-500 rounded-t-full shadow-[0_-5px_15px_rgba(6,182,212,0.5)]"></span>
    )}
  </button>
);

// Main Content Logic
const AppContent = () => {
  const { activeTab, setActiveTab } = useWallet(); // Using Context Logic
  const [hasEntered, setHasEntered] = React.useState(false);

  // =========================================================
  // 🚀 NEW: GLOBAL TELEMETRY STATES ADDED HERE
  // =========================================================
  const [isTelemetryOpen, setIsTelemetryOpen] = React.useState(false);
  const [telemetryMetrics, setTelemetryMetrics] = React.useState(null);
  const [engineName, setEngineName] = React.useState("System Engine");
  const [customTitle, setCustomTitle] = React.useState("Telemetry Dashboard");

  // 🚀 NEW: SMART GLOBAL TELEMETRY LOADER
  const openGlobalTelemetry = () => {
    const savedTelemetry = localStorage.getItem('globalTelemetryData');
    
    if (savedTelemetry) {
        const parsedData = JSON.parse(savedTelemetry);
        setTelemetryMetrics(parsedData.metrics);
        setEngineName(parsedData.engineName);
        setCustomTitle(parsedData.title || "Zero-Knowledge Diagnostics");
    } else {
        // If no data is available in memory, show standby
        setTelemetryMetrics(null);
        setEngineName("System Engine");
        setCustomTitle("Telemetry Dashboard");
    }
    
    setIsTelemetryOpen(true);
  };
  // =========================================================

  if (!hasEntered) {
    return <Welcome onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 font-sans relative">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-[#020617]/90 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-xl mx-auto flex w-full">
          <TabButton isActive={activeTab === 'issuer'} onClick={() => setActiveTab('issuer')} label="Issuer" />
          <TabButton isActive={activeTab === 'holder'} onClick={() => setActiveTab('holder')} label="Holder" />
          <TabButton isActive={activeTab === 'verifier'} onClick={() => setActiveTab('verifier')} label="Verifier" />
        </div>
      </nav>

      {/* Pages */}
      <main className="pt-24 pb-10">
        {activeTab === 'issuer' && <Issuer />}
        {activeTab === 'holder' && <Wallet />}
        {activeTab === 'verifier' && <Verifier />}
      </main>

      {/* Footer Status */}
      <footer className="fixed bottom-4 left-0 w-full text-center pointer-events-none z-40">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur rounded-full border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">System Operational</span>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* 🚀 NEW: GLOBAL TELEMETRY BUTTON & MODAL INTEGRATED HERE */}
      {/* Smart Positioning: bottom-16 on Mobile, bottom-6 on PC */}
      {/* ========================================================= */}
      <div className="fixed bottom-16 left-4 md:bottom-6 md:left-6 z-[60]">
        <button
          onClick={openGlobalTelemetry}
          className="bg-[#040914]/90 backdrop-blur-md border border-cyan-500/30 px-4 py-3 md:px-5 md:py-3 rounded-xl flex items-center gap-3 transition-all hover:shadow-[0px_0px_20px_0px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95"
        >
          <BarChart3 className="text-cyan-400" size={18} />
          {/* Text hides on very small screens, shows on slightly larger ones to save space */}
          <span className="text-white font-mono text-[10px] md:text-[11px] font-bold uppercase tracking-widest hidden sm:inline-block">
            Telemetry
          </span>
        </button>
      </div>

      <BenchmarkModal 
        isOpen={isTelemetryOpen} 
        onClose={() => setIsTelemetryOpen(false)}
        isTesting={false} // Since this is a global viewer, it directly shows saved data
        metrics={telemetryMetrics}
        engineName={engineName}
        customTitle={customTitle}
        startEvaluation={openGlobalTelemetry}
      />
      {/* ========================================================= */}

    </div>
  );
};

const App = () => {
  return (
    <WalletProvider>
      <AppContent />
    </WalletProvider>
  );
};

export default App;
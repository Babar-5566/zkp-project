import React from 'react';
import { WalletProvider, useWallet } from './context/WalletContext';
import Issuer from './pages/Issuer';
import Wallet from './pages/Wallet';
import Verifier from './pages/Verifier';
import Welcome from './pages/Welcome';

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

  if (!hasEntered) {
    return <Welcome onEnter={() => setHasEntered(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-cyan-500/30 font-sans">
      
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
      <footer className="fixed bottom-4 left-0 w-full text-center pointer-events-none">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/50 backdrop-blur rounded-full border border-white/5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">System Operational</span>
        </div>
      </footer>
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
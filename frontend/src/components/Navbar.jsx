/**
 * NAVBAR COMPONENT
 * ----------------------------------------------------------------------
 * Features:
 * 1. Hardware-Accelerated Tab Switching (Framer Motion Layout Animations).
 * 2. Glassmorphism Design (Backdrop blur).
 * 3. Auto-Demo Trigger Button.
 * 4. Responsive & High Performance.
 */

// import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Play } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const Navbar = () => {
  const { activeTab, setActiveTab } = useWallet();

  // The Tabs available in the system
  const tabs = ['issuer', 'holder', 'verifier'];

  /**
   * Auto-Demo Simulation Logic
   * Automatically switches tabs to demonstrate the full ZKP flow.
   * Logic: Issuer (Create ID) -> Holder (View ID) -> Verifier (Prove ID)
   */
  const runAutoDemo = () => {
    // Step 1: Go to Issuer
    setActiveTab('issuer');
    
    // Step 2: Go to Holder (After 2 seconds)
    setTimeout(() => {
      setActiveTab('holder');
    }, 2500);

    // Step 3: Go to Verifier (After 4.5 seconds)
    setTimeout(() => {
      setActiveTab('verifier');
    }, 5000);
  };

  return (
    <nav className="fixed top-0 w-full z-[50] bg-[#020617]/80 backdrop-blur-xl border-b border-white/5 h-16 flex items-center transition-all duration-300">
      <div className="max-w-6xl mx-auto w-full px-4 flex justify-between items-center">
        
        {/* --- 1. LOGO SECTION --- */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setActiveTab('issuer')}>
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-cyan-950/30 p-2 rounded-lg border border-cyan-500/20 relative z-10">
              <Shield className="text-cyan-400 group-hover:rotate-12 transition-transform duration-300" size={20} />
            </div>
          </div>
          <div className="leading-none">
            <h1 className="text-lg font-black text-white tracking-tighter uppercase font-sans">CipherTrust</h1>
            <span className="text-[9px] text-emerald-500 font-mono tracking-widest uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              NODE_SYNCED
            </span>
          </div>
        </div>

        {/* --- 2. TAB CONTROLS & DEMO BUTTON --- */}
        <div className="flex bg-slate-950/60 p-1 rounded-xl border border-white/5 items-center backdrop-blur-md shadow-inner">
          
          {/* Loop through tabs to generate buttons */}
          {tabs.map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`relative px-6 py-2 rounded-lg text-[10px] font-black uppercase transition-colors duration-200 ${
                activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {/* THE MAGIC ANIMATION: layoutId makes the background slide smoothly */}
              {activeTab === tab && (
                <motion.div 
                  layoutId="activeTabIndicator" 
                  className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.3)]" 
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab}</span>
            </button>
          ))}
          
          {/* Separator Line */}
          <div className="w-[1px] h-5 bg-white/10 mx-2"></div>
          
          {/* Auto Demo Play Button */}
          <button 
            onClick={runAutoDemo} 
            className="p-2 rounded-lg text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all active:scale-95 group/play" 
            title="Run Automated Demo"
          >
            <Play size={16} className="group-hover/play:fill-emerald-400 transition-colors" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate } from 'framer-motion';
import { Activity, Clock, Cpu, Database, X, Zap, BarChart3, ShieldCheck, Signal, Server, Code2 } from 'lucide-react';

// ==========================================
// 🌌 ULTRA-PREMIUM EASING & PHYSICS
// ==========================================
const premiumEase = [0.16, 1, 0.3, 1]; // Apple-like buttery curve
const springConfig = { type: "spring", stiffness: 250, damping: 25, mass: 0.5 };

// Container for staggering children (Cascade effect)
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// Item entrance physics
const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: springConfig }
};

// ==========================================
// 1️⃣ COMPONENT: Scramble Text (Matrix Decrypt Effect)
// ==========================================
const ScrambleText = ({ text }) => {
  const [displayText, setDisplayText] = useState("");
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  useEffect(() => {
    let iteration = 0;
    let interval = setInterval(() => {
      setDisplayText(text.split("").map((letter, index) => {
          if (index < iteration) return text[index];
          return letters[Math.floor(Math.random() * 36)];
        }).join(""));
      if (iteration >= text.length) clearInterval(interval);
      iteration += 1 / 3;
    }, 20); // Faster, crisper scramble
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayText}</span>;
};

// ==========================================
// 2️⃣ COMPONENT: Premium Number Counter 
// ==========================================
const AnimatedCounter = ({ value, suffix = "" }) => {
  const nodeRef = useRef(null);
  
  useEffect(() => {
    if (!nodeRef.current || value === undefined) return;
    const numericValue = parseFloat(value.toString().replace(/,/g, ''));
    
    const controls = animate(0, numericValue, {
      duration: 1.5,
      ease: premiumEase,
      onUpdate(val) {
        if (nodeRef.current) {
          nodeRef.current.textContent = (numericValue % 1 !== 0 ? val.toFixed(1) : Math.floor(val)) + suffix;
        }
      },
    });
    return () => controls.stop();
  }, [value, suffix]);

  return <span ref={nodeRef} className="tabular-nums">0{suffix}</span>;
};

// ==========================================
// 3️⃣ MAIN MODAL COMPONENT
// ==========================================
const BenchmarkModal = ({ isOpen, onClose, isTesting, metrics, startEvaluation }) => {
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (isTesting) {
      const phases = [ { t: 0, p: 1 }, { t: 600, p: 2 }, { t: 1200, p: 3 } ];
      phases.forEach(({ t, p }) => setTimeout(() => setLoadingPhase(p), t));
    } else { setLoadingPhase(0); }
  }, [isTesting]);

  return (
    <>
      {/* --- TRIGGER BUTTON --- */}
      {/* ⚠️ FIX APPLIED HERE: Mobile -> bottom-20 right-6 | Desktop -> bottom-8 left-8 */}
      <div className="fixed bottom-20 left-6 md:bottom-8 md:right-auto md:left-8 z-[60]">
        <motion.button
          onClick={startEvaluation}
          initial={{ boxShadow: "0px 0px 0px 0px rgba(6,182,212,0)", borderColor: "rgba(6,182,212,0.3)" }}
          whileHover={{ 
            boxShadow: "0px 0px 20px 0px rgba(6,182,212,0.4)", 
            borderColor: "rgba(6,182,212,0.9)",
            scale: 1.02
          }}
          whileTap={{ scale: 0.95 }}
          className="bg-[#040914]/90 backdrop-blur-md border px-5 py-3 rounded-[12px] flex items-center gap-3 transition-all duration-300 group overflow-hidden relative"
        >
          {/* Button Hover Sweep */}
          <motion.div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
          
          <BarChart3 className="text-white group-hover:text-cyan-400 transition-colors duration-300 relative z-10" size={18} />
          <span className="text-white font-mono text-[11px] font-bold uppercase tracking-[0.2em] group-hover:text-cyan-50 mt-0.5 transition-colors duration-300 relative z-10">
            Telemetry
          </span>
        </motion.button>
      </div>

      {/* --- MODAL OVERLAY --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }} 
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }} 
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-[#02050A]/85 antialiased"
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              transition={springConfig}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-[#060B14] border border-slate-800/80 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden"
            >
              {/* Premium Top Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent blur-[3px]"></div>

              {/* HEADER */}
              <div className="flex justify-between items-center px-5 md:px-8 py-5 border-b border-white/5 bg-[#060B14]/90 backdrop-blur-xl sticky top-0 z-40">
                <div className="flex items-center gap-4">
                  <div className="p-2 md:p-2.5 bg-[#0A111F] rounded-lg border border-white/10 relative overflow-hidden group">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 bg-gradient-to-tr from-cyan-500/0 via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100" />
                    <Activity className="text-cyan-400 relative z-10" size={18} />
                  </div>
                  <div>
                    <h3 className="text-white/95 text-sm md:text-base font-black uppercase tracking-widest flex items-center gap-2">
                      <ScrambleText text="Zero-Knowledge Diagnostics" />
                      {isTesting && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]" />}
                    </h3>
                    <p className="text-[9px] md:text-[10px] text-slate-500 font-mono font-medium tracking-[0.2em] uppercase mt-0.5">
                      Core Engine v2.1 • BLS12-381
                    </p>
                  </div>
                </div>
                {/* Anti-Clockwise Close Button */}
                <motion.button 
                  whileHover={{ rotate: -90, scale: 1.1, backgroundColor: "rgba(255,255,255,0.05)" }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose} 
                  className="p-2 bg-white/5 border border-transparent hover:border-white/10 rounded-full text-slate-400 hover:text-white transition-all duration-300 cursor-pointer"
                >
                  <X size={16} />
                </motion.button>
              </div>

              {/* CONTENT AREA */}
              <div className="p-5 md:p-8 min-h-[350px] md:min-h-[400px] flex flex-col justify-center relative z-10">
                <AnimatePresence mode="wait">
                  
                  {!metrics && !isTesting ? (
                    /* IDLE STATE */
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="text-center">
                      <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex justify-center">
                        <Code2 className="text-slate-700 mb-5" size={48} strokeWidth={1} />
                      </motion.div>
                      <h4 className="text-white/90 font-bold mb-2 uppercase tracking-widest text-xs md:text-sm"><ScrambleText text="System Standby" /></h4>
                      <p className="text-slate-500 text-[10px] md:text-xs max-w-sm mx-auto font-mono">Awaiting cryptographic payload generation to begin verifiable telemetry.</p>
                    </motion.div>
                  ) : 

                  isTesting ? (
                    /* LOADING STATE (Ultra-Premium Dual Spinners) */
                    <motion.div key="testing" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05, filter: "blur(5px)" }} transition={springConfig} className="flex flex-col items-center justify-center">
                      <div className="relative w-28 h-28 md:w-32 md:h-32 mb-8 flex items-center justify-center">
                        {/* Outer Ring: Clockwise, Solid with Gradient Glow */}
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-[2px] border-cyan-900/30 border-t-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]" />
                        {/* Inner Ring: Anti-Clockwise, Dashed */}
                        <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-3 rounded-full border-[2px] border-dashed border-cyan-500/40" />
                        {/* Center Icon */}
                        <ShieldCheck className="text-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] relative z-10" size={32} />
                      </div>
                      
                      <div className="h-6 overflow-hidden relative w-full text-center">
                        <AnimatePresence mode="wait">
                          <motion.p key={loadingPhase} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="text-cyan-400 font-mono text-[10px] md:text-xs font-bold tracking-widest uppercase absolute w-full">
                            {loadingPhase === 1 ? "Allocating Heap Memory..." : loadingPhase === 2 ? "Computing ZK Constraints..." : loadingPhase === 3 ? "Verifying Proof..." : "Initializing..."}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  ) : 

                  (
                    /* RESULTS STATE (Staggered Entry) */
                    <motion.div key="results" variants={containerVariants} initial="hidden" animate="show" className="w-full">
                      
                      {/* Top Metric Cards */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mb-5">
                        <MetricCard icon={<Clock/>} title="Prover Time" value={metrics?.proverTime} />
                        <MetricCard icon={<Zap/>} title="Verifier Time" value={metrics?.verifierTime} />
                        <MetricCard icon={<Database/>} title="Proof Size" value={metrics?.proofSize} />
                        <MetricCard icon={<Signal/>} title="End-to-End" value={metrics?.latency} />
                      </div>

                      {/* Bottom Technical Section */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
                        <SleekBar title="CPU Load" value={metrics?.cpuUsage} limit={100} unit="%" icon={<Cpu size={14}/>} color="bg-emerald-400" />
                        <SleekBar title="RAM Allocation" value={metrics?.ramUsage} limit={500} unit="MB" icon={<Server size={14}/>} color="bg-cyan-400" />
                        
                        {/* Network Status Card */}
                        <motion.div variants={itemVariants} whileHover={{ y: -2 }} className="bg-white/[0.02] border border-white/5 hover:border-white/10 p-5 rounded-2xl flex flex-col justify-center relative overflow-hidden group transition-colors duration-300">
                           {/* Network Card Ambient Glow */}
                           <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/0 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          
                          <div className="flex justify-between items-center mb-3 relative z-10">
                            <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                              <Signal size={12}/> Network
                            </span>
                            <span className="flex items-center gap-1.5 text-emerald-400 text-[9px] uppercase tracking-widest font-bold bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Stable
                            </span>
                          </div>
                          <p className="text-white font-mono font-medium text-xs md:text-sm relative z-10">
                            <ScrambleText text={metrics?.network || "Optimal (12ms RTT)"} />
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// ==========================================
// SUB-COMPONENTS (With Premium Interactions)
// ==========================================
const MetricCard = ({ icon, title, value }) => {
  const numMatch = value?.toString().match(/[\d.]+/);
  const textMatch = value?.toString().replace(/[\d.]+/g, '');
  const numericVal = numMatch ? numMatch[0] : "0";
  const suffix = textMatch ? textMatch : "";

  return (
    <motion.div 
      variants={itemVariants}
      whileHover={{ y: -4, scale: 1.01, backgroundColor: "rgba(255,255,255,0.04)", borderColor: "rgba(6,182,212,0.4)" }}
      className="bg-white/[0.02] border border-white/5 p-4 md:p-6 rounded-2xl transition-all duration-300 relative overflow-hidden group cursor-default"
    >
      {/* Background Ambient Watermark (Breathing) */}
      <motion.div 
        animate={{ opacity: [0.02, 0.05, 0.02], scale: [1, 1.1, 1] }} 
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -right-4 -top-4 text-white transform scale-[2] rotate-12"
      >
        {React.cloneElement(icon, { size: 60 })}
      </motion.div>
      
      {/* Subtle Hover Sweep */}
      <motion.div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent group-hover:translate-x-full transition-transform duration-700 ease-in-out" />

      <div className="flex items-center gap-2 mb-3 md:mb-4 relative z-10">
        <div className="text-cyan-400">{React.cloneElement(icon, { size: 14 })}</div>
        <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest"><ScrambleText text={title} /></h4>
      </div>
      <div className="flex items-baseline gap-1 text-2xl md:text-3xl font-bold text-white font-mono relative z-10 drop-shadow-md">
        <AnimatedCounter value={numericVal} suffix={suffix} />
      </div>
    </motion.div>
  );
};

const SleekBar = ({ title, value, limit, unit, icon, color }) => {
  const percentage = Math.min((parseFloat(value) / limit) * 100, 100);

  return (
    <motion.div 
      variants={itemVariants} 
      whileHover={{ y: -2 }}
      className="bg-white/[0.02] border border-white/5 hover:border-white/10 p-5 rounded-2xl flex flex-col justify-center group relative overflow-hidden transition-colors duration-300"
    >
      <div className="flex justify-between items-center mb-4 relative z-10">
        <span className="text-[9px] md:text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
          {icon} <ScrambleText text={title} />
        </span>
        <span className="text-[10px] md:text-sm font-mono text-white font-bold"><AnimatedCounter value={parseFloat(value)} suffix={unit} /></span>
      </div>
      <div className="h-[4px] bg-white/5 rounded-full w-full relative z-10 overflow-hidden">
        {/* Animated Bar Fill */}
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1.5, ease: premiumEase, delay: 0.2 }}
          className={`h-full rounded-full ${color} shadow-[0_0_10px_currentColor] relative`}
        >
          {/* Glowing Leading Edge */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full blur-[2px] opacity-80"></div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default BenchmarkModal;
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Clock, Cpu, Database, X, Zap, BarChart3, ShieldCheck, Globe, Server, Code2 } from 'lucide-react';

// Custom Easing for "Apple/Google" like buttery smooth animations (No Jitter)
const springTransition = { type: "spring", damping: 30, stiffness: 200, mass: 0.8 };
const smoothEase = [0.16, 1, 0.3, 1]; 

const BenchmarkModal = ({ 
  isOpen, 
  onClose, 
  isTesting, 
  metrics, 
  startEvaluation 
}) => {
  // Local state to manage the loading sequence phases for extreme realism
  const [loadingPhase, setLoadingPhase] = useState(0);

  useEffect(() => {
    if (isTesting) {
      const phases = [
        { time: 0, phase: 1 }, // Allocating WASM
        { time: 600, phase: 2 }, // Computing ZKP
        { time: 1200, phase: 3 }, // Network Verification
      ];
      phases.forEach(({ time, phase }) => setTimeout(() => setLoadingPhase(phase), time));
    } else {
      setLoadingPhase(0);
    }
  }, [isTesting]);

  return (
    <>
      {/* TRIGGER BUTTON (FAB) */}
      <div className="fixed bottom-8 left-8 z-[60]">
        <motion.button
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 30px rgba(6,182,212,0.4)" }}
          whileTap={{ scale: 0.95 }}
          onClick={startEvaluation}
          className="bg-[#050A15]/90 border border-cyan-500/30 backdrop-blur-xl p-4 rounded-2xl flex items-center gap-3 overflow-hidden group"
        >
          <div className="relative">
            <BarChart3 className="text-cyan-400 z-10 relative" size={22} />
            <motion.div 
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }} 
              transition={{ duration: 2, repeat: Infinity }} 
              className="absolute inset-0 bg-cyan-400 rounded-full blur-md"
            />
          </div>
          <span className="text-cyan-50 font-mono text-[10px] font-bold uppercase tracking-[2px] pr-2 group-hover:text-cyan-300 transition-colors">
            System Telemetry
          </span>
        </motion.button>
      </div>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-xl antialiased">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={springTransition}
              className="relative w-full max-w-4xl bg-[#090E17] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col"
            >
              {/* TOP HEADER */}
              <div className="flex justify-between items-center px-8 py-6 border-b border-white/5 bg-gradient-to-r from-cyan-500/5 to-transparent">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#0B1221] rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Activity className="text-cyan-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-white/90 text-lg font-black uppercase tracking-widest flex items-center gap-2">
                      Zero-Knowledge Diagnostics
                      {isTesting && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                    </h3>
                    <p className="text-[10px] text-cyan-500/70 font-mono font-bold tracking-[3px]">
                      INFRASTRUCTURE EVALUATION REPORT
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose} 
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* MAIN CONTENT AREA */}
              <div className="p-8 min-h-[400px] flex flex-col justify-center relative">
                
                {/* BACKGROUND GRID (For that Pro Dev Vibe) */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 pointer-events-none" />

                <AnimatePresence mode="wait">
                  {!metrics && !isTesting ? (
                    // STATE 1: IDLE
                    <motion.div 
                      key="idle"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="text-center z-10"
                    >
                      <Code2 className="mx-auto text-slate-600 mb-6" size={48} strokeWidth={1} />
                      <h4 className="text-slate-300 font-bold mb-2 uppercase tracking-[2px] text-sm">Awaiting Telemetry Data</h4>
                      <p className="text-slate-500 text-xs mb-8 max-w-sm mx-auto font-mono">
                        Initiate a Verifiable Presentation or Credential Issuance to capture cryptographic benchmarks.
                      </p>
                    </motion.div>

                  ) : isTesting ? (
                    // STATE 2: LOADING / COMPUTING
                    <motion.div 
                      key="testing"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center z-10"
                    >
                      <div className="relative w-32 h-32 mb-8">
                        {/* Outer rotating dashed ring */}
                        <motion.div 
                          animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 border-[2px] border-dashed border-cyan-500/20 rounded-full"
                        />
                        {/* Inner fast spinner */}
                        <motion.div 
                          animate={{ rotate: -360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-2 border-[3px] border-transparent border-t-cyan-400 border-l-cyan-400/50 rounded-full"
                        />
                        <ShieldCheck className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-400" size={40} />
                      </div>
                      <div className="h-6 overflow-hidden">
                        <AnimatePresence mode="wait">
                          <motion.p 
                            key={loadingPhase}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                            className="text-cyan-400 font-mono text-[11px] font-bold tracking-[3px] uppercase"
                          >
                            {loadingPhase === 1 ? "1/3 Allocating WASM Memory..." : 
                             loadingPhase === 2 ? "2/3 Computing SPoK Constraints..." : 
                             loadingPhase === 3 ? "3/3 Verifying Network Payloads..." : "Initializing Engine..."}
                          </motion.p>
                        </AnimatePresence>
                      </div>
                    </motion.div>

                  ) : (
                    // STATE 3: RESULTS (The Google/Microsoft Dashboard)
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0, filter: "blur(10px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 0.5, ease: smoothEase }}
                      className="w-full z-10"
                    >
                      {/* TOP 4 MAIN METRICS */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <MetricCard icon={<Clock />} title="Prover Time" value={metrics?.proverTime} unit="ms" delay={0.1} />
                        <MetricCard icon={<Zap />} title="Verifier Time" value={metrics?.verifierTime} unit="ms" delay={0.2} />
                        <MetricCard icon={<Database />} title="Proof Size" value={metrics?.proofSize} unit="KB" delay={0.3} />
                        <MetricCard icon={<Globe />} title="E2E Latency" value={metrics?.latency} unit="ms" delay={0.4} />
                      </div>

                      {/* BOTTOM TECHNICAL BARS */}
                      <div className="grid grid-cols-3 gap-4">
                        <HardwareBar title="CPU Intensity" value={metrics?.cpuUsage} limit={100} unit="%" icon={<Cpu size={14}/>} delay={0.5} color="bg-emerald-400" />
                        <HardwareBar title="Memory Footprint" value={metrics?.ramUsage} limit={500} unit="MB" icon={<Server size={14}/>} delay={0.6} color="bg-cyan-400" />
                        
                        {/* Network Status Block */}
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, ease: smoothEase }}
                          className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col justify-center"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                              Network Stability
                            </span>
                            <div className="flex gap-1">
                              {[1,2,3,4].map(i => (
                                <motion.div key={i} initial={{ height: 2 }} animate={{ height: i * 4 }} transition={{ delay: 0.7 + (i*0.1) }} className="w-1 bg-cyan-500 rounded-full" />
                              ))}
                            </div>
                          </div>
                          <p className="text-white font-mono font-black text-sm">{metrics?.network}</p>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- SUB-COMPONENTS FOR CLEAN CODE ---

const MetricCard = ({ icon, title, value, unit, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, ease: smoothEase }}
    className="bg-gradient-to-br from-white/[0.04] to-transparent border border-white/5 p-5 rounded-[1.5rem] relative overflow-hidden group hover:border-cyan-500/30 transition-colors"
  >
    <div className="absolute -right-4 -top-4 text-white/[0.02] group-hover:text-cyan-500/[0.05] transition-colors transform scale-150">
      {React.cloneElement(icon, { size: 64 })}
    </div>
    <div className="flex items-center gap-2 mb-4">
      <div className="text-cyan-500/70">{React.cloneElement(icon, { size: 16 })}</div>
      <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</h4>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black text-white font-mono tracking-tight">{value}</span>
      <span className="text-xs font-bold text-cyan-500/50">{unit}</span>
    </div>
  </motion.div>
);

const HardwareBar = ({ title, value, limit, unit, icon, delay, color }) => {
  const percentage = Math.min((parseFloat(value) / limit) * 100, 100);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, ease: smoothEase }}
      className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex flex-col justify-center"
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
          {icon} {title}
        </span>
        <span className="text-xs font-mono text-white font-black">{value}{unit}</span>
      </div>
      <div className="h-1.5 bg-[#050A15] rounded-full overflow-hidden w-full relative">
        <motion.div 
          initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 1, delay: delay + 0.2, ease: smoothEase }}
          className={`absolute top-0 left-0 h-full ${color} shadow-[0_0_10px_currentColor]`} 
        />
      </div>
    </motion.div>
  );
};

export default BenchmarkModal;
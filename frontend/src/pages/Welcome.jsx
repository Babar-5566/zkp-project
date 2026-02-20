import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowRight, Hexagon } from 'lucide-react';

const Welcome = ({ onEnter }) => {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 500);
    const t2 = setTimeout(() => setStage(2), 2500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ opacity: stage >= 1 ? 0.4 : 0 }}
          transition={{ duration: 2 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-cyan-900/20 rounded-full blur-[150px]" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)]"></div>
      </div>

      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={stage >= 1 ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
        className="relative z-10 mb-10"
      >
        <div className="relative">
           <div className={`absolute inset-0 bg-cyan-500 blur-2xl opacity-0 transition-opacity duration-1000 ${stage >= 2 ? 'opacity-40' : ''}`}></div>
           <Hexagon size={80} className="text-white fill-black relative z-10" strokeWidth={1} />
           <motion.div 
             initial={{ scale: 0 }} animate={stage >= 1 ? { scale: 1 } : {}} transition={{ delay: 0.2 }}
             className="absolute inset-0 flex items-center justify-center z-20"
           >
             <ShieldCheck size={40} className="text-cyan-400" />
           </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={stage >= 2 ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 1 }}
        className="text-center relative z-10 space-y-6 max-w-lg"
      >
        <div className="space-y-2">
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase">
            Cipher<span className="text-cyan-500">Trust</span>
          </h1>
          <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-[6px]">
            Zero-Knowledge Identity Vault
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: '#fff', color: '#000' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEnter()}
          className="group mt-8 px-10 py-4 border border-slate-700 bg-black/50 backdrop-blur-md text-white rounded-full font-black text-xs uppercase tracking-[3px] transition-all hover:border-white shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center gap-3 mx-auto"
        >
          Enter System <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform"/>
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Welcome;
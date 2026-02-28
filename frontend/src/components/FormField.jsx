/**
 * FORM FIELD COMPONENT
 * ----------------------------------------------------------------------
 * A reusable input component with:
 * 1. Built-in Error Handling (Red Border + Message).
 * 2. Floating Label Animation (Subtle Focus Effect).
 * 3. Icon Support (Left Side Icon).
 * 4. Hardware-Accelerated Transitions.
 */

import { memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const FormField = memo(({ 
  label, 
  placeholder, 
  icon: Icon, 
  value, 
  onChange, 
  name, 
  type = "text", 
  error = null,
  readOnly = false
}) => {
  return (
    <div className="space-y-1 group/in">
      {/* Label with dynamic error color */}
      <label className={`text-[9px] font-black uppercase tracking-[2px] ml-1 transition-colors duration-200 ${
        error ? 'text-red-400' : 'text-slate-500 group-focus-within/in:text-cyan-400'
      }`}>
        {label}
      </label>

      <div className="relative">
        {/* Left Icon */}
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 z-10 transition-colors duration-200 ${
          error ? 'text-red-400' : 'text-slate-500 group-focus-within/in:text-cyan-400'
        }`}>
          {Icon && <Icon size={16} />}
        </div>

        {/* Input Field */}
        <input 
          type={type} 
          name={name} 
          placeholder={placeholder} 
          value={value} 
          onChange={onChange}
          readOnly={readOnly}
          className={`
            w-full bg-[#030712] border p-3 pl-10 rounded-xl text-sm font-bold text-slate-100 outline-none shadow-inner transition-all duration-200
            placeholder:text-slate-700
            ${error 
              ? 'border-red-500/50 focus:border-red-500 focus:shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
              : 'border-slate-800 focus:border-cyan-500/50 focus:shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:border-slate-700'
            }
            ${readOnly ? 'opacity-70 cursor-not-allowed' : ''}
          `} 
        />
        
        {/* Error Icon (Right Side) */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.5 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"
            >
              <AlertCircle size={14} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message Text */}
      <AnimatePresence>
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }} 
            className="text-[10px] text-red-400 font-bold ml-1"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
});

export default FormField;
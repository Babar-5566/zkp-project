import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

const MessageBox = ({
  isOpen,
  type = "error", // "error" | "warning"
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  const config = {
    error: {
      icon: <XCircle size={22} />,
      color: "text-red-400",
      border: "border-red-500/30",
      button: "bg-red-600"
    },
    warning: {
      icon: <AlertTriangle size={22} />,
      color: "text-yellow-400",
      border: "border-yellow-500/30",
      button: "bg-yellow-600"
    }
  };

  const style = config[type];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`bg-[#0B101B] border ${style.border} rounded-2xl p-6 w-full max-w-sm`}
        >
          <div className={`flex items-center gap-3 mb-4 ${style.color}`}>
            {style.icon}
            <h3 className="font-bold text-white">{title}</h3>
          </div>

          <p className="text-slate-400 text-sm mb-6">
            {message}
          </p>

          <div className="flex gap-3">
            {cancelText && (
              <button
                onClick={onCancel}
                className="flex-1 py-2 bg-slate-800 rounded-xl text-xs font-bold text-slate-400 uppercase"
              >
                {cancelText}
              </button>
            )}

            <button
              onClick={onConfirm}
              className={`flex-1 py-2 rounded-xl text-xs font-bold text-white uppercase ${style.button}`}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageBox;
import React from "react";

const CustomButton = ({ text, onClick, variant = "primary", className }) => {
  let baseClasses = "py-3 rounded-xl font-bold text-[10px] uppercase transition-all ";

  switch (variant) {
    case "primary":
      baseClasses += "bg-cyan-600 text-white hover:bg-cyan-500";
      break;
    case "success":
      baseClasses += "bg-emerald-600 text-white hover:bg-emerald-500";
      break;
    case "secondary":
      baseClasses += "bg-slate-800 text-slate-300 hover:bg-slate-700";
      break;
    default:
      baseClasses += "bg-gray-600 text-white";
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${className}`}>
      {text}
    </button>
  );
};

export default CustomButton;

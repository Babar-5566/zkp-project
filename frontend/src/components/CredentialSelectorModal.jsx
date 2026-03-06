import React, { useState } from "react"
import { Eye, ShieldCheck, Hash, Calendar, Scale, CircleEqual } from "lucide-react"

/** Human-friendly explanation for each predicate type */
const predicateDescriptions = {
  reveal: {
    label: "Reveal",
    hint: "will be exposed to the verifier",
    icon: Eye,
    color: "text-amber-400"
  },
  existence: {
    label: "Existence",
    hint: "only checked if present in the selected credential",
    icon: ShieldCheck,
    color: "text-emerald-400"
  },
  "numeric/range": {
    label: "Range check",
    hint: "verified via zero-knowledge — value stays hidden",
    icon: Scale,
    color: "text-violet-400"
  },
  equality: {
    label: "Equality check",
    hint: "verified via zero-knowledge — value stays hidden",
    icon: CircleEqual,
    color: "text-blue-400"
  },
  hash: {
    label: "Hash check",
    hint: "verified via zero-knowledge — value stays hidden",
    icon: Hash,
    color: "text-pink-400"
  },
  "date comparison": {
    label: "Date check",
    hint: "verified via zero-knowledge — value stays hidden",
    icon: Calendar,
    color: "text-teal-400"
  }
}

const fallbackDesc = {
  label: "Requested",
  hint: "requested by verifier",
  icon: ShieldCheck,
  color: "text-slate-400"
}

const CredentialSelectorModal = ({
  isOpen,
  request,
  credentials,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !request) return null

  // Build enriched field list carrying predicate metadata
  const requestedFields = [
    ...(request.requested_attributes || []).map(a => ({
      name: a.name,
      predicate: a.predicate || "reveal"
    })),
    ...(request.requested_predicates || []).map(p => ({
      name: p.name,
      predicate: p.predicate || "existence",
      value: p.value || null
    }))
  ]

  const [selection, setSelection] = useState({})

  const matchingCredentials = (fieldName) => {
    return credentials.filter(vc =>
      vc?.credentialSubject?.[fieldName] !== undefined
    )
  }

  const handleSelect = (fieldName, vc) => {
    setSelection(prev => ({
      ...prev,
      [fieldName]: vc
    }))
  }

  const allSelected =
    requestedFields.length > 0 &&
    requestedFields.every(f => selection[f.name]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#020617] border border-cyan-500/30 p-6 rounded-xl w-[480px] max-h-[80vh] overflow-y-auto">

        <h2 className="text-white font-bold mb-4">
          Select Credential for Proof
        </h2>

        {requestedFields.map(field => {
          const matches = matchingCredentials(field.name)
          const desc = predicateDescriptions[field.predicate] || fallbackDesc
          const Icon = desc.icon

          return (
            <div key={`${field.name}-${field.predicate}`} className="mb-5">
              {/* Field name + predicate badge */}
              <div className="flex items-center gap-2 mb-1">
                <Icon size={13} className={desc.color} />
                <span className="text-cyan-400 text-xs font-bold uppercase">
                  {field.name}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${desc.color} border-current/30 opacity-80`}>
                  {desc.label}
                </span>
              </div>

              {/* Explanation line */}
              <p className="text-slate-500 text-[10px] ml-5 mb-2 italic">
                {desc.hint}
                {field.value != null && (
                  <span className="text-slate-400"> — threshold: {field.value}</span>
                )}
              </p>

              {matches.length === 0 && (
                <p className="text-red-400 text-xs ml-5">
                  No credential contains this attribute
                </p>
              )}

              {matches.map(vc => (
                <button
                  key={vc.id}
                  onClick={() => handleSelect(field.name, vc)}
                  className={`w-full text-left px-3 py-2 mb-2 rounded border text-xs ${selection[field.name]?.id === vc.id
                      ? "border-emerald-500 text-emerald-400"
                      : "border-slate-700 text-slate-400"
                    }`}
                >
                  <div className="font-semibold">
                    {vc.credentialSubject?.idType}
                  </div>
                </button>
              ))}
            </div>
          )
        })}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-700 py-2 rounded text-xs"
          >
            Cancel
          </button>

          <button
            onClick={() => onConfirm(selection)}
            disabled={!allSelected}
            className={`flex-1 py-2 rounded text-xs text-white ${allSelected
                ? "bg-cyan-600"
                : "bg-slate-600 opacity-50 cursor-not-allowed"
              }`}
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  )
}

export default CredentialSelectorModal;
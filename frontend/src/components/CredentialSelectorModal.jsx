import React, { useState } from "react"

const CredentialSelectorModal = ({
  isOpen,
  request,
  credentials,
  onClose,
  onConfirm
}) => {
  if (!isOpen || !request) return null

  const requestedFields = [
    ...(request.requested_attributes || []).map(a => a.name),
    ...(request.requested_predicates || []).map(p => p.name)
  ]

  const [selection, setSelection] = useState({})

  const matchingCredentials = (field) => {
    return credentials.filter(vc =>
      vc?.credentialSubject?.[field] !== undefined
    )
  }

  const handleSelect = (field, vc) => {
    setSelection(prev => ({
      ...prev,
      [field]: vc
    }))
  }

  const allSelected =
    requestedFields.length > 0 &&
    requestedFields.every(field => selection[field]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-[#020617] border border-cyan-500/30 p-6 rounded-xl w-[480px] max-h-[80vh] overflow-y-auto">

        <h2 className="text-white font-bold mb-4">
          Select Credential for Proof
        </h2>

        {requestedFields.map(field => {
          const matches = matchingCredentials(field)

          return (
            <div key={field} className="mb-5">
              <p className="text-cyan-400 text-xs uppercase mb-2">
                Requested: {field}
              </p>

              {matches.length === 0 && (
                <p className="text-red-400 text-xs">
                  No credential contains this attribute
                </p>
              )}

              {matches.map(vc => (
                <button
                  key={vc.id}
                  onClick={() => handleSelect(field, vc)}
                  className={`w-full text-left px-3 py-2 mb-2 rounded border text-xs ${selection[field]?.id === vc.id
                      ? "border-emerald-500 text-emerald-400"
                      : "border-slate-700 text-slate-400"
                    }`}
                >
                  <div className="font-semibold">
                    {vc.credentialSubject?.idType}
                  </div>
                  {/* <div className="text-[10px] opacity-70">
                    {vc.credentialSubject?.fullName}
                  </div> */}
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
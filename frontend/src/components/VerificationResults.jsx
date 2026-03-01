import React, { useEffect, useState } from "react";

const VerificationResults = ({ requestId, onExpired }) => {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("waiting");

  useEffect(() => {
    // ✅ Do nothing if no request yet
    if (!requestId) return;

    let interval;

    const pollStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/request-status?id=${requestId}`
        );
        const data = await res.json();
        console.log("Data",data);

        setResults(data.verifiedUsers || []);
        setStatus(data.status);

        if (data.status === "expired") {
          clearInterval(interval);
          if (onExpired) onExpired();
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    // Call immediately once
    pollStatus();

    // Then start polling
    interval = setInterval(pollStatus, 3000);

    return () => clearInterval(interval);
  }, [requestId, onExpired]);

  // ✅ If requestId is null (initial render)
  if (!requestId) {
    return (
      <div className="mt-8 bg-[#0B101B] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4">
          Verified Users (0)
        </h3>
        <p className="text-slate-500 text-sm">
          No active verification request yet.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-[#0B101B] border border-slate-800 rounded-2xl p-6">
      <h3 className="text-white font-bold mb-4">
        Verified Users ({results.length})
      </h3>

      {status === "waiting" && results.length === 0 && (
        <p className="text-slate-400 text-sm mb-4">
          Waiting for users to verify...
        </p>
      )}

      {results.map((user, index) => (
        <div
          key={index}
          className="bg-slate-900 p-3 rounded-xl mb-2 border border-slate-700"
        >
          <p className="text-emerald-400 font-mono text-xs">
            {`${user.subjectId.substring(0, 5)}...${user.subjectId.substring(user.subjectId.length - 5)}`}
          </p>
          <p className="text-slate-400 text-[10px]">
            Verified at: {new Date(user.timestamp).toLocaleTimeString()}
          </p>
        </div>
      ))}

      {status === "expired" && (
        <p className="text-red-400 text-sm mt-4">
          Verification request expired
        </p>
      )}
    </div>
  );
};

export default VerificationResults;
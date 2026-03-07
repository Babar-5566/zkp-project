import React, { useEffect, useState, useMemo } from "react";

const VerificationResults = ({ requestId, onExpired }) => {
  const [results, setResults] = useState([]);
  const [failedResults, setFailedResults] = useState([]);
  const [status, setStatus] = useState("waiting");
  const [searchQuery, setSearchQuery] = useState("");

  // 🔄 Polling
  useEffect(() => {
    if (!requestId) return;

    let interval;

    const pollStatus = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/request-status?id=${requestId}`
        );
        const data = await res.json();

        // console.log(`📡 [Poll] request-status for ${requestId}:`, data);

        // ✅ Verified users — newest first
        const users = data.verifiedUsers || [];
        const sorted = [...users].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setResults(sorted);

        // ❌ Failed users — newest first
        const failed = data.failedUsers || [];
        const sortedF = [...failed].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setFailedResults(sortedF);

        setStatus(data.status);

        if (data.status === "expired") {
          clearInterval(interval);
          if (onExpired) onExpired();
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    };

    pollStatus();
    interval = setInterval(pollStatus, 3000);

    return () => clearInterval(interval);
  }, [requestId, onExpired]);

  // ✅ Derived filtered results (no extra state/effect timing issues)
  const displayedResults = useMemo(() => {
    if (!searchQuery.trim()) return results;
    const q = searchQuery.toLowerCase();
    return results.filter((user) =>
      user.subjectId.toLowerCase().includes(q)
    );
  }, [searchQuery, results]);

  const displayedFailed = useMemo(() => {
    if (!searchQuery.trim()) return failedResults;
    const q = searchQuery.toLowerCase();
    return failedResults.filter((user) =>
      user.subjectId.toLowerCase().includes(q)
    );
  }, [searchQuery, failedResults]);

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

  const truncateId = (id) =>
    `${id.substring(0, 5)}...${id.substring(id.length - 5)}`;

  return (
    <div className="mt-8 bg-[#0B101B] border border-slate-800 rounded-2xl p-6">

      {/* ✅ COUNTS */}
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-white font-bold">
          Verified ({results.length})
        </h3>
        {failedResults.length > 0 && (
          <span className="text-red-400 font-bold text-sm">
            · Failed ({failedResults.length})
          </span>
        )}
      </div>

      {/* 🔍 SEARCH INPUT */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Subject ID..."
          className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm"
        />
      </div>

      {status !== "expired" && results.length === 0 && failedResults.length === 0 && (
        <p className="text-slate-400 text-sm mb-4">
          Waiting for users to verify...
        </p>
      )}

      {/* ✅ VERIFIED USERS */}
      {displayedResults.map((user, index) => {
        const isMatched =
          searchQuery &&
          user.subjectId.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={`verified-${index}`}
            className={`p-3 rounded-xl mb-2 border ${isMatched
                ? "bg-orange-900/40 border-orange-500"
                : "bg-slate-900 border-slate-700"
              }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-emerald-400 font-mono text-xs">
                {truncateId(user.subjectId)}
              </p>
              <span className="text-[8px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded">
                Verified
              </span>
            </div>
            <p className="text-slate-400 text-[10px]">
              Verified at: {new Date(user.timestamp).toLocaleTimeString()}
            </p>

            {/* Revealed Attributes */}
            {user.revealedAttributes && Object.keys(user.revealedAttributes).length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-800">
                <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">
                  Revealed Attributes
                </p>
                {Object.entries(user.revealedAttributes).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-[10px]">
                    <span className="text-slate-400">{key}</span>
                    <span className="text-white font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* ❌ FAILED USERS */}
      {displayedFailed.map((user, index) => {
        const isMatched =
          searchQuery &&
          user.subjectId.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={`failed-${index}`}
            className={`p-3 rounded-xl mb-2 border ${isMatched
                ? "bg-orange-900/40 border-orange-500"
                : "bg-red-950/40 border-red-500/30"
              }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-red-400 font-mono text-xs">
                {truncateId(user.subjectId)}
              </p>
              <span className="text-[8px] font-black uppercase tracking-widest bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                Failed
              </span>
            </div>
            <p className="text-slate-400 text-[10px]">
              Failed at: {new Date(user.timestamp).toLocaleTimeString()}
            </p>
            <p className="text-red-300/70 text-[9px] mt-1 italic">
              Reason: {user.reason}
            </p>
          </div>
        );
      })}

      {status === "expired" && (
        <p className="text-red-400 text-sm mt-4">
          Verification request expired
        </p>
      )}
    </div>
  );
};

export default VerificationResults;
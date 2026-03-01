import React, { useEffect, useState } from "react";

const VerificationResults = ({ requestId, onExpired }) => {
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("waiting");

  const [searchQuery, setSearchQuery] = useState("");
  const [sortedResults, setSortedResults] = useState([]);

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

        const users = data.verifiedUsers || [];

        // ✅ Always keep newest on top
        const sorted = [...users].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        setResults(sorted);
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

  // ✅ SEARCH LOGIC INSIDE useEffect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSortedResults(results);
      return;
    }

    const q = searchQuery.toLowerCase();

    const matched = results.filter((user) =>
      user.subjectId.toLowerCase().includes(q)
    );

    // 🔥 Final list:
    // 1. matched users at top
    // 2. original list below unchanged
    setSortedResults([...matched, ...results]);

  }, [searchQuery, results]);

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
      
      {/* ✅ COUNT SHOULD BE TOTAL, NOT FILTERED */}
      <h3 className="text-white font-bold mb-4">
        Verified Users ({results.length})
      </h3>

      {/* 🔍 SEARCH INPUT (AUTO RUN) */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Subject ID..."
          className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm"
        />
      </div>

      {status === "waiting" && results.length === 0 && (
        <p className="text-slate-400 text-sm mb-4">
          Waiting for users to verify...
        </p>
      )}

      {sortedResults.map((user, index) => {

        const isMatched =
          searchQuery &&
          user.subjectId.toLowerCase().includes(searchQuery.toLowerCase());

        return (
          <div
            key={index}
            className={`p-3 rounded-xl mb-2 border ${
              isMatched
                ? "bg-orange-900/40 border-orange-500"   // 🔥 Highlighted
                : "bg-slate-900 border-slate-700"        // Normal
            }`}
          >
            <p className="text-emerald-400 font-mono text-xs">
              {`${user.subjectId.substring(0, 5)}...${user.subjectId.substring(
                user.subjectId.length - 5
              )}`}
            </p>
            <p className="text-slate-400 text-[10px]">
              Verified at: {new Date(user.timestamp).toLocaleTimeString()}
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
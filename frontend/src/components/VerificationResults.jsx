import React, { useEffect, useState, useMemo } from "react";

const VerificationResults = ({ requestId, onExpired }) => {
  const [results, setResults] = useState([]);
  const [failedResults, setFailedResults] = useState([]);
  const [status, setStatus] = useState("waiting");

  // Toggle: null = main view, "verified" or "failed" = specific view
  const [activeView, setActiveView] = useState(null);

  // Per-view search (resets when switching views)
  const [searchQuery, setSearchQuery] = useState("");

  // Reset search when switching views
  const switchView = (view) => {
    setActiveView(view);
    setSearchQuery("");
  };

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

  // ✅ SEARCH LOGIC — compute matched items for the active list
  const hasSearch = searchQuery.trim().length > 0;

  const activeList = activeView === "verified" ? results : failedResults;

  const matchedItems = useMemo(() => {
    if (!hasSearch) return [];
    const q = searchQuery.toLowerCase();
    return activeList.filter((user) =>
      user.subjectId.toLowerCase().includes(q)
    );
  }, [searchQuery, activeList, hasSearch]);

  // ── No request yet ──
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

  // ── Render a single verified user card ──
  const renderVerifiedCard = (user, index, keyPrefix, highlighted) => (
    <div
      key={`${keyPrefix}-${index}`}
      className={`p-3 rounded-xl mb-2 ${highlighted ? "" : "border bg-slate-900 border-slate-700"}`}
      style={highlighted ? { border: "2px solid #00e676", background: "rgba(0, 230, 118, 0.1)" } : undefined}
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

  // ── Render a single failed user card ──
  const renderFailedCard = (user, index, keyPrefix, highlighted) => (
    <div
      key={`${keyPrefix}-${index}`}
      className={`p-3 rounded-xl mb-2 ${highlighted ? "" : "border bg-red-950/40 border-red-500/30"}`}
      style={highlighted ? { border: "2px solid #00e676", background: "rgba(0, 230, 118, 0.1)" } : undefined}
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

  // ── Main view: two toggle buttons ──
  if (activeView === null) {
    return (
      <div className="mt-8 bg-[#0B101B] border border-slate-800 rounded-2xl p-6">

        {/* ✅ COUNTS */}
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-white font-bold">
            Verification Results
          </h3>
        </div>

        {status === "waiting" && results.length === 0 && failedResults.length === 0 && (
          <p className="text-slate-400 text-sm mb-4">
            Waiting for users to verify...
          </p>
        )}

        <div className="flex gap-4">
          {/* Verified User List Button */}
          <button
            onClick={() => switchView("verified")}
            className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-[3px] transition-all border"
            style={{
              background: results.length > 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(30, 41, 59, 0.5)",
              borderColor: results.length > 0 ? "rgba(16, 185, 129, 0.4)" : "rgba(51, 65, 85, 1)",
              color: results.length > 0 ? "#34d399" : "#64748b"
            }}
          >
            ✅ Verified Users ({results.length})
          </button>

          {/* Failed User List Button */}
          <button
            onClick={() => switchView("failed")}
            className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-[3px] transition-all border"
            style={{
              background: failedResults.length > 0 ? "rgba(239, 68, 68, 0.1)" : "rgba(30, 41, 59, 0.5)",
              borderColor: failedResults.length > 0 ? "rgba(239, 68, 68, 0.4)" : "rgba(51, 65, 85, 1)",
              color: failedResults.length > 0 ? "#f87171" : "#64748b"
            }}
          >
            ❌ Failed Users ({failedResults.length})
          </button>
        </div>

        {status === "expired" && (
          <p className="text-red-400 text-sm mt-4">
            Verification request expired
          </p>
        )}
      </div>
    );
  }

  // ── Specific view: Verified or Failed ──
  const isVerifiedView = activeView === "verified";
  const listData = isVerifiedView ? results : failedResults;
  const renderCard = isVerifiedView ? renderVerifiedCard : renderFailedCard;
  const viewTitle = isVerifiedView
    ? `Verified Users (${results.length})`
    : `Failed Users (${failedResults.length})`;

  return (
    <div className="mt-8 bg-[#0B101B] border border-slate-800 rounded-2xl p-6">

      {/* Header with back button */}
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => switchView(null)}
          className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-500 transition-all text-xs"
        >
          ←
        </button>
        <h3 className="text-white font-bold">
          {viewTitle}
        </h3>
      </div>

      {/* 🔍 Internal search bar */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search by Subject ID...`}
          className="w-full bg-slate-800 text-white rounded px-3 py-2 text-sm"
        />
      </div>

      {listData.length === 0 && (
        <p className="text-slate-400 text-sm mb-4">
          No {isVerifiedView ? "verified" : "failed"} users yet.
        </p>
      )}

      {/* 📌 Pinned matched results at top */}
      {hasSearch && matchedItems.length > 0 && (
        <>
          {matchedItems.map((user, index) =>
            renderCard(user, index, "pinned", true)
          )}
          <hr style={{ margin: "15px 0", borderColor: "#444" }} />
        </>
      )}

      {/* Full original list */}
      {listData.map((user, index) => {
        const isMatched =
          hasSearch &&
          user.subjectId.toLowerCase().includes(searchQuery.toLowerCase());

        return renderCard(user, index, activeView, isMatched);
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
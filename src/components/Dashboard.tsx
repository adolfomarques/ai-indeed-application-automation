"use client";
import { useMemo, useState } from "react";
import type { Job, PipelineState } from "@/lib/store";

interface Props {
  jobs: Job[];
  pipeline: PipelineState;
  onNavigate: (page: "dashboard" | "jobs" | "pipeline" | "schedules" | "settings") => void;
  onRunPipeline: () => void;
}

// Glowing Concentric Radial Meter Component (matches image exactly)
function RadialMatchMeter({ percentage }: { percentage: number }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="cockpit-radial-gauge">
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={`radialGrad-${percentage}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#c084fc" />
          </linearGradient>
          <filter id="radialGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer subtle ring */}
        <circle
          cx="48"
          cy="48"
          r="42"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1.5"
        />

        {/* Inner track */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(99, 102, 241, 0.15)"
          strokeWidth="5"
        />

        {/* Active glowing progress ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={`url(#radialGrad-${percentage})`}
          strokeWidth="5.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#radialGlow)"
        />
      </svg>

      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="cockpit-radial-score-val">{percentage}% Match</span>
        <span className="cockpit-radial-score-sub">AI-Powered</span>
      </div>
    </div>
  );
}

export default function Dashboard({ jobs, pipeline, onNavigate, onRunPipeline }: Props) {
  const [showLogs, setShowLogs] = useState(false);

  const matchedJobs = useMemo(() => jobs.filter((j) => j.aiMatch), [jobs]);
  const appliedJobs = useMemo(() => jobs.filter((j) => j.applicationStatus === "applied"), [jobs]);
  const isRunning = pipeline.status !== "idle" && pipeline.status !== "completed" && pipeline.status !== "error";

  // Site counts for the left column
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = { linkedin: 0, indeed: 0, glassdoor: 0, zip_recruiter: 0 };
    jobs.forEach((j) => {
      const s = (j.site || "indeed").toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Demo card fallback data matching the mockup screenshot
  const displayCards = useMemo(() => {
    if (matchedJobs.length >= 4) {
      return matchedJobs.slice(0, 4).map((j, idx) => ({
        id: j.id || String(idx),
        title: j.title,
        company: j.company || "Leading Tech Co",
        location: j.location || "Remote",
        matchPct: j.aiScore ? Math.round(j.aiScore * 10) : 95 - idx * 2,
        logoBg: idx === 0 ? "#4f46e5" : idx === 1 ? "#ec4899" : idx === 2 ? "#db2777" : "#0284c7",
        logoLetter: (j.company || "T")[0].toUpperCase(),
        tags: [j.jobType || "Full-time", "AI-Verified"],
        salary: j.minAmount && j.maxAmount ? `${j.currency || '$'}${j.minAmount.toLocaleString()} - ${j.currency || '$'}${j.maxAmount.toLocaleString()}` : "Competitive Salary",
        highlighted: idx === 0,
      }));
    }

    // Default high-fidelity roles (matching screenshot)
    return [
      {
        id: "mock-1",
        title: "Senior Full-Stack Engineer",
        company: "Vortex Dynamics",
        location: "Remote/NY",
        matchPct: 98,
        logoBg: "linear-gradient(135deg, #4f46e5, #6366f1)",
        logoLetter: "V",
        tags: ["React, Node.js", "Hybrid"],
        salary: "Competitive Salary",
        highlighted: true,
      },
      {
        id: "mock-2",
        title: "Lead Product Designer",
        company: "Vortex Dynamics",
        location: "Remote/NY",
        matchPct: 96,
        logoBg: "linear-gradient(135deg, #ec4899, #f43f5e)",
        logoLetter: "⬡",
        tags: ["design, UX", "Hybrid"],
        salary: "Competitive Salary",
        highlighted: false,
      },
      {
        id: "mock-3",
        title: "Lead Product Designer",
        company: "Vortex Dynamics",
        location: "Remote/NY",
        matchPct: 96,
        logoBg: "linear-gradient(135deg, #a855f7, #ec4899)",
        logoLetter: "⬡",
        tags: ["React, Node.js", "Hybrid"],
        salary: "Competitive Salary",
        highlighted: false,
      },
      {
        id: "mock-4",
        title: "Data Scientist",
        company: "Vortex Dynamics",
        location: "Remote/NY",
        matchPct: 94,
        logoBg: "linear-gradient(135deg, #3b82f6, #06b6d4)",
        logoLetter: "🐍",
        tags: ["design", "AI", "Python"],
        salary: "Competitive Salary",
        highlighted: false,
      },
    ];
  }, [matchedJobs]);

  const totalTracked = jobs.length > 0 ? jobs.length : 1429;
  const totalMatches = matchedJobs.length > 0 ? matchedJobs.length : 48;
  const totalApplications = appliedJobs.length > 0 ? appliedJobs.length : 248;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 3-Column Cockpit Layout (Image Consistency) */}
      <div className="cockpit-grid">
        {/* ── Column 1: Automation Pipeline ── */}
        <div className="cockpit-card">
          <div className="cockpit-card-title">
            <span>Automation Pipeline</span>
          </div>

          <div className="cockpit-pipeline-status-row">
            <div className="cockpit-status-pill">
              <span className="lp-hero-badge-dot" />
              <span>Pipeline: {isRunning ? "ACTIVE" : "ACTIVE"}</span>
            </div>
            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className="cockpit-icon-btn"
              title="Run Automation Pipeline"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>
          </div>

          <div style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "4px" }}>
            Currently Searching:
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
            8 Job Boards
          </div>

          {/* Job Boards List */}
          <div className="cockpit-boards-list">
            <div className="cockpit-board-row" onClick={() => onNavigate("jobs")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: "14px" }}>in</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>LinkedIn</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{siteCounts.linkedin || 412} &gt;</span>
            </div>

            <div className="cockpit-board-row" onClick={() => onNavigate("jobs")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#60a5fa", fontWeight: 800, fontSize: "14px" }}>i</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Indeed</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{siteCounts.indeed || 645} &gt;</span>
            </div>

            <div className="cockpit-board-row" onClick={() => onNavigate("jobs")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "#4ade80", fontWeight: 800, fontSize: "14px" }}>D</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>Glassdoor</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>{siteCounts.glassdoor || 284} &gt;</span>
            </div>

            <div className="cockpit-board-row" onClick={() => onNavigate("jobs")}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 800, fontSize: "14px" }}>•••</span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "rgba(226, 232, 240, 0.7)" }}>etc...</span>
              </div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>88 &gt;</span>
            </div>
          </div>

          {/* Lower Stats Widget */}
          <div className="cockpit-stat-widget">
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Jobs Tracked:</div>
            <div className="cockpit-big-metric">{totalTracked.toLocaleString()}</div>

            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Matches Found:</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "12px" }}>
              {totalMatches}
            </div>

            {/* Sparkline wave */}
            <div style={{ position: "relative", width: "100%", height: "54px" }}>
              <svg viewBox="0 0 240 60" style={{ width: "100%", height: "100%" }}>
                <path
                  d="M 0 45 Q 60 50, 100 35 T 180 20 T 240 10"
                  fill="none"
                  stroke="#818cf8"
                  strokeWidth="2.5"
                />
                <circle cx="180" cy="20" r="4" fill="#ffffff" />
                <circle cx="180" cy="20" r="8" fill="rgba(99, 102, 241, 0.4)" />
              </svg>
              <div style={{ position: "absolute", bottom: "4px", right: "0" }}>
                <button
                  onClick={onRunPipeline}
                  className="cockpit-icon-btn"
                  style={{ width: "32px", height: "32px" }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Real-time Match Toast Pill (matching screenshot) */}
            <div
              style={{
                marginTop: "16px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 14px",
                borderRadius: "9999px",
                background: "rgba(10, 15, 26, 0.85)",
                border: "1px solid rgba(255, 255, 255, 0.12)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
                fontSize: "12px",
                backdropFilter: "blur(12px)",
                width: "100%",
              }}
            >
              <span style={{ color: "#4ade80", fontSize: "10px" }}>●</span>
              <span style={{ color: "#4ade80", fontWeight: 700 }}>98% Fit</span>
              <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
              <span style={{ fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Senior Full-Stack Engineer
              </span>
            </div>
          </div>
        </div>

        {/* ── Column 2: AI-Matched Tech Jobs (2x2 Grid) ── */}
        <div className="cockpit-card">
          <div className="cockpit-card-title">
            <span>AI-Matched Tech Jobs</span>
            <button
              onClick={() => onNavigate("jobs")}
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--accent-primary)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              Show more &gt;
            </button>
          </div>

          <div className="cockpit-jobs-grid">
            {displayCards.map((card) => (
              <div
                key={card.id}
                className={`cockpit-job-tile ${card.highlighted ? "highlighted" : ""}`}
              >
                <div>
                  <div className="cockpit-tile-top">
                    <div
                      className="cockpit-tile-logo"
                      style={{ background: card.logoBg, color: "#ffffff" }}
                    >
                      {card.logoLetter}
                    </div>
                    <button style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "16px" }}>
                      ⋮
                    </button>
                  </div>

                  <div className="cockpit-tile-title">{card.title}</div>
                  <div className="cockpit-tile-sub">
                    Company: {card.company}<br />
                    Location: {card.location}
                  </div>
                </div>

                {/* Glowing Concentric Radial Meter */}
                <RadialMatchMeter percentage={card.matchPct} />

                {/* Tags Row */}
                <div className="cockpit-tags-row">
                  <span className="cockpit-tag ai-fit">● AI-Fit</span>
                  {card.tags.map((t) => (
                    <span key={t} className="cockpit-tag">{t}</span>
                  ))}
                  <span className="cockpit-tag">{card.salary}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Column 3: Analytics Performance ── */}
        <div>
          {/* Applications Sent */}
          <div className="cockpit-card cockpit-analytics-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Applications Sent</span>
              <span className="cockpit-metric-badge-green">↗ 32%</span>
            </div>
            <div style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.65)", marginBottom: "14px" }}>
              {totalApplications} applications this week
            </div>

            {/* Smooth Cyan-to-Violet Wave Chart */}
            <div style={{ width: "100%", height: "90px" }}>
              <svg viewBox="0 0 300 90" style={{ width: "100%", height: "100%", overflow: "visible" }}>
                <defs>
                  <linearGradient id="appSentGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="60%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#c084fc" />
                  </linearGradient>
                  <linearGradient id="appSentArea" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M 0 70 Q 50 30, 90 55 T 170 30 T 250 20 L 300 15 L 300 90 L 0 90 Z"
                  fill="url(#appSentArea)"
                />
                <path
                  d="M 0 70 Q 50 30, 90 55 T 170 30 T 250 20 L 300 15"
                  fill="none"
                  stroke="url(#appSentGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "var(--text-muted)", marginTop: "4px" }}>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>

          {/* Interview Rates */}
          <div className="cockpit-card cockpit-analytics-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Interview Rates</span>
              <span style={{ fontSize: "14px", color: "var(--text-muted)", cursor: "pointer" }}>•••</span>
            </div>

            {/* Glowing Vertical Histogram Bars */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", height: "80px", padding: "0 4px" }}>
              {[
                { m: "Jan", h: 20 },
                { m: "Feb", h: 32 },
                { m: "Mar", h: 45 },
                { m: "Apr", h: 58 },
                { m: "May", h: 50 },
                { m: "Jun", h: 70 },
                { m: "Nov", h: 82 },
                { m: "Dec", h: 95 },
              ].map((bar) => (
                <div key={bar.m} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <div
                    style={{
                      width: "12px",
                      height: `${bar.h * 0.7}px`,
                      borderRadius: "4px",
                      background: `linear-gradient(180deg, #38bdf8 0%, #818cf8 100%)`,
                      boxShadow: "0 0 8px rgba(56, 189, 248, 0.3)",
                    }}
                  />
                  <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>{bar.m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Applications */}
          <div className="cockpit-card cockpit-analytics-card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Recent Applications</span>
              <button
                onClick={() => onNavigate("jobs")}
                style={{ fontSize: "12px", color: "var(--accent-primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                See all
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { company: "Vortex Dynamics", stat: "248", time: "1.3 week", iconBg: "#6366f1", iconLetter: "V" },
                { company: "Vortex Dynamics", stat: "248", time: "1 week", iconBg: "#a855f7", iconLetter: "⬡" },
                { company: "Glassdoor Glassdoor", stat: "88", time: "1 week", iconBg: "#22c55e", iconLetter: "D" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "8px",
                        background: item.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#ffffff",
                      }}
                    >
                      {item.iconLetter}
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>{item.company}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12.5px", fontWeight: 700, color: "#4ade80" }}>{item.stat}</div>
                    <div style={{ fontSize: "10.5px", color: "var(--text-muted)" }}>{item.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action Tray & Real-Time Terminal ── */}
      <div style={{ maxWidth: "1600px", width: "100%", margin: "0 auto", padding: "0 28px 32px" }}>
        <div className="cockpit-controls-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button
              onClick={onRunPipeline}
              disabled={isRunning}
              className="lp-btn lp-btn-primary"
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              {isRunning ? "Pipeline Running..." : "Run Full Automation Pipeline"}
            </button>
            <button
              onClick={() => onNavigate("jobs")}
              className="lp-btn lp-btn-secondary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              View All Jobs ({jobs.length})
            </button>
            <button
              onClick={() => onNavigate("schedules")}
              className="lp-btn lp-btn-secondary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              Configure Schedules
            </button>
          </div>

          <button
            onClick={() => setShowLogs(!showLogs)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "transparent",
              border: "none",
              color: "var(--text-secondary)",
              fontSize: "12.5px",
              cursor: "pointer",
            }}
          >
            <span className="lp-hero-badge-dot" style={{ background: isRunning ? "#f59e0b" : "#22c55e" }} />
            <span>{showLogs ? "Hide System Terminal" : "Show System Terminal"}</span>
          </button>
        </div>

        {/* Live Logs Terminal Drawer */}
        {showLogs && (
          <div
            style={{
              marginTop: "12px",
              background: "rgba(10, 11, 20, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "16px 20px",
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "12px",
              color: "#a5b4fc",
              maxHeight: "180px",
              overflowY: "auto",
            }}
          >
            <div style={{ color: "#64748b", marginBottom: "8px" }}>─── System Logs ───</div>
            {pipeline.logs.length === 0 ? (
              <div style={{ color: "#64748b" }}>Pipeline idle. Click "Run Full Automation Pipeline" to trigger discovery.</div>
            ) : (
              pipeline.logs.map((l, i) => (
                <div key={i} style={{ marginBottom: "4px" }}>
                  <span style={{ color: "#64748b" }}>[{new Date(l.timestamp).toLocaleTimeString()}]</span> {l.message}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

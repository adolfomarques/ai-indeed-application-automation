"use client";
import { useMemo, useState } from "react";
import type { Job, PipelineState, Settings } from "@/lib/store";

interface Props {
  jobs: Job[];
  pipeline: PipelineState;
  settings?: Settings;
  onNavigate: (page: "dashboard" | "jobs" | "pipeline" | "schedules" | "settings") => void;
  onRunPipeline: () => void;
  onRunScrape?: () => void;
  onRunFilter?: () => void;
}

const SITE_META: Record<string, { label: string; color: string; prefix: string }> = {
  indeed: { label: "Indeed", color: "#60a5fa", prefix: "i" },
  linkedin: { label: "LinkedIn", color: "#38bdf8", prefix: "in" },
  glassdoor: { label: "Glassdoor", color: "#4ade80", prefix: "D" },
  zip_recruiter: { label: "ZipRecruiter", color: "#34d399", prefix: "Z" },
  google: { label: "Google Jobs", color: "#f87171", prefix: "G" },
  bayt: { label: "Bayt", color: "#fbbf24", prefix: "B" },
  naukri: { label: "Naukri", color: "#818cf8", prefix: "N" },
  bdjobs: { label: "BDJobs", color: "#2dd4bf", prefix: "BD" },
};

function getCompanyColor(name: string): string {
  const gradients = [
    "linear-gradient(135deg, #4f46e5, #6366f1)",
    "linear-gradient(135deg, #0284c7, #38bdf8)",
    "linear-gradient(135deg, #059669, #10b981)",
    "linear-gradient(135deg, #7c3aed, #a855f7)",
    "linear-gradient(135deg, #db2777, #f43f5e)",
    "linear-gradient(135deg, #d97706, #f59e0b)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

// Glowing Concentric Radial Meter Component
function RadialMatchMeter({ percentage, subtitle }: { percentage: number; subtitle?: string }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const safePct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (safePct / 100) * circumference;

  return (
    <div className="cockpit-radial-gauge">
      <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id={`radialGrad-${safePct}`} x1="0%" y1="0%" x2="100%" y2="100%">
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
        <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1.5" />

        {/* Inner track */}
        <circle cx="48" cy="48" r={radius} fill="none" stroke="rgba(99, 102, 241, 0.15)" strokeWidth="5" />

        {/* Active glowing progress ring */}
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke={`url(#radialGrad-${safePct})`}
          strokeWidth="5.5"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          filter="url(#radialGlow)"
        />
      </svg>

      <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center" }}>
        <span className="cockpit-radial-score-val">{safePct}%</span>
        <span className="cockpit-radial-score-sub">{subtitle || "Match"}</span>
      </div>
    </div>
  );
}

export default function Dashboard({
  jobs,
  pipeline,
  settings,
  onNavigate,
  onRunPipeline,
  onRunScrape,
  onRunFilter,
}: Props) {
  const [showLogs, setShowLogs] = useState(false);

  // 100% Real User State Calculations
  const matchedJobs = useMemo(() => jobs.filter((j) => j.aiMatch === true), [jobs]);
  const appliedJobs = useMemo(() => jobs.filter((j) => j.applicationStatus === "applied"), [jobs]);
  const screenedJobs = useMemo(() => jobs.filter((j) => j.aiScore !== undefined), [jobs]);
  const isRunning = pipeline.status !== "idle" && pipeline.status !== "completed" && pipeline.status !== "error";

  const totalTracked = jobs.length;
  const totalMatches = matchedJobs.length;
  const totalApplications = appliedJobs.length;

  // Real site counts from scraped jobs
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach((j) => {
      const s = (j.site || "indeed").toLowerCase();
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Real configured sites
  const configuredSites = useMemo(() => {
    const fromSettings = settings?.jobSites && settings.jobSites.length > 0 ? settings.jobSites : ["indeed"];
    const fromJobs = Object.keys(siteCounts);
    const set = new Set([...fromSettings, ...fromJobs]);
    return Array.from(set);
  }, [settings?.jobSites, siteCounts]);

  // Display real jobs (prioritizing AI matched jobs, then unscored jobs)
  const displayJobs = useMemo(() => {
    if (matchedJobs.length > 0) {
      return matchedJobs.slice(0, 4);
    }
    if (jobs.length > 0) {
      return jobs.slice(0, 4);
    }
    return [];
  }, [matchedJobs, jobs]);

  // Top match for pill
  const topJob = useMemo(() => {
    if (matchedJobs.length > 0) {
      return [...matchedJobs].sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0))[0];
    }
    return null;
  }, [matchedJobs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* 3-Column Cockpit Layout */}
      <div className="cockpit-grid">
        {/* ── Column 1: Automation Pipeline ── */}
        <div className="cockpit-card">
          <div className="cockpit-card-title">
            <span>Automation Pipeline</span>
          </div>

          <div className="cockpit-pipeline-status-row">
            <div
              className="cockpit-status-pill"
              style={{
                background: isRunning
                  ? "rgba(56, 189, 248, 0.12)"
                  : totalTracked > 0
                  ? "rgba(34, 197, 94, 0.12)"
                  : "rgba(148, 163, 184, 0.12)",
                borderColor: isRunning
                  ? "rgba(56, 189, 248, 0.3)"
                  : totalTracked > 0
                  ? "rgba(34, 197, 94, 0.25)"
                  : "rgba(148, 163, 184, 0.2)",
                color: isRunning ? "#38bdf8" : totalTracked > 0 ? "#4ade80" : "#94a3b8",
              }}
            >
              <span
                className="lp-hero-badge-dot"
                style={{
                  background: isRunning ? "#38bdf8" : totalTracked > 0 ? "#4ade80" : "#94a3b8",
                }}
              />
              <span>
                {pipeline.status === "scraping"
                  ? "SCRAPING ACTIVE"
                  : pipeline.status === "filtering"
                  ? "AI FILTER ACTIVE"
                  : pipeline.status === "applying"
                  ? "DISPATCHING"
                  : totalTracked > 0
                  ? "PIPELINE READY"
                  : "STANDBY"}
              </span>
            </div>

            <button
              onClick={onRunScrape || onRunPipeline}
              disabled={isRunning}
              className="cockpit-icon-btn"
              title="Run Job Scraper"
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
            {configuredSites.length} Job Board{configuredSites.length > 1 ? "s" : ""}
          </div>

          {/* Real Job Boards List */}
          <div className="cockpit-boards-list">
            {configuredSites.map((site) => {
              const meta = SITE_META[site.toLowerCase()] || {
                label: site.charAt(0).toUpperCase() + site.slice(1),
                color: "#818cf8",
                prefix: site.slice(0, 2).toUpperCase(),
              };
              const count = siteCounts[site.toLowerCase()] || 0;

              return (
                <div key={site} className="cockpit-board-row" onClick={() => onNavigate("jobs")}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: meta.color, fontWeight: 800, fontSize: "14px" }}>
                      {meta.prefix}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff" }}>
                      {meta.label}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: count > 0 ? "#e2e8f0" : "var(--text-muted)", fontWeight: count > 0 ? 700 : 500 }}>
                    {count.toLocaleString()} &gt;
                  </span>
                </div>
              );
            })}
          </div>

          {/* Lower Stats Widget */}
          <div className="cockpit-stat-widget">
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Jobs Tracked:</div>
            <div className="cockpit-big-metric">{totalTracked.toLocaleString()}</div>

            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Matches Found:</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#ffffff", marginBottom: "12px" }}>
              {totalMatches.toLocaleString()}
            </div>

            {/* Sparkline wave */}
            <div style={{ position: "relative", width: "100%", height: "54px" }}>
              <svg viewBox="0 0 240 60" style={{ width: "100%", height: "100%" }}>
                {totalTracked > 0 ? (
                  <>
                    <path
                      d="M 0 45 Q 60 50, 100 35 T 180 20 T 240 10"
                      fill="none"
                      stroke="#818cf8"
                      strokeWidth="2.5"
                    />
                    <circle cx="180" cy="20" r="4" fill="#ffffff" />
                    <circle cx="180" cy="20" r="8" fill="rgba(99, 102, 241, 0.4)" />
                  </>
                ) : (
                  <path
                    d="M 0 45 L 240 45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeDasharray="4 4"
                    strokeWidth="2"
                  />
                )}
              </svg>
              <div style={{ position: "absolute", bottom: "4px", right: "0" }}>
                <button
                  onClick={onRunScrape || onRunPipeline}
                  disabled={isRunning}
                  className="cockpit-icon-btn"
                  style={{ width: "32px", height: "32px" }}
                  title="Run Job Scraper"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Real-time Match Toast Pill */}
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
              {topJob ? (
                <>
                  <span style={{ color: "#4ade80", fontSize: "10px" }}>●</span>
                  <span style={{ color: "#4ade80", fontWeight: 700 }}>
                    {topJob.aiScore ? `${Math.round(topJob.aiScore * 10)}% Fit` : "AI Match"}
                  </span>
                  <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
                  <span style={{ fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {topJob.title}
                  </span>
                </>
              ) : totalTracked > 0 ? (
                <>
                  <span style={{ color: "#818cf8", fontSize: "10px" }}>●</span>
                  <span style={{ color: "#818cf8", fontWeight: 700 }}>{totalTracked} Scraped</span>
                  <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
                  <span style={{ color: "var(--text-secondary)" }}>AI Screening Ready</span>
                </>
              ) : (
                <>
                  <span style={{ color: "#94a3b8", fontSize: "10px" }}>●</span>
                  <span style={{ color: "#94a3b8", fontWeight: 600 }}>Pipeline Standby</span>
                  <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>•</span>
                  <span style={{ color: "var(--text-muted)" }}>0 Jobs Ingested</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Column 2: AI-Matched Tech Jobs (2x2 Grid) ── */}
        <div className="cockpit-card">
          <div className="cockpit-card-title">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span>AI-Matched Tech Jobs</span>
              {totalMatches > 0 && (
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px", background: "rgba(34, 197, 94, 0.15)", color: "#4ade80", border: "1px solid rgba(34, 197, 94, 0.3)" }}>
                  {totalMatches} Found
                </span>
              )}
            </div>
            {totalTracked > 0 && (
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
                View all ({totalTracked}) &gt;
              </button>
            )}
          </div>

          {/* Real Jobs Render / Empty State */}
          {displayJobs.length > 0 ? (
            <div className="cockpit-jobs-grid">
              {displayJobs.map((job, idx) => {
                const matchPct = job.aiScore !== undefined
                  ? Math.round(job.aiScore * 10)
                  : job.aiMatch
                  ? 90
                  : 50;
                const companyName = job.company || "Direct Employer";
                const logoColor = getCompanyColor(companyName);
                const salaryStr = job.minAmount && job.maxAmount
                  ? `${job.currency || '$'}${job.minAmount.toLocaleString()} - ${job.currency || '$'}${job.maxAmount.toLocaleString()}`
                  : (job.isRemote ? "Remote Eligible" : "Competitive Salary");

                return (
                  <div
                    key={job.id || idx}
                    className={`cockpit-job-tile ${idx === 0 && job.aiMatch ? "highlighted" : ""}`}
                    onClick={() => {
                      if (job.jobUrl) window.open(job.jobUrl, "_blank");
                      else onNavigate("jobs");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div>
                      <div className="cockpit-tile-top">
                        <div
                          className="cockpit-tile-logo"
                          style={{ background: logoColor, color: "#ffffff" }}
                        >
                          {companyName[0].toUpperCase()}
                        </div>
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            style={{ background: "transparent", border: "none", color: "var(--text-muted)", fontSize: "14px" }}
                            title="Open original job posting"
                          >
                            ↗
                          </a>
                        )}
                      </div>

                      <div className="cockpit-tile-title" style={{ overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                        {job.title}
                      </div>
                      <div className="cockpit-tile-sub">
                        Company: {companyName}<br />
                        Location: {job.location || (job.isRemote ? "Remote" : "Not Specified")}
                      </div>
                    </div>

                    {/* Glowing Concentric Radial Meter */}
                    <RadialMatchMeter
                      percentage={matchPct}
                      subtitle={job.aiScore !== undefined ? "AI-Powered" : "Screening Pending"}
                    />

                    {/* Tags Row */}
                    <div className="cockpit-tags-row">
                      {job.aiMatch ? (
                        <span className="cockpit-tag ai-fit">● AI-Fit</span>
                      ) : (
                        <span className="cockpit-tag" style={{ color: "#94a3b8" }}>
                          {job.aiScore !== undefined ? "Unmatched" : "Unscored"}
                        </span>
                      )}
                      {job.matchingSkills && job.matchingSkills.length > 0 ? (
                        job.matchingSkills.slice(0, 2).map((s) => (
                          <span key={s} className="cockpit-tag">{s}</span>
                        ))
                      ) : (
                        <>
                          {job.jobType && <span className="cockpit-tag">{job.jobType}</span>}
                          {job.site && <span className="cockpit-tag">{job.site.toUpperCase()}</span>}
                        </>
                      )}
                      <span className="cockpit-tag">{salaryStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Clean Empty State (When 0 real jobs exist) */
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "48px 24px",
                textAlign: "center",
                minHeight: "380px",
              }}
            >
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "16px",
                  background: "rgba(99, 102, 241, 0.12)",
                  border: "1px solid rgba(99, 102, 241, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "16px",
                  boxShadow: "0 0 20px rgba(99, 102, 241, 0.2)",
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>

              <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>
                No Real Jobs Ingested Yet
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "420px", lineHeight: 1.55, marginBottom: "24px" }}>
                Your database has 0 scraped records. Click below to start the multi-board scraper with your configured keywords ({settings?.searchTerms?.join(", ") || "General"}).
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                <button
                  onClick={onRunScrape || onRunPipeline}
                  disabled={isRunning}
                  className="lp-btn lp-btn-primary"
                  style={{ padding: "10px 20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                  Scrape Real Jobs Now
                </button>
                <button
                  onClick={() => onNavigate("settings")}
                  className="lp-btn lp-btn-secondary"
                  style={{ padding: "10px 18px", fontSize: "13px" }}
                >
                  Configure Search Criteria
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Column 3: Analytics Performance ── */}
        <div>
          {/* Applications Sent */}
          <div className="cockpit-card cockpit-analytics-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Applications Sent</span>
              {totalApplications > 0 ? (
                <span className="cockpit-metric-badge-green">● {totalApplications} Sent</span>
              ) : (
                <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "2px 8px", background: "rgba(255,255,255,0.05)", borderRadius: "6px" }}>
                  0 Sent
                </span>
              )}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(226, 232, 240, 0.65)", marginBottom: "14px" }}>
              {totalApplications} application{totalApplications !== 1 ? "s" : ""} submitted
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
                {totalApplications > 0 ? (
                  <>
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
                  </>
                ) : (
                  <path
                    d="M 0 75 L 300 75"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeDasharray="4 4"
                    strokeWidth="1.5"
                  />
                )}
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

          {/* Real Pipeline Throughput Funnel (Replacing fake Jan-Dec months) */}
          <div className="cockpit-card cockpit-analytics-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>Pipeline Funnel</span>
                <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Real Conversion Rates</span>
              </div>
              <button
                onClick={() => onNavigate("pipeline")}
                style={{ fontSize: "12px", color: "var(--accent-primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                Run Flow &gt;
              </button>
            </div>

            {/* Glowing Funnel Histogram Bars (Real Data) */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", height: "85px", padding: "0 4px" }}>
              {[
                { stage: "Scraped", count: totalTracked, color: "#60a5fa" },
                { stage: "Screened", count: screenedJobs.length, color: "#818cf8" },
                { stage: "Matched", count: totalMatches, color: "#c084fc" },
                { stage: "Applied", count: totalApplications, color: "#4ade80" },
              ].map((bar) => {
                const maxRef = Math.max(totalTracked, 1);
                const barHeight = totalTracked > 0 ? Math.max((bar.count / maxRef) * 60, 6) : 6;

                return (
                  <div key={bar.stage} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, color: bar.count > 0 ? "#ffffff" : "var(--text-muted)" }}>
                      {bar.count}
                    </span>
                    <div
                      style={{
                        width: "18px",
                        height: `${barHeight}px`,
                        borderRadius: "4px",
                        background: bar.count > 0 ? bar.color : "rgba(255, 255, 255, 0.1)",
                        boxShadow: bar.count > 0 ? `0 0 10px ${bar.color}40` : "none",
                        transition: "height 0.4s ease",
                      }}
                    />
                    <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{bar.stage}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Applications (Real Data) */}
          <div className="cockpit-card cockpit-analytics-card" style={{ marginBottom: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff" }}>
                {totalApplications > 0 ? "Recent Applications" : totalMatches > 0 ? "Top Matched Roles" : "Recent Activity"}
              </span>
              <button
                onClick={() => onNavigate("jobs")}
                style={{ fontSize: "12px", color: "var(--accent-primary)", background: "transparent", border: "none", cursor: "pointer", fontWeight: 600 }}
              >
                See all
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {totalApplications > 0 ? (
                appliedJobs.slice(0, 3).map((job, i) => {
                  const companyName = job.company || "Employer";
                  return (
                    <div key={job.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: getCompanyColor(companyName),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#ffffff",
                            flexShrink: 0,
                          }}
                        >
                          {companyName[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {companyName}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {job.title}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#4ade80" }}>Applied ✓</div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>{job.site || "Direct"}</div>
                      </div>
                    </div>
                  );
                })
              ) : totalMatches > 0 ? (
                matchedJobs.slice(0, 3).map((job, i) => {
                  const companyName = job.company || "Employer";
                  return (
                    <div key={job.id || i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div
                          style={{
                            width: "28px",
                            height: "28px",
                            borderRadius: "8px",
                            background: getCompanyColor(companyName),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            color: "#ffffff",
                            flexShrink: 0,
                          }}
                        >
                          {companyName[0].toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#ffffff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {companyName}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {job.title}
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 8 }}>
                        <div style={{ fontSize: "11.5px", fontWeight: 700, color: "#818cf8" }}>
                          {job.aiScore ? `${Math.round(job.aiScore * 10)}%` : "Match"}
                        </div>
                        <div style={{ fontSize: "10px", color: "var(--text-muted)" }}>Ready</div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: "16px 0", textAlign: "center", color: "var(--text-muted)", fontSize: "12.5px" }}>
                  No applications submitted yet.<br />
                  Processed roles will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Action Tray & Real-Time Terminal ── */}
      <div style={{ maxWidth: "1600px", width: "100%", margin: "0 auto", padding: "0 28px 32px" }}>
        <div className="cockpit-controls-bar">
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
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
              View All Jobs ({totalTracked})
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

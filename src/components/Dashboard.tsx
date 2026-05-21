"use client";
import { useMemo } from "react";
import type { Job, PipelineState } from "@/lib/store";

interface Props {
  jobs: Job[];
  pipeline: PipelineState;
  onNavigate: (page: "dashboard" | "jobs" | "pipeline" | "settings") => void;
  onRunPipeline: () => void;
}

const SITE_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  indeed:        { bg: 'rgba(37, 87, 167, 0.15)',  color: '#6b9fff', label: 'Indeed' },
  linkedin:      { bg: 'rgba(0, 119, 181, 0.15)',   color: '#5bb8f5', label: 'LinkedIn' },
  glassdoor:     { bg: 'rgba(12, 170, 65, 0.15)',   color: '#6ee7a0', label: 'Glassdoor' },
  google:        { bg: 'rgba(234, 67, 53, 0.12)',   color: '#f9a8a0', label: 'Google' },
  zip_recruiter: { bg: 'rgba(93, 187, 99, 0.15)',   color: '#78d97f', label: 'ZipRecruiter' },
  bayt:          { bg: 'rgba(245, 158, 11, 0.15)',  color: '#fcd34d', label: 'Bayt' },
  naukri:        { bg: 'rgba(66, 133, 244, 0.15)',  color: '#93b8fd', label: 'Naukri' },
  bdjobs:        { bg: 'rgba(0, 106, 78, 0.15)',    color: '#6ee7c0', label: 'BDJobs' },
};

const Sparkline = ({ color }: { color: string }) => (
  <div className="sparkline-container">
    <svg width="100%" height="100%" viewBox="0 0 100 60" preserveAspectRatio="none">
      <path 
        d="M 0 50 Q 15 45 25 30 T 40 35 T 55 15 T 75 25 T 100 10" 
        className="sparkline-path" 
        stroke={color}
      />
      <path 
        d="M 0 50 Q 15 45 25 30 T 40 35 T 55 15 T 75 25 T 100 10 V 60 H 0 Z" 
        fill={`url(#grad-${color.replace('#', '')})`}
        style={{ opacity: 0.1 }}
      />
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
    </svg>
  </div>
);

const Icons = {
  scraped: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>,
  matched: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10H12V2z"></path><path d="M12 12L2.1 12.1"></path><path d="M12 12l9.9-0.1"></path><path d="M12 2a10 10 0 0 1 10 10"></path></svg>,
  applied: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
  status: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
};

export default function Dashboard({ jobs, pipeline, onNavigate, onRunPipeline }: Props) {
  const matched = jobs.filter((j) => j.aiMatch).length;
  const applied = jobs.filter((j) => j.applicationStatus === "applied").length;
  const isRunning = pipeline.status !== "idle" && pipeline.status !== "completed" && pipeline.status !== "error";

  const stats = [
    { id: 'scraped', icon: Icons.scraped, value: jobs.length, label: "Jobs Scraped", color: "var(--accent-primary)" },
    { id: 'matched', icon: Icons.matched, value: matched, label: "AI Matched", color: "var(--accent-secondary)" },
    { id: 'applied', icon: Icons.applied, value: applied, label: "Applied", color: "var(--success)" },
    { id: 'status', icon: Icons.status, value: pipeline.status === "completed" ? "Done" : pipeline.status === "idle" ? "Ready" : "Active", label: "Pipeline", color: "var(--warning)" },
  ];

  const recentLogs = pipeline.logs.slice(-5);

  // Site breakdown
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      const s = j.site || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  const siteEntries = Object.entries(siteCounts).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div key={s.id} className="stat-card" style={{ 
              background: `linear-gradient(135deg, rgba(0,0,0,0.3), rgba(0,0,0,0.1))`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 60, opacity: 0.15 }}>
                <Sparkline color={s.color} />
              </div>
              <div className="stat-icon" style={{ 
                color: s.color, 
                background: `${s.color}15`,
                border: `1px solid ${s.color}30`,
                width: 44, height: 44, borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{s.icon}</div>
              <div className="stat-value" style={{ 
                fontSize: 32, fontWeight: 800, 
                background: `linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)`,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{s.value}</div>
              <div className="stat-label" style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ 
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, 
                background: 'rgba(255,255,255,0.05)' 
              }}>
                <div style={{ 
                  width: s.id === 'status' ? (pipeline.status === 'completed' ? '100%' : pipeline.status === 'idle' ? '20%' : '60%') : '100%', 
                  height: '100%', 
                  background: s.color,
                  borderRadius: '0 3px 3px 0',
                  transition: 'width 0.5s ease'
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Quota & Warning */}
        {pipeline.quotaExceeded && (
          <div className="apple-card animate-in" style={{ background: "rgba(239, 68, 68, 0.06)", border: '1px solid rgba(239,68,68,0.25)', marginBottom: 24 }}>
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ fontSize: 24 }}>⚠️</div>
              <div>
                <h4 style={{ color: "#fff", fontWeight: 700 }}>Heuristic Engine Throttled</h4>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 4 }}>
                  You have hit the free tier rate limit. The system will automatically retry in 60 seconds. 
                  Consider decreasing your **Batch Size** in Settings to save tokens.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Site Breakdown + Quick Actions */}
        <div className="grid-2" style={{ marginBottom: 24 }}>
          {/* Site Breakdown */}
          <div className="apple-card animate-in" style={{ animationDelay: "0.4s", background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(139,92,246,0.02))' }}>
            <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Scraping Intelligence</h3>
              </div>
              <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("jobs")} style={{ padding: '6px 14px', fontSize: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: 'var(--accent-primary)' }}>
                DETAILS
              </button>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              {siteEntries.length === 0 ? (
                <div style={{ padding: '24px 0', textAlign: 'center' }}>
                  <div style={{ 
                    width: 64, height: 64, borderRadius: 16, 
                    background: 'rgba(99,102,241,0.08)', border: '1px solid var(--border-glass)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 220, margin: '0 auto' }}>
                    No jobs scraped yet. Run the pipeline to start.
                  </p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {siteEntries.map(([site, count]) => {
                    const config = SITE_COLORS[site] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', label: site };
                    const pct = Math.round((count / jobs.length) * 100);
                    return (
                      <div key={site} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ 
                          width: 36, height: 36, borderRadius: 10, 
                          background: config.bg, border: `1px solid ${config.color}30`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16
                        }}>
                          {site.slice(0,2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{config.label}</span>
                            <span style={{ fontSize: 12, fontWeight: 700, color: config.color }}>{count} <span style={{ opacity: 0.5, fontWeight: 400 }}>({pct}%)</span></span>
                          </div>
                          <div style={{
                            flex: 1,
                            height: 8,
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: 4,
                            overflow: 'hidden',
                          }}>
                            <div style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                              borderRadius: 4,
                              boxShadow: `0 0 12px ${config.color}40`,
                              transition: 'width 0.8s var(--ease-liquid)',
                            }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="apple-card animate-in" style={{ animationDelay: "0.5s", background: 'linear-gradient(135deg, rgba(16,185,129,0.03), rgba(59,130,246,0.02))' }}>
            <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Flow Evolution</h3>
              </div>
              <span style={{ 
                fontSize: 11, fontWeight: 700, padding: '6px 12px', borderRadius: 20,
                background: pipeline.status === 'completed' ? 'rgba(16,185,129,0.15)' : pipeline.status === 'idle' ? 'rgba(255,255,255,0.05)' : 'rgba(245,158,11,0.15)',
                color: pipeline.status === 'completed' ? 'var(--success)' : pipeline.status === 'idle' ? 'var(--text-muted)' : 'var(--warning)',
                border: `1px solid ${pipeline.status === 'completed' ? 'rgba(16,185,129,0.2)' : pipeline.status === 'idle' ? 'var(--border-glass)' : 'rgba(245,158,11,0.2)'}`
              }}>
                {pipeline.status === 'completed' ? '✓ COMPLETE' : pipeline.status === 'idle' ? '○ READY' : '● ACTIVE'}
              </span>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, fontSize: 11 }}>
                  <span style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>System Progress</span>
                  <span style={{ fontWeight: 800, color: 'var(--accent-primary)', fontSize: 14 }}>{pipeline.progress}%</span>
                </div>
                <div className="progress-bar" style={{ 
                  height: 10, borderRadius: 5, 
                  background: 'rgba(255,255,255,0.05)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  <div className="fill" style={{ 
                    width: `${pipeline.progress}%`,
                    background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                    boxShadow: '0 0 16px rgba(99,102,241,0.4)',
                    borderRadius: 5
                  }} />
                </div>
              </div>
              <div className="step-indicators">
                {[
                  { step: "Scrape", icon: "🔍", key: 1 },
                  { step: "Filter", icon: "🤖", key: 2 },
                  { step: "Apply", icon: "📝", key: 3 },
                  { step: "Done", icon: "✅", key: 4 }
                ].map((item) => {
                  const isCompleted = pipeline.currentStep > item.key;
                  const isActive = pipeline.currentStep === item.key;
                  return (
                    <div
                      key={item.step}
                      style={{
                        flex: 1,
                        minWidth: 80,
                        padding: '12px 16px',
                        borderRadius: 12,
                        background: isCompleted ? 'rgba(16,185,129,0.1)' : isActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${isCompleted ? 'rgba(16,185,129,0.3)' : isActive ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                        display: 'flex', alignItems: 'center', gap: 10,
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <div>
                        <span style={{ 
                          fontSize: 12, fontWeight: 700, 
                          color: isCompleted ? 'var(--success)' : isActive ? 'var(--accent-primary)' : 'var(--text-muted)'
                        }}>
                          {isCompleted ? '✓' : isActive ? '●' : '○'}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)', marginLeft: 4 }}>{item.step.toUpperCase()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* AI Quota Monitor */}
        <div className="apple-card animate-in" style={{ animationDelay: "0.55s", marginBottom: 24, background: 'linear-gradient(135deg, rgba(245,158,11,0.03), rgba(239,68,68,0.02))' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Quantum Quota Monitor</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ 
                width: 10, height: 10, borderRadius: '50%', 
                background: pipeline.aiUsageInSession > 1000 ? 'var(--danger)' : pipeline.aiUsageInSession > 500 ? 'var(--warning)' : 'var(--success)',
                boxShadow: `0 0 8px ${pipeline.aiUsageInSession > 1000 ? 'var(--danger)' : pipeline.aiUsageInSession > 500 ? 'var(--warning)' : 'var(--success)'}`
              }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                {pipeline.aiUsageInSession > 1000 ? 'CRITICAL' : pipeline.aiUsageInSession > 500 ? 'MODERATE' : 'HEALTHY'}
              </span>
            </div>
          </div>
          <div className="card-body" style={{ padding: '24px' }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, fontSize: 11 }}>
                <span style={{ color: "var(--text-muted)", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Neural Calls Remaining</span>
                <span style={{ fontWeight: 800, fontSize: 16 }}>{1500 - pipeline.aiUsageInSession} <span style={{ opacity: 0.4, fontSize: 12 }}>/ 1.5K</span></span>
              </div>
              <div style={{ 
                height: 12, borderRadius: 6, 
                background: 'rgba(0,0,0,0.3)',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <div style={{ 
                  width: `${Math.min(100, (pipeline.aiUsageInSession / 1500) * 100)}%`,
                  height: '100%',
                  background: pipeline.aiUsageInSession > 1000 
                    ? 'linear-gradient(90deg, #ef4444, #f87171)' 
                    : pipeline.aiUsageInSession > 500 
                    ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' 
                    : 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                  boxShadow: pipeline.aiUsageInSession > 1000 
                    ? '0 0 16px rgba(239,68,68,0.5)' 
                    : pipeline.aiUsageInSession > 500 
                    ? '0 0 16px rgba(245,158,11,0.5)' 
                    : '0 0 16px rgba(99,102,241,0.5)',
                  borderRadius: 6,
                  transition: 'width 0.5s ease'
                }} />
                <div style={{ 
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  fontSize: 9, fontWeight: 700, color: '#fff', opacity: 0.8
                }}>
                  {Math.round((pipeline.aiUsageInSession / 1500) * 100)}%
                </div>
              </div>
            </div>
            <div style={{ 
              display: 'flex', alignItems: 'center', gap: 10, 
              padding: '12px 16px', 
              background: 'rgba(245,158,11,0.05)', 
              borderRadius: 10, 
              border: '1px solid rgba(245,158,11,0.1)'
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <p style={{ fontSize: 11, color: "var(--text-secondary)", margin: 0 }}>
                High-fidelity heuristics are limited to 15 RPM on the free tier substrate.
              </p>
            </div>
          </div>
        </div>

        {/* Activity / Recent Logs */}
        <div className="apple-card animate-in" style={{ animationDelay: "0.6s", background: 'linear-gradient(135deg, rgba(59,130,246,0.03), rgba(139,92,246,0.02))' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>System Telemetry</h3>
              <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 4, background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>
                {pipeline.logs.length} EVTS
              </span>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => onNavigate("pipeline")} style={{ padding: '6px 14px', fontSize: 10, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--info)' }}>
              FULL LOG
            </button>
          </div>
          <div className="card-body" style={{ padding: '24px' }}>
            {recentLogs.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <div style={{ 
                  width: 64, height: 64, borderRadius: 16, 
                  background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', 
                  border: '1px solid var(--border-glass)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--info)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 6 }}>No telemetry data</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 260, margin: '0 auto' }}>
                  Run the automata flow to begin real-time data ingestion
                </p>
              </div>
            ) : (
              <div className="apple-terminal" style={{ 
                maxHeight: 200, overflowY: 'auto',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid var(--border-glass)',
                borderRadius: 12,
                padding: 16
              }}>
                {recentLogs.map((log, i) => (
                  <div key={i} style={{ 
                    display: 'flex', alignItems: 'flex-start', gap: 12, 
                    padding: '8px 0', borderBottom: i < recentLogs.length - 1 ? '1px solid var(--border-glass)' : 'none'
                  }}>
                    <span style={{ 
                      fontSize: 10, fontFamily: 'var(--font-mono)', 
                      color: 'var(--text-muted)', whiteSpace: 'nowrap'
                    }}>
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span style={{ 
                      fontSize: 12, fontFamily: 'var(--font-mono)',
                      color: log.level === 'error' ? 'var(--danger)' : log.level === 'warn' ? 'var(--warning)' : 'var(--text-secondary)'
                    }}>
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

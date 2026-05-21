"use client";
import { useEffect, useRef } from "react";
import type { Job, PipelineState } from "@/lib/store";

interface Props {
  pipeline: PipelineState;
  jobs: Job[];
  onScrape: () => void;
  onFilter: () => void;
  onApply: () => void;
  onRunAll: () => void;
  onClearLogs: () => void;
}

const STEPS = [
  { title: "Scrape Jobs", desc: "Fetch listings from selected job boards", icon: "🔍" },
  { title: "AI Filter", desc: "Match jobs against your preferences", icon: "🤖" },
  { title: "Apply", desc: "Auto-apply via Browser-Use SDK", icon: "📝" },
  { title: "Complete", desc: "Pipeline finished", icon: "✅" },
];

export default function PipelinePage({ 
  pipeline, 
  jobs, 
  onScrape, 
  onFilter, 
  onApply, 
  onRunAll, 
  onClearLogs
}: Props) {
  const logRef = useRef<HTMLDivElement>(null);
  const isRunning = !["idle", "completed", "error"].includes(pipeline.status);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [pipeline.logs]);

  const getStepState = (idx: number) => {
    if (pipeline.currentStep > idx + 1) return "completed";
    if (pipeline.currentStep === idx + 1) return pipeline.status === "error" ? "error" : "active";
    return "";
  };

  return (
    <>
      <div className="page-header" style={{ padding: '16px 32px' }}>
        <div className="header-left">
          <h2>Pipeline</h2>
          <p>Run the full automation workflow or individual steps</p>
        </div>
        <div className="header-right">
          <button className="btn btn-primary" onClick={onRunAll} disabled={isRunning} style={{ height: 36 }}>
            {isRunning ? (
              <>
                <span className="spinner" /> Running...
              </>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                Run All
              </span>
            )}
          </button>
          <button className="btn btn-secondary" onClick={onClearLogs} style={{ height: 36 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            Clear
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="grid-2">
          {/* Steps */}
          <div className="apple-card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Automation Sequence</h3>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-sm btn-secondary" onClick={onClearLogs}>
                  Clear Log
                </button>
                <button className="btn btn-sm btn-primary" onClick={onRunAll} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <span className="spinner" /> Active
                    </>
                  ) : (
                    <>Run All</>
                  )}
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="pipeline-container">
                {STEPS.map((step, i) => (
                  <div key={i} className={`pipeline-step ${getStepState(i)}`}>
                    <div className={`step-number ${getStepState(i)}`}>
                      {getStepState(i) === "completed" ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      ) : i + 1}
                    </div>
                    <div className="step-content">
                      <div className="step-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ opacity: 0.7 }}>{step.icon}</span>
                        <span>{step.title}</span>
                      </div>
                      <div className="step-desc">{step.desc}</div>
                      
                      {(getStepState(i) === "active" || getStepState(i) === "completed") && (
                        <div style={{ marginTop: 12, maxWidth: 240 }}>
                          <div className="progress-bar" style={{ height: 6, borderRadius: 3, overflow: 'hidden' }}>
                            <div 
                              className="fill" 
                              style={{ 
                                width: `${i === 0 ? pipeline.stepProgress.scrape : i === 1 ? pipeline.stepProgress.filter : i === 2 ? pipeline.stepProgress.apply : 100}%`,
                                background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))',
                                transition: 'width 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                              }} 
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    {i < 3 && (
                      <button
                        className={`btn btn-icon ${pipeline.currentStep === i + 1 && isRunning ? 'btn-playing' : 'btn-secondary'}`}
                        onClick={i === 0 ? onScrape : i === 1 ? onFilter : onApply}
                        disabled={isRunning}
                        style={{ 
                          width: 36, height: 36, borderRadius: 10,
                          background: isRunning 
                            ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                            : 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.3)',
                          color: 'var(--accent-primary)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s ease',
                          boxShadow: isRunning ? '0 0 16px rgba(99,102,241,0.4)' : 'none',
                          animation: isRunning ? 'pulse-glow 1.5s ease-in-out infinite' : 'none',
                          cursor: isRunning ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {pipeline.currentStep === i + 1 && isRunning ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                            <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                            <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                            <path d="M8 5.14v14l11-7-11-7z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ marginTop: 32, padding: 20, background: 'linear-gradient(135deg, rgba(99,102,241,0.06), rgba(139,92,246,0.04))', borderRadius: 16, border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>Session Analytics</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 48, height: 4, background: 'var(--border-glass)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${pipeline.progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 2, transition: 'width 0.5s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent-primary)' }}>{pipeline.progress}%</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ opacity: 0.6 }}>🔍</span> <span style={{ color: 'var(--text-primary)' }}>{jobs.length}</span> <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Found</span>
                  </div>
                  <div style={{ padding: '8px 14px', background: 'rgba(16,185,129,0.08)', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(16,185,129,0.15)' }}>
                    <span style={{ opacity: 0.6 }}>✨</span> <span style={{ color: 'var(--success)' }}>{jobs.filter((j) => j.aiMatch).length}</span> <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Matched</span>
                  </div>
                  <div style={{ padding: '8px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: 20, fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, border: '1px solid rgba(245,158,11,0.15)' }}>
                    <span style={{ opacity: 0.6 }}>📨</span> <span style={{ color: 'var(--warning)' }}>{jobs.filter((j) => j.applicationStatus === "applied").length}</span> <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Sent</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logs */}
          <div className="apple-card">
            <div className="card-header">
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Telemetry Console</h3>
              <span className="badge badge-neutral" style={{ fontSize: 10 }}>{pipeline.logs.length} EVTS</span>
            </div>
            <div className="card-body">
              {pipeline.logs.length === 0 ? (
                <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ 
                    width: 64, height: 64, borderRadius: 16, 
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                    border: '1px solid var(--border-glass)'
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <line x1="10" y1="9" x2="8" y2="9"></line>
                    </svg>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Aguardando comando</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 280, margin: '0 auto' }}>Execute o pipeline para monitorar o comportamento dos agentes de IA em tempo real</p>
                </div>
              ) : (
                <div className="apple-terminal" ref={logRef} style={{ height: 500, maxHeight: '60vh', overflowY: 'auto' }}>
                  {pipeline.logs.map((log, i) => (
                    <div key={i} className="log-line">
                      <span className="log-time" style={{ opacity: 0.4 }}>[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      <span className={`log-msg ${log.level}`}>{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error banner */}
        {pipeline.error && (
          <div className="apple-card" style={{ marginTop: 24, borderLeft: '4px solid var(--danger)' }}>
            <div className="card-body" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 24 }}>⚠️</span>
              <div>
                <div style={{ fontWeight: 700, color: "#fff" }}>Interrupt Signal Received</div>
                <div style={{ fontSize: 13, color: "var(--danger)", marginTop: 2 }}>{pipeline.error}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

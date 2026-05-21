"use client";
import { useState, useCallback, useEffect } from "react";
import type { Settings } from "@/lib/store";
import { AVAILABLE_COUNTRIES, AVAILABLE_JOB_SITES, DATE_RANGE_OPTIONS } from "@/lib/store";

interface Props {
  settings: Settings;
  onSave: (s: Settings) => void;
}

export default function SettingsPage({ settings, onSave }: Props) {
  const [form, setForm] = useState<Settings>({ ...settings });
  const [termInput, setTermInput] = useState("");
  const [showKeys, setShowKeys] = useState(false);

  useEffect(() => {
    fetch("/api/env")
      .then((r) => r.json())
      .then((data) => {
        setForm((f) => ({
          ...f,
          geminiApiKey: f.geminiApiKey || data.geminiApiKey || "",
          groqApiKey: f.groqApiKey || data.groqApiKey || "",
          deepSeekApiKey: f.deepSeekApiKey || data.deepSeekApiKey || "",
          openAiApiKey: f.openAiApiKey || data.openAiApiKey || "",
        }));
      })
      .catch(() => {});
  }, []);

  const update = (key: keyof Settings, value: unknown) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const addTerm = useCallback(() => {
    const term = termInput.trim();
    if (term) {
      if (!form.searchTerms.includes(term)) {
        setForm((f) => ({ ...f, searchTerms: [...f.searchTerms, term] }));
      }
      setTermInput("");
    }
  }, [termInput, form.searchTerms]);

  const handleSave = () => {
    let finalSettings = { ...form };
    const pendingTerm = termInput.trim();
    if (pendingTerm && !finalSettings.searchTerms.includes(pendingTerm)) {
      finalSettings.searchTerms = [...finalSettings.searchTerms, pendingTerm];
    }
    onSave(finalSettings);
  };

  const removeTerm = (t: string) => {
    setForm((f) => ({ ...f, searchTerms: f.searchTerms.filter((x) => x !== t) }));
  };

  const toggleCountry = (c: string) => {
    setForm((f) => ({
      ...f,
      countries: f.countries.includes(c) ? f.countries.filter((x) => x !== c) : [...f.countries, c],
    }));
  };

  const toggleSite = (siteId: string) => {
    setForm((f) => {
      const current = f.jobSites || [];
      const updated = current.includes(siteId)
        ? current.filter((x) => x !== siteId)
        : [...current, siteId];
      if (updated.length === 0) return f;
      return { ...f, jobSites: updated };
    });
  };

  const getStatusBadge = (status: 'stable' | 'beta' | 'experimental') => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      stable:       { bg: 'rgba(16,185,129,0.12)', color: '#6ee7b7', label: 'Stable' },
      beta:         { bg: 'rgba(245,158,11,0.12)', color: '#fcd34d', label: 'Beta' },
      experimental: { bg: 'rgba(239,68,68,0.12)',  color: '#fca5a5', label: 'Experimental' },
    };
    const s = styles[status];
    return (
      <span style={{
        fontSize: 9,
        padding: '1px 6px',
        borderRadius: 4,
        background: s.bg,
        color: s.color,
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
      }}>
        {s.label}
      </span>
    );
  };

  return (
    <div className="page-body">
      <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <div className="subpage-header" style={{ marginBottom: 24, padding: 0, background: 'none', borderBottom: '1px solid var(--border-glass)', paddingBottom: 24, backdropFilter: 'none' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', boxShadow: '0 0 8px rgba(99,102,241,0.5)' }}></span>
              System Configuration
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>General Settings</h1>
          </div>
          <button className="btn btn-primary" onClick={handleSave} style={{ height: 44, padding: '0 28px', borderRadius: 14, fontWeight: 600, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
            <span style={{ marginRight: 8 }}>✓</span> Apply Changes
          </button>
        </div>

        <div className="grid-2">
          <div className="apple-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.03), rgba(139,92,246,0.02))' }}>
            <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Active Intelligence</h3>
              </div>
              <span className="badge badge-info" style={{ fontSize: 10, background: 'rgba(99,102,241,0.15)', color: 'var(--accent-primary)', border: '1px solid rgba(99,102,241,0.2)' }}>ENGINE</span>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div className="form-group">
                <label className="form-label">Core Reasoning Brain</label>
                <select 
                  className="apple-form-control" 
                  value={form.selectedAiProvider}
                  onChange={(e) => update("selectedAiProvider", e.target.value as any)}
                  style={{ appearance: 'none', backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")` }}
                >
                  <option value="gemini">Google Gemini 1.5 Pro</option>
                  <option value="groq">Groq Llama 3.1 (70B)</option>
                  <option value="deepseek">DeepSeek V3</option>
                  <option value="openai">OpenAI GPT-4o</option>
                  <option value="together">Together AI Llama 3</option>
                  <option value="ollama">Local Llama (Ollama)</option>
                </select>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Choose the LLM that will evaluate job matches and tailor responses.</p>
              </div>
              {form.selectedAiProvider === "ollama" && (
                <div className="form-group animate-in">
                  <label className="form-label">Local Host Endpoint</label>
                  <input
                    className="apple-form-control"
                    placeholder="http://localhost:11434"
                    value={form.ollamaEndpoint || ""}
                    onChange={(e) => update("ollamaEndpoint", e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="apple-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Operation Limits</h3>
              </div>
              <span className="badge badge-neutral" style={{ fontSize: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-glass)' }}>THROTTLING</span>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Jobs per Search</label>
                  <input
                    className="apple-form-control"
                    type="number"
                    value={form.resultsPerSearch}
                    onChange={(e) => update("resultsPerSearch", parseInt(e.target.value) || 10)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">AI Batch Size</label>
                  <input
                    className="apple-form-control"
                    type="number"
                    value={form.batchSize}
                    onChange={(e) => update("batchSize", parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Higher batch sizes speed up filtering but may exceed token limits.</p>
            </div>
          </div>
        </div>

        <div className="grid-2">
          <div className="apple-card" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.02), rgba(59,130,246,0.02))' }}>
            <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>Scraping Sources</h3>
              </div>
              <span className="badge badge-primary" style={{ background: 'rgba(16,185,129,0.12)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.15)' }}>{(form.jobSites || []).length} Active</span>
            </div>
            <div className="card-body" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {AVAILABLE_JOB_SITES.map((site) => {
                  const isSelected = (form.jobSites || []).includes(site.id);
                  return (
                    <button
                      key={site.id}
                      className="site-toggle-btn"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderRadius: 14,
                        border: `1px solid ${isSelected ? 'rgba(99,102,241,0.4)' : 'var(--border-glass)'}`,
                        background: isSelected ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.3s var(--ease-liquid)',
                        textAlign: 'left',
                        fontSize: 14,
                        fontWeight: isSelected ? 600 : 500,
                      }}
                      onClick={() => toggleSite(site.id)}
                    >
                      <span style={{ fontSize: 20, width: 28 }}>{site.icon}</span>
                      <span style={{ flex: 1 }}>{site.label}</span>
                      {getStatusBadge(site.status)}
                      <div style={{
                        width: 20, height: 20, borderRadius: 6,
                        border: `2px solid ${isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)'}`,
                        background: isSelected ? 'var(--accent-primary)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}>
                        {isSelected && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="apple-card" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700 }}>Publication Window</h3>
                </div>
              </div>
              <div className="card-body" style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {DATE_RANGE_OPTIONS.map((opt) => {
                    const isSelected = (form.hoursOld || 0) === opt.value;
                    return (
                      <button
                        key={opt.value}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 10,
                          border: `1px solid ${isSelected ? 'var(--warning)' : 'var(--border-glass)'}`,
                          background: isSelected ? 'rgba(245,158,11,0.1)' : 'transparent',
                          color: isSelected ? '#fff' : 'var(--text-secondary)',
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                        onClick={() => update('hoursOld', opt.value)}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="apple-card" style={{ background: 'linear-gradient(135deg, rgba(236,72,153,0.02), rgba(168,85,247,0.02))' }}>
              <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #ec4899, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700 }}>Telemetry & API Access</h3>
                </div>
                <button className="btn btn-sm" onClick={() => setShowKeys(!showKeys)} style={{ background: showKeys ? 'rgba(236,72,153,0.15)' : 'transparent', color: '#ec4899', padding: '6px 12px', borderRadius: 8, border: showKeys ? '1px solid rgba(236,72,153,0.3)' : '1px solid transparent', fontWeight: 600, fontSize: 11 }}>
                  {showKeys ? "🔒 Hide Keys" : "👁️ Reveal All"}
                </button>
              </div>
              <div className="card-body" style={{ padding: '20px 24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                  {[
                    { id: 'geminiApiKey', label: 'Google Gemini', icon: '🟢' },
                    { id: 'groqApiKey', label: 'Groq Cloud', icon: '⚡' },
                    { id: 'deepSeekApiKey', label: 'DeepSeek', icon: '🔵' },
                    { id: 'openAiApiKey', label: 'OpenAI', icon: '🤖' },
                  ].map((key) => (
                    <div key={key.id} className="form-group" style={{ margin: 0, padding: '16px', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid var(--border-glass)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 12 }}>{key.icon}</span> {key.label}
                        </label>
                        <span 
                          style={{ fontSize: 10, color: '#ec4899', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.05em', padding: '4px 8px', borderRadius: 4, background: 'rgba(236,72,153,0.1)' }}
                          onClick={() => navigator.clipboard.writeText(form[key.id as keyof Settings] as string)}
                        >
                          COPY
                        </span>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <input
                          className="apple-form-control"
                          type={showKeys ? "text" : "password"}
                          value={form[key.id as keyof Settings] as string || ""}
                          onChange={(e) => update(key.id as keyof Settings, e.target.value)}
                          style={{ 
                            fontSize: 12, 
                            fontFamily: 'var(--font-mono)', 
                            background: 'rgba(0,0,0,0.4)', 
                            borderColor: 'rgba(255,255,255,0.1)',
                            padding: '12px 14px',
                            paddingRight: 40,
                            borderRadius: 10,
                            width: '100%'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="apple-card" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.02), rgba(239,68,68,0.02))' }}>
          <div className="card-header" style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}>Geographic & Keyword Target</h3>
            </div>
            <span className="badge badge-primary" style={{ background: 'rgba(245,158,11,0.12)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.15)' }}>{form.searchTerms.length} Terms · {form.countries.length} Regions</span>
          </div>
          <div className="card-body" style={{ padding: '24px' }}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Search Keywords</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: 14, border: '1px solid var(--border-glass)', minHeight: 48 }}>
                  {form.searchTerms.map((t) => (
                    <span key={t} className="badge badge-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', fontSize: 12, borderRadius: 8 }}>
                      {t}
                      <span style={{ cursor: 'pointer', opacity: 0.6, fontSize: 14 }} onClick={() => removeTerm(t)}>✕</span>
                    </span>
                  ))}
                  <input
                    placeholder="Add job title..."
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTerm())}
                    style={{ border: 'none', background: 'transparent', outline: 'none', color: '#fff', fontSize: 13, flex: 1, minWidth: 120, padding: '4px 0' }}
                  />
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Press Enter to add multiple job titles (e.g. "React Developer").</p>
              </div>

              <div className="form-group">
                <label className="form-label">Specific City or Region</label>
                <input
                  className="apple-form-control"
                  placeholder="Ex: San Francisco, Remote, London..."
                  value={form.location || ""}
                  onChange={(e) => update("location", e.target.value)}
                  style={{ background: 'rgba(0,0,0,0.3)', borderColor: 'rgba(255,255,255,0.15)' }}
                />
                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8 }}>Leave empty to search across the entire selected countries.</p>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <label className="form-label">Active Recruitment Regions</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, maxHeight: 120, overflow: "auto", padding: '4px' }}>
                {AVAILABLE_COUNTRIES.map((c) => {
                  const isSelected = form.countries.includes(c);
                  return (
                    <button
                      key={c}
                      onClick={() => toggleCountry(c)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: 10,
                        border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-glass)'}`,
                        background: isSelected ? 'var(--accent-glow)' : 'rgba(255,255,255,0.02)',
                        color: isSelected ? '#fff' : 'var(--text-secondary)',
                        fontSize: 11,
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      {isSelected && <span style={{ marginRight: 6 }}>✓</span>}
                      {c}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="apple-card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.03))', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="card-header" style={{ padding: '24px', borderBottom: '1px solid var(--border-glass)' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-0.02em' }}>Intelligence Profile</h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>Define the heuristics and data used by the AI to evaluate job matches.</p>
              </div>
            </div>
          </div>
          
          <div className="card-body" style={{ padding: '0 24px 24px 24px' }}>
            <div className="grid-2" style={{ gap: 24 }}>
              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="form-label" style={{ margin: 0 }}>Ideal Job Trajectory</label>
                  <span style={{ fontSize: 10, color: 'var(--accent-primary)', fontWeight: 700, letterSpacing: '0.05em' }}>LLM INSTRUCTION SET</span>
                </div>
                <textarea
                  className="apple-form-control"
                  placeholder="Describe your target roles, tech stack, minimum salary, and company culture preferences..."
                  value={form.userPreferences || ""}
                  onChange={(e) => update("userPreferences", e.target.value)}
                  style={{ minHeight: 400, fontSize: 14, lineHeight: 1.7, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <label className="form-label" style={{ margin: 0 }}>Raw Resume Ingestion</label>
                  <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 700, letterSpacing: '0.05em' }}>CORE KNOWLEDGE BASE</span>
                </div>
                <textarea
                  className="apple-form-control"
                  placeholder="Paste your plain text resume here. The AI will extract your skills and experience from this block."
                  value={form.myResume || ""}
                  onChange={(e) => update("myResume", e.target.value)}
                  style={{ minHeight: 400, fontSize: 13, fontFamily: 'var(--font-mono)', lineHeight: 1.6, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.03)' }}
                />
              </div>
            </div>
          </div>

          <div className="profile-metrics" style={{ borderTop: '1px solid var(--border-glass)', padding: '20px 24px', gap: 20, background: 'rgba(0,0,0,0.2)' }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Skill Matching</span>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>85%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '85%', height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))', borderRadius: 3, boxShadow: '0 0 10px rgba(99,102,241,0.3)' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Experience Fit</span>
                <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>60%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, var(--accent-secondary), var(--accent-primary))', borderRadius: 3, boxShadow: '0 0 10px rgba(139,92,246,0.3)' }} />
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Cultural Alignment</span>
                <span style={{ color: 'var(--warning)', fontWeight: 600 }}>40%</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, var(--warning), #fbbf24)', borderRadius: 3, boxShadow: '0 0 10px rgba(245,158,11,0.3)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
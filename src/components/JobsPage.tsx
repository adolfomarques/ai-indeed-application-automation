"use client";
import React, { useState, useMemo, Fragment } from "react";
import type { Job } from "@/lib/store";

interface Props {
  jobs: Job[];
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

export default function JobsPage({ jobs }: Props) {
  const [search, setSearch] = useState("");
  const [filterMatch, setFilterMatch] = useState<"all" | "matched" | "unmatched">("all");
  const [filterSite, setFilterSite] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Job; direction: 'asc' | 'desc' } | null>({ key: 'aiScore', direction: 'desc' });

  const handleSort = (key: keyof Job) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get unique sites from scraped jobs
  const availableSites = useMemo(() => {
    const sites = new Set(jobs.map(j => j.site).filter(Boolean));
    return Array.from(sites) as string[];
  }, [jobs]);

  const filtered = useMemo(() => {
    let result = [...jobs];
    
    // 1. Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title?.toLowerCase().includes(q) ||
          j.company?.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q)
      );
    }
    
    // 2. Match filter
    if (filterMatch === "matched") result = result.filter((j) => j.aiMatch === true);
    if (filterMatch === "unmatched") result = result.filter((j) => j.aiMatch === false);

    // 3. Site filter
    if (filterSite !== "all") {
      result = result.filter((j) => j.site === filterSite);
    }

    // 4. Sort
    if (sortConfig) {
      result.sort((a, b) => {
        let aVal: any = a[sortConfig.key];
        let bVal: any = b[sortConfig.key];

        // Handle salary sorting by using maxAmount
        if (sortConfig.key === 'maxAmount') {
          aVal = a.maxAmount || a.minAmount || 0;
          bVal = b.maxAmount || b.minAmount || 0;
        }

        if (aVal === undefined || aVal === null) return 1;
        if (bVal === undefined || bVal === null) return -1;

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    
    return result;
  }, [jobs, search, filterMatch, filterSite, sortConfig]);

  const getSiteBadge = (site?: string) => {
    if (!site) return <span className="badge badge-neutral">—</span>;
    const config = SITE_COLORS[site.toLowerCase()] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', label: site };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: config.bg,
        color: config.color,
      }}>
        {config.label}
      </span>
    );
  };

  // Count per site
  const siteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    jobs.forEach(j => {
      const s = j.site || 'unknown';
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ 
              width: 48, height: 48, borderRadius: 14, 
              background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))', 
              border: '1px solid rgba(99,102,241,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em', background: 'linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Jobs</h2>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{jobs.length}</span> scraped · 
                <span style={{ color: 'var(--success)', fontWeight: 600 }}> {jobs.filter((j) => j.aiMatch === true).length}</span> matched
                {availableSites.length > 0 && (
                  <> · <span style={{ color: 'var(--accent-secondary)', fontWeight: 600 }}>{availableSites.length}</span> sources</>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="page-body">
        {/* Site Summary Badges */}
        {availableSites.length > 0 && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sources:</span>
            {availableSites.map(site => {
              const config = SITE_COLORS[site.toLowerCase()] || { bg: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', label: site };
              return (
                <button
                  key={site}
                  onClick={() => setFilterSite(filterSite === site ? "all" : site)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    borderRadius: 12,
                    fontSize: 12,
                    fontWeight: 600,
                    background: filterSite === site ? config.bg : 'rgba(255,255,255,0.03)',
                    color: filterSite === site ? config.color : 'var(--text-secondary)',
                    border: `1px solid ${filterSite === site ? config.color + '40' : 'var(--border-glass)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span style={{ opacity: 0.7 }}>●</span>
                  {config.label}
                  <span style={{
                    background: filterSite === site ? config.color + '20' : 'rgba(255,255,255,0.08)',
                    padding: '2px 8px',
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {siteCounts[site] || 0}
                  </span>
                </button>
              );
            })}
            {filterSite !== "all" && (
              <button
                onClick={() => setFilterSite("all")}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 600,
                  background: 'rgba(239,68,68,0.1)',
                  color: '#fca5a5',
                  border: '1px solid rgba(239,68,68,0.2)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                ✕ Clear
              </button>
            )}
          </div>
        )}

        {/* Toolbar */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </span>
            <input
              className="apple-form-control"
              placeholder="Search jobs, companies, locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: 44 }}
            />
          </div>
          <div style={{ display: "flex", gap: 6, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, border: '1px solid var(--border-glass)' }}>
            {(["all", "matched", "unmatched"] as const).map((f) => (
              <button 
                key={f} 
                className={`btn btn-sm ${filterMatch === f ? "btn-primary" : "btn-secondary"}`} 
                onClick={() => setFilterMatch(f)}
                style={{ border: 'none', background: filterMatch === f ? undefined : 'transparent' }}
              >
                {f === "all" ? "All" : f === "matched" ? "Matched" : "Unmatched"}
              </button>
            ))}
          </div>
          <div className="badge badge-neutral" style={{ marginLeft: "auto" }}>
            {filtered.length} <span style={{ opacity: 0.5, marginLeft: 4 }}>results</span>
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="apple-card">
            <div className="empty-state">
              <div className="icon">💼</div>
              <h3>No jobs found</h3>
              <p>{jobs.length === 0 ? "Run the pipeline to scrape jobs from multiple sites" : "Try adjusting your search or filters"}</p>
            </div>
          </div>
        ) : (
          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('title')} style={{ cursor: 'pointer' }}>
                    Job Role {sortConfig?.key === 'title' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('company')} style={{ cursor: 'pointer' }}>
                    Company {sortConfig?.key === 'company' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('site')} style={{ cursor: 'pointer' }}>
                    Board {sortConfig?.key === 'site' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('location')} style={{ cursor: 'pointer' }}>
                    Location {sortConfig?.key === 'location' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('aiMatch')} style={{ cursor: 'pointer' }}>
                    Status {sortConfig?.key === 'aiMatch' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th onClick={() => handleSort('aiScore')} style={{ cursor: 'pointer' }}>
                    Match {sortConfig?.key === 'aiScore' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                  </th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((job) => (
                  <Fragment key={job.id}>
                    <tr 
                      className={`interactive ${expandedId === job.id ? 'active' : ''}`} 
                      onClick={() => setExpandedId(expandedId === job.id ? null : job.id)}
                    >
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff' }}>{job.title || "Untitled"}</div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                          {job.isRemote ? "🏠 Remote" : "📍 Local"}
                          {job.maxAmount && (
                            <span style={{ color: 'var(--success)', opacity: 0.8 }}>
                              • {job.currency || '$'}{job.minAmount?.toLocaleString()}-{job.maxAmount?.toLocaleString()}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ color: "var(--text-secondary)", fontWeight: 500 }}>{job.company || "—"}</td>
                      <td>{getSiteBadge(job.site)}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>{job.location || "—"}</td>
                      <td>
                        {job.aiMatch === true ? (
                          <span className="badge badge-success">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            Match
                          </span>
                        ) : job.aiMatch === false ? (
                          <span className="badge badge-danger">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            Skip
                          </span>
                        ) : (
                          <span className="badge badge-neutral">Pending</span>
                        )}
                      </td>
                      <td>
                        {job.aiScore !== undefined ? (
                          <div style={{ 
                            display: 'inline-flex', 
                            padding: '4px 10px', 
                            borderRadius: '8px', 
                            background: job.aiScore >= 8 ? 'rgba(16,185,129,0.1)' : job.aiScore >= 5 ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)',
                            color: job.aiScore >= 8 ? '#10b981' : job.aiScore >= 5 ? '#f59e0b' : '#ef4444',
                            fontWeight: 700,
                            fontSize: 12,
                            border: `1px solid ${job.aiScore >= 8 ? 'rgba(16,185,129,0.2)' : job.aiScore >= 5 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
                          }}>
                            {job.aiScore}/10
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>—</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-icon btn-secondary"
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: 32, height: 32, borderRadius: 8 }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                          </a>
                        )}
                      </td>
                    </tr>
                    {expandedId === job.id && (
                      <tr key={`${job.id}-detail`}>
                        <td colSpan={7} style={{ padding: "0", background: "rgba(0,0,0,0.5)" }}>
                          <div style={{ 
                            padding: "28px", 
                            borderLeft: `4px solid ${job.aiMatch ? 'var(--success)' : 'var(--danger)'}`,
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.6), rgba(0,0,0,0.3))',
                          }}>
                            {/* Header with job info */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                              <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                                  {job.title || "Untitled Position"}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-secondary)' }}>{job.company || "Company not specified"}</span>
                                  <span style={{ color: 'var(--border-glass)' }}>•</span>
                                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{job.location || "Location not specified"}</span>
                                  {job.isRemote && (
                                    <>
                                      <span style={{ color: 'var(--border-glass)' }}>•</span>
                                      <span style={{ 
                                        fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, 
                                        background: 'rgba(16,185,129,0.1)', color: 'var(--success)', 
                                        border: '1px solid rgba(16,185,129,0.2)'
                                      }}>
                                        🌐 REMOTE
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action buttons container */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {/* AI Score Badge */}
                                <div style={{ 
                                  display: 'flex', alignItems: 'center', gap: 10,
                                  background: job.aiScore && job.aiScore >= 8 
                                    ? 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.1))' 
                                    : 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.1))',
                                  borderRadius: 12,
                                  padding: '10px 16px',
                                  height: 42,
                                  boxSizing: 'border-box',
                                  border: `1px solid ${job.aiScore && job.aiScore >= 8 ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.4)'}`,
                                }}>
                                  <div style={{ 
                                    width: 24, height: 24, borderRadius: '50%', 
                                    background: job.aiScore && job.aiScore >= 8 
                                      ? 'linear-gradient(135deg, #10b981, #059669)' 
                                      : 'linear-gradient(135deg, #f59e0b, #d97706)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: job.aiScore && job.aiScore >= 8 
                                      ? '0 2px 8px rgba(16,185,129,0.5)' 
                                      : '0 2px 8px rgba(245,158,11,0.5)'
                                  }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>
                                      {job.aiScore || 0}
                                    </span>
                                  </div>
                                  <div>
                                    <div style={{ fontSize: 11, fontWeight: 700, color: job.aiScore && job.aiScore >= 8 ? '#10b981' : '#f59e0b', lineHeight: 1.2 }}>
                                      {job.aiScore && job.aiScore >= 8 ? 'EXCELLENT' : job.aiScore && job.aiScore >= 5 ? 'GOOD' : 'WEAK'}
                                    </div>
                                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>{job.aiScore ? (job.aiScore * 10) : 0}%</div>
                                  </div>
                                </div>

                                {job.jobUrl && (
                                  <a
                                    href={job.jobUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    style={{
                                      display: 'inline-flex', alignItems: 'center', gap: 8,
                                      padding: '10px 20px', borderRadius: 12,
                                      height: 42,
                                      boxSizing: 'border-box',
                                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                      color: '#fff', fontSize: 13, fontWeight: 600,
                                      textDecoration: 'none', boxShadow: '0 4px 16px rgba(99,102,241,0.3)'
                                    }}
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                      <polyline points="15 3 21 3 21 9"></polyline>
                                      <line x1="10" y1="14" x2="21" y2="3"></line>
                                    </svg>
                                    View
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* Main content - Job Description First */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                              
                              {/* Job Description - PROMINENT */}
                              <div style={{ 
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))', 
                                borderRadius: 20, 
                                padding: 28, 
                                border: '1px solid rgba(99,102,241,0.2)',
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                                  <div style={{ 
                                    width: 40, height: 40, borderRadius: 12, 
                                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                      <polyline points="14 2 14 8 20 8"/>
                                      <line x1="16" y1="13" x2="8" y2="13"/>
                                      <line x1="16" y1="17" x2="8" y2="17"/>
                                    </svg>
                                  </div>
                                  <div>
                                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Job Description</h4>
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Full job posting details</p>
                                  </div>
                                </div>
                                <p style={{ 
                                  fontSize: 14, 
                                  lineHeight: 1.9, 
                                  color: "var(--text-secondary)", 
                                  whiteSpace: 'pre-wrap',
                                  maxHeight: 400,
                                  overflow: 'auto',
                                  paddingRight: 8
                                }}>
                                  {job.description || "No description available"}
                                </p>
                              </div>

                              {/* Second Row: AI Analysis */}
                              <div>
                                {/* AI Reasoning */}
                                <div style={{ 
                                  background: 'rgba(255,255,255,0.03)', 
                                  borderRadius: 16, 
                                  padding: 20, 
                                  border: '1px solid var(--border-glass)',
                                  marginBottom: 16
                                }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                                    <div style={{ 
                                      width: 28, height: 28, borderRadius: 8, 
                                      background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2a10 10 0 1 0 10 10 10 10 0 0 0-10-10zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
                                        <path d="M12 16v-4"/>
                                        <path d="M12 8h.01"/>
                                      </svg>
                                    </div>
                                    <h4 style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>AI Match Analysis</h4>
                                    {job.aiMatch === true ? (
                                      <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(16,185,129,0.15)', color: 'var(--success)', marginLeft: 'auto' }}>✓ MATCHED</span>
                                    ) : job.aiMatch === false ? (
                                      <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', marginLeft: 'auto' }}>✕ SKIPPED</span>
                                    ) : null}
                                  </div>
                                  <p style={{ fontSize: 13, lineHeight: 1.7, color: "var(--text-secondary)" }}>
                                    {job.aiReasoning || "No reasoning provided yet."}
                                  </p>
                                </div>

                                {/* Skills */}
                                {(job.matchingSkills?.length || job.missingSkills?.length) ? (
                                  <div>
                                    <h4 style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                                      Skills Assessment
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                      {job.matchingSkills?.length ? (
                                        <div>
                                          <span style={{ fontSize: 10, color: 'var(--success)', fontWeight: 600, marginBottom: 4, display: 'block' }}>✓ MATCHING ({job.matchingSkills.length})</span>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {job.matchingSkills.map((s, i) => (
                                              <span key={`match-${i}-${s}`} style={{ 
                                                padding: '5px 10px', borderRadius: 6, 
                                                background: 'rgba(16,185,129,0.1)', 
                                                color: 'var(--success)', 
                                                fontSize: 11, fontWeight: 600,
                                                border: '1px solid rgba(16,185,129,0.2)'
                                              }}>
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null}
                                      {job.missingSkills?.length ? (
                                        <div>
                                          <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 600, marginBottom: 4, display: 'block' }}>✕ MISSING ({job.missingSkills.length})</span>
                                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                            {job.missingSkills.map((s, i) => (
                                              <span key={`missing-${i}-${s}`} style={{ 
                                                padding: '5px 10px', borderRadius: 6, 
                                                background: 'rgba(239,68,68,0.1)', 
                                                color: 'var(--danger)', 
                                                fontSize: 11, fontWeight: 600,
                                                border: '1px solid rgba(239,68,68,0.2)'
                                              }}>
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ) : null}
                                    </div>
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

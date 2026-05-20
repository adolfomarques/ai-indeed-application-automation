"use client";
import { useState, useEffect } from "react";
import type { Job, Schedule } from "@/lib/store";
import { SCHEDULE_FREQUENCIES, DAYS_OF_WEEK, TIMEZONES, getNextRunTime, getUserTimezone } from "@/lib/store";

interface Props {
  schedules: Schedule[];
  jobs: Job[];
  onAdd: (s: Schedule) => void;
  onUpdate: (s: Schedule) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onRunNow: (id: string) => void;
  onExport: (id: string) => void;
  onExportRun: (scheduleId: string, runId: string) => void;
  isRunning: boolean;
}

export default function ScheduleManager({ schedules, jobs, onAdd, onUpdate, onToggle, onDelete, onRunNow, onExport, onExportRun, isRunning }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [expandedHistory, setExpandedHistory] = useState<string | null>(null);
  const [userTz] = useState(() => {
    const tz = getUserTimezone();
    const found = TIMEZONES.find(t => t.value === tz);
    return found ? tz : 'America/New_York';
  });
  
  const [newSchedule, setNewSchedule] = useState<Partial<Schedule>>({
    name: "",
    frequency: "daily",
    hour: 9,
    minute: 0,
    dayOfWeek: 1,
    timezone: userTz,
    runScrape: true,
    runFilter: true,
    enabled: true,
  });

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const activeCount = schedules.filter(s => s.enabled).length;
  const totalRuns = schedules.reduce((sum, s) => sum + (s.runCount || 0), 0);

  const handleAdd = () => {
    if (!newSchedule.name) return;
    
    if (editingId) {
      const existing = schedules.find(s => s.id === editingId);
      if (existing) {
        const updated: Schedule = {
          ...existing,
          name: newSchedule.name!,
          frequency: newSchedule.frequency as "hourly" | "daily" | "weekly",
          hour: newSchedule.hour,
          minute: newSchedule.minute,
          dayOfWeek: newSchedule.dayOfWeek,
          timezone: newSchedule.timezone || userTz,
          runScrape: newSchedule.runScrape ?? true,
          runFilter: newSchedule.runFilter ?? true,
          nextRun: getNextRunTime(
            newSchedule.frequency!,
            newSchedule.hour ?? 9,
            newSchedule.minute ?? 0,
            newSchedule.dayOfWeek
          ),
        };
        onUpdate(updated);
      }
    } else {
      const schedule: Schedule = {
        id: Date.now().toString(),
        name: newSchedule.name!,
        frequency: newSchedule.frequency as "hourly" | "daily" | "weekly",
        hour: newSchedule.hour,
        minute: newSchedule.minute,
        dayOfWeek: newSchedule.dayOfWeek,
        timezone: newSchedule.timezone || userTz,
        runScrape: newSchedule.runScrape ?? true,
        runFilter: newSchedule.runFilter ?? true,
        enabled: true,
        runCount: 0,
        nextRun: getNextRunTime(
          newSchedule.frequency!,
          newSchedule.hour ?? 9,
          newSchedule.minute ?? 0,
          newSchedule.dayOfWeek
        ),
      };
      onAdd(schedule);
    }
    
    setShowForm(false);
    setEditingId(null);
    setNewSchedule({
      name: "",
      frequency: "daily",
      hour: 9,
      minute: 0,
      dayOfWeek: 1,
      timezone: userTz,
      runScrape: true,
      runFilter: true,
      enabled: true,
    });
  };

  const startEdit = (schedule: Schedule) => {
    setEditingId(schedule.id);
    setNewSchedule({
      name: schedule.name,
      frequency: schedule.frequency,
      hour: schedule.hour,
      minute: schedule.minute,
      dayOfWeek: schedule.dayOfWeek,
      timezone: schedule.timezone || userTz,
      runScrape: schedule.runScrape,
      runFilter: schedule.runFilter,
      enabled: schedule.enabled,
    });
    setShowForm(true);
  };

  const formatLastRun = (lastRun?: string) => {
    if (!lastRun) return "Never";
    const date = new Date(lastRun);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 168) return `${Math.floor(hours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getTimeUntil = (nextRun?: string) => {
    if (!nextRun) return "-";
    const diff = new Date(nextRun).getTime() - now.getTime();
    if (diff <= 0) return "Now";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 24) return `${Math.floor(hours / 24)}d`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getNextRunPreview = () => {
    const freq = newSchedule.frequency || "daily";
    const hr = newSchedule.hour ?? 9;
    const min = newSchedule.minute ?? 0;
    const day = newSchedule.dayOfWeek ?? 1;
    
    const next = getNextRunTime(freq, hr, min, freq === "weekly" ? day : undefined);
    const date = new Date(next);
    return date.toLocaleString(undefined, { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getTimezoneAbbr = (tz: string) => {
    const found = TIMEZONES.find(t => t.value === tz);
    return found ? found.label.split(' ')[1]?.replace(/[()]/g, '') : '';
  };

  return (
    <div className="apple-card" style={{ marginTop: 24 }}>
      <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(99,102,241,0.2)'
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Schedules</h3>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>Automate your job search pipeline</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto' }}>
          {schedules.length > 0 && (
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-primary)' }}>{activeCount}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</div>
              </div>
              <div style={{ width: 1, height: 28, background: 'var(--border-glass)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>{totalRuns}</div>
                <div style={{ fontSize: 9, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Runs</div>
              </div>
            </div>
          )}
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ minWidth: 100 }}
          >
            {showForm ? (
              <>Cancel</>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                {editingId ? 'Edit' : 'New'}
              </span>
            )}
          </button>
        </div>
      </div>
      
      <div className="card-body" style={{ paddingTop: 0 }}>
        {showForm && (
          <div style={{ 
            padding: 24, 
            background: 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))',
            borderRadius: 14, 
            border: '1px solid rgba(99,102,241,0.12)',
            marginBottom: 20,
            animation: 'fadeIn 0.2s ease'
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Schedule Name</label>
                <input
                  type="text"
                  placeholder="e.g., Morning Job Search"
                  value={newSchedule.name}
                  onChange={(e) => setNewSchedule({ ...newSchedule, name: e.target.value })}
                  className="input"
                  style={{ width: '100%', height: 44, fontSize: 14 }}
                  autoFocus
                />
              </div>
              
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Frequency</label>
                <select
                  value={newSchedule.frequency}
                  onChange={(e) => setNewSchedule({ ...newSchedule, frequency: e.target.value as any })}
                  className="input"
                  style={{ width: '100%', height: 44 }}
                >
                  {SCHEDULE_FREQUENCIES.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Timezone</label>
                <select
                  value={newSchedule.timezone || userTz}
                  onChange={(e) => setNewSchedule({ ...newSchedule, timezone: e.target.value })}
                  className="input"
                  style={{ width: '100%', height: 44 }}
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                  ))}
                </select>
              </div>
              
              {newSchedule.frequency !== "hourly" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Time</label>
                  <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
                    <select
                      value={newSchedule.hour}
                      onChange={(e) => setNewSchedule({ ...newSchedule, hour: parseInt(e.target.value) })}
                      className="input"
                      style={{ width: 72, height: 44 }}
                    >
                      {Array.from({ length: 24 }, (_, i) => (
                        <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                    <span style={{ fontSize: 18, fontWeight: 600, opacity: 0.3 }}>:</span>
                    <select
                      value={newSchedule.minute}
                      onChange={(e) => setNewSchedule({ ...newSchedule, minute: parseInt(e.target.value) })}
                      className="input"
                      style={{ width: 72, height: 44 }}
                    >
                      {[0, 15, 30, 45].map((m) => (
                        <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              
              {newSchedule.frequency === "weekly" && (
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Day</label>
                  <select
                    value={newSchedule.dayOfWeek}
                    onChange={(e) => setNewSchedule({ ...newSchedule, dayOfWeek: parseInt(e.target.value) })}
                    className="input"
                    style={{ width: '100%', height: 44 }}
                  >
                    {DAYS_OF_WEEK.map((d) => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
              )}
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Pipeline Steps</label>
                <div style={{ display: "flex", gap: 12, flexWrap: 'wrap' }}>
                  {[
                    { key: 'runScrape', label: '🔍 Scrape Jobs', desc: 'Fetch listings from job boards' },
                    { key: 'runFilter', label: '🤖 AI Filter', desc: 'Match against your preferences' },
                  ].map((action) => (
                    <label 
                      key={action.key}
                      style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: 10, 
                        cursor: 'pointer',
                        padding: '12px 16px',
                        background: newSchedule[action.key as keyof Schedule] 
                          ? 'rgba(99,102,241,0.1)' 
                          : 'rgba(255,255,255,0.03)',
                        borderRadius: 10,
                        border: `1px solid ${newSchedule[action.key as keyof Schedule] ? 'rgba(99,102,241,0.25)' : 'var(--border-glass)'}`,
                        flex: 1,
                        minWidth: 180,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={!!newSchedule[action.key as keyof Schedule]}
                        onChange={(e) => setNewSchedule({ ...newSchedule, [action.key]: e.target.checked })}
                        style={{ display: 'none' }}
                      />
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: 4,
                        border: newSchedule[action.key as keyof Schedule] ? 'none' : '2px solid var(--text-muted)',
                        background: newSchedule[action.key as keyof Schedule] ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {newSchedule[action.key as keyof Schedule] && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{action.label}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{action.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
                <div style={{ 
                  padding: 12, 
                  background: 'rgba(99,102,241,0.05)', 
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  border: '1px dashed rgba(99,102,241,0.15)'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>First run: <strong style={{ color: 'var(--accent-primary)' }}>{getNextRunPreview()}</strong></span>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: 20, display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowForm(false)}
                style={{ height: 40 }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleAdd}
                disabled={!newSchedule.name}
                style={{ height: 40, minWidth: 140 }}
              >
                {editingId ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Save Changes
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Create Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {schedules.length === 0 ? (
          <div className="empty-state" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ 
              width: 72, height: 72, borderRadius: 18, 
              background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
              border: '1px solid var(--border-glass)'
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6, color: 'var(--text-primary)' }}>No schedules yet</h3>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 300, margin: '0 auto 20px' }}>
              Create a schedule to automatically run your job search pipeline on a recurring basis.
            </p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              style={{ height: 42 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              Create First Schedule
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {schedules.map((schedule) => (
              <div key={schedule.id}>
                <div
                  onMouseEnter={() => setHoveredId(schedule.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 18,
                    background: schedule.enabled 
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.04), rgba(139,92,246,0.02))' 
                      : 'rgba(255,255,255,0.015)',
                    borderRadius: expandedHistory === schedule.id ? '14px 14px 0 0' : 14,
                    border: `1px solid ${schedule.enabled ? 'rgba(99,102,241,0.12)' : 'var(--border-glass)'}`,
                    borderBottom: expandedHistory === schedule.id ? 'none' : undefined,
                    opacity: schedule.enabled ? 1 : 0.5,
                    transition: 'all 0.2s ease',
                    transform: hoveredId === schedule.id ? 'translateY(-1px)' : 'none',
                    boxShadow: hoveredId === schedule.id ? '0 4px 20px rgba(99,102,241,0.1)' : 'none',
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                      onClick={() => onToggle(schedule.id)}
                      style={{
                        width: 48,
                        height: 28,
                        borderRadius: 14,
                        background: schedule.enabled 
                          ? 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))'
                          : 'rgba(255,255,255,0.08)',
                        border: 'none',
                        cursor: 'pointer',
                        position: 'relative',
                        transition: 'all 0.25s ease',
                        flexShrink: 0
                      }}
                    >
                      <div style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: '#fff',
                        position: 'absolute',
                        top: 3,
                        left: schedule.enabled ? 23 : 3,
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                      }} />
                    </button>
                    
                    <div style={{ minWidth: 0 }}>
                      <div style={{ 
                        fontSize: 15, 
                        fontWeight: 600, 
                        color: 'var(--text-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                      }}>
                        {schedule.name}
                        {schedule.runCount && schedule.runCount > 0 && (
                          <span style={{
                            fontSize: 10,
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'rgba(16,185,129,0.15)',
                            color: '#10b981',
                            border: '1px solid rgba(16,185,129,0.2)'
                          }}>
                            {schedule.runCount} runs
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        fontSize: 11, 
                        color: 'var(--text-muted)', 
                        marginTop: 4, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8,
                        flexWrap: 'wrap'
                      }}>
                        <span style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 4,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: 'rgba(99,102,241,0.1)',
                          color: 'var(--accent-primary)',
                          fontWeight: 500
                        }}>
                          {schedule.frequency === 'hourly' && '⏱ Every hour'}
                          {schedule.frequency === 'daily' && `🕐 ${schedule.hour?.toString().padStart(2, '0')}:${schedule.minute?.toString().padStart(2, '0')}`}
                          {schedule.frequency === 'weekly' && `📅 ${DAYS_OF_WEEK.find(d => d.value === schedule.dayOfWeek)?.label} ${schedule.hour?.toString().padStart(2, '0')}:${schedule.minute?.toString().padStart(2, '0')}`}
                        </span>
                        <span style={{ opacity: 0.4 }}>|</span>
                        <span>{getTimezoneAbbr(schedule.timezone || userTz)}</span>
                        <span style={{ opacity: 0.4 }}>|</span>
                        <span style={{ display: 'flex', gap: 4 }}>
                          {schedule.runScrape && <span style={{ opacity: 0.7 }}>🔍</span>}
                          {schedule.runFilter && <span style={{ opacity: 0.7 }}>🤖</span>}
                        </span>
                      </div>
                      {schedule.lastRun && (
                        <div style={{ 
                          fontSize: 10, 
                          color: 'var(--text-muted)', 
                          marginTop: 6,
                          opacity: 0.6
                        }}>
                          Last run {formatLastRun(schedule.lastRun)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    <div style={{ 
                      textAlign: 'right', 
                      minWidth: 80,
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: schedule.enabled 
                        ? 'rgba(99,102,241,0.08)' 
                        : 'rgba(255,255,255,0.03)'
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                        {schedule.enabled ? 'Next run' : 'Status'}
                      </div>
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 600, 
                        color: schedule.enabled ? 'var(--accent-primary)' : 'var(--text-muted)' 
                      }}>
                        {schedule.enabled ? getTimeUntil(schedule.nextRun) : 'Paused'}
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-sm"
                        onClick={() => onRunNow(schedule.id)}
                        disabled={isRunning}
                        style={{ 
                          height: 36,
                          padding: '0 14px',
                          background: 'rgba(99,102,241,0.1)',
                          border: '1px solid rgba(99,102,241,0.2)',
                          color: 'var(--accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z"/></svg>
                        Run
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => {
                          if (expandedHistory === schedule.id) {
                            setExpandedHistory(null);
                          } else {
                            setExpandedHistory(schedule.id);
                          }
                        }}
                        style={{ 
                          height: 36,
                          padding: '0 12px',
                          background: expandedHistory === schedule.id ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${expandedHistory === schedule.id ? 'rgba(99,102,241,0.25)' : 'var(--border-glass)'}`,
                          color: expandedHistory === schedule.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expandedHistory === schedule.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }}>
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                        History
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => startEdit(schedule)}
                        disabled={isRunning}
                        style={{ 
                          height: 36,
                          padding: '0 12px',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          fontSize: 12,
                          fontWeight: 500
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => onExport(schedule.id)}
                        style={{ 
                          height: 36,
                          padding: '0 12px',
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.2)',
                          color: '#10b981',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          fontSize: 12,
                          fontWeight: 500,
                          cursor: 'pointer'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Export
                      </button>
                      <button
                        className="btn btn-sm"
                        onClick={() => onDelete(schedule.id)}
                        style={{ 
                          width: 36,
                          height: 36,
                          padding: 0,
                          background: 'rgba(239,68,68,0.08)', 
                          border: '1px solid rgba(239,68,68,0.15)',
                          color: '#ef4444',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {expandedHistory === schedule.id && (
                  <div style={{
                    background: 'rgba(0,0,0,0.2)',
                    border: `1px solid ${schedule.enabled ? 'rgba(99,102,241,0.12)' : 'var(--border-glass)'}`,
                    borderTop: 'none',
                    borderRadius: '0 0 14px 14px',
                    padding: '12px 18px 16px',
                    animation: 'fadeIn 0.15s ease'
                  }}>
                    {(!schedule.runs || schedule.runs.length === 0) ? (
                      <div style={{ padding: '16px 0', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No runs yet. Click Run to start.</div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {schedule.runs.map((run, i) => (
                          <div key={run.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: i < schedule.runs!.length - 1 ? '1px solid var(--border-glass)' : 'none',
                            gap: 12
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                              <div style={{
                                width: 28,
                                height: 28,
                                borderRadius: 8,
                                background: run.status === 'completed' 
                                  ? 'rgba(16,185,129,0.15)' 
                                  : run.status === 'failed' 
                                  ? 'rgba(239,68,68,0.15)' 
                                  : 'rgba(245,158,11,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                              }}>
                                {run.status === 'completed' && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                )}
                                {run.status === 'failed' && (
                                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                )}
                                {run.status === 'running' && (
                                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', animation: 'pulse 1.5s infinite' }} />
                                )}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {new Date(run.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                                  {run.jobCount > 0 ? `${run.jobCount} jobs found` : 'No jobs'}
                                  {run.matchedCount > 0 && ` · ${run.matchedCount} matched`}
                                  {run.status === 'running' && ' · Running...'}
                                </div>
                              </div>
                            </div>
                            <button
                              className="btn btn-sm"
                              onClick={() => onExportRun(schedule.id, run.id)}
                              disabled={run.status === 'running'}
                              style={{
                                height: 30,
                                padding: '0 10px',
                                background: run.status === 'completed' ? 'rgba(16,185,129,0.1)' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${run.status === 'completed' ? 'rgba(16,185,129,0.2)' : 'var(--border-glass)'}`,
                                color: run.status === 'completed' ? '#10b981' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontSize: 10,
                                fontWeight: 600,
                                flexShrink: 0,
                                cursor: run.status === 'running' ? 'not-allowed' : 'pointer',
                                opacity: run.status === 'running' ? 0.4 : 1
                              }}
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              CSV
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
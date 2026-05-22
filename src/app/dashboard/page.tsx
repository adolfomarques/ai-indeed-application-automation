"use client";
import { useState, useCallback, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import JobsPage from "@/components/JobsPage";
import PipelinePage from "@/components/PipelinePage";
import SchedulesPage from "@/components/SchedulesPage";
import SettingsPage from "@/components/SettingsPage";
import type { Job, Settings, PipelineState, LogEntry, Schedule, ScheduleRun } from "@/lib/store";
import { DEFAULT_SETTINGS, getNextRunTime, jobsToCSV, downloadCSV, getScheduleRunJobsKey } from "@/lib/store";

type Page = "dashboard" | "jobs" | "pipeline" | "schedules" | "settings";

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "jobs", label: "Jobs", icon: "💼" },
  { id: "pipeline", label: "Pipeline", icon: "⚡" },
  { id: "schedules", label: "Schedules", icon: "⏰" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

import { motion, AnimatePresence } from "framer-motion";

function UserMenu({ collapsed }: { collapsed: boolean }) {
  const { data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut({ callbackUrl: "/auth/signin" });
  };

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  if (collapsed) {
    return (
      <div className="user-avatar-mini" title={session?.user?.name || "Sign out"}>
        {session?.user?.image ? (
          <img src={session.user.image} alt="" className="user-avatar-img" />
        ) : (
          <span className="user-avatar-initials">{initials}</span>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="user-info">
        <div className="user-avatar">
          {session?.user?.image ? (
            <img src={session.user.image} alt="" className="user-avatar-img" />
          ) : (
            <span className="user-avatar-initials">{initials}</span>
          )}
        </div>
        <div className="user-details">
          <span className="user-name">{session?.user?.name || "User"}</span>
          <span className="user-email">{session?.user?.email || ""}</span>
        </div>
      </div>
      <button
        onClick={handleSignOut}
        disabled={signingOut}
        className="sidebar-signout"
      >
        {signingOut ? (
          <span className="auth-spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        )}
        <span>{signingOut ? "Signing out..." : "Sign out"}</span>
      </button>
    </>
  );
}

export default function Home() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);
  const [page, setPage] = useState<Page>("dashboard");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: session } = useSession();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("jobpilot_settings");
      const sidebarState = localStorage.getItem("jobpilot_sidebar_collapsed");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse settings", e);
        }
      }
      if (sidebarState) {
        setIsSidebarCollapsed(sidebarState === "true");
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (typeof window === "undefined" || !uid) return;
    fetch("/api/user/settings")
      .then((r) => r.ok ? r.json() : null)
      .then((serverSettings) => {
        if (serverSettings) {
          setSettings(serverSettings);
          localStorage.setItem("jobpilot_settings", JSON.stringify(serverSettings));
        }
      })
      .catch(() => {});
  }, [session]);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem("jobpilot_sidebar_collapsed", String(newState));
  };

  const [pipeline, setPipeline] = useState<PipelineState>({
    status: "idle",
    currentStep: 0,
    logs: [],
    progress: 0,
    stepProgress: { scrape: 0, filter: 0, apply: 0 },
    aiUsageInSession: 0,
    quotaExceeded: false,
  });

  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const syncSchedules = useCallback(async (scheds: Schedule[]) => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return;
    try {
      await fetch("/api/user/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheds),
      });
    } catch (e) {
      console.error("Failed to sync schedules:", e);
    }
  }, [session]);

  const syncJobs = useCallback(async (jobsData: Job[]) => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return;
    try {
      await fetch("/api/user/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobsData),
      });
    } catch {}
  }, [session]);

  const syncScheduleRunJobs = useCallback(async (jobsData: Record<string, Job[]>) => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return;
    try {
      const res = await fetch("/api/user/schedule-jobs");
      const existing: Record<string, Job[]> = await res.json();
      const merged = { ...existing, ...jobsData };
      await fetch("/api/user/schedule-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(merged),
      });
    } catch {}
  }, [session]);

  const loadSchedulesFromServer = useCallback(async () => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return;
    try {
      const res = await fetch("/api/user/schedules");
      const serverSchedules = await res.json();
      if (Array.isArray(serverSchedules)) {
        setSchedules((prev) => {
          const merged = [...serverSchedules];
          for (const local of prev) {
            if (!merged.find((s: Schedule) => s.id === local.id)) {
              merged.push(local);
            }
          }
          return merged;
        });
        localStorage.setItem("jobpilot_schedules", JSON.stringify(serverSchedules));
      }
    } catch {}
  }, [session]);

  const loadJobsFromServer = useCallback(async () => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (!uid) return;
    try {
      const res = await fetch("/api/user/jobs");
      const serverJobs = await res.json();
      if (Array.isArray(serverJobs) && serverJobs.length > 0) {
        setJobs(serverJobs);
      }
    } catch {}
  }, [session]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSchedules = localStorage.getItem("jobpilot_schedules");
      if (savedSchedules) {
        try {
          setSchedules(JSON.parse(savedSchedules));
        } catch (e) {
          console.error("Failed to parse schedules", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("jobpilot_schedules", JSON.stringify(schedules));
    }
    syncSchedules(schedules);
  }, [schedules, syncSchedules]);

  const [toasts, setToasts] = useState<{ id: number; msg: string; type: string }[]>([]);

  const addToast = useCallback((msg: string, type: string = "info") => {
    const id = Date.now() + Math.random(); 
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }, []);

  const addSchedule = useCallback((schedule: Schedule) => {
    setSchedules((prev) => [...prev, schedule]);
    addToast(`Schedule "${schedule.name}" created`, "success");
  }, [addToast]);

  const toggleSchedule = useCallback((id: string) => {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    addToast("Schedule deleted", "info");
  }, [addToast]);

  const updateSchedule = useCallback((updated: Schedule) => {
    setSchedules((prev) => prev.map((s) => s.id === updated.id ? updated : s));
    addToast("Schedule updated", "success");
  }, [addToast]);

  const runScheduleNow = (id: string) => {
    const schedule = schedules.find((s) => s.id === id);
    if (schedule) {
      addLog(`[Schedule: ${schedule.name}] Manual run triggered...`, "info");
      const runId = crypto.randomUUID();
      const runEntry: ScheduleRun = { id: runId, timestamp: new Date().toISOString(), jobCount: 0, matchedCount: 0, status: 'running' };

      setSchedules(prev => prev.map(sched =>
        sched.id === id
          ? { ...sched, runs: [runEntry, ...(sched.runs || [])] }
          : sched
      ));

      if (schedule.runScrape) {
        runScrape().then((scrapedJobs) => {
          const jobCount = scrapedJobs.length;
          const runKey = getScheduleRunJobsKey(id, runId);
          localStorage.setItem(runKey, JSON.stringify(scrapedJobs));
          syncScheduleRunJobs({ [runKey]: scrapedJobs });
          
          setSchedules(prev => prev.map(sched =>
            sched.id === id
              ? { ...sched, lastJobCount: jobCount, lastRun: new Date().toISOString(), runCount: (sched.runCount || 0) + 1 }
              : sched
          ));
          
          if (schedule.runFilter && scrapedJobs.length > 0) {
            runFilter(scrapedJobs).then((filteredJobs) => {
              const matchedCount = filteredJobs.filter(j => j.aiMatch).length;
              localStorage.setItem(runKey, JSON.stringify(filteredJobs));
              syncScheduleRunJobs({ [runKey]: filteredJobs });
              setSchedules(prev => prev.map(sched =>
                sched.id === id
                  ? { ...sched, runs: (sched.runs || []).map(r => r.id === runId ? { ...r, jobCount, matchedCount, status: 'completed' as const } : r) }
                  : sched
              ));
              addLog(`[Schedule: ${schedule.name}] Manual run completed. ${jobCount} found, ${matchedCount} matched.`, "success");
            });
          } else {
            setSchedules(prev => prev.map(sched =>
              sched.id === id
                ? { ...sched, runs: (sched.runs || []).map(r => r.id === runId ? { ...r, jobCount, matchedCount: 0, status: 'completed' as const } : r) }
                : sched
            ));
            addLog(`[Schedule: ${schedule.name}] Manual run completed. Found ${jobCount} jobs.`, "success");
          }
        });
      }
    }
  };

  const getRunJobs = useCallback(async (scheduleId: string, runId: string): Promise<Job[]> => {
    const key = getScheduleRunJobsKey(scheduleId, runId);
    const local = localStorage.getItem(key);
    if (local) {
      try { return JSON.parse(local); } catch {}
    }
    try {
      const res = await fetch("/api/user/schedule-jobs");
      const all = await res.json() as Record<string, Job[]>;
      if (all[key]) return all[key];
    } catch {}
    return [];
  }, []);

  const exportScheduleJobs = useCallback(async (id: string) => {
    const schedule = schedules.find((s) => s.id === id);
    
    const latestRun = schedule?.runs?.[0];
    if (latestRun) {
      const runId = latestRun.id;
      const run = latestRun;
      
      let runJobs = await getRunJobs(id, runId);
      let jobsToExport = runJobs.filter((j: Job) => j.aiMatch === true);
      
      if (jobsToExport.length === 0) {
        jobsToExport = jobs.filter(j => j.aiMatch === true);
      }
      
      jobsToExport.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
      
      if (jobsToExport.length === 0) {
        addToast("No matched jobs to export", "warn");
        return;
      }
      
      const dateStr = new Date(run.timestamp).toISOString().split('T')[0];
      const filename = `jobpilot-${schedule?.name.toLowerCase().replace(/\s+/g, '-') || 'schedule'}-${dateStr}.csv`;
      downloadCSV(jobsToCSV(jobsToExport), filename);
      addToast(`Exported ${jobsToExport.length} matched jobs from ${dateStr}`, "success");
      return;
    }

    let jobsToExport: Job[] = jobs.filter(j => j.aiMatch === true);
    jobsToExport.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    
    if (jobsToExport.length === 0) {
      addToast("No matched jobs to export", "warn");
      return;
    }
    
    const filename = `jobpilot-${schedule?.name.toLowerCase().replace(/\s+/g, '-') || 'schedule'}-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCSV(jobsToCSV(jobsToExport), filename);
    addToast(`Exported ${jobsToExport.length} matched jobs (sorted by score)`, "success");
    
    if (schedule) {
      setSchedules(prev => prev.map(s => s.id === id ? { ...s, lastExport: new Date().toISOString() } : s));
    }
  }, [schedules, jobs, addToast, getRunJobs]);

  const exportScheduleRun = useCallback(async (scheduleId: string, runId: string) => {
    const schedule = schedules.find((s) => s.id === scheduleId);
    const run = schedule?.runs?.find(r => r.id === runId);
    
    let runJobs = await getRunJobs(scheduleId, runId);
    let jobsToExport = runJobs.filter((j: Job) => j.aiMatch === true);
    
    if (jobsToExport.length === 0) {
      jobsToExport = jobs.filter(j => j.aiMatch === true);
    }
    
    jobsToExport.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
    
    if (jobsToExport.length === 0) {
      addToast("No matched jobs to export", "warn");
      return;
    }
    
    const dateStr = run ? new Date(run.timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    const filename = `jobpilot-${schedule?.name.toLowerCase().replace(/\s+/g, '-') || 'schedule'}-${dateStr}.csv`;
    downloadCSV(jobsToCSV(jobsToExport), filename);
    addToast(`Exported ${jobsToExport.length} matched jobs from ${dateStr}`, "success");
  }, [schedules, jobs, addToast, getRunJobs]);

  const addLog = useCallback((message: string, level: LogEntry["level"] = "info") => {
    setPipeline((prev) => ({
      ...prev,
      logs: [...prev.logs, { timestamp: new Date().toISOString(), message, level }],
    }));
  }, []);

  const saveSettings = useCallback(
    (s: Settings) => {
      setSettings(s);
      if (typeof window !== "undefined") {
        localStorage.setItem("jobpilot_settings", JSON.stringify(s));
      }
      const uid = (session?.user as { id?: string } | undefined)?.id;
      if (uid) {
        fetch("/api/user/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(s),
        }).catch(() => {});
      }
      addToast("Settings saved", "success");
    },
    [addToast, session]
  );

  useEffect(() => {
    const uid = (session?.user as { id?: string } | undefined)?.id;
    if (typeof window === "undefined" || !uid) return;
    loadSchedulesFromServer();
    loadJobsFromServer();
  }, [session, loadSchedulesFromServer, loadJobsFromServer]);

  // ─── Pipeline actions ───
  const runScrape = useCallback(async () => {
    if (!isLoaded) return [];
    if (settings.searchTerms.length === 0) {
      addLog("No search terms defined. Please add terms in Settings.", "warn");
      addToast("No search terms defined", "error");
      setPipeline((p) => ({ ...p, status: "idle" }));
      return [];
    }

    setPipeline((p) => ({ ...p, status: "scraping", currentStep: 1, logs: [], progress: 10 }));
    const siteNames = (settings.jobSites || ['indeed']).join(', ');
    const dateLabel = settings.hoursOld ? `${settings.hoursOld}h` : 'all time';
    addLog(`Starting job scraping for ${settings.searchTerms.length} terms in ${settings.countries.length} countries on [${siteNames}] (${dateLabel})...`, "info");
    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countries: settings.countries,
          searchTerms: settings.searchTerms,
          resultsPerSearch: settings.resultsPerSearch,
          jobSites: settings.jobSites || ['indeed'],
          hoursOld: settings.hoursOld || 0,
          location: settings.location || "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scrape failed");
      const scrapedJobs = data.jobs || [];
      setJobs(scrapedJobs);
      syncJobs(scrapedJobs);
      addLog(`Found ${scrapedJobs.length} jobs`, "success");
      setPipeline((p) => ({ ...p, progress: 33 }));
      addToast(`Scraped ${data.jobs?.length || 0} jobs`, "success");
      setPipeline((p) => ({ ...p, status: "idle", progress: 33, currentStep: 2, stepProgress: { ...p.stepProgress, scrape: 100 } }));
      return data.jobs || [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      addLog(`Scrape error: ${msg}`, "error");
      setPipeline((p) => ({ ...p, status: "error", error: msg }));
      addToast(`Scrape failed: ${msg}`, "error");
      return [];
    }
  }, [settings, addLog, addToast, isLoaded, syncJobs]);

  const runFilter = useCallback(
    async (jobsToFilter: Job[]) => {
      if (jobsToFilter.length === 0) {
        addLog("No jobs to filter", "warn");
        return [];
      }
      // Validate API Keys based on provider
      if (settings.selectedAiProvider === "gemini" && !settings.geminiApiKey) {
        addLog("Gemini API Key missing. Please add it in Settings.", "error");
        addToast("Missing Gemini API Key", "error");
        setPipeline((p) => ({ ...p, status: "idle" }));
        return jobsToFilter;
      }
      if (settings.selectedAiProvider === "groq" && !settings.groqApiKey) {
        addLog("Groq API Key missing. Please add it in Settings.", "error");
        addToast("Missing Groq API Key", "error");
        setPipeline((p) => ({ ...p, status: "idle" }));
        return jobsToFilter;
      }
      if (settings.selectedAiProvider === "together" && !settings.togetherApiKey) {
        addLog("Together AI Key missing. Please add it in Settings.", "error");
        addToast("Missing Together AI Key", "error");
        setPipeline((p) => ({ ...p, status: "idle" }));
        return jobsToFilter;
      }
      if (settings.selectedAiProvider === "deepseek" && !settings.deepSeekApiKey) {
        addLog("DeepSeek API Key missing. Please add it in Settings.", "error");
        addToast("Missing DeepSeek API Key", "error");
        setPipeline((p) => ({ ...p, status: "idle" }));
        return jobsToFilter;
      }
      if (settings.selectedAiProvider === "openai" && !settings.openAiApiKey) {
        addLog("OpenAI API Key missing. Please add it in Settings.", "error");
        addToast("Missing OpenAI API Key", "error");
        setPipeline((p) => ({ ...p, status: "idle" }));
        return jobsToFilter;
      }

      setPipeline((p) => ({ 
        ...p, 
        status: "filtering", 
        currentStep: 2, 
        progress: 40,
        stepProgress: { ...p.stepProgress, filter: 0 }
      }));
      addLog(`Filtering ${jobsToFilter.length} jobs with AI (Batching enabled)...`, "info");
      
      const batchSize = settings.batchSize || 10;
      let allUpdatedJobs = [...jobsToFilter];
      
      let failedJobsCount = 0;
      for (let i = 0; i < jobsToFilter.length; i += batchSize) {
        const batch = jobsToFilter.slice(i, i + batchSize);
        const batchNum = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(jobsToFilter.length / batchSize);
        
        let success = false;
        let retries = 0;
        
        while (!success && retries < 3) {
          try {
            addLog(`Processing batch ${batchNum}/${totalBatches}...`, "info");
            
            const res = await fetch("/api/filter-v2", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    jobs: batch,
                    userPreferences: settings.userPreferences,
                    myResume: settings.myResume,
                    geminiApiKey: settings.geminiApiKey,
                    groqApiKey: settings.groqApiKey,
                    deepSeekApiKey: settings.deepSeekApiKey,
                    openAiApiKey: settings.openAiApiKey,
                    togetherApiKey: settings.togetherApiKey,
                    ollamaEndpoint: settings.ollamaEndpoint,
                    selectedAiProvider: settings.selectedAiProvider,
                  }),
            });

            const data = await res.json();
            
            if (!res.ok) {
              if (res.status === 429) {
                addLog("⚠️ Rate Limit (429) hit. Waiting 65s before retry...", "warn");
                await new Promise(r => setTimeout(r, 65000));
                retries++;
                continue;
              }
              throw new Error(data.error || "Filter failed");
            }

            // Update jobs in real-time
            const results = data.results || [];
            allUpdatedJobs = allUpdatedJobs.map(j => {
              const match = results.find((r: any) => r.jobId === j.id);
              return match ? { 
                ...j, 
                aiMatch: match.matches, 
                aiScore: match.score, 
                aiReasoning: match.reasoning,
                matchingSkills: match.matchingSkills,
                missingSkills: match.missingSkills
              } : j;
            });
            
            setJobs([...allUpdatedJobs]);
            syncJobs([...allUpdatedJobs]);
            
            // Update progress
            const progressPercent = Math.round(((i + batch.length) / jobsToFilter.length) * 100);
            setPipeline(p => ({ 
              ...p, 
              stepProgress: { ...p.stepProgress, filter: progressPercent } 
            }));
            
            success = true;
            await new Promise(r => setTimeout(r, 2000));
          } catch (err: any) {
            addLog(`Error in batch ${batchNum}: ${err.message}`, "error");
            retries++;
            if (retries >= 3) {
              failedJobsCount += batch.length;
            }
            await new Promise(r => setTimeout(r, 2000));
          }
        }
      }

      const matched = allUpdatedJobs.filter((j) => j.aiMatch).length;
      addLog(`AI Filtering complete! ${matched} matches found. ${failedJobsCount > 0 ? `⚠️ ${failedJobsCount} jobs skipped due to AI errors.` : ""}`, "success");
      
      const callsMade = Math.ceil(jobsToFilter.length / batchSize);
      saveSettings({ ...settings, aiUsageCount: (settings.aiUsageCount || 0) + callsMade });

      setPipeline((p) => ({ 
        ...p, 
        status: "idle", 
        progress: 66,
        currentStep: 3,
        stepProgress: { ...p.stepProgress, filter: 100 },
        aiUsageInSession: p.aiUsageInSession + callsMade,
        quotaExceeded: false
      }));
      
      addToast(`${matched} jobs matched your preferences`, "success");
      return allUpdatedJobs;
    },
    [settings, addLog, addToast, saveSettings, syncJobs]
  );

  const runApply = useCallback(
    async (jobsToApply: Job[]) => {
      const matched = jobsToApply.filter((j) => j.aiMatch);
      if (matched.length === 0) {
        addLog("No matched jobs to apply to", "warn");
        addToast("No matched jobs to apply to", "error");
        return;
      }
      setPipeline((p) => ({ ...p, status: "applying", currentStep: 3, progress: 75 }));
      addLog(`Applying to ${matched.length} jobs...`, "info");
      try {
        const res = await fetch("/api/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobs: matched,
            geminiApiKey: settings.geminiApiKey,
            groqApiKey: settings.groqApiKey,
            userPreferences: settings.userPreferences,
            browserUseApiKey: settings.browserUseApiKey,
            browserProfileId: settings.browserProfileId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Apply failed");
        addLog(`Application tasks created: ${data.taskId || "N/A"}`, "success");
        setPipeline((p) => ({ ...p, status: "completed", currentStep: 4, progress: 100, stepProgress: { ...p.stepProgress, apply: 100 }, liveUrl: data.liveUrl || undefined, viewUrl: data.viewUrl || undefined }));
        addToast("Applications submitted!", "success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        addLog(`Apply error: ${msg}`, "error");
        setPipeline((p) => ({ ...p, status: "error", error: msg }));
        addToast(`Apply failed: ${msg}`, "error");
      }
    },
    [settings, addLog, addToast]
  );

  useEffect(() => {
    const checkSchedules = setInterval(() => {
      const now = new Date();
      setSchedules((prev) => {
        let updated = false;
        const newSchedules = prev.map((s) => {
          if (!s.enabled || !s.nextRun) return s;
          const nextRunTime = new Date(s.nextRun);
          if (nextRunTime <= now) {
            updated = true;
            const newNextRun = getNextRunTime(s.frequency, s.hour ?? 9, s.minute ?? 0, s.dayOfWeek);
            const lastRun = now.toISOString();
            const newRunCount = (s.runCount || 0) + 1;
            const scheduleId = s.id;
            const runId = crypto.randomUUID();
            const runEntry: ScheduleRun = { id: runId, timestamp: now.toISOString(), jobCount: 0, matchedCount: 0, status: 'running' };
            if (s.runScrape || s.runFilter) {
              setTimeout(() => {
                addLog(`[Schedule: ${s.name}] Starting scheduled run...`, "info");
                if (s.runScrape) {
                  runScrape().then((scrapedJobs) => {
                    const jobCount = scrapedJobs.length;
                    const runKey = getScheduleRunJobsKey(scheduleId, runId);
                    
                    localStorage.setItem(runKey, JSON.stringify(scrapedJobs));
                    syncScheduleRunJobs({ [runKey]: scrapedJobs });
                    
                    setSchedules(prev => prev.map(sched => 
                      sched.id === scheduleId 
                        ? { ...sched, lastJobCount: jobCount, lastRun: new Date().toISOString() }
                        : sched
                    ));
                    
                    const storedSchedules = JSON.parse(localStorage.getItem("jobpilot_schedules") || "[]") as Schedule[];
                    const updatedStored = storedSchedules.map(sched => 
                      sched.id === scheduleId 
                        ? { ...sched, lastJobCount: jobCount, lastRun: new Date().toISOString() }
                        : sched
                    );
                    localStorage.setItem("jobpilot_schedules", JSON.stringify(updatedStored));
                    
                    if (s.runFilter && scrapedJobs.length > 0) {
                      runFilter(scrapedJobs).then((filteredJobs) => {
                        const matchedCount = filteredJobs.filter(j => j.aiMatch).length;
                        localStorage.setItem(runKey, JSON.stringify(filteredJobs));
                        syncScheduleRunJobs({ [runKey]: filteredJobs });
                        setSchedules(prev => prev.map(sched =>
                          sched.id === scheduleId
                            ? { ...sched, runs: (sched.runs || []).map(r => r.id === runId ? { ...r, jobCount, matchedCount, status: 'completed' as const } : r) }
                            : sched
                        ));
                        addLog(`[Schedule: ${s.name}] Completed. ${jobCount} found, ${matchedCount} matched.`, "success");
                      });
                    } else {
                      setSchedules(prev => prev.map(sched =>
                        sched.id === scheduleId
                          ? { ...sched, runs: (sched.runs || []).map(r => r.id === runId ? { ...r, jobCount, matchedCount: 0, status: 'completed' as const } : r) }
                          : sched
                      ));
                      addLog(`[Schedule: ${s.name}] Completed. Found ${jobCount} jobs.`, "success");
                    }
                  });
                }
              }, 100);
            }
            return { ...s, lastRun, nextRun: newNextRun, runCount: newRunCount, runs: [runEntry, ...(s.runs || [])] };
          }
          return s;
        });
        if (updated) {
          localStorage.setItem("jobpilot_schedules", JSON.stringify(newSchedules));
        }
        return updated ? newSchedules : prev;
      });
    }, 30000);
    return () => clearInterval(checkSchedules);
  }, [runScrape, runFilter, addLog, syncScheduleRunJobs]);

  const runFullPipeline = useCallback(async () => {
    const scrapedJobs = await runScrape();
    if (scrapedJobs.length === 0) return;
    const filteredJobs = await runFilter(scrapedJobs);
    await runApply(filteredJobs);
  }, [runScrape, runFilter, runApply]);

  const renderPage = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)", scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
          {(() => {
            switch (page) {
              case "dashboard":
                return <Dashboard jobs={jobs} pipeline={pipeline} onNavigate={setPage} onRunPipeline={runFullPipeline} />;
              case "jobs":
                return <JobsPage jobs={jobs} />;
              case "pipeline":
                return (
                  <PipelinePage
                    pipeline={pipeline}
                    jobs={jobs}
                    onScrape={runScrape}
                    onFilter={() => runFilter(jobs)}
                    onApply={() => runApply(jobs)}
                    onRunAll={runFullPipeline}
                    onClearLogs={() => setPipeline((p) => ({ ...p, logs: [], status: "idle", currentStep: 0, progress: 0, error: undefined }))}
                  />
                );
              case "schedules":
                return (
                  <SchedulesPage
                    schedules={schedules}
                    jobs={jobs}
                    onAdd={addSchedule}
                    onUpdate={updateSchedule}
                    onToggle={toggleSchedule}
                    onDelete={deleteSchedule}
                    onRunNow={runScheduleNow}
                    onExport={exportScheduleJobs}
                    onExportRun={exportScheduleRun}
                    pipeline={pipeline}
                  />
                );
              case "settings":
                return <SettingsPage settings={settings} onSave={saveSettings} />;
            }
          })()}
        </motion.div>
      </AnimatePresence>
    );
  };

  const getPageTitle = () => {
    switch (page) {
      case "dashboard": return "Command Center";
      case "jobs": return "Intelligence Feed";
      case "pipeline": return "Automata Flow";
      case "schedules": return "Schedule Manager";
      case "settings": return "Configuration";
      default: return "";
    }
  };

  const getPageDesc = () => {
    switch (page) {
      case "dashboard": return "Monitor your automated pipeline performance.";
      case "jobs": return "High-fidelity database of matched opportunities.";
      case "pipeline": return "Real-time execution of AI-driven agents.";
      case "schedules": return "Automate your job search on a schedule.";
      case "settings": return "Adjust heuristics and identity parameters.";
      default: return "";
    }
  };

  if (!isLoaded) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
              <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
              <path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5" />
              <path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5" />
            </svg>
          </div>
          <div className="loading-text">
            <span className="loading-title">Initializing</span>
            <span className="loading-subtitle">Liquid Automata Engine</span>
          </div>
        </div>
      </div>
    );
  }

  const Icons = {
    dashboard: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"></path><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"></path><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"></path></svg>,
    jobs: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>,
    pipeline: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>,
    schedules: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>,
    settings: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
    toggle: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarCollapsed ? "collapsed" : ""} ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4.5c1.62-1.63 5-2.5 5-2.5"></path><path d="M12 15v5s3.03-.55 4.5-2c1.63-1.62 2.5-5 2.5-5"></path></svg>
          </div>
          <div className="flex flex-col">
            <h1 style={{ marginBottom: -2 }}>JobPilot AI</h1>
            <span className="text-[9px] uppercase tracking-[0.2em] text-indigo-400 font-extrabold opacity-70">Quantum Suite</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">Orchestration</div>
          {NAV_ITEMS.map((item) => (
            <button 
              key={item.id} 
              className={`nav-link ${page === item.id ? "active" : ""}`} 
              onClick={() => { setPage(item.id); closeSidebar(); }}
            >
              <span className="icon">{Icons[item.id]}</span>
              <span className="nav-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!isSidebarCollapsed && (
            <div className="sidebar-version" style={{ textAlign: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.2)', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase' }}>v1.6</span>
            </div>
          )}
          <div className={`sidebar-user ${isSidebarCollapsed ? "collapsed" : ""}`}>
            <UserMenu collapsed={isSidebarCollapsed} />
          </div>
          <button 
            onClick={toggleSidebar}
            className="sidebar-toggle"
          >
            <span className={`transition-transform duration-700 ${isSidebarCollapsed ? "rotate-180" : ""}`}>
              {Icons.toggle}
            </span>
            {!isSidebarCollapsed && <span className="toggle-label">Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Sidebar overlay (mobile) */}
      <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={closeSidebar} />

      {/* Main Content */}
      <main className={`main-content ${isSidebarCollapsed ? "sidebar-collapsed" : ""}`}>
        <header className="page-header">
          <div className="header-left">
            <button className="hamburger-btn" onClick={openSidebar} aria-label="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 800 }}>{getPageTitle()}</h2>
            <p style={{ opacity: 0.6 }}>{getPageDesc()}</p>
          </div>
          <div className="header-right">
            <div className={`status-pill ${pipeline.status !== 'idle' ? 'active' : ''}`} style={{ background: 'rgba(0,0,0,0.3)' }}>
              <span className="dot"></span>
              <span style={{ opacity: 0.8 }}>{pipeline.status === 'idle' ? 'STANDBY' : pipeline.status.toUpperCase()}</span>
            </div>
            <div className="status-pill" style={{ background: 'rgba(99, 102, 241, 0.05)', borderColor: 'rgba(99, 102, 241, 0.2)' }}>
              <span style={{ color: 'var(--accent-primary)', fontSize: 10, fontWeight: 800, marginRight: 4 }}>QUANTUM</span>
              <span style={{ fontWeight: 700 }}>{(settings.aiUsageCount || 0) + pipeline.aiUsageInSession}</span>
              <span style={{ opacity: 0.3, margin: '0 4px' }}>/</span>
              <span style={{ opacity: 0.5 }}>1.5K</span>
            </div>
          </div>
        </header>

        {renderPage()}
      </main>

      {/* Bottom Nav (mobile) */}
      <nav className="bottom-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={page === item.id ? "active" : ""}
            onClick={() => { setPage(item.id); closeSidebar(); }}
          >
            {Icons[item.id]}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <div style={{ 
              width: 24, height: 24, borderRadius: 6, 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.1)'
            }}>
              {t.type === "success" ? "✓" : t.type === "error" ? "!" : "i"}
            </div>
            {t.msg}
          </div>
        ))}
      </div>
    </>
  );
}

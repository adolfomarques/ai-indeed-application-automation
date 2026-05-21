// Simple global state store for the application

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  jobUrl: string;
  site?: string;
  jobType?: string;
  isRemote?: boolean;
  minAmount?: number;
  maxAmount?: number;
  currency?: string;
  datePosted?: string;
  aiMatch?: boolean;
  aiScore?: number;
  aiReasoning?: string;
  matchingSkills?: string[];
  missingSkills?: string[];
  // Application status
  applicationStatus?: 'pending' | 'applied' | 'skipped' | 'failed';
}

export interface Settings {
  geminiApiKey: string;
  groqApiKey: string;
  deepSeekApiKey: string;
  openAiApiKey: string;
  togetherApiKey: string;
  ollamaEndpoint: string;
  selectedAiProvider: "gemini" | "groq" | "deepseek" | "openai" | "ollama" | "together";
  browserUseApiKey: string;
  browserProfileId: string;
  userPreferences: string;
  countries: string[];
  searchTerms: string[];
  location: string;
  jobSites: string[];
  hoursOld: number;
  resultsPerSearch: number;
  batchSize: number;
  aiUsageCount: number;
  myResume: string;
}

export interface PipelineState {
  status: 'idle' | 'scraping' | 'filtering' | 'applying' | 'completed' | 'error';
  currentStep: number;
  logs: LogEntry[];
  error?: string;
  progress: number;
  stepProgress: {
    scrape: number;
    filter: number;
    apply: number;
  };
  aiUsageInSession: number; // Session specific
  quotaExceeded: boolean;
}

export interface LogEntry {
  timestamp: string;
  message: string;
  level: 'info' | 'success' | 'warn' | 'error';
}

export interface ScheduleRun {
  id: string;
  timestamp: string;
  jobCount: number;
  matchedCount: number;
  status: 'running' | 'completed' | 'failed';
}

export interface Schedule {
  id: string;
  name: string;
  enabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly';
  hour?: number;
  minute?: number;
  dayOfWeek?: number;
  timezone?: string;
  lastRun?: string;
  lastExport?: string;
  nextRun?: string;
  runCount?: number;
  lastJobCount?: number;
  runScrape: boolean;
  runFilter: boolean;
  runs?: ScheduleRun[];
  qstashMessageId?: string;
}

export const DEFAULT_SETTINGS: Settings = {
  geminiApiKey: "",
  groqApiKey: "",
  deepSeekApiKey: "",
  openAiApiKey: "",
  togetherApiKey: "",
  ollamaEndpoint: "http://localhost:11434",
  selectedAiProvider: "gemini",
  browserUseApiKey: '',
  browserProfileId: '',
  userPreferences: '',
  countries: ['USA'],
  searchTerms: ['software engineer'],
  location: '',
  jobSites: ['indeed', 'linkedin'],
  hoursOld: 72,
  resultsPerSearch: 10,
  batchSize: 5,
  aiUsageCount: 0,
  myResume: '',
};

export const AVAILABLE_COUNTRIES = [
  'USA', 'UK', 'Canada', 'Australia', 'Germany', 'France',
  'Netherlands', 'Singapore', 'Philippines', 'Japan', 'India',
  'Brazil', 'Mexico', 'Spain', 'Italy', 'Sweden', 'Switzerland',
  'Ireland', 'New Zealand', 'South Korea', 'Portugal', 'Poland',
];

export const AVAILABLE_JOB_SITES: { id: string; label: string; icon: string; status: 'stable' | 'beta' | 'experimental' }[] = [
  { id: 'indeed',        label: 'Indeed',        icon: '🟦', status: 'stable' },
  { id: 'linkedin',      label: 'LinkedIn',      icon: '🔗', status: 'stable' },
  { id: 'glassdoor',     label: 'Glassdoor',     icon: '🟢', status: 'beta' },
  { id: 'google',        label: 'Google Jobs',   icon: '🔍', status: 'beta' },
  { id: 'zip_recruiter', label: 'ZipRecruiter',  icon: '⚡', status: 'experimental' },
  { id: 'bayt',          label: 'Bayt',          icon: '🌍', status: 'experimental' },
  { id: 'naukri',        label: 'Naukri',        icon: '🇮🇳', status: 'experimental' },
  { id: 'bdjobs',        label: 'BDJobs',        icon: '🇧🇩', status: 'experimental' },
];

export const DATE_RANGE_OPTIONS: { value: number; label: string }[] = [
  { value: 24,   label: 'Last 24 hours' },
  { value: 72,   label: 'Last 3 days' },
  { value: 168,  label: 'Last week' },
  { value: 336,  label: 'Last 2 weeks' },
  { value: 504,  label: 'Last 3 weeks' },
  { value: 720,  label: 'Last month' },
  { value: 2160, label: 'Last 3 months' },
  { value: 0,    label: 'No limit (all)' },
];

export const SCHEDULE_FREQUENCIES: { value: 'hourly' | 'daily' | 'weekly'; label: string; desc: string }[] = [
  { value: 'hourly', label: 'Hourly', desc: 'Every hour' },
  { value: 'daily', label: 'Daily', desc: 'Once per day' },
  { value: 'weekly', label: 'Weekly', desc: 'Once per week' },
];

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export const TIMEZONES = [
  { value: 'America/New_York', label: 'New York (EST/EDT)', offset: -5 },
  { value: 'America/Chicago', label: 'Chicago (CST/CDT)', offset: -6 },
  { value: 'America/Denver', label: 'Denver (MST/MDT)', offset: -7 },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST/PDT)', offset: -8 },
  { value: 'America/Sao_Paulo', label: 'São Paulo (BRT)', offset: -3 },
  { value: 'Europe/London', label: 'London (GMT/BST)', offset: 0 },
  { value: 'Europe/Paris', label: 'Paris (CET/CEST)', offset: 1 },
  { value: 'Europe/Berlin', label: 'Berlin (CET/CEST)', offset: 1 },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)', offset: 9 },
  { value: 'Asia/Singapore', label: 'Singapore (SGT)', offset: 8 },
  { value: 'Asia/Dubai', label: 'Dubai (GST)', offset: 4 },
  { value: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', offset: 11 },
];

export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getNextRunTime(frequency: string, hour: number, minute: number, dayOfWeek?: number): string {
  const now = new Date();
  const next = new Date(now);
  
  if (frequency === 'hourly') {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
  } else if (frequency === 'daily') {
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === 'weekly') {
    const targetDay = dayOfWeek ?? 1;
    const currentDay = now.getDay();
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd < 0) daysToAdd += 7;
    next.setDate(next.getDate() + daysToAdd);
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);
  }
  
  return next.toISOString();
}

export function jobsToCSV(jobs: Job[]): string {
  const headers = [
    'Title', 'Company', 'Location', 'Site', 'Job URL', 
    'Job Type', 'Remote', 'Salary Min', 'Salary Max', 'Currency',
    'Date Posted', 'AI Match', 'AI Score', 'AI Reasoning',
    'Matching Skills', 'Missing Skills', 'Application Status'
  ];
  
  const rows = jobs.map(job => [
    escapeCSV(job.title),
    escapeCSV(job.company),
    escapeCSV(job.location),
    escapeCSV(job.site || ''),
    escapeCSV(job.jobUrl),
    escapeCSV(job.jobType || ''),
    job.isRemote ? 'Yes' : 'No',
    job.minAmount?.toString() || '',
    job.maxAmount?.toString() || '',
    escapeCSV(job.currency || ''),
    escapeCSV(job.datePosted || ''),
    job.aiMatch ? 'Yes' : 'No',
    job.aiScore?.toString() || '',
    escapeCSV(job.aiReasoning || ''),
    escapeCSV((job.matchingSkills || []).join(', ')),
    escapeCSV((job.missingSkills || []).join(', ')),
    escapeCSV(job.applicationStatus || '')
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

function escapeCSV(str: string | undefined | null): string {
  if (!str) return '';
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function getScheduleRunJobsKey(scheduleId: string, runId: string): string {
  return `jobpilot_schedule_jobs_${scheduleId}_${runId}`;
}

export function getScheduleJobsKey(scheduleId: string): string {
  return `jobpilot_schedule_jobs_${scheduleId}`;
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

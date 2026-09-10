// src/lib/kv.ts
import { kv } from "@vercel/kv";

/** Verifica se o Vercel KV / Upstash Redis está configurado no ambiente */
export const isKvConfigured = (): boolean => {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
};

/** Returns the number of active users stored in KV */
export async function getActiveUserCount(): Promise<number> {
  if (!isKvConfigured()) return 0;
  try {
    const keys = await kv.keys("user:*");
    return keys.length;
  } catch (err) {
    console.warn("[KV] getActiveUserCount error (operating in memory/fallback):", err);
    return 0;
  }
}

/** Persists a user profile in KV */
export async function addActiveUser(id: string, data: Record<string, unknown>) {
  if (!isKvConfigured()) return;
  try {
    await kv.set(`user:${id}`, JSON.stringify(data));
  } catch (err) {
    console.warn("[KV] addActiveUser error:", err);
  }
}

/** Removes a user profile from KV (on sign‑out) */
export async function removeActiveUser(id: string) {
  if (!isKvConfigured()) return;
  try {
    await kv.del(`user:${id}`);
  } catch (err) {
    console.warn("[KV] removeActiveUser error:", err);
  }
}

// ─── User Schedules ─────────────────────────────────────────────

const SCHEDULES_PREFIX = "user_schedules:";

/** Returns the schedules array for a given user */
export async function getUserSchedules(userId: string): Promise<unknown> {
  if (!isKvConfigured()) return null;
  try {
    return await kv.get(`${SCHEDULES_PREFIX}${userId}`);
  } catch (err) {
    console.warn("[KV] getUserSchedules error:", err);
    return null;
  }
}

/** Persists the schedules array for a given user */
export async function setUserSchedules(userId: string, data: unknown) {
  if (!isKvConfigured()) return;
  try {
    await kv.set(`${SCHEDULES_PREFIX}${userId}`, JSON.stringify(data));
  } catch (err) {
    console.warn("[KV] setUserSchedules error:", err);
  }
}

// ─── User Jobs (main pipeline) ──────────────────────────────────

const JOBS_PREFIX = "user_jobs:";

/** Returns the latest job results for a given user */
export async function getUserJobs(userId: string): Promise<unknown> {
  if (!isKvConfigured()) return null;
  try {
    return await kv.get(`${JOBS_PREFIX}${userId}`);
  } catch (err) {
    console.warn("[KV] getUserJobs error:", err);
    return null;
  }
}

/** Persists the latest job results for a given user */
export async function setUserJobs(userId: string, data: unknown) {
  if (!isKvConfigured()) return;
  try {
    await kv.set(`${JOBS_PREFIX}${userId}`, JSON.stringify(data));
  } catch (err) {
    console.warn("[KV] setUserJobs error:", err);
  }
}

// ─── User Schedule Run Jobs ─────────────────────────────────────

const SCHEDULE_RUN_JOBS_PREFIX = "user_schedule_run_jobs:";

/** Returns the map of schedule-run jobs for a given user */
export async function getUserScheduleRunJobs(userId: string): Promise<Record<string, unknown>> {
  if (!isKvConfigured()) return {};
  try {
    const data = await kv.get(`${SCHEDULE_RUN_JOBS_PREFIX}${userId}`);
    return (data as Record<string, unknown>) ?? {};
  } catch (err) {
    console.warn("[KV] getUserScheduleRunJobs error:", err);
    return {};
  }
}

/** Persists the map of schedule-run jobs for a given user */
export async function setUserScheduleRunJobs(userId: string, data: Record<string, unknown>) {
  if (!isKvConfigured()) return;
  try {
    await kv.set(`${SCHEDULE_RUN_JOBS_PREFIX}${userId}`, JSON.stringify(data));
  } catch (err) {
    console.warn("[KV] setUserScheduleRunJobs error:", err);
  }
}

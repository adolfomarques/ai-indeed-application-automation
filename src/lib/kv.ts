// src/lib/kv.ts
import { kv } from "@vercel/kv";

/** Returns the number of active users stored in KV */
export async function getActiveUserCount(): Promise<number> {
  const keys = await kv.keys("user:*");
  return keys.length;
}

/** Persists a user profile in KV */
export async function addActiveUser(id: string, data: Record<string, unknown>) {
  await kv.set(`user:${id}`, JSON.stringify(data));
}

/** Removes a user profile from KV (on sign‑out) */
export async function removeActiveUser(id: string) {
  await kv.del(`user:${id}`);
}

// ─── User Schedules ─────────────────────────────────────────────

const SCHEDULES_PREFIX = "user_schedules:";

/** Returns the schedules array for a given user */
export async function getUserSchedules(userId: string): Promise<unknown> {
  return kv.get(`${SCHEDULES_PREFIX}${userId}`);
}

/** Persists the schedules array for a given user */
export async function setUserSchedules(userId: string, data: unknown) {
  await kv.set(`${SCHEDULES_PREFIX}${userId}`, JSON.stringify(data));
}

// ─── User Jobs (main pipeline) ──────────────────────────────────

const JOBS_PREFIX = "user_jobs:";

/** Returns the latest job results for a given user */
export async function getUserJobs(userId: string): Promise<unknown> {
  return kv.get(`${JOBS_PREFIX}${userId}`);
}

/** Persists the latest job results for a given user */
export async function setUserJobs(userId: string, data: unknown) {
  await kv.set(`${JOBS_PREFIX}${userId}`, JSON.stringify(data));
}

// ─── User Schedule Run Jobs ─────────────────────────────────────

const SCHEDULE_RUN_JOBS_PREFIX = "user_schedule_run_jobs:";

/** Returns the map of schedule-run jobs for a given user */
export async function getUserScheduleRunJobs(userId: string): Promise<Record<string, unknown>> {
  const data = await kv.get(`${SCHEDULE_RUN_JOBS_PREFIX}${userId}`);
  return (data as Record<string, unknown>) ?? {};
}

/** Persists the map of schedule-run jobs for a given user */
export async function setUserScheduleRunJobs(userId: string, data: Record<string, unknown>) {
  await kv.set(`${SCHEDULE_RUN_JOBS_PREFIX}${userId}`, JSON.stringify(data));
}

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

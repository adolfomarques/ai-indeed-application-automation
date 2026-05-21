import { Client } from "@upstash/qstash";

function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL
    || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
    || "http://localhost:3000";
}

export function getQstashClient(): Client | null {
  const token = process.env.QSTASH_TOKEN;
  if (!token) return null;
  return new Client({ token });
}

export function calculateDelay(nextRun: string): number {
  const diff = new Date(nextRun).getTime() - Date.now();
  return Math.max(Math.ceil(diff / 1000), 0);
}

export async function scheduleScheduleRun(
  userId: string,
  scheduleId: string,
  nextRun: string,
): Promise<string | null> {
  const client = getQstashClient();
  if (!client) {
    console.log("[QStash] No client: QSTASH_TOKEN not set");
    return null;
  }

  const delay = calculateDelay(nextRun);
  if (delay < 0) {
    console.log(`[QStash] Delay < 0 for ${scheduleId}, nextRun=${nextRun}`);
    return null;
  }

  const baseUrl = getBaseUrl();
  const url = `${baseUrl}/api/cron/check-schedules`;
  console.log(`[QStash] Scheduling run for schedule ${scheduleId} at ${nextRun} (delay=${delay}s, url=${url})`);

  try {
    const { messageId } = await client.publishJSON({
      url,
      body: { userId, scheduleId },
      delay,
    });
    console.log(`[QStash] Scheduled successfully: messageId=${messageId}`);
    return messageId;
  } catch (e) {
    console.error("[QStash] Failed to schedule message:", e);
    return null;
  }
}

export async function cancelScheduleRun(messageId: string): Promise<void> {
  const client = getQstashClient();
  if (!client) return;

  try {
    await client.messages.cancel(messageId);
    console.log(`[QStash] Cancelled message ${messageId}`);
  } catch (e) {
    console.error("[QStash] Failed to cancel message:", e);
  }
}

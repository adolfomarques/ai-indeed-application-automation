import { Client } from "@upstash/qstash";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

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
  if (!client) return null;

  const delay = calculateDelay(nextRun);
  if (delay <= 0) return null;

  try {
    const { messageId } = await client.publishJSON({
      url: `${BASE_URL}/api/cron/check-schedules`,
      body: { userId, scheduleId },
      delay,
    });
    return messageId;
  } catch (e) {
    console.error("Failed to schedule QStash message:", e);
    return null;
  }
}

export async function cancelScheduleRun(messageId: string): Promise<void> {
  const client = getQstashClient();
  if (!client) return;

  try {
    await client.messages.cancel(messageId);
  } catch (e) {
    console.error("Failed to cancel QStash message:", e);
  }
}

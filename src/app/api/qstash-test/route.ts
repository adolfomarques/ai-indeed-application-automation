import { NextResponse } from "next/server";
import { getQstashClient } from "@/lib/qstash";

export async function GET() {
  const results: Record<string, unknown> = {
    qstashTokenSet: !!process.env.QSTASH_TOKEN,
    nextauthUrl: process.env.NEXTAUTH_URL || "(not set)",
    vercelUrl: process.env.VERCEL_URL || "(not set)",
    baseUrl: process.env.NEXTAUTH_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"),
  };

  const client = getQstashClient();
  if (!client) {
    results.qstashStatus = "QSTASH_TOKEN not configured";
    return NextResponse.json(results);
  }

  try {
    const testDelay = 5;
    const { messageId } = await client.publishJSON({
      url: `${results.baseUrl}/api/cron/check-schedules`,
      body: { userId: "__test__", scheduleId: "__test__" },
      delay: testDelay,
    });
    results.qstashStatus = "connected";
    results.testMessageId = messageId;
    results.testMessageInfo = `Message scheduled, check logs in ~${testDelay}s`;
  } catch (e) {
    results.qstashStatus = "error";
    results.qstashError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}

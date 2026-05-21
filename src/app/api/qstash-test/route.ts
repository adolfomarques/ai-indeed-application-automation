import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getQstashClient, calculateDelay } from "@/lib/qstash";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: Record<string, unknown> = {
    userId,
    qstashTokenSet: !!process.env.QSTASH_TOKEN,
    nextauthUrl: process.env.NEXTAUTH_URL || "(not set)",
    vercelUrl: process.env.VERCEL_URL || "(not set)",
  };

  const client = getQstashClient();
  if (!client) {
    results.qstashStatus = "QSTASH_TOKEN not configured";
    return NextResponse.json(results);
  }

  try {
    const testDelay = 5;
    const { messageId } = await client.publishJSON({
      url: `${process.env.NEXTAUTH_URL || `https://${process.env.VERCEL_URL || "localhost:3000"}`}/api/cron/check-schedules`,
      body: { userId: userId, scheduleId: "__test__" },
      delay: testDelay,
    });
    results.qstashStatus = "connected";
    results.testMessageId = messageId;
    results.testMessageInfo = `Message scheduled, will fire in ~${testDelay}s`;
  } catch (e) {
    results.qstashStatus = "error";
    results.qstashError = e instanceof Error ? e.message : String(e);
  }

  return NextResponse.json(results);
}

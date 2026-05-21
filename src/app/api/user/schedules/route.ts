import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserSchedules, setUserSchedules } from "@/lib/kv";
import { scheduleScheduleRun, cancelScheduleRun } from "@/lib/qstash";
import type { Schedule } from "@/lib/store";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await getUserSchedules(userId);
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const incoming = (await request.json()) as Schedule[];

    // Cancel old QStash messages for schedules that changed
    const existing = (await getUserSchedules(userId)) as Schedule[] | null;
    if (Array.isArray(existing)) {
      for (const oldSched of existing) {
        const updated = incoming.find((s) => s.id === oldSched.id);
        const wasRemoved = !updated;
        const wasDisabled = updated && !updated.enabled;
        const nextRunChanged = updated && updated.nextRun !== oldSched.nextRun;

        if ((wasRemoved || wasDisabled || nextRunChanged) && oldSched.qstashMessageId) {
          await cancelScheduleRun(oldSched.qstashMessageId).catch(() => {});
        }
      }
    }

    // Schedule QStash messages for enabled schedules with a future nextRun
    const qstashToken = process.env.QSTASH_TOKEN;
    for (const sched of incoming) {
      if (sched.enabled && sched.nextRun && qstashToken) {
        const messageId = await scheduleScheduleRun(userId, sched.id, sched.nextRun);
        if (messageId) {
          sched.qstashMessageId = messageId;
        }
      } else if (!sched.enabled) {
        sched.qstashMessageId = undefined;
      }
    }

    await setUserSchedules(userId, incoming);
    return NextResponse.json({ success: true, schedules: incoming });
  } catch (e) {
    console.error("Failed to save schedules:", e);
    return NextResponse.json({ error: "Failed to save schedules" }, { status: 500 });
  }
}

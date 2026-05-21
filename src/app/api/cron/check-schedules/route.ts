import { NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { getUserSchedules, setUserSchedules } from "@/lib/kv";
import { scheduleScheduleRun } from "@/lib/qstash";
import type { Schedule } from "@/lib/store";

export const maxDuration = 300;

export async function POST(request: Request) {
  const rawBody = await request.text();

  const signature = request.headers.get("Upstash-Signature");
  if (signature) {
    const currentKey = process.env.QSTASH_CURRENT_SIGNING_KEY;
    const nextKey = process.env.QSTASH_NEXT_SIGNING_KEY;
    if (currentKey && nextKey) {
      const receiver = new Receiver({ currentSigningKey: currentKey, nextSigningKey: nextKey });
      const isValid = await receiver.verify({ body: rawBody, signature }).catch(() => false);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }
  }

  let body: { userId?: string; scheduleId?: string };
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { userId, scheduleId } = body;
  if (!userId || !scheduleId) {
    return NextResponse.json({ error: "Missing userId or scheduleId" }, { status: 400 });
  }

  try {
    if (scheduleId === "__test__") {
      console.log(`[QStash] Test message received for user ${userId}`);
      return NextResponse.json({ success: true, message: "QStash test OK" });
    }

    const schedules = (await getUserSchedules(userId)) as Schedule[] | null;
    if (!Array.isArray(schedules)) {
      return NextResponse.json({ error: "No schedules found for user" }, { status: 404 });
    }

    const scheduleIndex = schedules.findIndex((s) => s.id === scheduleId);
    if (scheduleIndex === -1) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
    }

    const schedule = schedules[scheduleIndex];
    if (!schedule.enabled) {
      return NextResponse.json({ success: true, message: "Schedule is disabled, skipping" });
    }

    console.log(`[QStash] Executing schedule "${schedule.name}" for user ${userId}`);

    const runId = crypto.randomUUID();
    const runEntry = {
      id: runId,
      timestamp: new Date().toISOString(),
      jobCount: 0,
      matchedCount: 0,
      status: "running" as const,
    };

    schedules[scheduleIndex] = {
      ...schedule,
      runs: [runEntry, ...(schedule.runs || [])],
    };
    await setUserSchedules(userId, schedules);

    let jobCount = 0;
    let matchedCount = 0;

    if (schedule.runScrape) {
      console.log(`[QStash] Scraping jobs for schedule "${schedule.name}"...`);
      const scrapeRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/scrape`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countries: ["USA"],
          searchTerms: ["software engineer"],
          resultsPerSearch: 10,
          jobSites: ["indeed"],
          hoursOld: 72,
          location: "",
        }),
      });

      const scrapeData = await scrapeRes.json();
      jobCount = scrapeData.jobs?.length || 0;
      console.log(`[QStash] Found ${jobCount} jobs`);

      if (schedule.runFilter && jobCount > 0) {
        console.log(`[QStash] Filtering ${jobCount} jobs with AI...`);
        const filterRes = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/filter-v2`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jobs: scrapeData.jobs,
            userPreferences: "",
            myResume: "",
            geminiApiKey: process.env.GEMINI_API_KEY || "",
            groqApiKey: process.env.GROQ_API_KEY || "",
            selectedAiProvider: "gemini",
          }),
        });

        const filterData = await filterRes.json();
        const results = filterData.results || [];
        matchedCount = results.filter((r: any) => r.matches).length;
        console.log(`[QStash] ${matchedCount} jobs matched`);
      }
    }

    const updatedRun = {
      id: runId,
      timestamp: new Date().toISOString(),
      jobCount,
      matchedCount,
      status: "completed" as const,
    };

    schedules[scheduleIndex] = {
      ...schedules[scheduleIndex],
      lastJobCount: jobCount,
      lastRun: new Date().toISOString(),
      runCount: (schedules[scheduleIndex].runCount || 0) + 1,
      runs: schedules[scheduleIndex].runs?.map((r) =>
        r.id === runId ? updatedRun : r
      ),
    };

    const nextRun = getNextRunTime(
      schedule.frequency,
      schedule.hour ?? 9,
      schedule.minute ?? 0,
      schedule.dayOfWeek
    );
    schedules[scheduleIndex].nextRun = nextRun;

    const oldMessageId = schedules[scheduleIndex].qstashMessageId;
    if (oldMessageId) {
      try {
        const { Client } = await import("@upstash/qstash");
        const client = new Client({ token: process.env.QSTASH_TOKEN! });
        await client.messages.cancel(oldMessageId).catch(() => {});
      } catch {}
    }

    const newMessageId = await scheduleScheduleRun(userId, scheduleId, nextRun);
    if (newMessageId) {
      schedules[scheduleIndex].qstashMessageId = newMessageId;
    }

    await setUserSchedules(userId, schedules);

    return NextResponse.json({
      success: true,
      message: `Schedule "${schedule.name}" executed. ${jobCount} jobs found, ${matchedCount} matched.`,
      jobCount,
      matchedCount,
    });
  } catch (error) {
    console.error("[QStash] Error executing schedule:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getNextRunTime(frequency: string, hour: number, minute: number, dayOfWeek?: number): string {
  const now = new Date();
  const next = new Date(now);

  if (frequency === "hourly") {
    next.setHours(next.getHours() + 1);
    next.setMinutes(0, 0, 0);
  } else if (frequency === "daily") {
    next.setHours(hour, minute, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
  } else if (frequency === "weekly") {
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

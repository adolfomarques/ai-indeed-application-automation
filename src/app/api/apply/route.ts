import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { kv } from "@vercel/kv";
import applyToJobs from "../../../api/cron/apply";

export const maxDuration = 300;

async function getUserResume(): Promise<{ base64?: string; fileName?: string; text?: string } | null> {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string } | undefined)?.id;
    if (!userId) return null;

    const resumeData = await kv.get(`user_resume:${userId}`) as { base64?: string; fileName?: string; sizeBytes?: number } | null;
    if (!resumeData?.base64) return null;

    const userSettings = await kv.get(`user_settings:${userId}`) as { myResume?: string } | null;
    return {
      base64: resumeData.base64,
      fileName: resumeData.fileName,
      text: userSettings?.myResume || "",
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobs, geminiApiKey, groqApiKey, userPreferences, browserUseApiKey, browserProfileId } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }

    const matchedJobs = jobs.filter((j: any) => j.aiMatch);
    
    if (matchedJobs.length === 0) {
      return NextResponse.json({ error: "No matched jobs to apply to" }, { status: 400 });
    }

    // Load user's uploaded resume for cloud mode
    const resume = await getUserResume();

    // CLOUD MODE DETECTION
    // If running on Vercel or forced via APPLY_MODE=cloud, use the Browser-Use cloud SDK
    if (process.env.APPLY_MODE === "cloud" || process.env.VERCEL === "1") {
      console.log("☁️ Vercel or Cloud Mode detected. Using Browser-Use Cloud API...");

      // Set keys to environment for the Browser-Use client to pick up
      if (geminiApiKey) process.env.GEMINI_API_KEY = geminiApiKey;
      if (groqApiKey) process.env.GROQ_API_KEY = groqApiKey;
      if (userPreferences) process.env.USER_PREFERENCES = userPreferences;

      // Trigger cloud automation without waiting (keeps execution time < 1s)
      // Pass keys directly as parameters (more reliable than process.env in serverless)
      const results = await applyToJobs(matchedJobs, false, resume ?? undefined, browserUseApiKey, browserProfileId);

      return NextResponse.json({
        success: true,
        message: "Cloud application agent started. Click the link to watch it live!",
        mode: "cloud",
        ...results
      });
    }

    // LOCAL MODE (FALLBACK)
    // Run the local Playwright Python script
    console.log("💻 Local environment detected. Spawning local Python agent...");
    const jobUrls = matchedJobs.map((j: any) => j.jobUrl).filter(Boolean);
    const scriptPath = path.join(process.cwd(), "scripts", "apply_local.py");

    const pythonProcess = spawn("python3", [scriptPath]);

    pythonProcess.stdout.on("data", (data) => {
      console.log(`[Python Agent]: ${data}`);
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`[Python Agent Error]: ${data}`);
    });

    const inputData = JSON.stringify({
      urls: jobUrls,
      gemini_key: geminiApiKey,
      groq_key: groqApiKey,
      user_context: userPreferences
    });

    pythonProcess.stdin.write(inputData);
    pythonProcess.stdin.end();

    return NextResponse.json({
      success: true,
      message: "Local application agent started. Check your server terminal/logs for real-time status.",
      jobCount: jobUrls.length,
      mode: "local"
    });

  } catch (error) {
    console.error("Apply API error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Apply failed" }, { status: 500 });
  }
}


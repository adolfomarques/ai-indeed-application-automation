import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

interface HeuristicResult {
  jobId: string;
  matches: boolean;
  score: number;
  reasoning: string;
  matchingSkills: string[];
  missingSkills: string[];
}

function runHeuristicScreening(
  jobs: any[],
  myResume: string,
  userPreferences: string,
  customDealbreakers: string,
  threshold: number
): HeuristicResult[] {
  const commonTech = [
    "react", "typescript", "javascript", "node", "nodejs", "next.js", "nextjs",
    "python", "django", "fastapi", "aws", "docker", "kubernetes", "gcp", "azure",
    "sql", "postgresql", "mongodb", "graphql", "tailwind", "vue", "angular",
    "golang", "go", "java", "spring", "c++", "c#", ".net", "rust", "redis",
    "ci/cd", "terraform", "rest api", "microservices", "agile", "scrum"
  ];

  const resumeText = (myResume || "").toLowerCase();
  const prefText = (userPreferences || "").toLowerCase();
  const dealbreakers = (customDealbreakers || "").toLowerCase();

  const userSkills = commonTech.filter(tech => 
    resumeText.includes(tech) || prefText.includes(tech)
  );

  return jobs.map((job) => {
    const title = (job.title || "").toLowerCase();
    const desc = (job.description || "").toLowerCase();
    const isRemote = job.isRemote || title.includes("remote") || desc.includes("remote");

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    commonTech.forEach(tech => {
      const inJob = desc.includes(tech) || title.includes(tech);
      const inUser = userSkills.includes(tech);
      if (inJob && inUser) {
        matchedSkills.push(tech.charAt(0).toUpperCase() + tech.slice(1));
      } else if (inJob && !inUser) {
        missingSkills.push(tech.charAt(0).toUpperCase() + tech.slice(1));
      }
    });

    let score = 5.0; // Baseline

    // Title alignment
    if (prefText && title.split(/\s+/).some((word: string) => word.length > 3 && prefText.includes(word))) {
      score += 2.0;
    } else if (title.includes("senior") || title.includes("full stack") || title.includes("engineer") || title.includes("developer")) {
      score += 1.0;
    }

    // Skill coverage bonus
    const totalTechInJob = matchedSkills.length + missingSkills.length;
    if (totalTechInJob > 0) {
      const matchRatio = matchedSkills.length / totalTechInJob;
      score += matchRatio * 3.0;
    }

    // Remote bonus if preferred
    if (prefText.includes("remote") && isRemote) {
      score += 1.0;
    }

    // Dealbreakers penalties
    if (dealbreakers.includes("remote only") && !isRemote) {
      score -= 3.0;
    }
    if (dealbreakers.includes("senior only") && !title.includes("senior") && !title.includes("lead")) {
      score -= 2.0;
    }

    // Clamp score
    const finalScore = Math.max(1.0, Math.min(9.8, Math.round(score * 10) / 10));
    const matches = finalScore >= threshold;

    return {
      jobId: job.id,
      matches,
      score: finalScore,
      reasoning: `Algorithmic Matcher: ${matchedSkills.length} matching core skills (${matchedSkills.slice(0, 3).join(", ") || "General Alignment"}), ${missingSkills.length} missing. WCS calibrated to ${finalScore}/10.`,
      matchingSkills: matchedSkills.slice(0, 6),
      missingSkills: missingSkills.slice(0, 4),
    };
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      jobs, 
      userPreferences = "", 
      myResume = "", 
      geminiApiKey, 
      groqApiKey, 
      deepSeekApiKey,
      openAiApiKey,
      togetherApiKey, 
      ollamaEndpoint,
      selectedAiProvider = "groq",
      matchingThreshold = 7.5,
      customDealbreakers = ""
    } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }

    // Resolve API keys with server environment fallbacks
    const effectiveGroqKey = groqApiKey || process.env.GROQ_API_KEY || "";
    const effectiveGeminiKey = geminiApiKey || process.env.GEMINI_API_KEY || "";
    const effectiveDeepSeekKey = deepSeekApiKey || process.env.DEEPSEEK_API_KEY || "";
    const effectiveOpenAiKey = openAiApiKey || process.env.OPENAI_API_KEY || "";
    const effectiveTogetherKey = togetherApiKey || process.env.TOGETHER_API_KEY || "";

    // Explicit heuristic mode requested
    if (selectedAiProvider === "heuristic") {
      const results = runHeuristicScreening(jobs, myResume, userPreferences, customDealbreakers, matchingThreshold);
      return NextResponse.json({ success: true, results, provider: "heuristic" });
    }

    const MAX_DESC = 900;
    const jobDescriptions = jobs
      .map((job: any, idx: number) => {
        const desc = (job.description || "N/A").substring(0, MAX_DESC);
        return `[Job ${idx}]\nTitle: ${job.title || "N/A"}\nCompany: ${job.company || "N/A"}\nLocation: ${job.location || "N/A"}\nDescription: ${desc}`;
      })
      .join("\n\n---\n\n");

    const dealbreakerInstruction = customDealbreakers.trim()
      ? `STRICT USER DEALBREAKERS (If violated, penalize by -3.5 and set matchesPreferences: false):\n"${customDealbreakers.trim()}"\n`
      : "";

    const prompt = `
Context:
My Resume: "${myResume || "Software Engineering Professional"}"
My Preferences: "${userPreferences || "Software engineering roles with good culture"}"
${dealbreakerInstruction}
Jobs to analyze:
${jobDescriptions}

Task:
Analyze the jobs provided above and calculate a "Weighted Compatibility Score (WCS) v2.2" for each from 0.0 to 10.0.
Follow this calculation: ((Sum(Category_Score * Category_Weight)) * MustHaveMultiplier) - TotalPenalties.

SCORING PARAMETERS:
1. Core Role Experience (25%)
2. Hard Skills Match (25%)
3. Domain Knowledge (15%)
4. Impact & Seniority (15%)
5. Education/Languages (10%)
6. Cultural & Remote Fit (10%)

THRESHOLD:
Set matchesPreferences: true ONLY if score >= ${matchingThreshold}. Otherwise false.

IMPORTANT: Respond ONLY with a valid JSON object:
{
  "results": [
    {
      "jobIndex": number,
      "score": number,
      "matchesPreferences": boolean,
      "reasoning": "string (concise breakdown)",
      "matching_skills": ["string"],
      "missing_skills": ["string"]
    }
  ]
}
`;

    let textResponse = "";
    let retries = 0;
    const MAX_RETRIES = 3;
    let isSuccess = false;

    while (retries < MAX_RETRIES && !isSuccess) {
      try {
        if (selectedAiProvider === "gemini") {
          if (!effectiveGeminiKey) throw new Error("No Gemini key available");
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(effectiveGeminiKey);
          
          const geminiModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
          for (const modelName of geminiModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent(prompt);
              textResponse = result.response.text();
              if (textResponse) {
                isSuccess = true;
                break;
              }
            } catch (e: any) {
              console.warn(`[Filter API] Gemini model ${modelName} failed:`, e.message);
            }
          }
        } 
        else if (selectedAiProvider === "groq") {
          if (!effectiveGroqKey) throw new Error("No Groq key available");

          const groqModels = [
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "openai/gpt-oss-120b",
            "qwen/qwen3.6-27b",
          ];

          for (const modelName of groqModels) {
            try {
              const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                  "Authorization": `Bearer ${effectiveGroqKey}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  model: modelName,
                  messages: [{ role: "user", content: prompt }],
                  temperature: 0.1,
                  response_format: { type: "json_object" },
                }),
              });

              if (res.status === 429) {
                console.warn(`[Filter API] Groq 429 on ${modelName}. Trying next...`);
                continue;
              }

              const data = await res.json();
              if (res.ok && data.choices?.[0]?.message?.content) {
                textResponse = data.choices[0].message.content;
                isSuccess = true;
                break;
              }
            } catch (e: any) {
              console.warn(`[Filter API] Groq error on ${modelName}:`, e.message);
            }
          }
        }
        else if (selectedAiProvider === "openai") {
          if (!effectiveOpenAiKey) throw new Error("No OpenAI key available");
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${effectiveOpenAiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-mini",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" },
            }),
          });
          const data = await res.json();
          if (res.ok && data.choices?.[0]?.message?.content) {
            textResponse = data.choices[0].message.content;
            isSuccess = true;
          }
        }
        else if (selectedAiProvider === "deepseek") {
          if (!effectiveDeepSeekKey) throw new Error("No DeepSeek key available");
          const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${effectiveDeepSeekKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" },
            }),
          });
          const data = await res.json();
          if (res.ok && data.choices?.[0]?.message?.content) {
            textResponse = data.choices[0].message.content;
            isSuccess = true;
          }
        }
        else if (selectedAiProvider === "together") {
          if (!effectiveTogetherKey) throw new Error("No Together key available");
          const res = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${effectiveTogetherKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" },
            }),
          });
          const data = await res.json();
          if (res.ok && data.choices?.[0]?.message?.content) {
            textResponse = data.choices[0].message.content;
            isSuccess = true;
          }
        }
        else if (selectedAiProvider === "ollama") {
          const endpoint = ollamaEndpoint || "http://localhost:11434";
          const res = await fetch(`${endpoint}/api/generate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "llama3.2",
              prompt,
              stream: false,
              format: "json",
            }),
          });
          const data = await res.json();
          if (res.ok && data.response) {
            textResponse = data.response;
            isSuccess = true;
          }
        }

        if (isSuccess) break;
      } catch (err: any) {
        console.warn(`[Filter API] Attempt ${retries + 1} failed:`, err.message);
      }
      retries++;
      if (!isSuccess && retries < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    // If AI calls failed or returned empty, seamlessly fallback to Heuristic Engine
    if (!textResponse || !isSuccess) {
      console.warn("[Filter API] AI calls exhausted. Seamlessly switching to Heuristic Matcher.");
      const fallbackResults = runHeuristicScreening(jobs, myResume, userPreferences, customDealbreakers, matchingThreshold);
      return NextResponse.json({
        success: true,
        results: fallbackResults,
        provider: "heuristic_fallback",
        note: "Screened using JobPilot Algorithmic Heuristic Engine due to upstream AI limits.",
      });
    }

    // Robust JSON parsing
    let cleanJson = textResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch {
      console.warn("[Filter API] AI returned non-JSON. Falling back to Heuristic Engine.");
      const fallbackResults = runHeuristicScreening(jobs, myResume, userPreferences, customDealbreakers, matchingThreshold);
      return NextResponse.json({ success: true, results: fallbackResults, provider: "heuristic_fallback" });
    }

    let items: any[] = [];
    if (Array.isArray(parsedData)) {
      items = parsedData;
    } else if (parsedData.results && Array.isArray(parsedData.results)) {
      items = parsedData.results;
    } else if (parsedData.jobs && Array.isArray(parsedData.jobs)) {
      items = parsedData.jobs;
    } else if (typeof parsedData === "object") {
      const firstArrayKey = Object.keys(parsedData).find((key) => Array.isArray(parsedData[key]));
      if (firstArrayKey) items = parsedData[firstArrayKey];
    }

    const results = items
      .map((r: any) => {
        const idx = r.jobIndex ?? r.job_index ?? r.index;
        const score = Number(r.score ?? r.ai_score ?? r.rating ?? 0);
        const matches = r.matchesPreferences ?? (score >= matchingThreshold);
        const reasoning = r.reasoning ?? r.ai_reasoning ?? r.explanation ?? "";

        return {
          jobId: jobs[idx]?.id,
          matches: !!matches,
          score,
          reasoning,
          matchingSkills: r.matching_skills || r.matchingSkills || [],
          missingSkills: r.missing_skills || r.missingSkills || [],
        };
      })
      .filter((r) => r.jobId);

    return NextResponse.json({ success: true, results, provider: selectedAiProvider });
  } catch (error: any) {
    console.error("[Filter API] Uncaught error:", error);
    return NextResponse.json({ error: error.message || "Filter error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      jobs, 
      userPreferences, 
      myResume, 
      geminiApiKey, 
      groqApiKey, 
      deepSeekApiKey,
      openAiApiKey,
      togetherApiKey, 
      ollamaEndpoint,
      selectedAiProvider = "gemini" 
    } = body;

    if (!jobs || !Array.isArray(jobs) || jobs.length === 0) {
      return NextResponse.json({ error: "No jobs provided" }, { status: 400 });
    }

    const MAX_DESC = 800;
    const jobDescriptions = jobs
      .map((job: any, idx: number) => {
        const desc = (job.description || "N/A").substring(0, MAX_DESC);
        return `[Job ${idx}]\nTitle: ${job.title || "N/A"}\nCompany: ${job.company || "N/A"}\nDescription: ${desc}`;
      })
      .join("\n\n---\n\n");

    const prompt = `
Context:
My Resume: "${myResume || "Not provided"}"
My Preferences: "${userPreferences}"

Jobs to analyze:
${jobDescriptions}

Task:
Analyze the jobs provided above and calculate a "Weighted Compatibility Score (WCS) v2.1" for each.
Follow this EXACT calculation logic: ((Sum(Category_Score * Category_Weight)) * MustHaveMultiplier) - TotalPenalties

SCORING PARAMETERS (Weights):
1. Core Role Experience (25%): Alignment of job titles and historical seniority.
2. Hard Skills Match (20%): Technical competencies and specific tools.
3. Domain Knowledge (10%): Industry-specific expertise (e.g., AI, Fintech).
4. Impact & Achievements (15%): Quantifiable results and delivered projects.
5. Methodologies & Process (10%): Agile, Scrum, Lean, etc.
6. Soft Skills & Leadership (10%): Communication and stakeholder management.
7. Education & Languages (10%): Background and certifications.

MODIFIERS:
- Must-Have Logic: 0.5x multiplier if a mandatory skill is missing. 1.0x if all present.
- Recency Factor: Penalize skills older than 5 years (0.7x) or 10 years (0.3x).

PENALTY RULES (Subtract from final 0-10 score):
- Location Mismatch: -1.5
- Seniority Mismatch (too junior/senior): -2.0
- Overqualified: -1.0
- Job Hopping: -1.0

SCORING SCALE:
- 9.0-10.0: Exceptional - Perfect Match
- 7.5-8.9: Strong Candidate - Proceed
- 5.0-7.4: Potential - Needs validation
- 0.0-4.9: Incompatible

IMPORTANT: Respond ONLY with a valid JSON object:
{
  "results": [
    {
      "jobIndex": number,
      "score": number, // Final calculated WCS (0-10)
      "matchesPreferences": boolean, // true if score >= 7.5
      "reasoning": "string", // Brief breakdown of weights and penalties applied
      "matching_skills": ["string"],
      "missing_skills": ["string"]
    }
  ]
}
`;

    let textResponse = "";
    let retries = 0;
    const MAX_RETRIES = 5;
    let isSuccess = false;

    while (retries < MAX_RETRIES && !isSuccess) {
      try {
        if (selectedAiProvider === "gemini") {
          const { GoogleGenerativeAI } = await import("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(geminiApiKey);
          const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
          const result = await model.generateContent(prompt);
          textResponse = result.response.text();
          if (textResponse) isSuccess = true;
        } 
        else if (selectedAiProvider === "groq") {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${groqApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "llama-3.1-8b-instant", 
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" }
            }),
          });
          
          if (res.status === 429) {
            console.warn(`[Filter API] Groq Limit. Waiting 20s...`);
            await new Promise(r => setTimeout(r, 20000));
            retries++;
            continue;
          }

          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || "Groq failed");
          textResponse = data.choices[0].message.content;
          if (textResponse) isSuccess = true;
        }
        else if (selectedAiProvider === "ollama") {
          try {
            const res = await fetch(`${ollamaEndpoint}/api/generate`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "llama3.2",
                prompt: prompt,
                stream: false,
                format: "json"
              }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Ollama failed");
            textResponse = data.response;
            if (textResponse) isSuccess = true;
          } catch (e: any) {
            if (e.message.includes("ECONNREFUSED") || e.message.includes("fetch failed")) {
              throw new Error(`Ollama not found at ${ollamaEndpoint}. Is Ollama running?`);
            }
            throw e;
          }
        }
        else if (selectedAiProvider === "together") {
          const res = await fetch("https://api.together.xyz/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${togetherApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" }
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || "Together failed");
          textResponse = data.choices[0].message.content;
          if (textResponse) isSuccess = true;
        }
        else if (selectedAiProvider === "deepseek") {
          const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${deepSeekApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "deepseek-chat",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" }
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || "DeepSeek failed");
          textResponse = data.choices[0].message.content;
          if (textResponse) isSuccess = true;
        }
        else if (selectedAiProvider === "openai") {
          const res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${openAiApiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o",
              messages: [{ role: "user", content: prompt }],
              temperature: 0.1,
              response_format: { type: "json_object" }
            }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data.error?.message || "OpenAI failed");
          textResponse = data.choices[0].message.content;
          if (textResponse) isSuccess = true;
        } else {
          throw new Error(`AI Provider "${selectedAiProvider}" not implemented.`);
        }
      } catch (error: any) {
        console.error(`[Filter API] Error on attempt ${retries + 1}:`, error.message);
        if (retries >= MAX_RETRIES - 1) throw error;
        await new Promise(r => setTimeout(r, 5000));
        retries++;
      }
    }

    if (!textResponse) throw new Error("Empty response from AI");
    
    // Robust Parsing
    let cleanJson = textResponse.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let parsedData: any;
    try {
      parsedData = JSON.parse(cleanJson);
    } catch (e) {
      console.error("[Filter API] JSON Parse Error. Raw response:", textResponse);
      throw new Error("Failed to parse AI JSON response");
    }
    
    let items: any[] = [];
    if (Array.isArray(parsedData)) {
      items = parsedData;
    } else if (parsedData.results && Array.isArray(parsedData.results)) {
      items = parsedData.results;
    } else if (parsedData.jobs && Array.isArray(parsedData.jobs)) {
      items = parsedData.jobs;
    } else if (typeof parsedData === 'object') {
      // Try to find any array property
      const firstArrayKey = Object.keys(parsedData).find(key => Array.isArray(parsedData[key]));
      if (firstArrayKey) items = parsedData[firstArrayKey];
    }

    const results = items.map((r: any) => {
      const idx = r.jobIndex ?? r.job_index ?? r.index;
      const matches = r.matchesPreferences ?? r.matches_preferences ?? r.matches ?? (Number(r.score ?? 0) >= 7);
      const score = r.score ?? r.ai_score ?? r.rating ?? 0;
      const reasoning = r.reasoning ?? r.ai_reasoning ?? r.explanation ?? "";
      
      return {
        jobId: jobs[idx]?.id,
        matches: !!matches,
        score: Number(score),
        reasoning: reasoning,
        matchingSkills: r.matching_skills || r.matchingSkills || [],
        missingSkills: r.missing_skills || r.missingSkills || [],
      };
    }).filter(r => r.jobId);

    console.log(`[Filter API] Batch complete. Parsed ${results.length} valid results.`);
    return NextResponse.json({ success: true, results });

  } catch (error: any) {
    console.error("Filter Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

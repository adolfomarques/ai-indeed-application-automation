import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  try {
    const body = await request.json();
    const { provider, apiKey, endpoint } = body;

    if (!provider) {
      return NextResponse.json({ ok: false, error: "No provider specified" }, { status: 400 });
    }

    if (provider === "heuristic") {
      return NextResponse.json({
        ok: true,
        latencyMs: 1,
        model: "Rule-Based Heuristic Engine",
        message: "Algorithmic matcher ready (100% offline, zero API required).",
      });
    }

    if (provider === "groq") {
      const key = apiKey || process.env.GROQ_API_KEY;
      if (!key) {
        return NextResponse.json({ ok: false, error: "Groq API key is missing." }, { status: 400 });
      }

      const candidateModels = [
        "openai/gpt-oss-20b",
        "llama-3.3-70b-versatile",
        "llama-3.1-8b-instant",
        "openai/gpt-oss-120b",
        "qwen/qwen3.6-27b",
      ];

      let lastError = "";
      for (const model of candidateModels) {
        try {
          const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: "hi" }],
              max_tokens: 5,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            const latencyMs = Math.round(performance.now() - startTime);
            return NextResponse.json({
              ok: true,
              latencyMs,
              model,
              message: `Groq connected in ${latencyMs}ms (${model})`,
            });
          }
          lastError = data.error?.message || `Failed on model ${model}`;
        } catch (e: any) {
          lastError = e.message;
        }
      }
      return NextResponse.json({ ok: false, error: lastError || "Groq connection failed" }, { status: 400 });
    }

    if (provider === "gemini") {
      const key = apiKey || process.env.GEMINI_API_KEY;
      if (!key) {
        return NextResponse.json({ ok: false, error: "Gemini API key is missing." }, { status: 400 });
      }

      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(key);

      const candidateModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-flash-8b"];
      let lastError = "";

      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const result = await model.generateContent("hi");
          const text = result.response.text();
          if (text) {
            const latencyMs = Math.round(performance.now() - startTime);
            return NextResponse.json({
              ok: true,
              latencyMs,
              model: modelName,
              message: `Gemini connected in ${latencyMs}ms (${modelName})`,
            });
          }
        } catch (e: any) {
          lastError = e.message;
        }
      }
      return NextResponse.json({ ok: false, error: lastError || "Gemini connection failed" }, { status: 400 });
    }

    if (provider === "openai") {
      const key = apiKey || process.env.OPENAI_API_KEY;
      if (!key) {
        return NextResponse.json({ ok: false, error: "OpenAI API key is missing." }, { status: 400 });
      }

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: data.error?.message || "OpenAI connection failed" }, { status: 400 });
      }

      const latencyMs = Math.round(performance.now() - startTime);
      return NextResponse.json({
        ok: true,
        latencyMs,
        model: "gpt-4o-mini",
        message: `OpenAI connected in ${latencyMs}ms`,
      });
    }

    if (provider === "deepseek") {
      const key = apiKey || process.env.DEEPSEEK_API_KEY;
      if (!key) {
        return NextResponse.json({ ok: false, error: "DeepSeek API key is missing." }, { status: 400 });
      }

      const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: data.error?.message || "DeepSeek connection failed" }, { status: 400 });
      }

      const latencyMs = Math.round(performance.now() - startTime);
      return NextResponse.json({
        ok: true,
        latencyMs,
        model: "deepseek-chat",
        message: `DeepSeek connected in ${latencyMs}ms`,
      });
    }

    if (provider === "ollama") {
      const host = endpoint || "http://localhost:11434";
      try {
        const res = await fetch(`${host}/api/tags`, { method: "GET" });
        if (!res.ok) throw new Error("Ollama endpoint returned non-200 status");
        const data = await res.json();
        const latencyMs = Math.round(performance.now() - startTime);
        return NextResponse.json({
          ok: true,
          latencyMs,
          model: "local-ollama",
          message: `Local Ollama connected (${data.models?.length || 0} models detected)`,
        });
      } catch (e: any) {
        return NextResponse.json({
          ok: false,
          error: `Could not reach Ollama at ${host}. Note: Cloud environments (Vercel) cannot access localhost.`,
        }, { status: 400 });
      }
    }

    return NextResponse.json({ ok: false, error: `Unsupported provider: ${provider}` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Unknown error" }, { status: 500 });
  }
}

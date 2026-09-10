import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { provider, apiKey } = await req.json();

    if (!provider || !apiKey) {
      return NextResponse.json(
        { success: false, error: "Provider and API Key are required." },
        { status: 400 }
      );
    }

    if (provider === "gemini") {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: "Respond with 'ok'" }] }],
            generationConfig: { maxOutputTokens: 5 },
          }),
        }
      );

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: "Invalid Gemini API Key." },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true });
    }

    if (provider === "groq") {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [{ role: "user", content: "Respond with 'ok'" }],
          max_tokens: 5,
        }),
      });

      if (!response.ok) {
        return NextResponse.json(
          { success: false, error: "Invalid Groq API Key." },
          { status: 401 }
        );
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { success: false, error: "Unsupported provider." },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to test API key." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    groqApiKey: process.env.GROQ_API_KEY || "",
    deepSeekApiKey: process.env.DEEPSEEK_API_KEY || "",
    openAiApiKey: process.env.OPENAI_API_KEY || "",
  });
}

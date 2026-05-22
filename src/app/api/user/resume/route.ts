import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { kv } from "@vercel/kv";

const KV_PREFIX = "user_resume:";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await kv.get(`${KV_PREFIX}${userId}`);
    return NextResponse.json(data ?? null);
  } catch {
    return NextResponse.json(null);
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Max 2MB." }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");

    const resumeData = {
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
      base64,
    };

    await kv.set(`${KV_PREFIX}${userId}`, JSON.stringify(resumeData));

    return NextResponse.json({
      success: true,
      fileName: file.name,
      sizeBytes: file.size,
    });
  } catch (err) {
    console.error("Resume upload error:", err);
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    await kv.del(`${KV_PREFIX}${userId}`);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}

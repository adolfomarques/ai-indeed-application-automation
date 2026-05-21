import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getUserScheduleRunJobs, setUserScheduleRunJobs } from "@/lib/kv";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const data = await getUserScheduleRunJobs(userId);
    return NextResponse.json(data ?? {});
  } catch {
    return NextResponse.json({});
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    await setUserScheduleRunJobs(userId, body);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save schedule run jobs" }, { status: 500 });
  }
}

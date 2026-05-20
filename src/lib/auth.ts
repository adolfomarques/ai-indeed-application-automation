// src/lib/auth.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/** Returns the current user object (or null) for server‑side code */
export async function getCurrentUser(req: Request) {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
}

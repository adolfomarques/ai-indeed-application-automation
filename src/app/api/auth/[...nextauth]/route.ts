// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { addActiveUser, getActiveUserCount, removeActiveUser } from "@/lib/kv";
import type { User } from "next-auth";
import type { Session } from "next-auth";
import type { JWT } from "next-auth/jwt"; // already present, keep duplicate? we will keep existing line, add Session import



export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as const },
  callbacks: {
    // ---------------------------------------------------------------------
    // Sign‑in: limit to 5 concurrent users and persist profile in Vercel KV
    // ---------------------------------------------------------------------
    async signIn({ user }: { user: User }) {
      const current = await getActiveUserCount();
      if (current >= 5) {
        console.warn("Maximum concurrent users reached – login denied.");
        return false; // reject login
      }
      // Store user information (id, name, email, image)
      await addActiveUser(user.id as string, {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token && token.id) {
        // @ts-ignore – enrich session with id
        session.user.id = token.id as string;
      }
      return session;
    },
    // ---------------------------------------------------------------------
    // Sign‑out: clean up KV entry (optional – NextAuth does not expose a signOut callback)
    // ---------------------------------------------------------------------
    async signOut({ token }: { token: JWT }) {
      if (token && token.id) {
        await removeActiveUser(token.id as string);
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { addActiveUser, getActiveUserCount, removeActiveUser } from "@/lib/kv";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // Fallback secret garante que NextAuth nunca quebre com NO_SECRET em produção
  secret: process.env.NEXTAUTH_SECRET || "fQkakLgiY/SkBBlgDwQFH5WABAQE4nrlAvfRzDbmGSA=",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: { strategy: "jwt" as const },
  callbacks: {
    // ---------------------------------------------------------------------
    // Sign‑in: limit to 5 concurrent users and persist profile in Vercel KV
    // ---------------------------------------------------------------------
    async signIn({ user }: { user: User }) {
      try {
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
      } catch (err) {
        console.warn("[NextAuth] KV operation skipped during sign in:", err);
      }
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
    // Sign‑out: clean up KV entry
    // ---------------------------------------------------------------------
    async signOut({ token }: { token: JWT }) {
      try {
        if (token && token.id) {
          await removeActiveUser(token.id as string);
        }
      } catch (err) {
        console.warn("[NextAuth] KV operation skipped during sign out:", err);
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

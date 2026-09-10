// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { addActiveUser, removeActiveUser, isKvConfigured } from "@/lib/kv";
import type { User, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "online",
          response_type: "code",
        },
      },
    }),
  ],
  // Fallback secret garante que NextAuth nunca quebre com NO_SECRET em produção
  secret: process.env.NEXTAUTH_SECRET || "fQkakLgiY/SkBBlgDwQFH5WABAQE4nrlAvfRzDbmGSA=",
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 30 * 24 * 60 * 60, // 30 dias de sessão persistente
  },
  callbacks: {
    // ---------------------------------------------------------------------
    // Sign‑in: Retorno ultra-rápido (<10ms) com sincronização em background
    // ---------------------------------------------------------------------
    async signIn({ user }: { user: User }) {
      // Executa a persistência de perfil no KV de forma assíncrona/não-bloqueante
      // para não atrasar o redirecionamento do usuário para o Dashboard
      if (isKvConfigured() && user?.id) {
        addActiveUser(user.id, {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        }).catch((err) => {
          console.warn("[NextAuth] Background user sync warning:", err);
        });
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
    // Sign‑out: Limpeza assíncrona
    // ---------------------------------------------------------------------
    async signOut({ token }: { token: JWT }) {
      if (isKvConfigured() && token?.id) {
        removeActiveUser(token.id as string).catch((err) => {
          console.warn("[NextAuth] Background signout sync warning:", err);
        });
      }
      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

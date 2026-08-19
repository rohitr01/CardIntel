/**
 * CardIntel — Auth.js Configuration
 *
 * Google OAuth + Email Magic Link
 * Admin access controlled via allowlist
 */

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

const adminAllowlist = (process.env.ADMIN_ALLOWLIST || "")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.email) {
        const isAdmin = adminAllowlist.includes(user.email.toLowerCase());
        token.role = isAdmin ? "ADMIN" : "VIEWER";
        token.isAdmin = isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        (session.user as any).role = token.role;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
    async authorized({ auth: session, request: { nextUrl } }) {
      const isLoggedIn = !!session?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");

      if (isAdminRoute) {
        if (!isLoggedIn) return false;
        const isAdmin = (session.user as any)?.isAdmin;
        if (!isAdmin) return false;
        return true;
      }
      return true; // Public pages don't require login
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
});

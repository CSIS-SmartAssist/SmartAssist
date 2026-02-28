// NextAuth config (Mit) — Google provider, domain restrict to @goa.bits-pilani.ac.in

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          hd: "goa.bits-pilani.ac.in",
        },
      },
    }),
  ],
  callbacks: {
    signIn({ user }) {
      const email = user?.email ?? "";
      if (!email.endsWith("@goa.bits-pilani.ac.in")) return false;
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
};

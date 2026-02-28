// NextAuth config — Google OAuth, @goa.bits-pilani.ac.in only, Student vs Admin (admin key)

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { cookies } from "next/headers";
import { Role } from "@smart-assist/db";
import {
  getAuthUserByEmail,
  createAuthUser,
  updateAuthUserRole,
} from "@/lib/auth-db";
import { PENDING_ADMIN_COOKIE } from "@/lib/auth-constants";
import * as logger from "@/lib/logger";

const DOMAIN = "goa.bits-pilani.ac.in";
const OAUTH_PASSWORD_PLACEHOLDER = "oauth"; // OAuth-only users; DB requires non-empty string

export const authConfig: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          hd: DOMAIN,
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const email = user?.email ?? "";
      if (!email.endsWith(`@${DOMAIN}`)) return false;

      try {
        const cookieStore = await cookies();
        const pendingAdmin = cookieStore.get(PENDING_ADMIN_COOKIE)?.value === "1";
        const name = user.name ?? email.split("@")[0];
        const role = pendingAdmin ? Role.ADMIN : Role.USER;

        const row = await getAuthUserByEmail(email);
        if (row) {
          if (pendingAdmin) {
            await updateAuthUserRole(email, Role.ADMIN);
          }
        } else {
          await createAuthUser({
            email,
            name,
            passwordHash: OAUTH_PASSWORD_PLACEHOLDER,
            role,
          });
        }

        if (pendingAdmin) {
          cookieStore.delete(PENDING_ADMIN_COOKIE);
        }
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        logger.logAuth("error", { email, message });
        throw new Error(message || "Sign-in failed");
      }
    },
    async jwt({ token, user }) {
      const email = user?.email;
      if (email && typeof email === "string") {
        const dbUser = await getAuthUserByEmail(email);
        if (dbUser) {
          token.sub = dbUser.id;
          (token as { role?: string }).role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.sub ?? undefined;
        (session.user as { role?: string }).role = (token as { role?: string }).role;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login", error: "/login" },
};

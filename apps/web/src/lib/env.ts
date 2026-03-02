/**
 * Central env access with environment-aware defaults.
 * Values are read from process.env (populated at startup from .env / .env.local by next.config).
 * In development, some vars get safe defaults (e.g. localhost URLs); in production they must be set.
 */

import { isDevelopment } from "@/lib/environment";

const trim = (s: string | undefined): string => (s ?? "").trim();

// ─── RAG ─────────────────────────────────────────────────────────────────

const DEFAULT_RAG_URL_DEV = "http://localhost:8000";

/** RAG service base URL. Defaults to localhost:8000 in development only. */
export const getRagServiceUrl = (): string => {
  const url = process.env.RAG_SERVICE_URL?.trim();
  if (url) return url.replace(/\/+$/, "");
  if (isDevelopment()) return DEFAULT_RAG_URL_DEV;
  return "";
};

/** Internal secret for Next.js ↔ RAG. No default; must be set in .env or .env.local. */
export const getInternalSecret = (): string => trim(process.env.INTERNAL_SECRET);

// ─── Auth ─────────────────────────────────────────────────────────────────

/** NextAuth secret. No default. */
export const getNextAuthSecret = (): string => trim(process.env.NEXTAUTH_SECRET);

/** NextAuth URL (e.g. http://localhost:3000 or https://your-app.vercel.app). */
export const getNextAuthUrl = (): string => trim(process.env.NEXTAUTH_URL);

/** Admin key for admin sign-in. No default. */
export const getAdminSecretKey = (): string => trim(process.env.ADMIN_SECRET_KEY ?? "");

/** Google OAuth client ID. */
export const getGoogleClientId = (): string => trim(process.env.GOOGLE_CLIENT_ID ?? "");

/** Google OAuth client secret. */
export const getGoogleClientSecret = (): string => trim(process.env.GOOGLE_CLIENT_SECRET ?? "");

// ─── Database ─────────────────────────────────────────────────────────────

/** Database connection string. No default. */
export const getDatabaseUrl = (): string => trim(process.env.DATABASE_URL ?? "");

// ─── Optional / feature flags ────────────────────────────────────────────

/** Arcjet key; empty means protection disabled. */
export const getArcjetKey = (): string => trim(process.env.ARCJET_KEY ?? "");

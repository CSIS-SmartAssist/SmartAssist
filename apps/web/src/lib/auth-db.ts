// Auth DB helpers using @neondatabase/serverless — bypasses Prisma in NextAuth callbacks
// (Prisma 7 + adapter can throw "Invalid invocation" in this context)
// Uses Neon's serverless driver which handles SSL/channel_binding correctly.

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";
import * as logger from "@/lib/logger";

const getSQL = () => {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
};

export interface AuthUserRow {
  id: string;
  role: string;
}

export const getAuthUserByEmail = async (email: string): Promise<AuthUserRow | null> => {
  const sql = getSQL();
  const rows = await sql`SELECT id, role FROM "User" WHERE email = ${email} LIMIT 1`;
  logger.logDb("getAuthUserByEmail", { email, found: rows.length > 0 });
  return (rows[0] as AuthUserRow | undefined) ?? null;
};

export const createAuthUser = async (params: {
  email: string;
  name: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
}): Promise<void> => {
  const sql = getSQL();
  const id = randomUUID();
  await sql`INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt")
     VALUES (${id}, ${params.email}, ${params.name}, ${params.passwordHash}, ${params.role}::"Role", NOW())`;
  logger.logDb("createAuthUser", { id, email: params.email, role: params.role });
};

export const updateAuthUserRole = async (email: string, role: "USER" | "ADMIN"): Promise<void> => {
  const sql = getSQL();
  await sql`UPDATE "User" SET role = ${role}::"Role" WHERE email = ${email}`;
  logger.logDb("updateAuthUserRole", { email, role });
};

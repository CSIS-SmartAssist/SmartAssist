// Auth DB helpers using @neondatabase/serverless — bypasses Prisma in NextAuth callbacks
// (Prisma 7 + adapter can throw "Invalid invocation" in this context)
// Uses Neon's serverless driver which handles SSL/channel_binding correctly.

import { randomUUID } from "node:crypto";
import { neon } from "@neondatabase/serverless";

function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  return neon(url);
}

export interface AuthUserRow {
  id: string;
  role: string;
}

export async function getAuthUserByEmail(email: string): Promise<AuthUserRow | null> {
  const sql = getSQL();
  const rows = await sql`SELECT id, role FROM "User" WHERE email = ${email} LIMIT 1`;
  return (rows[0] as AuthUserRow | undefined) ?? null;
}

export async function createAuthUser(params: {
  email: string;
  name: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
}): Promise<void> {
  const sql = getSQL();
  const id = randomUUID();
  await sql`INSERT INTO "User" (id, email, name, "passwordHash", role, "createdAt")
     VALUES (${id}, ${params.email}, ${params.name}, ${params.passwordHash}, ${params.role}::"Role", NOW())`;
}

export async function updateAuthUserRole(email: string, role: "USER" | "ADMIN"): Promise<void> {
  const sql = getSQL();
  await sql`UPDATE "User" SET role = ${role}::"Role" WHERE email = ${email}`;
}

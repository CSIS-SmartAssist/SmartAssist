// Role auth helpers (Mit) — requireAdmin for admin routes

import type { Session } from "next-auth";

export async function requireAdmin(session: Session | null): Promise<boolean> {
  if (!session?.user) return false;
  // TODO: fetch user role from DB (Prisma) — User.role === "ADMIN"
  return false;
}

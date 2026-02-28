// Role auth helpers (Mit) — requireAdmin for admin routes

import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export async function requireAdmin(session: Session | null): Promise<boolean> {
  const email = session?.user?.email;
  if (!email) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch (err) {
    logger.error("requireAdmin", err instanceof Error ? err.message : String(err));
    return false;
  }
}

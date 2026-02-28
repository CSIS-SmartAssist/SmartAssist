// Role auth helpers (Mit) — requireAdmin for admin routes

import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function requireAdmin(session: Session | null): Promise<boolean> {
  const email = session?.user?.email;
  if (!email) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { role: true },
    });

    return user?.role === "ADMIN";
  } catch {
    return false;
  }
}

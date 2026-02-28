// GET /api/bookings — list bookings (logged-in users only)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export const GET = async () => {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: { select: { name: true, email: true } },
        room: { select: { name: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (err) {
    logger.logApi("error", "/api/bookings", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
};

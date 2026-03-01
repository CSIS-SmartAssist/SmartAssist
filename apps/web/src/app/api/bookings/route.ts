// GET /api/bookings — list bookings (logged-in users only)

import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export const GET = async (request: Request) => {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

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

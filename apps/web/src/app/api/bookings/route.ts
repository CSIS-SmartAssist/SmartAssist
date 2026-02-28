// GET /api/bookings — list bookings (Vedant)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export async function GET() {
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
}

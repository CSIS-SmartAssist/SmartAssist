import { NextRequest, NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const bookings = await prisma.booking.findMany({
      where:
        status && ["PENDING", "APPROVED", "REJECTED"].includes(status)
          ? { status: status as "PENDING" | "APPROVED" | "REJECTED" }
          : undefined,
      include: {
        user: { select: { id: true, name: true, email: true } },
        room: { select: { id: true, name: true, location: true } },
      },
      orderBy: [{ startTime: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(bookings);
  } catch (err) {
    logger.logApi("error", "/api/admin/bookings", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

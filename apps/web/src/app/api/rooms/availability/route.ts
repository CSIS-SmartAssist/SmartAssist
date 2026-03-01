import { NextRequest, NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export async function GET(request: NextRequest) {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("roomId");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!roomId || !startTime || !endTime) {
      return NextResponse.json(
        { error: "roomId, startTime and endTime are required" },
        { status: 400 }
      );
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        roomId,
        status: "APPROVED",
        AND: [
          { startTime: { lt: new Date(endTime) } },
          { endTime: { gt: new Date(startTime) } },
        ],
      },
    });

    return NextResponse.json({ available: !conflict });
  } catch (err) {
    logger.logApi("error", "/api/rooms/availability", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Availability check failed" }, { status: 500 });
  }
}

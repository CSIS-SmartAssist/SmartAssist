import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
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
  } catch {
    return NextResponse.json({ error: "Availability check failed" }, { status: 500 });
  }
}

// POST /api/admin/approve/[id] — approve booking, auto-reject conflicts, calendar + email (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id },
        data: { status: "APPROVED" },
      });

      await tx.booking.updateMany({
        where: {
          id: { not: id },
          roomId: booking.roomId,
          status: "PENDING",
          AND: [{ startTime: { lt: booking.endTime } }, { endTime: { gt: booking.startTime } }],
        },
        data: { status: "REJECTED" },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 });
  }
}

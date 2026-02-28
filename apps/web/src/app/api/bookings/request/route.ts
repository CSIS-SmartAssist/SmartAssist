// POST /api/bookings/request — create booking, conflict check → PENDING (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, roomId, startTime, endTime, reason } = await request.json();

    if (!userId || !roomId || !startTime || !endTime || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ error: "Invalid booking time range" }, { status: 400 });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        roomId,
        status: "APPROVED",
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (conflict) {
      return NextResponse.json({ error: "Room is already booked for this time slot" }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        roomId,
        startTime: start,
        endTime: end,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

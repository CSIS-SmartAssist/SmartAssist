import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

type RoomStatus = "vacant" | "occupied" | "ending";

const computeRoomStatus = (
  now: Date,
  bookings: Array<{ startTime: Date; endTime: Date }>,
): RoomStatus => {
  const active = bookings.find((booking) => booking.startTime <= now && booking.endTime > now);
  if (!active) return "vacant";
  const msUntilEnd = active.endTime.getTime() - now.getTime();
  if (msUntilEnd <= 30 * 60 * 1000) return "ending";
  return "occupied";
};

export async function GET(request: Request) {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const withTimeout = async <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    let timeoutId: NodeJS.Timeout | null = null;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error("Query timeout")), timeoutMs);
    });
    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  };

  try {
    const now = new Date();
    const [rooms, activeApprovedBookings] = await withTimeout(
      Promise.all([
        prisma.room.findMany(),
        prisma.booking.findMany({
          where: {
            status: "APPROVED",
            endTime: { gt: now },
          },
          select: {
            roomId: true,
            startTime: true,
            endTime: true,
          },
        }),
      ]),
      10000,
    );

    const bookingsByRoom = new Map<string, Array<{ startTime: Date; endTime: Date }>>();
    for (const booking of activeApprovedBookings) {
      const current = bookingsByRoom.get(booking.roomId) ?? [];
      current.push({ startTime: booking.startTime, endTime: booking.endTime });
      bookingsByRoom.set(booking.roomId, current);
    }

    const roomsWithStatus = rooms.map((room) => ({
      ...room,
      status: computeRoomStatus(now, bookingsByRoom.get(room.id) ?? []),
    }));

    const sortedRooms = [...roomsWithStatus].sort((left, right) =>
      left.name.localeCompare(right.name),
    );
    return NextResponse.json(sortedRooms);
  } catch (err) {
    logger.logApi("error", "/api/rooms", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 503 });
  }
}

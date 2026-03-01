import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { protect } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import { createCalendarEvent } from "@/lib/calendar";
import { sendBookingConfirmation } from "@/lib/email";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { deniedResponse } = await protect(request);
  if (deniedResponse) return deniedResponse;

  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, room: true },
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
          AND: [
            { startTime: { lt: booking.endTime } },
            { endTime: { gt: booking.startTime } },
          ],
        },
        data: { status: "REJECTED" },
      });
    });

    try {
      await createCalendarEvent({
        title: `${booking.room.name} - ${booking.user.name}`,
        description: booking.reason,
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.room.location,
      });
    } catch (calErr) {
      console.error("Calendar event failed:", calErr);
    }

    try {
      await sendBookingConfirmation({
        toEmail: booking.user.email,
        toName: booking.user.name,
        roomName: booking.room.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: "APPROVED",
      });
    } catch (emailErr) {
      console.error("Email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to approve booking" }, { status: 500 });
  }
};

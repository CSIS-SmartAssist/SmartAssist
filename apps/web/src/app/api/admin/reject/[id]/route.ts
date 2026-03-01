import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { protect } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
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

    await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    try {
      await sendBookingConfirmation({
        toEmail: booking.user.email,
        toName: booking.user.name,
        roomName: booking.room.name,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: "REJECTED",
      });
    } catch (emailErr) {
      console.error("Email failed:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 });
  }
};

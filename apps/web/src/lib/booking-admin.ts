/**
 * Admin booking actions: fetch booking with details, approve/reject with notification emails.
 * Keeps approve/reject route handlers thin and avoids duplicating transaction + side-effect logic.
 */

import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/email";
import * as logger from "@/lib/logger";

export const getBookingWithDetails = async (id: string) => {
  return prisma.booking.findUnique({
    where: { id },
    include: { user: true, room: true },
  });
};

export type BookingWithDetails = NonNullable<Awaited<ReturnType<typeof getBookingWithDetails>>>;

const sendConfirmationSafe = async (params: {
  toEmail: string;
  toName: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  status: "APPROVED" | "REJECTED";
  location?: string;
  reason?: string;
  endpoint: string;
}) => {
  try {
    await sendBookingConfirmation(params);
  } catch (err) {
    logger.logApi("error", params.endpoint, {
      message: "Email failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
};

export const approveBooking = async (id: string): Promise<{ success: true } | { error: string }> => {
  const booking = await getBookingWithDetails(id);
  if (!booking) return { error: "Booking not found" };

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

  await sendConfirmationSafe({
    toEmail: booking.user.email,
    toName: booking.user.name,
    roomName: booking.room.name,
    startTime: booking.startTime,
    endTime: booking.endTime,
    location: booking.room.location,
    reason: booking.reason,
    status: "APPROVED",
    endpoint: "/api/admin/approve",
  });

  logger.logDb("booking.approve", { bookingId: id });
  return { success: true };
};

export const rejectBooking = async (id: string): Promise<{ success: true } | { error: string }> => {
  const booking = await getBookingWithDetails(id);
  if (!booking) return { error: "Booking not found" };

  await prisma.booking.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await sendConfirmationSafe({
    toEmail: booking.user.email,
    toName: booking.user.name,
    roomName: booking.room.name,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: "REJECTED",
    endpoint: "/api/admin/reject",
  });

  logger.logDb("booking.reject", { bookingId: id });
  return { success: true };
};

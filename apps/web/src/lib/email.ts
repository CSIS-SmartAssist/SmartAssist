import nodemailer from "nodemailer";
import * as logger from "@/lib/logger";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const toIcsDate = (value: Date): string =>
  value.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

const sanitizeIcsText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

const buildApprovedBookingIcs = (params: {
  toEmail: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
}): string => {
  const now = toIcsDate(new Date());
  const dtStart = toIcsDate(params.startTime);
  const dtEnd = toIcsDate(params.endTime);
  const uid = `booking-${params.roomName}-${params.startTime.getTime()}@smartassist`;
  const summary = sanitizeIcsText(`Room Booking: ${params.roomName}`);
  const description = sanitizeIcsText(
    params.description || "Your room booking has been approved."
  );
  const location = sanitizeIcsText(params.location || params.roomName);
  const attendee = sanitizeIcsText(params.toEmail);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CSIS SmartAssist//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ATTENDEE;CN=${attendee}:mailto:${attendee}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
};

export async function sendBookingConfirmation({
  toEmail,
  toName,
  roomName,
  startTime,
  endTime,
  status,
  location,
  reason,
}: {
  toEmail: string;
  toName: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  status: "APPROVED" | "REJECTED";
  location?: string;
  reason?: string;
}) {
  const subject =
    status === "APPROVED"
      ? `Booking Approved - ${roomName}`
      : `Booking Rejected - ${roomName}`;

  const text =
    status === "APPROVED"
      ? `Hi ${toName},\n\nYour booking for ${roomName} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()} has been approved.\n\nPlease use the attached calendar file to add this event to your personal calendar.\n\nCSIS SmartAssist`
      : `Hi ${toName},\n\nYour booking for ${roomName} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()} has been rejected.\n\nPlease contact the admin for details.\n\nCSIS SmartAssist`;

  const attachments =
    status === "APPROVED"
      ? [
          {
            filename: "booking.ics",
            content: buildApprovedBookingIcs({
              toEmail,
              roomName,
              startTime,
              endTime,
              location,
              description: reason,
            }),
            contentType: "text/calendar; charset=utf-8; method=REQUEST",
          },
        ]
      : undefined;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject,
      text,
      attachments,
    });
  } catch (err) {
    logger.logApi("error", "email.sendBookingConfirmation", {
      to: toEmail,
      status,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

export async function sendBookingRequestReceived({
  toEmail,
  toName,
  roomName,
  startTime,
  endTime,
}: {
  toEmail: string;
  toName: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
}) {
  const subject = `Booking Request Received - ${roomName}`;
  const text = `Hi ${toName},\n\nYour booking request for ${roomName} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()} has been submitted and is pending admin approval.\n\nYou will receive another email once it is approved or rejected.\n\nCSIS SmartAssist`;

  try {
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: toEmail,
      subject,
      text,
    });
  } catch (err) {
    logger.logApi("error", "email.sendBookingRequestReceived", {
      to: toEmail,
      message: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

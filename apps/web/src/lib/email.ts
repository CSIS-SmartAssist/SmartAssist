import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendBookingConfirmation({
  toEmail,
  toName,
  roomName,
  startTime,
  endTime,
  status,
}: {
  toEmail: string;
  toName: string;
  roomName: string;
  startTime: Date;
  endTime: Date;
  status: "APPROVED" | "REJECTED";
}) {
  const subject =
    status === "APPROVED"
      ? `Booking Approved - ${roomName}`
      : `Booking Rejected - ${roomName}`;

  const text =
    status === "APPROVED"
      ? `Hi ${toName},\n\nYour booking for ${roomName} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()} has been approved.\n\nA calendar event has been created.\n\nCSIS SmartAssist`
      : `Hi ${toName},\n\nYour booking for ${roomName} from ${startTime.toLocaleString()} to ${endTime.toLocaleString()} has been rejected.\n\nPlease contact the admin for details.\n\nCSIS SmartAssist`;

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: toEmail,
    subject,
    text,
  });
}

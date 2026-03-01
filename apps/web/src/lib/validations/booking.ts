import { z } from "zod";

export const bookingRequestSchema = z
  .object({
    roomId: z.string().min(1, "Select a room"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    reason: z.string().trim().min(1, "Reason is required"),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime).getTime();
      const end = new Date(data.endTime).getTime();
      return !Number.isNaN(start) && !Number.isNaN(end) && start < end;
    },
    { message: "End time must be after start time", path: ["endTime"] }
  );

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;

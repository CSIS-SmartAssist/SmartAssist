import { z } from "zod";

export const chatMessageSchema = z.object({
  message: z.string().trim().min(1, "Enter a message"),
});

export type ChatMessageValues = z.infer<typeof chatMessageSchema>;

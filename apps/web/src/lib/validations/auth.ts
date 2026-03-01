import { z } from "zod";

export const adminKeySchema = z.object({
  adminKey: z.string().min(1, "Enter the admin key"),
});

export type AdminKeyValues = z.infer<typeof adminKeySchema>;

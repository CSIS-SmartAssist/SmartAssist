// Inngest handler — cron at 3 AM calls FastAPI /rag/ingest/sync (Mit)

import { serve } from "inngest/next";
import { inngestClient, functions } from "@/lib/inngest";

export const { GET, POST, PUT } = serve({
  client: inngestClient,
  functions,
});

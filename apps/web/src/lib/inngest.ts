// Inngest client + cron function def (Mit) — 3 AM daily Drive sync

import { Inngest } from "inngest";
import { triggerRagSync } from "./rag-client";
import * as logger from "@/lib/logger";

export const inngestClient = new Inngest({ id: "csis-smartassist" });

export const driveSyncCron = inngestClient.createFunction(
  { id: "daily-drive-sync", name: "Daily Drive Sync" },
  { cron: "0 3 * * *" },
  async () => {
    logger.logEvent("inngest:daily-drive-sync", { triggeredAt: new Date().toISOString() });
    await triggerRagSync();
    return { ok: true };
  }
);

export const functions = [driveSyncCron];

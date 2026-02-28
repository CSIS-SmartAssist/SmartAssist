// POST /api/admin/drive-sync — manual sync → call FastAPI /rag/ingest/sync (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { protect } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/middleware";
import { triggerRagSync } from "@/lib/rag-client";
import * as logger from "@/lib/logger";

export const POST = async (request: Request) => {
  const { deniedResponse } = await protect(request);
  if (deniedResponse) return deniedResponse;

  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await triggerRagSync();
    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.logApi("error", "/api/admin/drive-sync", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
};

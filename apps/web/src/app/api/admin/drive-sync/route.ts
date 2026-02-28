// POST /api/admin/drive-sync — manual sync → call FastAPI /rag/ingest/sync (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireAdmin } from "@/lib/middleware";
import { triggerRagSync } from "@/lib/rag-client";

export async function POST() {
  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    await triggerRagSync();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Drive sync error:", err);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

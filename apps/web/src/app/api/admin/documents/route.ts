// GET /api/admin/documents — list documents and ingestion status (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireAdmin } from "@/lib/middleware";
import * as logger from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  logger.logApi("request", "/api/admin/documents");

  // TODO: Prisma — list Document records
  return NextResponse.json({ documents: [] });
}

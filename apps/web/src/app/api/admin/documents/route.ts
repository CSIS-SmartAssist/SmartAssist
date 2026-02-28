// GET /api/admin/documents — list documents and ingestion status (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { protect } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/middleware";
import * as logger from "@/lib/logger";

export const GET = async (request: Request) => {
  const { deniedResponse } = await protect(request);
  if (deniedResponse) return deniedResponse;

  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  logger.logApi("request", "/api/admin/documents");

  // TODO: Prisma — list Document records
  return NextResponse.json({ documents: [] });
};

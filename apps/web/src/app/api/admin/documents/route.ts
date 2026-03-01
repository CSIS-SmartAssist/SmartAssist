import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export async function GET(request: Request) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  try {
    const documents = await prisma.document.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (err) {
    logger.logApi("error", "/api/admin/documents", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}


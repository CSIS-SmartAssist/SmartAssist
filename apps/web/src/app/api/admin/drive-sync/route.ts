import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import * as logger from "@/lib/logger";

export async function POST(request: Request) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  try {
    const ragResponse = await fetch(
      `${process.env.RAG_SERVICE_URL}/rag/ingest/sync`,
      {
        method: "POST",
        headers: { "x-internal-secret": process.env.INTERNAL_SECRET! },
      }
    );

    if (!ragResponse.ok) {
      logger.logApi("error", "/api/admin/drive-sync", { status: ragResponse.status });
      return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }

    const result = await ragResponse.json();
    return NextResponse.json(result);
  } catch (err) {
    logger.logApi("error", "/api/admin/drive-sync", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Sync request failed" }, { status: 500 });
  }
}


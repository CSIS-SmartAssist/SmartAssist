import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import * as logger from "@/lib/logger";

const DEFAULT_RAG_URL = "http://localhost:8000";
const FETCH_TIMEOUT_MS = 45_000;

const normalizeBaseUrl = (url: string) => url.replace(/\/+$/, "");

const getRagConfig = () => {
  const ragBaseUrl = normalizeBaseUrl(process.env.RAG_SERVICE_URL ?? DEFAULT_RAG_URL);
  const internalSecret = process.env.INTERNAL_SECRET?.trim();

  if (!internalSecret) {
    throw new Error("INTERNAL_SECRET is not configured");
  }

  return { ragBaseUrl, internalSecret };
};

export async function POST(request: Request) {
  const auth = await withRouteAuth(request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  try {
    const { ragBaseUrl, internalSecret } = getRagConfig();
    logger.logApi("request", "/api/admin/drive-sync", { ragBaseUrl });

    const ragResponse = await fetch(`${ragBaseUrl}/rag/ingest/sync`, {
      method: "POST",
      headers: { "x-internal-secret": internalSecret },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!ragResponse.ok) {
      const ragErrorText = await ragResponse.text().catch(() => "");
      const errorMessage = `RAG sync failed (${ragResponse.status})${ragErrorText ? `: ${ragErrorText.slice(0, 200)}` : ""}`;
      logger.logApi("error", "/api/admin/drive-sync", {
        status: ragResponse.status,
        errorMessage,
      });
      return NextResponse.json({ error: "Sync failed", detail: errorMessage }, { status: 500 });
    }

    const result = await ragResponse.json();
    logger.logApi("response", "/api/admin/drive-sync", { status: ragResponse.status });
    return NextResponse.json(result);
  } catch (err) {
    const failureMessage = err instanceof Error ? err.message : String(err);
    logger.logApi("error", "/api/admin/drive-sync", {
      message: failureMessage,
    });
    return NextResponse.json({ error: "Sync request failed", detail: failureMessage }, { status: 500 });
  }
}


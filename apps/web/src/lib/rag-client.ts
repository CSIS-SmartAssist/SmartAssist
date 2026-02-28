// Internal fetch wrapper to FastAPI — all calls use x-internal-secret (Mit)

import * as logger from "@/lib/logger";

const RAG_URL = process.env.RAG_SERVICE_URL ?? "http://localhost:8000";
const SECRET = process.env.INTERNAL_SECRET ?? "";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-internal-secret": SECRET,
  };
}

export async function queryRag(message: string): Promise<{ answer: string; citations: unknown[] }> {
  logger.logApi("request", "RAG /rag/query", { messageLength: message.length });
  const res = await fetch(`${RAG_URL}/rag/query`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    logger.logApi("error", "RAG /rag/query", { status: res.status });
    throw new Error(`RAG query failed: ${res.status}`);
  }
  logger.logApi("response", "RAG /rag/query", { status: res.status });
  return res.json();
}

export async function triggerRagSync(): Promise<void> {
  logger.logApi("request", "RAG /rag/ingest/sync");
  const res = await fetch(`${RAG_URL}/rag/ingest/sync`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) {
    logger.logApi("error", "RAG /rag/ingest/sync", { status: res.status });
    throw new Error(`RAG sync failed: ${res.status}`);
  }
  logger.logApi("response", "RAG /rag/ingest/sync", { status: res.status });
}

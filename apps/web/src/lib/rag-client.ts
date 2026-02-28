// Internal fetch wrapper to FastAPI — all calls use x-internal-secret (Mit)

const RAG_URL = process.env.RAG_SERVICE_URL ?? "http://localhost:8000";
const SECRET = process.env.INTERNAL_SECRET ?? "";

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-internal-secret": SECRET,
  };
}

export async function queryRag(message: string): Promise<{ answer: string; citations: unknown[] }> {
  const res = await fetch(`${RAG_URL}/rag/query`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`RAG query failed: ${res.status}`);
  }
  return res.json();
}

export async function triggerRagSync(): Promise<void> {
  const res = await fetch(`${RAG_URL}/rag/ingest/sync`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) {
    throw new Error(`RAG sync failed: ${res.status}`);
  }
}

import { NextResponse } from "next/server";

export async function POST() {
  try {
    const ragResponse = await fetch(
      `${process.env.RAG_SERVICE_URL}/rag/ingest/sync`,
      {
        method: "POST",
        headers: { "x-internal-secret": process.env.INTERNAL_SECRET! },
      }
    );

    if (!ragResponse.ok) {
      return NextResponse.json({ error: "Sync failed" }, { status: 500 });
    }

    const result = await ragResponse.json();
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Sync request failed" }, { status: 500 });
  }
}


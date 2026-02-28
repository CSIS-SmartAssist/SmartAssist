// POST /api/chat — validates session, calls FastAPI /rag/query via rag-client (Mit)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { queryRag } from "@/lib/rag-client";
import * as logger from "@/lib/logger";

export const POST = async (request: Request) => {
  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const message = body.message as string;
    if (!message?.trim()) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const result = await queryRag(message);
    return NextResponse.json(result);
  } catch (err) {
    logger.logApi("error", "/api/chat", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Failed to get response" },
      { status: 500 }
    );
  }
};

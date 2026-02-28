// POST /api/admin/upload — push file to Drive, DB record, call FastAPI ingest (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireAdmin } from "@/lib/middleware";

export async function POST(request: Request) {
  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file" }, { status: 400 });
  }

  // TODO: push to Drive, create Document record, call FastAPI POST /rag/ingest/file
  return NextResponse.json({ ok: true });
}

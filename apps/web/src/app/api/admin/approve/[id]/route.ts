// POST /api/admin/approve/[id] — approve booking, auto-reject conflicts, calendar + email (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { requireAdmin } from "@/lib/middleware";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  // TODO: transaction — set APPROVED, reject conflicts, create calendar event, send email
  return NextResponse.json({ ok: true, bookingId: id });
}

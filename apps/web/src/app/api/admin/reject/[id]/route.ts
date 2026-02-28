// POST /api/admin/reject/[id] — reject booking (Vedant)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { protect } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/middleware";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export const POST = async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { deniedResponse } = await protect(request);
  if (deniedResponse) return deniedResponse;

  const session = await getServerSession(authConfig);
  const allowed = await requireAdmin(session);
  if (!allowed) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    await prisma.booking.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    logger.logDb("booking.reject", { bookingId: id });
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.logApi("error", "/api/admin/reject", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 });
  }
};

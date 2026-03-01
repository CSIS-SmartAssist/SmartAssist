import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { rejectBooking } from "@/lib/booking-admin";
import * as logger from "@/lib/logger";

export const POST = async (
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  const auth = await withRouteAuth(_request, { requireAdmin: true });
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const result = await rejectBooking(id);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.logApi("error", "/api/admin/reject", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to reject booking" }, { status: 500 });
  }
};

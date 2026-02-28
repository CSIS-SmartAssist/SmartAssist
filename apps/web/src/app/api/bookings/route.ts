// GET /api/bookings — list bookings (Vedant)

import { NextResponse } from "next/server";

export async function GET() {
  // TODO: Prisma — fetch bookings (filter by user if not admin)
  return NextResponse.json({ bookings: [] });
}

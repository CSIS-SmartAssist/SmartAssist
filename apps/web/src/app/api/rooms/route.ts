import { NextResponse } from "next/server";
import { withRouteAuth } from "@/lib/route-auth";
import { prisma } from "@/lib/prisma";
import * as logger from "@/lib/logger";

export async function GET(request: Request) {
  const auth = await withRouteAuth(request);
  if (!auth.ok) return auth.response;

  try {
    const rooms = await prisma.room.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(rooms);
  } catch (err) {
    logger.logApi("error", "/api/rooms", {
      message: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

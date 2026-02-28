// POST /api/auth/verify-admin-key — validate admin key and set cookie for admin OAuth flow

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { PENDING_ADMIN_COOKIE } from "@/lib/auth-constants";
import * as logger from "@/lib/logger";

const COOKIE_MAX_AGE = 60 * 5; // 5 minutes

export const POST = async (request: Request) => {
  try {
    const body = await request.json();
    const key = typeof body?.key === "string" ? body.key.trim() : "";

    const secret = process.env.ADMIN_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { ok: false, message: "Admin sign-in is not configured." },
        { status: 503 }
      );
    }

    if (key !== secret) {
      return NextResponse.json(
        { ok: false, message: "Invalid admin key." },
        { status: 401 }
      );
    }

    const cookieStore = await cookies();
    cookieStore.set(PENDING_ADMIN_COOKIE, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    logger.logApi("error", "/api/auth/verify-admin-key", { message: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { ok: false, message: "Invalid request." },
      { status: 400 }
    );
  }
};

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import * as logger from "@/lib/logger";

const ADMIN_PATHS = ["/admin"];
const STATIC_EXT = /\.(ico|png|jpg|jpeg|gif|svg|webp|woff2?)$/i;

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public pages — no auth required
  if (path === "/" || path === "/login" || path.startsWith("/login")) {
    return NextResponse.next();
  }
  // Static assets (images, fonts) — allow so landing page loads
  if (STATIC_EXT.test(path)) {
    return NextResponse.next();
  }
  // API routes — each handler does its own session check
  if (path.startsWith("/api/")) {
    return NextResponse.next();
  }
  // _next static assets — allow
  if (path.startsWith("/_next/")) {
    return NextResponse.next();
  }

  try {
    // All other routes (e.g. /chat, /dashboard, /bookings) require auth
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const login = new URL("/login", request.url);
      login.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(login);
    }

    if (ADMIN_PATHS.some((p) => path.startsWith(p))) {
      const role = token.role as string | undefined;
      if (role !== "ADMIN") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }

    return NextResponse.next();
  } catch (err) {
    logger.error("proxy", err instanceof Error ? err.message : String(err));
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

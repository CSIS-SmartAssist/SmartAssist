// Next.js edge middleware (Mit) — protect routes, redirect by auth/role

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = ["/", "/login"];
const ADMIN_PATHS = ["/admin"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path === "/" || path === "/login" || path.startsWith("/login/")) {
    return NextResponse.next();
  }

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
    // TODO: check role from token or DB — if not ADMIN, redirect to /
    // For now allow; requireAdmin() in API routes does server-side check
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth).*)"],
};

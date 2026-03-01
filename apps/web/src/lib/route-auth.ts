/**
 * Shared route auth: Arcjet + session + optional admin check.
 * Use at the start of API route handlers to avoid repeating protect/session/requireAdmin.
 */

import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { protect } from "@/lib/arcjet";
import { requireAdmin } from "@/lib/middleware";

export type RouteAuthOptions = {
  /** If true, require session.user.role === ADMIN; otherwise 403. */
  requireAdmin?: boolean;
};

export type RouteAuthResult =
  | { ok: true; session: Session }
  | { ok: false; response: NextResponse | Response };

/**
 * Run Arcjet protect + getServerSession + optional requireAdmin.
 * Returns { ok: true, session } to continue, or { ok: false, response } to return from the route.
 */
export const withRouteAuth = async (
  request: Request,
  options: RouteAuthOptions = {}
): Promise<RouteAuthResult> => {
  const { deniedResponse } = await protect(request);
  if (deniedResponse) return { ok: false, response: deniedResponse };

  const session = await getServerSession(authConfig);
  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (options.requireAdmin) {
    const allowed = await requireAdmin(session);
    if (!allowed) {
      return {
        ok: false,
        response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      };
    }
  }

  return { ok: true, session };
};

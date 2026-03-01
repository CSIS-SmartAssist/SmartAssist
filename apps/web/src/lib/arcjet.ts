// Arcjet — rate limiting and bot detection for API routes

import arcjet, { detectBot, fixedWindow } from "@arcjet/next";
import * as logger from "@/lib/logger";

const key = process.env.ARCJET_KEY;
const isConfigured = Boolean(key?.trim());

const aj = isConfigured
  ? arcjet({
    key: key!,
    rules: [
      fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 60,
      }),
      detectBot({
        mode: "LIVE",
        allow: [],
      }),
    ],
  })
  : null;

/**
 * Run Arcjet protection (rate limit + bot detection). Use at the start of API route handlers.
 * If ARCJET_KEY is not set, allows the request. If denied, return deniedResponse and do not proceed.
 */
export async function protect(
  request: Request
): Promise<{ deniedResponse: Response | null }> {
  if (!aj) {
    return { deniedResponse: null };
  }
  const decision = await aj.protect(request);
  if (decision.isDenied()) {
    const isRateLimit = decision.reason.isRateLimit();
    const status = isRateLimit ? 429 : 403;
    const body = isRateLimit
      ? { error: "Too many requests. Please try again later." }
      : { error: "Forbidden" };
    logger.logApi("error", "arcjet", { denied: true, status, isRateLimit });
    return {
      deniedResponse: new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      }),
    };
  }
  return { deniedResponse: null };
}

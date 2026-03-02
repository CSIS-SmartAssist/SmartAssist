/**
 * Environment detection for the web app.
 * Use for branching behavior (e.g. cookie secure, log level, default URLs).
 * Actual env values come from process.env (loaded from .env / .env.local at startup by next.config).
 */

/** True when running in production (build or runtime). */
export const isProduction = (): boolean => {
  if (typeof process === "undefined" || process.env === undefined) return false;
  return process.env.NODE_ENV === "production";
};

/** True when running in development (next dev, or NODE_ENV !== production). */
export const isDevelopment = (): boolean => !isProduction();

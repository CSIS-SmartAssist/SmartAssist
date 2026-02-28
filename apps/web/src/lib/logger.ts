/**
 * Logger utility for SmartAssist (Next.js).
 * Structured, leveled logging with context tags.
 * No-op in production for debug/info levels; errors always log.
 */

const isDev = process.env.NODE_ENV !== "production";

const toMessage = (...args: unknown[]): string => {
  return args
    .map((arg) => {
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
      }
      if (typeof arg === "string") return arg;
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
};

const log = (name: string, ...args: unknown[]) => {
  if (!isDev) return;
  console.log(`[${name}]`, ...args);
};

const info = (name: string, ...args: unknown[]) => {
  if (!isDev) return;
  console.info(`[${name}]`, ...args);
};

const warn = (name: string, ...args: unknown[]) => {
  console.warn(`[${name}]`, ...args);
};

const error = (name: string, ...args: unknown[]) => {
  console.error(`[${name}]`, toMessage(...args));
};

const debug = (name: string, ...args: unknown[]) => {
  if (!isDev) return;
  console.debug(`[${name}]`, ...args);
};

const logEvent = (eventName: string, payload?: Record<string, unknown>) => {
  if (!isDev) return;
  console.log(`[Event: ${eventName}]`, payload ?? "");
};

const logApi = (
  type: "request" | "response" | "error",
  endpoint: string,
  details?: Record<string, unknown>
) => {
  if (!isDev && type !== "error") return;
  const tag = `API ${type.toUpperCase()}: ${endpoint}`;
  if (type === "error") {
    console.error(`[${tag}]`, details ?? "");
  } else {
    console.log(`[${tag}]`, details ?? "");
  }
};

const logAuth = (
  phase: "signIn" | "signOut" | "session" | "error",
  details?: Record<string, unknown>
) => {
  if (phase === "error") {
    console.error(`[Auth: ${phase}]`, details ?? "");
  } else if (isDev) {
    console.log(`[Auth: ${phase}]`, details ?? "");
  }
};

const logDb = (
  operation: string,
  details?: Record<string, unknown>
) => {
  if (!isDev) return;
  console.log(`[DB: ${operation}]`, details ?? "");
};

export { log, info, warn, error, debug, logEvent, logApi, logAuth, logDb };

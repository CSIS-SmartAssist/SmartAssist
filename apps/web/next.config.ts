import type { NextConfig } from "next";
import path from "node:path";
import { config } from "dotenv";

// Environment loading: support both monorepo root and apps/web as cwd.
// - From repo root (e.g. "npm run dev -w apps/web"): load root .env and .env.local.
// - From apps/web (e.g. Vercel build with Root Directory = apps/web): load root .env/.env.local first, then apps/web .env/.env.local so app overrides win.
// Later config() calls override earlier; .env.local is for local development overrides (not committed).
const cwd = process.cwd();
const normalizedCwd = cwd.replace(/\\/g, "/");
const isAppWeb = normalizedCwd.endsWith("apps/web");

if (isAppWeb) {
  const root = path.resolve(cwd, "..", "..");
  config({ path: path.join(root, ".env") });
  config({ path: path.join(root, ".env.local") });
}
config({ path: path.join(cwd, ".env") });
config({ path: path.join(cwd, ".env.local") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;

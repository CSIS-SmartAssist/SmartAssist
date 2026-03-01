import type { NextConfig } from "next";
import path from "node:path";
import { config } from "dotenv";

// Load .env: from cwd (repo root when run via "npm run dev -w apps/web") or from parent (when cwd is apps/web)
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), "..", ".env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;

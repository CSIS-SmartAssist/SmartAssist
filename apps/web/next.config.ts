import type { NextConfig } from "next";
import path from "node:path";
import { config } from "dotenv";

// Load root .env so DATABASE_URL etc. are available when running from apps/web
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), "..", "..", ".env") });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;

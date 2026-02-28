import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env from repo root (when cwd is packages/db) then cwd, so one root .env works.
config({ path: path.resolve(process.cwd(), "../../.env") });
config({ path: path.resolve(process.cwd(), ".env") });

// Use placeholder so `prisma generate` runs even when .env is missing (e.g. fresh clone).
const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});

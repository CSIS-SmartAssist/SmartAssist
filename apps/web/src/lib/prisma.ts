// Prisma client singleton (Vedant) — use in API routes
// Uses @prisma/adapter-pg for Prisma 7 (driver adapter)

import { PrismaClient } from "@smart-assist/db";
import { PrismaPg } from "@prisma/adapter-pg";
import * as logger from "@/lib/logger";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  logger.logDb("prisma.init", { adapter: "PrismaPg" });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

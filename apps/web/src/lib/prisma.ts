import { PrismaClient } from "@smart-assist/db";
import { PrismaPg } from "@prisma/adapter-pg";
import * as logger from "@/lib/logger";
import { isDevelopment } from "@/lib/environment";
import { getDatabaseUrl } from "@/lib/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const createPrisma = () => {
  const connectionString = getDatabaseUrl();
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  const adapter = new PrismaPg({ connectionString });
  logger.logDb("prisma.init", { adapter: "PrismaPg" });
  return new PrismaClient({
    adapter,
    log: isDevelopment() ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (isDevelopment()) globalForPrisma.prisma = prisma;

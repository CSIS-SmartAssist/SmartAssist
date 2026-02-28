/**
 * Seed: 5 rooms + 3 test users (Saksham runs).
 * Run: npm run seed from packages/db (or npx tsx seed.ts)
 * Requires DATABASE_URL and Prisma migrations applied.
 * Uses Prisma 7 driver adapter (@prisma/adapter-pg).
 */
import path from "node:path";
import { config } from "dotenv";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
import * as bcrypt from "bcryptjs";

// Support both execution contexts:
// - from packages/db (npm run seed)
// - from repo root (npm run seed -w @smart-assist/db)
config({ path: path.resolve(process.cwd(), "../../.env") });
config({ path: path.resolve(process.cwd(), ".env") });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("testpassword", 10);
  const testUsers = [
    {
      email: "admin@goa.bits-pilani.ac.in",
      name: "Admin User",
      role: "ADMIN" as const,
    },
    {
      email: "user1@goa.bits-pilani.ac.in",
      name: "Test User 1",
      role: "USER" as const,
    },
    {
      email: "user2@goa.bits-pilani.ac.in",
      name: "Test User 2",
      role: "USER" as const,
    },
  ];

  const rooms = [
    { name: "LT1", location: "C side", capacity: 150, amenities: ["Projector", "Whiteboard"] },
    { name: "A604", location: "A side", capacity: 60, amenities: ["Projector"] },
    { name: "C401", location: "C side", capacity: 60, amenities: ["Projector", "Whiteboard", "VC"] },
    { name: "Reading Room", location: "CC lab", capacity: 75, amenities: ["Whiteboard"] },
    { name: "LT2", location: "C side", capacity: 150, amenities: ["Projector", "Whiteboard"] },
  ];

  // Clear dependent rows before replacing room records.
  await prisma.booking.deleteMany({});
  await prisma.room.deleteMany({});

  for (const user of testUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: hash,
        role: user.role,
      },
      create: {
        email: user.email,
        name: user.name,
        passwordHash: hash,
        role: user.role,
      },
    });
  }

  await prisma.room.createMany({ data: rooms });

  console.log("Seed done: 3 test users, 5 rooms.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

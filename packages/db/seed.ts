/**
 * Seed: 5 rooms + 3 test users (Saksham runs).
 * Run: npm run seed from packages/db (or npx tsx seed.ts)
 * Requires DATABASE_URL and Prisma migrations applied.
 * Uses Prisma 7 driver adapter (@prisma/adapter-pg).
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";
import * as bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash("testpassword", 10);

  await prisma.user.upsert({
    where: { email: "admin@goa.bits-pilani.ac.in" },
    update: {},
    create: {
      email: "admin@goa.bits-pilani.ac.in",
      name: "Admin User",
      passwordHash: hash,
      role: "ADMIN",
    },
  });
  await prisma.user.upsert({
    where: { email: "user1@goa.bits-pilani.ac.in" },
    update: {},
    create: {
      email: "user1@goa.bits-pilani.ac.in",
      name: "Test User 1",
      passwordHash: hash,
      role: "USER",
    },
  });
  await prisma.user.upsert({
    where: { email: "user2@goa.bits-pilani.ac.in" },
    update: {},
    create: {
      email: "user2@goa.bits-pilani.ac.in",
      name: "Test User 2",
      passwordHash: hash,
      role: "USER",
    },
  });

  const rooms = [
    { name: "Lab 1", location: "Building A", capacity: 30, amenities: ["Projector", "Whiteboard"] },
    { name: "Lab 2", location: "Building A", capacity: 30, amenities: ["Projector"] },
    { name: "Lab 3", location: "Building B", capacity: 40, amenities: ["Projector", "Whiteboard", "VC"] },
    { name: "SR 101", location: "Building B", capacity: 15, amenities: ["Whiteboard"] },
    { name: "SR 102", location: "Building B", capacity: 20, amenities: ["Projector", "Whiteboard"] },
  ];

  await prisma.room.deleteMany({});
  await prisma.room.createMany({ data: rooms });

  console.log("Seed done: 3 users, 5 rooms.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

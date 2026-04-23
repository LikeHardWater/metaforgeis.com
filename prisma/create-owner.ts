/**
 * One-time script to create the initial Owner user.
 * Usage: npx tsx prisma/create-owner.ts
 *
 * Set these env vars (or pass inline):
 *   OWNER_EMAIL, OWNER_NAME, OWNER_PASSWORD
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.OWNER_EMAIL ?? "nate.ice@metaforgeis.com";
  const name = process.env.OWNER_NAME ?? "Nate Ice";
  const password = process.env.OWNER_PASSWORD;

  if (!password) {
    console.error("ERROR: Set OWNER_PASSWORD env var before running this script.");
    process.exit(1);
  }

  const ownerRole = await prisma.role.findFirst({
    where: { systemRole: "OWNER" },
  });

  if (!ownerRole) {
    console.error("ERROR: Owner role not found. Run `npm run db:seed` first.");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`User ${email} already exists. Nothing to do.`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      roleId: ownerRole.id,
      isActive: true,
    },
  });

  console.log(`✓ Created owner: ${user.name} <${user.email}>`);
  console.log(`  Role: ${ownerRole.name}`);
  console.log(`  ID:   ${user.id}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

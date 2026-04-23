import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding default CRM pipeline...");

  const existing = await prisma.pipeline.findFirst({ where: { isDefault: true } });
  if (existing) {
    console.log("  Default pipeline already exists. Skipping.");
    return;
  }

  await prisma.pipeline.create({
    data: {
      name: "Sales Pipeline",
      isDefault: true,
      stages: {
        create: [
          { name: "Lead In",       order: 1, probability: 10 },
          { name: "Qualified",     order: 2, probability: 25 },
          { name: "Proposal Sent", order: 3, probability: 50 },
          { name: "Negotiation",   order: 4, probability: 75 },
          { name: "Closed Won",    order: 5, probability: 100 },
          { name: "Closed Lost",   order: 6, probability: 0 },
        ],
      },
    },
  });

  console.log("  ✓ Sales Pipeline with 6 stages created.");
  console.log("Done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());

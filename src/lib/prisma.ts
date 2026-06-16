import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

function createPrismaClient() {
  const url = process.env.NODE_ENV === "development"
    ? process.env.DIRECT_URL!
    : process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString: url });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

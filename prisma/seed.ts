import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient, SystemRole } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DEFAULT_ROLES = [
  {
    name: "Owner / Partner",
    systemRole: SystemRole.OWNER,
    description: "Full access to everything including financial reports and system config.",
    sessionTimeoutMinutes: 480,
    maxFailedLogins: 10,
  },
  {
    name: "Administrator",
    systemRole: SystemRole.ADMINISTRATOR,
    description: "User/role management, integrations, audit log, system config.",
    sessionTimeoutMinutes: 480,
    maxFailedLogins: 5,
  },
  {
    name: "Estimator",
    systemRole: SystemRole.ESTIMATOR,
    description: "Catalog, quotes, estimates, projects, customer records. No financial reports.",
    sessionTimeoutMinutes: 480,
    maxFailedLogins: 5,
  },
  {
    name: "Sales Associate",
    systemRole: SystemRole.SALES_ASSOCIATE,
    description: "Leads, contacts, deals, quotes. Own invoices and commission only.",
    sessionTimeoutMinutes: 240,
    maxFailedLogins: 5,
  },
  {
    name: "Field Service Manager",
    systemRole: SystemRole.FIELD_SERVICE_MANAGER,
    description: "Work orders, scheduling, dispatch, tech profiles, service history, geofences.",
    sessionTimeoutMinutes: 480,
    maxFailedLogins: 5,
  },
  {
    name: "Field Service Employee",
    systemRole: SystemRole.FIELD_SERVICE_EMPLOYEE,
    description: "PWA only. Assigned jobs, status updates, time/expense, service reports.",
    sessionTimeoutMinutes: 720,
    maxFailedLogins: 5,
  },
];

async function main() {
  console.log("Seeding default roles...");

  for (const role of DEFAULT_ROLES) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
    console.log(`  ✓ ${role.name}`);
  }

  console.log("Done.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

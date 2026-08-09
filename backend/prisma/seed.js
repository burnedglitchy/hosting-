require("dotenv").config();

const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      slug: "starter",
      name: "Starter",
      priceCents: 300,
      ramMb: 2048,
      diskMb: 10240,
      cpuPercent: 100,
      maxDatabases: 1,
      maxBackups: 7,
      locations: ["US-East"],
      isFeatured: false,
    },
    {
      slug: "pro",
      name: "Pro",
      priceCents: 800,
      ramMb: 6144,
      diskMb: 30720,
      cpuPercent: 200,
      maxDatabases: 3,
      maxBackups: 30,
      locations: ["US-East", "EU-West", "AP-Singapore"],
      isFeatured: true,
    },
    {
      slug: "extreme",
      name: "Extreme",
      priceCents: 1600,
      ramMb: 16384,
      diskMb: 102400,
      cpuPercent: 400,
      maxDatabases: 8,
      maxBackups: 60,
      locations: [
        "US-East",
        "EU-West",
        "Frankfurt",
        "Singapore",
        "Sydney",
        "US-West",
        "London",
        "NYC",
      ],
      isFeatured: false,
    },
  ];

  console.log("Seeding plans...");

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: {
        slug: plan.slug,
      },
      update: {
        name: plan.name,
        priceCents: plan.priceCents,
        ramMb: plan.ramMb,
        diskMb: plan.diskMb,
        cpuPercent: plan.cpuPercent,
        maxDatabases: plan.maxDatabases,
        maxBackups: plan.maxBackups,
        locations: plan.locations,
        isFeatured: plan.isFeatured,
        isActive: true,
      },
      create: {
        slug: plan.slug,
        name: plan.name,
        priceCents: plan.priceCents,
        ramMb: plan.ramMb,
        diskMb: plan.diskMb,
        cpuPercent: plan.cpuPercent,
        maxDatabases: plan.maxDatabases,
        maxBackups: plan.maxBackups,
        locations: plan.locations,
        isFeatured: plan.isFeatured,
        isActive: true,
      },
    });

    console.log(`Created/updated plan: ${plan.name}`);
  }

  const adminEmail =
    process.env.ADMIN_EMAIL || "ezzglitchy@gmail.com";

  const adminPassword =
    process.env.ADMIN_PASSWORD || "admin12345";

  const existingAdmin = await prisma.user.findUnique({
    where: {
      email: adminEmail,
    },
  });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);

    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "MPanel Admin",
        passwordHash,
        role: "ADMIN",
        authProvider: "LOCAL",
      },
    });

    console.log(`Admin created: ${adminEmail}`);
  } else {
    console.log(`Admin already exists: ${adminEmail}`);
  }

  console.log("Seed complete.");
}

main()
  .catch((error) => {
    console.error("Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

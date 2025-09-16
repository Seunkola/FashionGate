import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "client", description: "Customer who books designers and tailors" },
    {
      name: "designer",
      description:
        "Fashion designer who creates portfolios and offers services",
    },
    {
      name: "tailor",
      description:
        "Tailor who provides tailoring services and creates portfolios",
    },
    { name: "admin", description: "Platform administrator" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error("Error seeding roles", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

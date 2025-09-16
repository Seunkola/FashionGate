import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  //seed skills
  const skills = [
    "Tailoring",
    "ReadyToWear",
    "Alterations",
    "Embroidery",
    "Pattern Making",
    "Bridal Wear",
    "Menswear",
    "Womenswear",
    "Children's Clothing",
    "Costume Design",
    "Fashion Design",
    "Sewing",
    "Textile Design",
    "Custom Clothing",
    "Fashion Consulting",
    "Styling",
    "Wardrobe Planning",
    "Fabric Selection",
    "Fitting Services",
    "Sustainable Fashion",
    "Vintage Clothing",
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill },
      update: {},
      create: { name: skill },
    });
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

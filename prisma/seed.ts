import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting to seed specialties...");

  const specialties = [
    "Anxiety",
    "Depression",
    "ADHD",
    "Self Esteem",
    "Anger Management",
    "Grief",
    "Teen",
    "Addiction",
    "Obsessive-Compulsive (OCD)",
    "Post-Traumatic Disorder (PTSD)",
  ];

  // Create specialties one by one
  for (const specialtyName of specialties) {
    // Check if specialty already exists to avoid duplicates
    const existingSpecialty = await prisma.specialty.findUnique({
      where: { name: specialtyName },
    });

    if (!existingSpecialty) {
      await prisma.specialty.create({
        data: { name: specialtyName },
      });
      console.log(`Created specialty: ${specialtyName}`);
    } else {
      console.log(`Specialty already exists: ${specialtyName}`);
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Close Prisma client connection
    await prisma.$disconnect();
  });

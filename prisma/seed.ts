import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_EMAIL;
  const password = process.env.SEED_PASSWORD;

  if (!email || !password) {
    console.error("SEED_EMAIL and SEED_PASSWORD env vars are required");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  // Try to update existing user first, otherwise create
  const existing = await prisma.user.findFirst();
  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: { email, passwordHash },
    });
    console.log(`Updated user ${existing.id} with email ${email}`);
  } else {
    const user = await prisma.user.create({
      data: { email, passwordHash },
    });
    console.log(`Created user ${user.id} with email ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

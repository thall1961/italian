import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

// Create Prisma client with libSQL adapter for SQLite
function makeClient() {
  const adapter = new PrismaLibSql({ url: "file:prisma/dev.db" });
  return new PrismaClient({ adapter });
}

// Prevent multiple Prisma instances in development (hot reload)
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || makeClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

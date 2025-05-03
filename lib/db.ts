import { PrismaClient as PrismaClientDev } from "@/prisma/generated";
import { PrismaClient as PrismaClientEdge } from "@/prisma/generated/edge";

let db: PrismaClientDev | PrismaClientEdge;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClientEdge();
} else {
  const globalForPrisma = globalThis as unknown as {
    prisma?: PrismaClientDev;
  };
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClientDev();
  }
  db = globalForPrisma.prisma;
}

export default db;

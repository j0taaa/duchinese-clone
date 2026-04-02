import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var __hanzilane_prisma__: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

export const prisma =
  globalThis.__hanzilane_prisma__ ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalThis.__hanzilane_prisma__ = prisma;
}

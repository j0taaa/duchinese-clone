import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var __hanzilane_prisma__: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });

function hasCurrentReadDelegates(client: PrismaClient) {
  const candidate = client as PrismaClient & {
    storyRead?: object;
    vocabularyRead?: object;
  };

  return Boolean(candidate.storyRead && candidate.vocabularyRead);
}

function createPrismaClient() {
  return new PrismaClient({ adapter });
}

const cachedClient = globalThis.__hanzilane_prisma__;

export const prisma =
  cachedClient && hasCurrentReadDelegates(cachedClient)
    ? cachedClient
    : createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__hanzilane_prisma__ = prisma;
}

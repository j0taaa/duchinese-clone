import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var __hanzilane_prisma__: PrismaClient | undefined;
}

function hasExpectedPrismaDelegates(client: PrismaClient) {
  const candidate = client as PrismaClient & {
    storyRead?: object;
    vocabularyRead?: object;
    storyHanziTerm?: object;
  };

  return Boolean(
    candidate.storyRead &&
      candidate.vocabularyRead &&
      candidate.storyHanziTerm,
  );
}

const cachedClient = globalThis.__hanzilane_prisma__;

export const prisma =
  cachedClient && hasExpectedPrismaDelegates(cachedClient)
    ? cachedClient
    : new PrismaClient({
        adapter: new PrismaPg({
          connectionString: process.env.DATABASE_URL!,
        }),
      });

if (process.env.NODE_ENV !== "production") {
  globalThis.__hanzilane_prisma__ = prisma;
}

import path from "node:path";

import { PGlite } from "@electric-sql/pglite";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaPGlite } from "pglite-prisma-adapter";

import { PrismaClient } from "@/lib/generated/prisma/client";

declare global {
  var __hanzilane_prisma__: PrismaClient | undefined;
}

const useLocalPGlite =
  process.env.NODE_ENV !== "production" && process.env.USE_LOCAL_PGLITE !== "0";

function hasCurrentReadDelegates(client: PrismaClient) {
  const candidate = client as PrismaClient & {
    storyRead?: object;
    vocabularyRead?: object;
  };

  return Boolean(candidate.storyRead && candidate.vocabularyRead);
}

function createPrismaClient() {
  if (useLocalPGlite) {
    const dataDir =
      process.env.DATABASE_DIR || path.join(process.cwd(), ".local-pgdata");
    const client = new PGlite(dataDir);
    const adapter = new PrismaPGlite(client);
    return new PrismaClient({ adapter });
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
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

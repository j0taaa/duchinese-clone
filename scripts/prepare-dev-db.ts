import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";

import { PGlite } from "@electric-sql/pglite";

import { seedStories } from "../lib/stories";

async function resetDataDir(dataDir: string) {
  await fs.rm(dataDir, { recursive: true, force: true });
  await fs.mkdir(dataDir, { recursive: true });
}

async function prepareDatabase(dataDir: string) {
  const cwd = process.cwd();

  const lockFile = path.join(dataDir, "postmaster.pid");
  await fs.rm(lockFile, { force: true });

  const db = new PGlite(dataDir);

  try {
    const existingTables = await db.query<{ exists: boolean }>(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'story'
      ) AS exists
    `);

    const hasSchema = existingTables.rows[0]?.exists === true;

    if (!hasSchema) {
      const migrationsDir = path.join(cwd, "prisma", "migrations");
      const entries = await fs.readdir(migrationsDir, { withFileTypes: true });
      const migrationFiles = entries
        .filter((entry) => entry.isDirectory())
        .map((entry) => path.join(migrationsDir, entry.name, "migration.sql"))
        .sort();

      for (const file of migrationFiles) {
        const sql = await fs.readFile(file, "utf8");
        await db.exec(sql);
      }
    }

    for (const story of seedStories) {
      await db.query(
        `
          INSERT INTO "story" (
            "id",
            "slug",
            "title",
            "titleTranslation",
            "summary",
            "excerpt",
            "hanziText",
            "pinyinText",
            "englishTranslation",
            "sections",
            "type",
            "hskLevel",
            "level",
            "visibility",
            "isSeeded",
            "authorUserId",
            "createdAt",
            "updatedAt"
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, $11, $12, $13, 'public_seeded', true, NULL, NOW(), NOW()
          )
          ON CONFLICT ("slug") DO UPDATE SET
            "title" = EXCLUDED."title",
            "titleTranslation" = EXCLUDED."titleTranslation",
            "summary" = EXCLUDED."summary",
            "excerpt" = EXCLUDED."excerpt",
            "hanziText" = EXCLUDED."hanziText",
            "pinyinText" = EXCLUDED."pinyinText",
            "englishTranslation" = EXCLUDED."englishTranslation",
            "sections" = EXCLUDED."sections",
            "type" = EXCLUDED."type",
            "hskLevel" = EXCLUDED."hskLevel",
            "level" = EXCLUDED."level",
            "visibility" = 'public_seeded',
            "isSeeded" = true,
            "authorUserId" = NULL,
            "updatedAt" = NOW()
        `,
        [
          `seed-${story.slug}`,
          story.slug,
          story.title,
          story.titleTranslation,
          story.summary,
          story.excerpt,
          story.hanziText,
          story.pinyinText,
          story.englishTranslation,
          JSON.stringify(story.sections),
          story.type,
          story.hskLevel,
          story.level,
        ],
      );
    }
  } finally {
    await db.close();
  }
}

async function main() {
  if (process.env.USE_LOCAL_PGLITE === "0") {
    return;
  }

  const cwd = process.cwd();
  const dataDir = process.env.DATABASE_DIR || path.join(cwd, ".local-pgdata");
  await fs.mkdir(dataDir, { recursive: true });

  try {
    await prepareDatabase(dataDir);
  } catch {
    console.warn("Local embedded DB bootstrap failed, recreating it from scratch.");
    await resetDataDir(dataDir);
    await prepareDatabase(dataDir);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

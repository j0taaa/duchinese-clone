import Hanzi from "hanzi";

import { prisma } from "@/lib/prisma";
import { storySectionsSchema, type StorySection } from "@/lib/stories";
import type { PrismaClient, Prisma } from "@/lib/generated/prisma/client";

const MAX_TERM_LENGTH = 128;

let hanziReady = false;

function ensureHanziSegmenter() {
  if (!hanziReady) {
    Hanzi.start();
    hanziReady = true;
  }
}

const isHanScriptChar = (ch: string) => /^\p{Script=Han}$/u.test(ch);

const isHanOnlyToken = (token: string) =>
  token.length > 0 && [...token].every((ch) => isHanScriptChar(ch));

/**
 * Collects unique Han characters plus multi-character segmented words from title + lesson body.
 * Used to build the DB reverse index for “which stories/series contain this 汉字/词”.
 */
export function extractIndexedTerms(input: {
  title: string;
  hanziText: string;
  sections: Pick<StorySection, "hanzi">[];
}): string[] {
  const blob = [
    input.title,
    input.hanziText,
    ...input.sections.map((s) => s.hanzi),
  ].join("\n");

  const terms = new Set<string>();

  for (const ch of blob) {
    if (isHanScriptChar(ch)) {
      terms.add(ch);
    }
  }

  ensureHanziSegmenter();
  try {
    for (const token of Hanzi.segment(blob)) {
      if (!isHanOnlyToken(token)) {
        continue;
      }
      if ([...token].length > MAX_TERM_LENGTH) {
        continue;
      }
      if (token.length >= 2) {
        terms.add(token);
      }
    }
  } catch {
    // Segmenter can throw on unusual input; character pass still indexes Han codepoints.
  }

  return [...terms];
}

type IndexDb = PrismaClient | Prisma.TransactionClient;

export async function syncStoryHanziIndex(
  db: IndexDb,
  storyId: string,
  input: {
    title: string;
    hanziText: string;
    sections: Pick<StorySection, "hanzi">[];
  },
) {
  const terms = extractIndexedTerms(input);
  await db.storyHanziTerm.deleteMany({ where: { storyId } });
  if (!terms.length) {
    return;
  }
  await db.storyHanziTerm.createMany({
    data: terms.map((term) => ({ storyId, term })),
    skipDuplicates: true,
  });
}

export async function findStoryIdsByIndexedTerm(term: string) {
  const rows = await prisma.storyHanziTerm.findMany({
    where: { term },
    select: { storyId: true },
  });
  return [...new Set(rows.map((r) => r.storyId))];
}

export async function findStoriesByIndexedTerm(term: string) {
  const ids = await findStoryIdsByIndexedTerm(term);
  if (!ids.length) {
    return [];
  }
  return prisma.story.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      slug: true,
      title: true,
      titleTranslation: true,
      seriesGroupSlug: true,
      seriesEpisode: true,
      visibility: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** Distinct `seriesGroupSlug` values for stories that contain the term (episodes of user/generated series). */
export async function findSeriesGroupSlugsByIndexedTerm(term: string) {
  const ids = await findStoryIdsByIndexedTerm(term);
  if (!ids.length) {
    return [];
  }
  const rows = await prisma.story.findMany({
    where: { id: { in: ids }, seriesGroupSlug: { not: null } },
    select: { seriesGroupSlug: true },
  });
  return [...new Set(rows.map((r) => r.seriesGroupSlug).filter(Boolean))] as string[];
}

/** Rebuild the full index from current `story` rows (e.g. after migration). */
export async function rebuildAllStoryHanziIndexes() {
  const stories = await prisma.story.findMany({
    select: {
      id: true,
      title: true,
      hanziText: true,
      sections: true,
    },
  });

  for (const row of stories) {
    const sections = storySectionsSchema.parse(row.sections);
    await syncStoryHanziIndex(prisma, row.id, {
      title: row.title,
      hanziText: row.hanziText,
      sections,
    });
  }
}

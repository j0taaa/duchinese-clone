import type { GeneratedSeriesEpisode } from "@/lib/ai";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { LessonLength } from "@/lib/story-length-standards";
import { syncStoryHanziIndex } from "@/lib/story-hanzi-index";
import { getStoryEmojiTitle } from "@/lib/story-labels";
import { getSeriesBySlug, getSeriesForStory, hydrateSeries } from "@/lib/series";
import { slugify } from "@/shared/content-utils";
import {
  type AppStory,
  type HskLevel,
  hskLevelValues,
  type SeedStory,
  seedStories,
  storySectionsSchema,
  type StoryLevel,
  type StoryType,
  type StoryVisibility,
} from "@/lib/stories";
import {
  countTrackedVocabularyOccurrences,
  getVocabularyCharactersUpToLevel,
  type VocabularyCharacterEntry,
} from "@/lib/vocabulary";

const publicVisibilities = ["public_seeded", "public_user"] as const;
const fallbackSeedTimestamp = new Date("2026-04-02T00:00:00.000Z");

function mapSeedStory(story: SeedStory): AppStory {
  return {
    id: `seed-${story.slug}`,
    slug: story.slug,
    title: story.title,
    titleTranslation: story.titleTranslation,
    emojiTitle: getStoryEmojiTitle({
      id: `seed-${story.slug}`,
      slug: story.slug,
      titleTranslation: story.titleTranslation,
      summary: story.summary,
      type: story.type,
    }),
    summary: story.summary,
    excerpt: story.excerpt,
    hanziText: story.hanziText,
    pinyinText: story.pinyinText,
    englishTranslation: story.englishTranslation,
    sections: story.sections,
    type: story.type,
    hskLevel: story.hskLevel,
    level: story.level,
    visibility: "public_seeded",
    isSeeded: true,
    authorUserId: null,
    authorName: null,
    seriesGroupSlug: null,
    seriesEpisode: null,
    seriesTitle: null,
    seriesTitleTranslation: null,
    seriesSummary: null,
    lessonLength: null,
    createdAt: fallbackSeedTimestamp,
    updatedAt: fallbackSeedTimestamp,
  };
}

function getFallbackSeedStories() {
  return seedStories.map(mapSeedStory);
}

function isDatabaseUnavailable(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.message.includes("Failed to identify your database");
}

function normalizeHskLevel(value: string): HskLevel {
  return (hskLevelValues as readonly string[]).includes(value) ? (value as HskLevel) : "1";
}

function shuffleArray<T>(items: T[]) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function rankVocabularyByStaleness(
  characters: VocabularyCharacterEntry[],
  stats: Map<string, { readCount: number; lastReadAt: Date | string | null }>,
) {
  return characters
    .map((entry) => {
      const stat = stats.get(entry.hanzi);

      return {
        ...entry,
        readCount: stat?.readCount ?? 0,
        lastReadAt: stat?.lastReadAt ? new Date(stat.lastReadAt) : null,
      };
    })
    .sort((left, right) => {
      if (left.lastReadAt === null && right.lastReadAt !== null) {
        return -1;
      }

      if (left.lastReadAt !== null && right.lastReadAt === null) {
        return 1;
      }

      if (left.lastReadAt && right.lastReadAt) {
        const timeDiff = left.lastReadAt.getTime() - right.lastReadAt.getTime();

        if (timeDiff !== 0) {
          return timeDiff;
        }
      }

      if (left.readCount !== right.readCount) {
        return left.readCount - right.readCount;
      }

      if (left.hskLevel !== right.hskLevel) {
        return Number(left.hskLevel) - Number(right.hskLevel);
      }

      return left.hanzi.localeCompare(right.hanzi, "zh-Hans-CN");
    });
}

function getReviewCharacterTargetCount(count: number) {
  if (count >= 4) {
    return 3 + Math.floor(Math.random() * 2);
  }

  return Math.max(0, count);
}

function mapStory(record: {
  id: string;
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  excerpt: string;
  hanziText: string;
  pinyinText: string;
  englishTranslation: string;
  sections: Prisma.JsonValue;
  type: StoryType;
  hskLevel: string;
  level: StoryLevel;
  visibility: StoryVisibility;
  isSeeded: boolean;
  authorUserId: string | null;
  seriesGroupSlug?: string | null;
  seriesEpisode?: number | null;
  seriesTitle?: string | null;
  seriesTitleTranslation?: string | null;
  seriesSummary?: string | null;
  lessonLength?: LessonLength | null;
  createdAt: Date;
  updatedAt: Date;
  author?: {
    name: string;
  } | null;
}): AppStory {
  return {
    id: record.id,
    slug: record.slug,
    title: record.title,
    titleTranslation: record.titleTranslation,
    emojiTitle: getStoryEmojiTitle({
      id: record.id,
      slug: record.slug,
      titleTranslation: record.titleTranslation,
      summary: record.summary,
      type: record.type,
    }),
    summary: record.summary,
    excerpt: record.excerpt,
    hanziText: record.hanziText,
    pinyinText: record.pinyinText,
    englishTranslation: record.englishTranslation,
    sections: storySectionsSchema.parse(record.sections),
    type: record.type,
    hskLevel: normalizeHskLevel(record.hskLevel),
    level: record.level,
    visibility: record.visibility,
    isSeeded: record.isSeeded,
    authorUserId: record.authorUserId,
    authorName: record.author?.name ?? null,
    seriesGroupSlug: record.seriesGroupSlug ?? null,
    seriesEpisode: record.seriesEpisode ?? null,
    seriesTitle: record.seriesTitle ?? null,
    seriesTitleTranslation: record.seriesTitleTranslation ?? null,
    seriesSummary: record.seriesSummary ?? null,
    lessonLength: record.lessonLength ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listPublicStories() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        visibility: {
          in: [...publicVisibilities],
        },
      },
      orderBy: [{ isSeeded: "desc" }, { createdAt: "desc" }],
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return stories.map(mapStory);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      console.warn("Falling back to bundled seed stories because the database is unavailable.");
      return getFallbackSeedStories();
    }

    throw error;
  }
}

export async function listSeededStories() {
  try {
    const stories = await prisma.story.findMany({
      where: {
        visibility: "public_seeded",
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return stories.map(mapStory);
  } catch (error) {
    if (isDatabaseUnavailable(error)) {
      return getFallbackSeedStories();
    }

    throw error;
  }
}

export async function listStoriesForUser(userId: string) {
  const stories = await prisma.story.findMany({
    where: {
      OR: [
        { visibility: "public_seeded" },
        { authorUserId: userId },
      ],
    },
    orderBy: [{ isSeeded: "desc" }, { createdAt: "desc" }],
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return stories.map(mapStory);
}

export async function listGeneratedStoriesForUser(userId: string) {
  const stories = await prisma.story.findMany({
    where: {
      authorUserId: userId,
      isSeeded: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return stories.map(mapStory);
}

export async function listPublicStoriesByAuthor(authorUserId: string) {
  const stories = await prisma.story.findMany({
    where: {
      authorUserId,
      visibility: "public_user",
      isSeeded: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
  });

  return stories.map(mapStory);
}

export async function getPublicAuthorProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
  });

  if (!user) {
    return null;
  }

  const stories = await listPublicStoriesByAuthor(userId);

  return { user, stories };
}

export async function getAccessibleStoryBySlug(slug: string, userId?: string | null) {
  try {
    const story = await prisma.story.findFirst({
      where: {
        slug,
        OR: userId
          ? [
              { visibility: { in: [...publicVisibilities] } },
              { authorUserId: userId },
            ]
          : [{ visibility: { in: [...publicVisibilities] } }],
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return story ? mapStory(story) : null;
  } catch (error) {
    if (isDatabaseUnavailable(error) && !userId) {
      return getFallbackSeedStories().find((story) => story.slug === slug) ?? null;
    }

    throw error;
  }
}

export async function getStoryListForReader(userId?: string | null) {
  const stories = userId
    ? await listStoriesForUser(userId)
    : await listPublicStories();

  return stories;
}

export async function markStoryRead(userId: string, storyId: string) {
  const now = new Date();
  const story = await prisma.story.findUnique({
    where: {
      id: storyId,
    },
    select: {
      hanziText: true,
    },
  });

  if (!story) {
    throw new Error("Story not found");
  }

  const vocabularyCounts = countTrackedVocabularyOccurrences(story.hanziText);

  return prisma.$transaction(async (tx) => {
    const read = await tx.storyRead.upsert({
      where: {
        userId_storyId: {
          userId,
          storyId,
        },
      },
      update: {
        readAt: now,
      },
      create: {
        userId,
        storyId,
      },
    });

    for (const [hanzi, count] of vocabularyCounts.entries()) {
      await tx.vocabularyRead.upsert({
        where: {
          userId_hanzi: {
            userId,
            hanzi,
          },
        },
        update: {
          readCount: {
            increment: count,
          },
          lastReadAt: now,
        },
        create: {
          userId,
          hanzi,
          readCount: count,
          lastReadAt: now,
        },
      });
    }

    return read;
  }, {
    timeout: 20000,
  });
}

export async function listReadStoryIdsForUser(userId: string) {
  const reads = await prisma.storyRead.findMany({
    where: {
      userId,
    },
    select: {
      storyId: true,
    },
  });

  return reads.map((read) => read.storyId);
}

export async function getVocabularyReadStatsForUser(userId: string) {
  const reads = await prisma.vocabularyRead.findMany({
    where: {
      userId,
    },
    select: {
      hanzi: true,
      readCount: true,
      lastReadAt: true,
    },
  });

  return new Map(
    reads.map((entry) => [
      entry.hanzi,
      {
        readCount: entry.readCount,
        lastReadAt: entry.lastReadAt,
      },
    ]),
  );
}

export type SuggestedReviewCharacter = {
  hanzi: string;
  pinyin: string | null;
  definition: string | null;
  hskLevel: HskLevel;
  readCount: number;
  lastReadAt: Date | null;
};

export async function listReviewCharacterCandidatesForUser(
  userId: string,
  hskLevel: HskLevel,
) {
  const stats = await getVocabularyReadStatsForUser(userId);
  const ranked = rankVocabularyByStaleness(
    getVocabularyCharactersUpToLevel(hskLevel),
    stats,
  );

  return ranked.slice(0, 20);
}

export async function getSuggestedReviewCharactersForUser(
  userId: string,
  hskLevel: HskLevel,
) {
  const candidates = await listReviewCharacterCandidatesForUser(userId, hskLevel);
  const targetCount = getReviewCharacterTargetCount(candidates.length);

  if (!targetCount) {
    return [];
  }

  const chosen = new Set(
    shuffleArray(candidates)
      .slice(0, targetCount)
      .map((entry) => entry.hanzi),
  );

  return candidates.filter((entry) => chosen.has(entry.hanzi));
}

export async function validateSuggestedReviewCharactersForUser(input: {
  userId: string;
  hskLevel: HskLevel;
  selectedCharacters: string[];
}) {
  const candidates = await listReviewCharacterCandidatesForUser(
    input.userId,
    input.hskLevel,
  );
  const candidateMap = new Map(candidates.map((entry) => [entry.hanzi, entry]));
  const uniqueSelection = Array.from(new Set(input.selectedCharacters))
    .map((hanzi) => candidateMap.get(hanzi))
    .filter((entry): entry is SuggestedReviewCharacter => Boolean(entry));

  const targetCount = getReviewCharacterTargetCount(candidates.length);

  if (!targetCount) {
    return [];
  }

  const remaining = shuffleArray(
    candidates.filter(
      (entry) => !uniqueSelection.some((selected) => selected.hanzi === entry.hanzi),
    ),
  );

  while (uniqueSelection.length < targetCount && remaining.length) {
    const next = remaining.shift();

    if (next) {
      uniqueSelection.push(next);
    }
  }

  return uniqueSelection.slice(0, targetCount);
}

export async function listPublicSeries(userId?: string | null) {
  const stories = userId
    ? await listStoriesForUser(userId)
    : await listPublicStories();

  return hydrateSeries(stories);
}

export async function getAccessibleSeriesBySlug(slug: string, userId?: string | null) {
  const stories = userId
    ? await listStoriesForUser(userId)
    : await listPublicStories();

  return getSeriesBySlug(slug, stories);
}

export async function getSeriesForAccessibleStory(storySlug: string, userId?: string | null) {
  const stories = userId
    ? await listStoriesForUser(userId)
    : await listPublicStories();

  return getSeriesForStory(storySlug, stories);
}

export type AiUsageForStory = {
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costCredits: number | null;
  providerRequestId: string | null;
};

export async function recordStandaloneAiUsage(input: {
  userId: string;
  storyId?: string | null;
  aiUsage: AiUsageForStory;
}) {
  const usage = input.aiUsage;
  await prisma.aiUsageEvent.create({
    data: {
      userId: input.userId,
      storyId: input.storyId ?? null,
      model: usage.model,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      costCredits:
        usage.costCredits != null ? new Prisma.Decimal(usage.costCredits) : null,
      providerRequestId: usage.providerRequestId,
    },
  });
}

export type AiUsageProfileSummary = {
  generationCount: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  totalCostCredits: Prisma.Decimal | null;
};

export type AiUsageProfileRow = {
  id: string;
  createdAt: Date;
  model: string;
  promptTokens: number | null;
  completionTokens: number | null;
  totalTokens: number | null;
  costCredits: Prisma.Decimal | null;
  story: { titleTranslation: string; slug: string } | null;
};

export async function getAiUsageProfileData(userId: string): Promise<{
  summary: AiUsageProfileSummary;
  recent: AiUsageProfileRow[];
}> {
  const [aggregate, recentRaw] = await Promise.all([
    prisma.aiUsageEvent.aggregate({
      where: { userId },
      _count: { _all: true },
      _sum: {
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        costCredits: true,
      },
    }),
    prisma.aiUsageEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        createdAt: true,
        model: true,
        promptTokens: true,
        completionTokens: true,
        totalTokens: true,
        costCredits: true,
        story: {
          select: {
            titleTranslation: true,
            slug: true,
          },
        },
      },
    }),
  ]);

  const recent: AiUsageProfileRow[] = recentRaw.map((row) => ({
    id: row.id,
    createdAt: row.createdAt,
    model: row.model,
    promptTokens: row.promptTokens,
    completionTokens: row.completionTokens,
    totalTokens: row.totalTokens,
    costCredits: row.costCredits,
    story: row.story,
  }));

  return {
    summary: {
      generationCount: aggregate._count._all,
      totalPromptTokens: aggregate._sum.promptTokens ?? 0,
      totalCompletionTokens: aggregate._sum.completionTokens ?? 0,
      totalTokens: aggregate._sum.totalTokens ?? 0,
      totalCostCredits: aggregate._sum.costCredits ?? null,
    },
    recent,
  };
}

export async function createGeneratedStory(input: {
  userId: string;
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  excerpt: string;
  hanziText: string;
  pinyinText: string;
  englishTranslation: string;
  sections: AppStory["sections"];
  type: StoryType;
  hskLevel: HskLevel;
  level: StoryLevel;
  visibility: StoryVisibility;
  lessonLength?: LessonLength | null;
  aiUsage?: AiUsageForStory;
}) {
  if (!input.aiUsage) {
    const story = await prisma.story.create({
      data: {
        slug: input.slug,
        title: input.title,
        titleTranslation: input.titleTranslation,
        summary: input.summary,
        excerpt: input.excerpt,
        hanziText: input.hanziText,
        pinyinText: input.pinyinText,
        englishTranslation: input.englishTranslation,
        sections: input.sections,
        type: input.type,
        hskLevel: input.hskLevel,
        level: input.level,
        visibility: input.visibility,
        isSeeded: false,
        authorUserId: input.userId,
        lessonLength: input.lessonLength ?? null,
      },
    });

    await syncStoryHanziIndex(prisma, story.id, {
      title: story.title,
      hanziText: story.hanziText,
      sections: input.sections,
    });

    return mapStory(story);
  }

  const usage = input.aiUsage;

  return prisma.$transaction(async (tx) => {
    const story = await tx.story.create({
      data: {
        slug: input.slug,
        title: input.title,
        titleTranslation: input.titleTranslation,
        summary: input.summary,
        excerpt: input.excerpt,
        hanziText: input.hanziText,
        pinyinText: input.pinyinText,
        englishTranslation: input.englishTranslation,
        sections: input.sections,
        type: input.type,
        hskLevel: input.hskLevel,
        level: input.level,
        visibility: input.visibility,
        isSeeded: false,
        authorUserId: input.userId,
        lessonLength: input.lessonLength ?? null,
      },
    });

    await tx.aiUsageEvent.create({
      data: {
        userId: input.userId,
        storyId: story.id,
        model: usage.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        costCredits:
          usage.costCredits != null ? new Prisma.Decimal(usage.costCredits) : null,
        providerRequestId: usage.providerRequestId,
      },
    });

    await syncStoryHanziIndex(tx, story.id, {
      title: story.title,
      hanziText: story.hanziText,
      sections: input.sections,
    });

    return mapStory(story);
  });
}

function newSeriesGroupSlug() {
  return `gen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function createGeneratedSeries(input: {
  userId: string;
  seriesGroupSlug: string;
  seriesTitle: string;
  seriesTitleTranslation: string;
  seriesSummary: string;
  episodes: GeneratedSeriesEpisode[];
  type: StoryType;
  hskLevel: HskLevel;
  level: StoryLevel;
  visibility: StoryVisibility;
  lessonLength: LessonLength;
  aiUsage: AiUsageForStory;
}) {
  const usage = input.aiUsage;

  return prisma.$transaction(async (tx) => {
    const mapped: AppStory[] = [];
    const stamp = Date.now().toString().slice(-7);

    for (let index = 0; index < input.episodes.length; index += 1) {
      const episode = input.episodes[index]!;
      const baseSlug =
        slugify(episode.titleTranslation) ||
        slugify(episode.title) ||
        `episode-${index + 1}`;
      const slug = `${baseSlug}-${stamp}-${index}`;

      const row = await tx.story.create({
        data: {
          slug,
          title: episode.title,
          titleTranslation: episode.titleTranslation,
          summary: episode.summary,
          excerpt: episode.excerpt,
          hanziText: episode.hanziText,
          pinyinText: episode.pinyinText,
          englishTranslation: episode.englishTranslation,
          sections: episode.sections,
          type: input.type,
          hskLevel: input.hskLevel,
          level: input.level,
          visibility: input.visibility,
          isSeeded: false,
          author: { connect: { id: input.userId } },
          seriesGroupSlug: input.seriesGroupSlug,
          seriesEpisode: index + 1,
          seriesTitle: input.seriesTitle,
          seriesTitleTranslation: input.seriesTitleTranslation,
          seriesSummary: input.seriesSummary,
          lessonLength: input.lessonLength,
        },
        include: {
          author: {
            select: {
              name: true,
            },
          },
        },
      });

      await syncStoryHanziIndex(tx, row.id, {
        title: row.title,
        hanziText: row.hanziText,
        sections: storySectionsSchema.parse(row.sections),
      });

      mapped.push(mapStory(row));
    }

    const first = mapped[0];

    if (first) {
      await tx.aiUsageEvent.create({
        data: {
          userId: input.userId,
          storyId: first.id,
          model: usage.model,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          costCredits:
            usage.costCredits != null ? new Prisma.Decimal(usage.costCredits) : null,
          providerRequestId: usage.providerRequestId,
        },
      });
    }

    return {
      seriesSlug: input.seriesGroupSlug,
      stories: mapped,
      firstStory: first ?? mapped[0]!,
    };
  });
}

export async function appendGeneratedSeriesEpisode(input: {
  userId: string;
  seriesGroupSlug: string;
  nextEpisodeNumber: number;
  seriesTitle: string;
  seriesTitleTranslation: string;
  seriesSummary: string;
  episode: GeneratedSeriesEpisode;
  type: StoryType;
  hskLevel: HskLevel;
  level: StoryLevel;
  visibility: StoryVisibility;
  lessonLength: LessonLength;
  aiUsage: AiUsageForStory;
}): Promise<AppStory> {
  const usage = input.aiUsage;
  const stamp = Date.now().toString().slice(-7);
  const ep = input.episode;
  const baseSlug =
    slugify(ep.titleTranslation) ||
    slugify(ep.title) ||
    `episode-${input.nextEpisodeNumber}`;
  const slug = `${baseSlug}-${stamp}-e${input.nextEpisodeNumber}`;

  return prisma.$transaction(async (tx) => {
    const row = await tx.story.create({
      data: {
        slug,
        title: ep.title,
        titleTranslation: ep.titleTranslation,
        summary: ep.summary,
        excerpt: ep.excerpt,
        hanziText: ep.hanziText,
        pinyinText: ep.pinyinText,
        englishTranslation: ep.englishTranslation,
        sections: ep.sections,
        type: input.type,
        hskLevel: input.hskLevel,
        level: input.level,
        visibility: input.visibility,
        isSeeded: false,
        author: { connect: { id: input.userId } },
        seriesGroupSlug: input.seriesGroupSlug,
        seriesEpisode: input.nextEpisodeNumber,
        seriesTitle: input.seriesTitle,
        seriesTitleTranslation: input.seriesTitleTranslation,
        seriesSummary: input.seriesSummary,
        lessonLength: input.lessonLength,
      },
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    await tx.aiUsageEvent.create({
      data: {
        userId: input.userId,
        storyId: row.id,
        model: usage.model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        costCredits:
          usage.costCredits != null ? new Prisma.Decimal(usage.costCredits) : null,
        providerRequestId: usage.providerRequestId,
      },
    });

    await syncStoryHanziIndex(tx, row.id, {
      title: row.title,
      hanziText: row.hanziText,
      sections: storySectionsSchema.parse(row.sections),
    });

    return mapStory(row);
  });
}

export { newSeriesGroupSlug };

export async function seedStarterStories(stories: SeedStory[]) {
  for (const story of stories) {
    const row = await prisma.story.upsert({
      where: {
        slug: story.slug,
      },
      update: {
        title: story.title,
        titleTranslation: story.titleTranslation,
        summary: story.summary,
        excerpt: story.excerpt,
        hanziText: story.hanziText,
        pinyinText: story.pinyinText,
        englishTranslation: story.englishTranslation,
        sections: story.sections,
        type: story.type,
        hskLevel: story.hskLevel,
        level: story.level,
        visibility: "public_seeded",
        isSeeded: true,
        authorUserId: null,
      },
      create: {
        slug: story.slug,
        title: story.title,
        titleTranslation: story.titleTranslation,
        summary: story.summary,
        excerpt: story.excerpt,
        hanziText: story.hanziText,
        pinyinText: story.pinyinText,
        englishTranslation: story.englishTranslation,
        sections: story.sections,
        type: story.type,
        hskLevel: story.hskLevel,
        level: story.level,
        visibility: "public_seeded",
        isSeeded: true,
      },
    });

    await syncStoryHanziIndex(prisma, row.id, {
      title: row.title,
      hanziText: row.hanziText,
      sections: story.sections,
    });
  }
}

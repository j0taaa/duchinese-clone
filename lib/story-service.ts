import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getSeriesBySlug, getSeriesForStory, hydrateSeries } from "@/lib/series";
import {
  type AppStory,
  type SeedStory,
  storySectionsSchema,
  type StoryLevel,
  type StoryType,
  type StoryVisibility,
} from "@/lib/stories";
import { countTrackedVocabularyOccurrences } from "@/lib/vocabulary";

const publicVisibilities = ["public_seeded", "public_user"] as const;

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
  level: StoryLevel;
  visibility: StoryVisibility;
  isSeeded: boolean;
  authorUserId: string | null;
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
    summary: record.summary,
    excerpt: record.excerpt,
    hanziText: record.hanziText,
    pinyinText: record.pinyinText,
    englishTranslation: record.englishTranslation,
    sections: storySectionsSchema.parse(record.sections),
    type: record.type,
    level: record.level,
    visibility: record.visibility,
    isSeeded: record.isSeeded,
    authorUserId: record.authorUserId,
    authorName: record.author?.name ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function listPublicStories() {
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
}

export async function listSeededStories() {
  const stories = await prisma.story.findMany({
    where: {
      visibility: "public_seeded",
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  return stories.map(mapStory);
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

export async function getAccessibleStoryBySlug(slug: string, userId?: string | null) {
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

export async function getAiSettingsSummary(userId: string) {
  const settings = await prisma.userAiSettings.findUnique({
    where: {
      userId,
    },
  });

  if (!settings) {
    return null;
  }

  return {
    baseUrl: settings.baseUrl,
    model: settings.model,
    hasApiKey: Boolean(settings.apiKey),
    apiKeyHint: settings.apiKey ? `••••${settings.apiKey.slice(-4)}` : null,
  };
}

export async function getAiSettingsForGeneration(userId: string) {
  return prisma.userAiSettings.findUnique({
    where: {
      userId,
    },
  });
}

export async function upsertAiSettings(input: {
  userId: string;
  baseUrl: string;
  model: string;
  apiKey: string;
}) {
  return prisma.userAiSettings.upsert({
    where: {
      userId: input.userId,
    },
    update: {
      baseUrl: input.baseUrl,
      model: input.model,
      apiKey: input.apiKey,
    },
    create: {
      userId: input.userId,
      baseUrl: input.baseUrl,
      model: input.model,
      apiKey: input.apiKey,
    },
  });
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
  level: StoryLevel;
  visibility: StoryVisibility;
}) {
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
      level: input.level,
      visibility: input.visibility,
      isSeeded: false,
      authorUserId: input.userId,
    },
  });

  return mapStory(story);
}

export async function seedStarterStories(stories: SeedStory[]) {
  for (const story of stories) {
    await prisma.story.upsert({
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
        level: story.level,
        visibility: "public_seeded",
        isSeeded: true,
      },
    });
  }
}

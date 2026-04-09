import { hydrateSeries } from "@/lib/series";
import type { AiUsageProfileRow } from "@/lib/story-service";
import type { AppStory } from "@/lib/stories";
import type { VocabularyLevelGroup } from "@/lib/vocabulary";

export function serializeStory(story: AppStory) {
  return {
    id: story.id,
    slug: story.slug,
    title: story.title,
    titleTranslation: story.titleTranslation,
    summary: story.summary,
    excerpt: story.excerpt,
    hskLevel: story.hskLevel,
    type: story.type,
    sections: story.sections,
    createdAt: new Date(story.createdAt).toISOString(),
    updatedAt: new Date(story.updatedAt).toISOString(),
    authorName: story.authorName,
    authorUserId: story.authorUserId,
    authorImage: null,
    isSeeded: story.isSeeded,
    isPublic: story.visibility !== "private_user",
    seriesGroupSlug: story.seriesGroupSlug,
    seriesEpisode: story.seriesEpisode,
  };
}

export function serializeSeriesFromStories(stories: AppStory[]) {
  return hydrateSeries(stories).map((series) => {
    const firstOwned = series.stories.find((story) => story.authorUserId && story.authorName);

    return {
      slug: series.slug,
      title: series.title,
      titleTranslation: series.titleTranslation,
      summary: series.summary,
      hskLevel: series.hskLevel,
      stories: series.stories.map(serializeStory),
      isPublic: series.stories.some((story) => story.visibility === "public_user"),
      ownerUserId: firstOwned?.authorUserId ?? null,
      ownerName: firstOwned?.authorName ?? null,
    };
  });
}

export function serializeUsageRows(rows: AiUsageProfileRow[]) {
  return rows.map((row) => ({
    id: row.id,
    createdAt: row.createdAt.toISOString(),
    title: row.story?.titleTranslation ?? "Generated lesson",
    promptTokens: row.promptTokens ?? 0,
    completionTokens: row.completionTokens ?? 0,
    totalTokens: row.totalTokens ?? 0,
    costCredits: row.costCredits?.toString() ?? "0",
  }));
}

export function serializeVocabularyLevels(levels: VocabularyLevelGroup[]) {
  return levels.map((level) => ({
    key: level.key,
    title: level.title,
    hskLevel: level.hskLevel,
    characters: level.characters.map((entry) => ({
      hanzi: entry.hanzi,
      pinyin: entry.pinyin,
      definition: entry.definition,
      hskLevel: entry.hskLevel,
      readCount: entry.readCount,
      lastReadAt: entry.lastReadAt ? new Date(entry.lastReadAt).toISOString() : null,
    })),
  }));
}

export function serializeVocabularyStats(
  stats: Map<string, { readCount: number; lastReadAt: Date | string | null }>,
) {
  return Object.fromEntries(
    [...stats.entries()].map(([hanzi, stat]) => [
      hanzi,
      {
        readCount: stat.readCount,
        lastReadAt: stat.lastReadAt ? new Date(stat.lastReadAt).toISOString() : null,
      },
    ]),
  );
}

import { getHighestHskLevel } from "@/lib/hsk";
import { type AppStory, type HskLevel } from "@/lib/stories";
import { getStoryEmojiTitle } from "@/lib/story-labels";

export type AppSeries = {
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  coverHanzi: string;
  emojiTitle: string;
  storySlugs: string[];
  stories: AppStory[];
  hskLevel: HskLevel;
};

type SeedSeries = Omit<AppSeries, "stories" | "hskLevel" | "emojiTitle">;

const seedSeries: SeedSeries[] = [
  {
    slug: "city-routines",
    title: "城市日常",
    titleTranslation: "City Routines",
    summary:
      "A small collection about the rhythm of daily city life, from markets to subways to after-work coffee.",
    coverHanzi: "城",
    storySlugs: ["morning-market", "subway-ride", "coffee-chat"],
  },
  {
    slug: "slow-living-notes",
    title: "慢生活笔记",
    titleTranslation: "Slow Living Notes",
    summary:
      "Stories about quieter moments: lunch in the park, rainy afternoons, and weekends spent at home.",
    coverHanzi: "慢",
    storySlugs: ["park-lunch", "rainy-notes", "weekend-bookshelf"],
  },
];

function buildUserSeriesFromStories(stories: AppStory[]): AppSeries[] {
  const byGroup = new Map<string, AppStory[]>();

  for (const story of stories) {
    if (!story.seriesGroupSlug) {
      continue;
    }

    const list = byGroup.get(story.seriesGroupSlug) ?? [];
    list.push(story);
    byGroup.set(story.seriesGroupSlug, list);
  }

  const result: AppSeries[] = [];

  for (const [slug, group] of byGroup) {
    group.sort((a, b) => (a.seriesEpisode ?? 0) - (b.seriesEpisode ?? 0));
    const first = group[0];

    if (!first?.seriesTitle || !first.seriesTitleTranslation) {
      continue;
    }

    const summary = first.seriesSummary ?? "";

    result.push({
      slug,
      title: first.seriesTitle,
      titleTranslation: first.seriesTitleTranslation,
      summary,
      coverHanzi: first.title.charAt(0) || "课",
      emojiTitle: getStoryEmojiTitle({
        id: `series-${slug}`,
        slug,
        titleTranslation: first.seriesTitleTranslation,
        summary,
        type: "story",
      }),
      storySlugs: group.map((s) => s.slug),
      stories: group,
      hskLevel: getHighestHskLevel(group.map((s) => s.hskLevel)),
    });
  }

  return result.sort((a, b) => {
    const ta = new Date(a.stories[0]?.createdAt ?? 0).getTime();
    const tb = new Date(b.stories[0]?.createdAt ?? 0).getTime();
    return tb - ta;
  });
}

export function hydrateSeries(stories: AppStory[]) {
  const storyMap = new Map(stories.map((story) => [story.slug, story]));

  const seedHydrated = seedSeries
    .map<AppSeries | null>((series) => {
      const seriesStories = series.storySlugs
        .map((slug) => storyMap.get(slug))
        .filter((story): story is AppStory => Boolean(story));

      if (!seriesStories.length) {
        return null;
      }

      return {
        ...series,
        emojiTitle: getStoryEmojiTitle({
          id: `series-${series.slug}`,
          slug: series.slug,
          titleTranslation: series.titleTranslation,
          summary: series.summary,
          type: "story",
        }),
        stories: seriesStories,
        hskLevel: getHighestHskLevel(seriesStories.map((story) => story.hskLevel)),
      };
    })
    .filter((series): series is AppSeries => Boolean(series));

  const userSeries = buildUserSeriesFromStories(stories);

  return [...seedHydrated, ...userSeries];
}

/**
 * From a flat list (e.g. all public stories by one author), separate bundled user series
 * from standalone lessons. Episodes that appear in a built {@link AppSeries} are omitted from `standalone`.
 */
export function partitionStoriesIntoSeriesAndStandalone(stories: AppStory[]): {
  series: AppSeries[];
  standalone: AppStory[];
} {
  const series = buildUserSeriesFromStories(stories);
  const episodeIdsInSeries = new Set(
    series.flatMap((entry) => entry.stories.map((episode) => episode.id)),
  );
  const standalone = stories.filter((story) => !episodeIdsInSeries.has(story.id));
  return { series, standalone };
}

export function getSeriesBySlug(slug: string, stories: AppStory[]) {
  return hydrateSeries(stories).find((series) => series.slug === slug) ?? null;
}

export function getSeriesForStory(storySlug: string, stories: AppStory[]) {
  return hydrateSeries(stories).find((series) => series.storySlugs.includes(storySlug)) ?? null;
}

export function getSeriesStorySlugs(stories: AppStory[]) {
  return new Set(hydrateSeries(stories).flatMap((series) => series.storySlugs));
}

/**
 * When every episode that has an author is by the same account (e.g. mixed with
 * starter lessons that have no author), return that author for series-level attribution.
 */
export function getSharedSeriesAuthor(stories: AppStory[]): {
  authorUserId: string;
  authorName: string;
} | null {
  let authorUserId: string | null = null;
  let authorName: string | null = null;

  for (const story of stories) {
    if (!story.authorUserId || !story.authorName) {
      continue;
    }

    if (authorUserId === null) {
      authorUserId = story.authorUserId;
      authorName = story.authorName;
      continue;
    }

    if (story.authorUserId !== authorUserId) {
      return null;
    }
  }

  if (authorUserId && authorName) {
    return { authorUserId, authorName };
  }

  return null;
}

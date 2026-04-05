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

export function hydrateSeries(stories: AppStory[]) {
  const storyMap = new Map(stories.map((story) => [story.slug, story]));

  return seedSeries
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

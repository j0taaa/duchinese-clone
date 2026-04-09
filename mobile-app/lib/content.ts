import type { AppSeries, AppStory, HskLevel } from "@/types/content";

export function getHskLabel(level: HskLevel) {
  return `HSK ${level}`;
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function filterStories(stories: AppStory[], query: string, hsk: HskLevel | "all") {
  const needle = query.trim().toLowerCase();
  return stories.filter((story) => {
    const matchesHsk = hsk === "all" || story.hskLevel === hsk;
    const haystack = [
      story.title,
      story.titleTranslation,
      story.summary,
      story.excerpt,
      story.authorName ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return matchesHsk && (!needle || haystack.includes(needle));
  });
}

export function filterSeries(series: AppSeries[], query: string, hsk: HskLevel | "all") {
  const needle = query.trim().toLowerCase();
  return series.filter((entry) => {
    const matchesHsk = hsk === "all" || entry.hskLevel === hsk;
    const haystack = [
      entry.title,
      entry.titleTranslation,
      entry.summary,
      ...entry.stories.map((story) => `${story.title} ${story.titleTranslation} ${story.summary}`),
    ]
      .join(" ")
      .toLowerCase();
    return matchesHsk && (!needle || haystack.includes(needle));
  });
}

export function getStandaloneStories(stories: AppStory[], series: AppSeries[]) {
  const seriesStoryIds = new Set(series.flatMap((entry) => entry.stories.map((story) => story.id)));
  return stories.filter((story) => !seriesStoryIds.has(story.id));
}

export function findStoryBySlug(stories: AppStory[], slug: string) {
  return stories.find((story) => story.slug === slug) ?? null;
}

export function findSeriesBySlug(series: AppSeries[], slug: string) {
  return series.find((entry) => entry.slug === slug) ?? null;
}

export function getSeriesForStory(series: AppSeries[], storySlug: string) {
  return series.find((entry) => entry.stories.some((story) => story.slug === storySlug)) ?? null;
}

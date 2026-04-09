import type { HskLevel } from "./content-types";

type SearchableStory = {
  id: string;
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  excerpt: string;
  hskLevel: HskLevel;
  authorName?: string | null;
};

type SearchableSeries<TStory extends { slug: string }> = {
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  hskLevel: HskLevel;
  stories: TStory[];
};

export type HskFilter = HskLevel | "all";

export function getHskLabel(level: HskLevel) {
  return `HSK ${level}`;
}

export function slugify(input: string, maxLength = 50) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

export function filterStoriesByQueryAndHsk<TStory extends SearchableStory>(
  stories: TStory[],
  query: string,
  hsk: HskFilter,
) {
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

export function filterSeriesByQueryAndHsk<
  TStory extends { title: string; titleTranslation: string; summary: string; slug: string },
  TSeries extends SearchableSeries<TStory>,
>(series: TSeries[], query: string, hsk: HskFilter) {
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

export function getStandaloneStories<
  TStory extends { id: string },
  TSeries extends { stories: Array<{ id: string }> },
>(stories: TStory[], series: TSeries[]) {
  const seriesStoryIds = new Set(series.flatMap((entry) => entry.stories.map((story) => story.id)));
  return stories.filter((story) => !seriesStoryIds.has(story.id));
}

export function findStoryBySlug<TStory extends { slug: string }>(stories: TStory[], slug: string) {
  return stories.find((story) => story.slug === slug) ?? null;
}

export function findSeriesBySlug<TSeries extends { slug: string }>(series: TSeries[], slug: string) {
  return series.find((entry) => entry.slug === slug) ?? null;
}

export function getSeriesForStory<
  TSeries extends { stories: Array<{ slug: string }> },
>(series: TSeries[], storySlug: string) {
  return series.find((entry) => entry.stories.some((story) => story.slug === storySlug)) ?? null;
}

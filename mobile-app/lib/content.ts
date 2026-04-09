export {
  filterSeriesByQueryAndHsk as filterSeries,
  filterStoriesByQueryAndHsk as filterStories,
  findSeriesBySlug,
  findStoryBySlug,
  getHskLabel,
  getSeriesForStory,
  getStandaloneStories,
  slugify,
} from "../../shared/content-utils";

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

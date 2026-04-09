import { getAiUsageProfileData, getVocabularyReadStatsForUser, listGeneratedStoriesForUser, listPublicStories, listReadStoryIdsForUser } from "@/lib/story-service";
import { getRequestSession } from "@/lib/session";
import { getViewCounts } from "@/lib/view-buffer";
import { mobileJson, mobileOptions } from "@/lib/mobile-api";
import {
  serializeSeriesFromStories,
  serializeStory,
  serializeUsageRows,
  serializeVocabularyLevels,
} from "@/lib/mobile-serialization";
import { getVocabularyLevelGroups, mergeVocabularyReadStats } from "@/lib/vocabulary";

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function GET(request: Request) {
  const session = await getRequestSession(request);
  const [publicStories, generatedStories, readStoryIds, usageProfile, vocabularyStats] =
    await Promise.all([
      listPublicStories(),
      session ? listGeneratedStoriesForUser(session.user.id) : Promise.resolve([]),
      session ? listReadStoryIdsForUser(session.user.id) : Promise.resolve<string[]>([]),
      session
        ? getAiUsageProfileData(session.user.id)
        : Promise.resolve({ summary: null, recent: [] }),
      session ? getVocabularyReadStatsForUser(session.user.id) : Promise.resolve(new Map()),
    ]);

  const publicSeries = serializeSeriesFromStories(publicStories);
  const generatedSeries = serializeSeriesFromStories(generatedStories);
  const allViewIds = [
    ...new Set([...publicStories.map((story) => story.id), ...generatedStories.map((story) => story.id)]),
  ];
  const viewCounts =
    allViewIds.length > 0 ? await getViewCounts(allViewIds) : new Map<string, number>();

  return mobileJson(request, {
    session: session
      ? {
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image ?? null,
          },
        }
      : null,
    publicStories: publicStories.map(serializeStory),
    publicSeries,
    generatedStories: generatedStories.map(serializeStory),
    generatedSeries,
    readStoryIds,
    usage: serializeUsageRows(usageProfile.recent),
    vocabularyLevels: serializeVocabularyLevels(
      mergeVocabularyReadStats(getVocabularyLevelGroups(), vocabularyStats),
    ),
    storyViewCounts: Object.fromEntries(viewCounts),
  });
}

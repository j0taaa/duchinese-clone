import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  publicSeries as basePublicSeries,
  publicStories as basePublicStories,
} from "@/data/mock-data";
import {
  simulateGeneration,
  simulateSeriesAppendEpisode,
} from "@/lib/mock-generation";
import {
  extractTrackedCharacters,
  getReviewCharacters,
  getVocabularyLevelGroups,
  mergeVocabularyReadStats,
} from "@/lib/vocabulary";
import type {
  AppSeries,
  AppStory,
  GenerationInput,
  PublicAuthorProfile,
  UsageEntry,
  UserSession,
  VocabularyLevelGroup,
} from "@/types/content";

type ReadStat = {
  readCount: number;
  lastReadAt: string | null;
};

type MobileAppContextValue = {
  session: UserSession | null;
  publicStories: AppStory[];
  publicSeries: AppSeries[];
  generatedStories: AppStory[];
  generatedSeries: AppSeries[];
  readStoryIds: string[];
  usage: UsageEntry[];
  allStories: AppStory[];
  allSeries: AppSeries[];
  storyViewCounts: Map<string, number>;
  vocabularyLevels: VocabularyLevelGroup[];
  publicAuthorProfiles: PublicAuthorProfile[];
  isSignedIn: boolean;
  signIn: (input: Omit<UserSession, "id">) => void;
  signUp: (input: Omit<UserSession, "id">) => void;
  signOut: () => void;
  markRead: (storyId: string) => void;
  recordView: (storyId: string) => void;
  getReviewCharactersForLevel: (hskLevel: GenerationInput["hskLevel"]) => ReturnType<typeof getReviewCharacters>;
  getAuthorProfile: (userId: string) => PublicAuthorProfile | null;
  generateLesson: (
    input: GenerationInput,
  ) => Promise<
    | { kind: "story"; story: AppStory }
    | { kind: "series"; series: AppSeries; stories: AppStory[] }
  >;
  appendSeriesEpisode: (seriesSlug: string) => Promise<AppStory | null>;
};

const MobileAppContext = createContext<MobileAppContextValue | null>(null);

const SELF_USER_ID = "mobile-self";

const initialViewCounts = new Map<string, number>([
  ["seed-morning-market", 284],
  ["seed-subway-ride", 191],
  ["seed-coffee-chat", 242],
  ["seed-park-lunch", 158],
  ["seed-rainy-notes", 173],
  ["seed-weekend-bookshelf", 149],
  ["public-tea-break", 64],
]);

function applyAuthorMetadata(story: AppStory, session: UserSession | null, visibility: GenerationInput["visibility"]) {
  return {
    ...story,
    authorName: session?.name ?? "You",
    authorUserId: session?.id ?? SELF_USER_ID,
    authorImage: session?.image ?? null,
    isPublic: visibility === "public",
  };
}

function buildStoryText(story: AppStory) {
  return story.sections.map((section) => section.hanzi).join("");
}

function buildPublicAuthorProfiles(stories: AppStory[], series: AppSeries[]) {
  const storiesByAuthor = new Map<string, AppStory[]>();

  for (const story of stories) {
    if (!story.isPublic || !story.authorUserId || !story.authorName) {
      continue;
    }

    const list = storiesByAuthor.get(story.authorUserId) ?? [];
    list.push(story);
    storiesByAuthor.set(story.authorUserId, list);
  }

  return Array.from(storiesByAuthor.entries()).map(([userId, authorStories]) => {
    const first = authorStories[0]!;

    return {
      user: {
        id: userId,
        name: first.authorName ?? "Reader",
        image: first.authorImage ?? null,
      },
      stories: authorStories,
      series: series.filter((entry) => entry.isPublic && entry.ownerUserId === userId),
    };
  });
}

export function MobileAppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [generatedStories, setGeneratedStories] = useState<AppStory[]>([]);
  const [generatedSeries, setGeneratedSeries] = useState<AppSeries[]>([]);
  const [readStoryIds, setReadStoryIds] = useState<string[]>([]);
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [storyViewCounts, setStoryViewCounts] = useState<Map<string, number>>(initialViewCounts);
  const [vocabularyStats, setVocabularyStats] = useState<Map<string, ReadStat>>(new Map());
  const generationSeed = useRef(100);

  function signIn(input: Omit<UserSession, "id">) {
    setSession({
      id: SELF_USER_ID,
      image: null,
      ...input,
    });
  }

  function signUp(input: Omit<UserSession, "id">) {
    signIn(input);
  }

  function signOut() {
    setSession(null);
  }

  function updateVocabularyStatsForStory(story: AppStory) {
    const now = new Date().toISOString();
    const chars = extractTrackedCharacters(buildStoryText(story));

    if (!chars.length) {
      return;
    }

    setVocabularyStats((current) => {
      const next = new Map(current);

      for (const hanzi of chars) {
        const existing = next.get(hanzi);
        next.set(hanzi, {
          readCount: (existing?.readCount ?? 0) + 1,
          lastReadAt: now,
        });
      }

      return next;
    });
  }

  const allStories = useMemo(() => [...generatedStories, ...basePublicStories], [generatedStories]);

  function markRead(storyId: string) {
    if (readStoryIds.includes(storyId)) {
      return;
    }

    const story = allStories.find((entry) => entry.id === storyId);
    if (story) {
      updateVocabularyStatsForStory(story);
    }

    setReadStoryIds((current) => [storyId, ...current]);
  }

  function recordView(storyId: string) {
    setStoryViewCounts((current) => {
      const next = new Map(current);
      next.set(storyId, (next.get(storyId) ?? 0) + 1);
      return next;
    });
  }

  async function generateLesson(input: GenerationInput) {
    generationSeed.current += 1;
    const seed = generationSeed.current;
    const result = await simulateGeneration(input, seed);

    if (result.kind === "story") {
      const story = applyAuthorMetadata(result.story, session, input.visibility);

      setGeneratedStories((current) => [story, ...current]);
      setUsage((current) => [result.usage, ...current]);
      return {
        kind: "story" as const,
        story,
      };
    }

    const stories = result.stories.map((story) =>
      applyAuthorMetadata(story, session, input.visibility),
    );
    const series: AppSeries = {
      ...result.series,
      stories,
      isPublic: input.visibility === "public",
      ownerUserId: session?.id ?? SELF_USER_ID,
      ownerName: session?.name ?? "You",
    };

    setGeneratedSeries((current) => [series, ...current]);
    setGeneratedStories((current) => [...stories, ...current]);
    setUsage((current) => [result.usage, ...current]);
    return {
      kind: "series" as const,
      series,
      stories,
    };
  }

  async function appendSeriesEpisode(seriesSlug: string) {
    const series = generatedSeries.find((entry) => entry.slug === seriesSlug);

    if (!series) {
      return null;
    }

    generationSeed.current += 1;
    const seed = generationSeed.current;
    const anchor = series.stories[0];

    if (!anchor) {
      return null;
    }

    const result = await simulateSeriesAppendEpisode({
      seed,
      series,
      type: anchor.type,
      hskLevel: anchor.hskLevel,
      length: "medium",
      visibility: series.isPublic ? "public" : "private",
    });

    const story = applyAuthorMetadata(
      {
        ...result.story,
        seriesGroupSlug: series.slug,
      },
      session,
      series.isPublic ? "public" : "private",
    );

    setGeneratedSeries((current) =>
      current.map((entry) =>
        entry.slug === seriesSlug
          ? {
              ...entry,
              stories: [...entry.stories, story],
            }
          : entry,
      ),
    );
    setGeneratedStories((current) => [story, ...current]);
    setUsage((current) => [result.usage, ...current]);
    return story;
  }

  const value = useMemo<MobileAppContextValue>(() => {
    const publicStories = [
      ...generatedStories.filter((story) => story.isPublic),
      ...basePublicStories,
    ].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

    const publicSeries = [
      ...generatedSeries.filter((series) => series.isPublic),
      ...basePublicSeries,
    ];

    const allSeries = [...generatedSeries, ...basePublicSeries];
    const vocabularyLevels = mergeVocabularyReadStats(
      getVocabularyLevelGroups(),
      vocabularyStats,
    );
    const publicAuthorProfiles = buildPublicAuthorProfiles(publicStories, publicSeries);

    return {
      session,
      publicStories,
      publicSeries,
      generatedStories,
      generatedSeries,
      readStoryIds,
      usage,
      allStories,
      allSeries,
      storyViewCounts,
      vocabularyLevels,
      publicAuthorProfiles,
      isSignedIn: Boolean(session),
      signIn,
      signUp,
      signOut,
      markRead,
      recordView,
      getReviewCharactersForLevel: (hskLevel) => getReviewCharacters(hskLevel, vocabularyStats),
      getAuthorProfile: (userId) =>
        publicAuthorProfiles.find((profile) => profile.user.id === userId) ?? null,
      generateLesson,
      appendSeriesEpisode,
    };
  }, [
    allStories,
    generatedSeries,
    generatedStories,
    readStoryIds,
    session,
    storyViewCounts,
    usage,
    vocabularyStats,
  ]);

  return <MobileAppContext.Provider value={value}>{children}</MobileAppContext.Provider>;
}

export function useMobileApp() {
  const context = useContext(MobileAppContext);

  if (!context) {
    throw new Error("useMobileApp must be used inside MobileAppProvider");
  }

  return context;
}

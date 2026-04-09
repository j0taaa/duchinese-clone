import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { mobileApi } from "@/lib/api";
import type { BootstrapResponse } from "@/lib/api";
import type {
  AppSeries,
  AppStory,
  GenerationInput,
  PublicAuthorProfile,
  UsageEntry,
  UserSession,
  VocabularyLevelGroup,
} from "@/types/content";

type MobileAppContextValue = {
  session: UserSession | null;
  sessionToken: string | null;
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
  isLoading: boolean;
  bootstrapError: string | null;
  refreshBootstrap: () => Promise<BootstrapResponse | null>;
  signIn: (input: { email: string; password: string }) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  markRead: (storyId: string) => Promise<void>;
  recordView: (storyId: string) => Promise<void>;
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
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [session, setSession] = useState<UserSession | null>(null);
  const [publicStories, setPublicStories] = useState<AppStory[]>([]);
  const [publicSeries, setPublicSeries] = useState<AppSeries[]>([]);
  const [generatedStories, setGeneratedStories] = useState<AppStory[]>([]);
  const [generatedSeries, setGeneratedSeries] = useState<AppSeries[]>([]);
  const [readStoryIds, setReadStoryIds] = useState<string[]>([]);
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [storyViewCounts, setStoryViewCounts] = useState<Map<string, number>>(new Map());
  const [vocabularyLevels, setVocabularyLevels] = useState<VocabularyLevelGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState<string | null>(null);

  async function refreshBootstrap() {
    setBootstrapError(null);
    setIsLoading(true);

    try {
      const data = await mobileApi.fetchBootstrap(sessionToken);
      setSession(data.session?.user ?? null);
      setPublicStories(data.publicStories);
      setPublicSeries(data.publicSeries);
      setGeneratedStories(data.generatedStories);
      setGeneratedSeries(data.generatedSeries);
      setReadStoryIds(data.readStoryIds);
      setUsage(data.usage);
      setVocabularyLevels(data.vocabularyLevels);
      setStoryViewCounts(new Map(Object.entries(data.storyViewCounts)));
      return data;
    } catch (error) {
      setBootstrapError(
        error instanceof Error ? error.message : "Could not load mobile app data.",
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshBootstrap();
  }, [sessionToken]);

  async function signIn(input: { email: string; password: string }) {
    const data = await mobileApi.signIn(input.email, input.password);
    setSessionToken(data.token);
  }

  async function signUp(input: { name: string; email: string; password: string }) {
    const data = await mobileApi.signUp(input.name, input.email, input.password);
    setSessionToken(data.token);
  }

  async function signOut() {
    try {
      await mobileApi.signOut(sessionToken);
    } finally {
      setSessionToken(null);
      setSession(null);
      setGeneratedStories([]);
      setGeneratedSeries([]);
      setReadStoryIds([]);
      setUsage([]);
    }
  }

  const allStories = useMemo(
    () => [...generatedStories, ...publicStories],
    [generatedStories, publicStories],
  );
  const allSeries = useMemo(
    () => [...generatedSeries, ...publicSeries],
    [generatedSeries, publicSeries],
  );
  const publicAuthorProfiles = useMemo(
    () => buildPublicAuthorProfiles(publicStories, publicSeries),
    [publicSeries, publicStories],
  );

  async function markRead(storyId: string) {
    if (readStoryIds.includes(storyId)) {
      return;
    }

    setReadStoryIds((current) => [storyId, ...current]);

    try {
      await mobileApi.markRead(sessionToken, storyId);
    } catch {
      /* keep optimistic state */
    }
  }

  async function recordView(storyId: string) {
    setStoryViewCounts((current) => {
      const next = new Map(current);
      next.set(storyId, (next.get(storyId) ?? 0) + 1);
      return next;
    });

    try {
      await mobileApi.trackView(storyId);
    } catch {
      /* keep optimistic state */
    }
  }

  async function generateLesson(input: GenerationInput) {
    if (!sessionToken) {
      throw new Error("Sign in to generate lessons.");
    }

    const response = await mobileApi.generateLesson(sessionToken, {
      ...input,
      creationMode: input.mode,
      visibility: input.visibility === "public" ? "public_user" : "private_user",
    });

    const bootstrap = await refreshBootstrap();

    if (response.kind === "story") {
      const story = [...(bootstrap?.generatedStories ?? []), ...(bootstrap?.publicStories ?? [])].find(
        (entry) => entry.slug === response.story.slug,
      );
      return {
        kind: "story" as const,
        story:
          story ??
          ({
            id: response.story.id,
            slug: response.story.slug,
            title: response.story.title,
            titleTranslation: response.story.titleTranslation,
          } as AppStory),
      };
    }

    const series =
      [...(bootstrap?.generatedSeries ?? []), ...(bootstrap?.publicSeries ?? [])].find(
        (entry) => entry.slug === response.series.slug,
      ) ??
      ({
        slug: response.series.slug,
        title: response.series.titleTranslation,
        titleTranslation: response.series.titleTranslation,
        summary: "",
        hskLevel: input.hskLevel,
        stories: [],
        isPublic: input.visibility === "public",
        ownerUserId: session?.id ?? null,
        ownerName: session?.name ?? null,
      } as AppSeries);

    return {
      kind: "series" as const,
      series,
      stories: series.stories,
    };
  }

  async function appendSeriesEpisode(seriesSlug: string) {
    if (!sessionToken) {
      throw new Error("Sign in to continue a series.");
    }

    const response = await mobileApi.appendSeriesEpisode(sessionToken, seriesSlug);
    const bootstrap = await refreshBootstrap();

    return (
      [...(bootstrap?.generatedStories ?? []), ...(bootstrap?.publicStories ?? [])].find(
        (story) => story.slug === response.story.slug,
      ) ??
      null
    );
  }

  const value = useMemo<MobileAppContextValue>(
    () => ({
      session,
      sessionToken,
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
      isSignedIn: Boolean(session && sessionToken),
      isLoading,
      bootstrapError,
      refreshBootstrap,
      signIn,
      signUp,
      signOut,
      markRead,
      recordView,
      getAuthorProfile: (userId) =>
        publicAuthorProfiles.find((profile) => profile.user.id === userId) ?? null,
      generateLesson,
      appendSeriesEpisode,
    }),
    [
      allSeries,
      allStories,
      bootstrapError,
      generatedSeries,
      generatedStories,
      isLoading,
      publicAuthorProfiles,
      publicSeries,
      publicStories,
      readStoryIds,
      session,
      sessionToken,
      storyViewCounts,
      usage,
      vocabularyLevels,
    ],
  );

  return <MobileAppContext.Provider value={value}>{children}</MobileAppContext.Provider>;
}

export function useMobileApp() {
  const context = useContext(MobileAppContext);

  if (!context) {
    throw new Error("useMobileApp must be used inside MobileAppProvider");
  }

  return context;
}

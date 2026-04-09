import {
  createContext,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { publicSeries, publicStories } from "@/data/mock-data";
import { simulateGeneration } from "@/lib/mock-generation";
import type {
  AppSeries,
  AppStory,
  GenerationInput,
  UsageEntry,
  UserSession,
} from "@/types/content";

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
  isSignedIn: boolean;
  signIn: (input: UserSession) => void;
  signUp: (input: UserSession) => void;
  signOut: () => void;
  markRead: (storyId: string) => void;
  generateLesson: (
    input: GenerationInput,
  ) => Promise<
    | { kind: "story"; story: AppStory }
    | { kind: "series"; series: AppSeries; stories: AppStory[] }
  >;
};

const MobileAppContext = createContext<MobileAppContextValue | null>(null);

export function MobileAppProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<UserSession | null>(null);
  const [generatedStories, setGeneratedStories] = useState<AppStory[]>([]);
  const [generatedSeries, setGeneratedSeries] = useState<AppSeries[]>([]);
  const [readStoryIds, setReadStoryIds] = useState<string[]>([]);
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const generationSeed = useRef(100);

  function signIn(input: UserSession) {
    setSession(input);
  }

  function signUp(input: UserSession) {
    setSession(input);
  }

  function signOut() {
    setSession(null);
  }

  function markRead(storyId: string) {
    setReadStoryIds((current) => (current.includes(storyId) ? current : [storyId, ...current]));
  }

  async function generateLesson(input: GenerationInput) {
    generationSeed.current += 1;
    const seed = generationSeed.current;
    const result = await simulateGeneration(input, seed);

    if (result.kind === "story") {
      setGeneratedStories((current) => [result.story, ...current]);
      setUsage((current) => [result.usage, ...current]);
      return {
        kind: "story" as const,
        story: result.story,
      };
    }

    setGeneratedSeries((current) => [result.series, ...current]);
    setGeneratedStories((current) => [...result.stories, ...current]);
    setUsage((current) => [result.usage, ...current]);
    return {
      kind: "series" as const,
      series: result.series,
      stories: result.stories,
    };
  }

  const value = useMemo<MobileAppContextValue>(() => {
    const allStories = [...generatedStories, ...publicStories];
    const allSeries = [...generatedSeries, ...publicSeries];

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
      isSignedIn: Boolean(session),
      signIn,
      signUp,
      signOut,
      markRead,
      generateLesson,
    };
  }, [generatedSeries, generatedStories, readStoryIds, session, usage]);

  return <MobileAppContext.Provider value={value}>{children}</MobileAppContext.Provider>;
}

export function useMobileApp() {
  const context = useContext(MobileAppContext);

  if (!context) {
    throw new Error("useMobileApp must be used inside MobileAppProvider");
  }

  return context;
}

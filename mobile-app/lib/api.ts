import type {
  AppSeries,
  AppStory,
  GenerationInput,
  HskLevel,
  UsageEntry,
  UserSession,
  VocabularyEntry,
  VocabularyLevelGroup,
} from "@/types/content";

const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  "",
);

type JsonInit = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string | null;
};

export type BootstrapResponse = {
  session: { user: UserSession } | null;
  publicStories: AppStory[];
  publicSeries: AppSeries[];
  generatedStories: AppStory[];
  generatedSeries: AppSeries[];
  readStoryIds: string[];
  usage: UsageEntry[];
  vocabularyLevels: VocabularyLevelGroup[];
  storyViewCounts: Record<string, number>;
};

type AuthResponse = {
  ok: true;
  token: string;
  user: UserSession;
};

export type InfiniteNextResponse = {
  ok: true;
  mode: "vocab" | "random" | "generated";
  targetHanzi?: string;
  story: AppStory;
};

async function apiRequest<T>(path: string, init?: JsonInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(init?.token ? { Authorization: `Bearer ${init.token}` } : {}),
    },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
  });

  const data = (await response.json().catch(() => ({}))) as { error?: string } & T;

  if (!response.ok) {
    throw new Error(data.error ?? `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const mobileApi = {
  baseURL: API_BASE_URL,
  fetchBootstrap(token: string | null) {
    return apiRequest<BootstrapResponse>("/api/mobile/bootstrap", { token });
  },
  signIn(email: string, password: string) {
    return apiRequest<AuthResponse>("/api/mobile/auth/sign-in", {
      method: "POST",
      body: { email, password },
    });
  },
  signUp(name: string, email: string, password: string) {
    return apiRequest<AuthResponse>("/api/mobile/auth/sign-up", {
      method: "POST",
      body: { name, email, password },
    });
  },
  signOut(token: string | null) {
    return apiRequest<{ ok: true }>("/api/mobile/auth/sign-out", {
      method: "POST",
      token,
    });
  },
  generateLesson(
    token: string,
    input: Omit<GenerationInput, "mode" | "visibility"> & {
      creationMode: "story" | "series";
      visibility: "private_user" | "public_user";
    },
  ) {
    return apiRequest<
      | {
          ok: true;
          kind: "story";
          story: { id: string; slug: string; title: string; titleTranslation: string };
        }
      | {
          ok: true;
          kind: "series";
          series: { slug: string; titleTranslation: string };
          firstStory: { slug: string; titleTranslation: string };
        }
    >("/api/mobile/stories/generate", {
      method: "POST",
      token,
      body: input,
    });
  },
  appendSeriesEpisode(token: string, seriesSlug: string) {
    return apiRequest<{
      ok: true;
      story: { id: string; slug: string; titleTranslation: string; episode: number };
    }>(`/api/mobile/series/${encodeURIComponent(seriesSlug)}/append-episode`, {
      method: "POST",
      token,
    });
  },
  markRead(token: string | null, storyId: string) {
    return apiRequest<{ ok: true; skipped?: boolean }>("/api/mobile/stories/read", {
      method: "POST",
      token,
      body: { storyId },
    });
  },
  trackView(storyId: string) {
    return apiRequest<{ ok: true }>("/api/mobile/views/story", {
      method: "POST",
      body: { storyId },
    });
  },
  fetchReviewCharacters(token: string, hskLevel: string) {
    return apiRequest<{
      characters: Array<
        Omit<VocabularyEntry, "hskLevel"> & {
          hskLevel: HskLevel;
        }
      >;
    }>(`/api/mobile/stories/review-characters?hskLevel=${encodeURIComponent(hskLevel)}`, {
      token,
    });
  },
  fetchInfiniteNext(token: string | null, hskLevel: string) {
    return apiRequest<InfiniteNextResponse>("/api/mobile/infinite/next", {
      method: "POST",
      token,
      body: { hskLevel },
    });
  },
};

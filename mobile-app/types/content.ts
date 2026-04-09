import {
  hskLevelValues,
  storyTypeValues,
  type HskLevel,
  type SharedStorySection,
  type StoryType,
} from "../../shared/content-types";

export const hskLevels = hskLevelValues;
export const storyTypes = storyTypeValues;
export const lessonLengths = ["short", "medium", "long"] as const;
export const visibilities = ["private", "public"] as const;

export type LessonLength = (typeof lessonLengths)[number];
export type LessonVisibility = (typeof visibilities)[number];
export type { HskLevel, StoryType };

export type StorySection = SharedStorySection;

export type AppStory = {
  id: string;
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  excerpt: string;
  hskLevel: HskLevel;
  type: StoryType;
  sections: StorySection[];
  createdAt: string;
  updatedAt: string;
  authorName: string | null;
  authorUserId: string | null;
  authorImage: string | null;
  isSeeded: boolean;
  isPublic: boolean;
  seriesGroupSlug: string | null;
  seriesEpisode: number | null;
};

export type AppSeries = {
  slug: string;
  title: string;
  titleTranslation: string;
  summary: string;
  hskLevel: HskLevel;
  stories: AppStory[];
  isPublic: boolean;
  ownerUserId: string | null;
  ownerName: string | null;
};

export type UserSession = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export type UsageEntry = {
  id: string;
  createdAt: string;
  title: string;
  totalTokens: number;
  promptTokens: number;
  completionTokens: number;
  costCredits: string;
};

export type GenerationInput = {
  topic: string;
  hskLevel: HskLevel;
  type: StoryType;
  length: LessonLength;
  visibility: LessonVisibility;
  mode: "story" | "series";
  useVocabularyTargets?: boolean;
  reviewCharacters?: string[];
};

export type VocabularyEntry = {
  hanzi: string;
  pinyin: string | null;
  definition: string | null;
  hskLevel: HskLevel;
  readCount: number;
  lastReadAt: string | null;
};

export type VocabularyLevelGroup = {
  key: string;
  title: string;
  hskLevel: HskLevel;
  characters: VocabularyEntry[];
};

export type PublicAuthorProfile = {
  user: {
    id: string;
    name: string;
    image: string | null;
  };
  stories: AppStory[];
  series: AppSeries[];
};

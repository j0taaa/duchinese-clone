export const storyTypeValues = ["story", "dialogue", "journal"] as const;
export const storyLevelValues = ["beginner", "elementary", "intermediate"] as const;
export const hskLevelValues = ["1", "2", "3", "4", "5", "6"] as const;

export type StoryType = (typeof storyTypeValues)[number];
export type StoryLevel = (typeof storyLevelValues)[number];
export type HskLevel = (typeof hskLevelValues)[number];

export type SharedStorySection = {
  hanzi: string;
  pinyin: string;
  english: string;
};

import Hanzi from "hanzi";

import hskWords from "@/data/hsk/words.json";
import type { AppStory, StoryLevel } from "@/lib/stories";

type HskWordRecord = {
  level: number;
  simplified: string;
  pronunciation: string;
  definitions: string;
};

let started = false;
let wordsBySimplified: Map<string, number> | null = null;

function ensureStarted() {
  if (!started) {
    Hanzi.start();
    started = true;
  }
}

function getWordsBySimplified() {
  if (!wordsBySimplified) {
    wordsBySimplified = new Map(
      (hskWords as HskWordRecord[]).map((entry) => [entry.simplified, entry.level]),
    );
  }

  return wordsBySimplified;
}

function getFallbackLevel(level: StoryLevel) {
  if (level === "intermediate") return 3;
  if (level === "elementary") return 2;
  return 1;
}

export function estimateHskLevelFromText(text: string) {
  ensureStarted();

  const words = getWordsBySimplified();
  let maxLevel = 0;

  for (const token of Hanzi.segment(text)) {
    const level = words.get(token);

    if (level && level > maxLevel) {
      maxLevel = level;
    }
  }

  return maxLevel || null;
}

export function getStoryHskLevel(story: Pick<AppStory, "hanziText" | "level">) {
  return estimateHskLevelFromText(story.hanziText) ?? getFallbackLevel(story.level);
}

export function getStoryHskLabel(story: Pick<AppStory, "hanziText" | "level">) {
  return `HSK${getStoryHskLevel(story)}`;
}

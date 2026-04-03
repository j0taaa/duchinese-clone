import Hanzi from "hanzi";

import hskWords from "@/data/hsk/words.json";
import type { AppStory, HskLevel } from "@/lib/stories";

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

export function getStoryHskLevel(story: Pick<AppStory, "hanziText" | "hskLevel">) {
  return Number.parseInt(story.hskLevel, 10) || estimateHskLevelFromText(story.hanziText) || 1;
}

export function getStoryHskLabel(story: Pick<AppStory, "hanziText" | "hskLevel">) {
  return `HSK${getStoryHskLevel(story)}`;
}

export function getHighestHskLevel(levels: HskLevel[]) {
  return levels.reduce<HskLevel>(
    (highest, current) =>
      Number.parseInt(current, 10) > Number.parseInt(highest, 10) ? current : highest,
    "1",
  );
}

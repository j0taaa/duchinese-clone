export type LessonLength = "short" | "medium" | "long";

/** Minimum total CJK characters across all section `hanzi` fields (standalone lesson). */
export const STANDALONE_LESSON_MIN_HANZI: Record<LessonLength, number> = {
  short: 100,
  medium: 400,
  long: 720,
};

/** Minimum CJK characters per episode when generating a series (each episode must meet this). */
export const SERIES_EPISODE_MIN_HANZI: Record<LessonLength, number> = {
  short: 80,
  medium: 320,
  long: 580,
};

/** Count CJK unified / extension A in all section hanzi (punctuation & Latin excluded). */
export function countCjkHanziInSections(sections: { hanzi: string }[]): number {
  const combined = sections.map((s) => s.hanzi).join("");
  const matches = combined.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g);
  return matches ? matches.length : 0;
}

export function getStandaloneLengthBriefWithMinimum(length: LessonLength): string {
  const min = STANDALONE_LESSON_MIN_HANZI[length];
  if (length === "long") {
    return `9 to 12 sections of graded text, aiming for roughly 650–950 Chinese characters total. Minimum ${min} CJK characters (汉字) across all section "hanzi" fields combined — count only Chinese characters, not punctuation or spaces. You must meet or exceed this minimum; add sections and detail until you do.`;
  }
  if (length === "medium") {
    return `6 to 8 sections of graded text, aiming for roughly 360–520 Chinese characters total. Minimum ${min} CJK characters (汉字) across all section "hanzi" fields combined — count only Chinese characters, not punctuation or spaces. You must meet or exceed this minimum; add sections and detail until you do.`;
  }
  return `3 to 4 short sections, about 100–180 Chinese characters total. Minimum ${min} CJK characters (汉字) across all section "hanzi" fields combined — count only Chinese characters, not punctuation or spaces. You must meet or exceed this minimum.`;
}

export function getSeriesEpisodeLengthBriefWithMinimum(length: LessonLength): string {
  const min = SERIES_EPISODE_MIN_HANZI[length];
  if (length === "long") {
    return `7 to 9 sections per episode, aiming for roughly 520–780 Chinese characters per episode. EACH episode must reach at least ${min} CJK characters (汉字) in its section "hanzi" fields combined (Chinese only, no punctuation). Every episode must meet this minimum; add sections and detail per episode until each does.`;
  }
  if (length === "medium") {
    return `5 to 7 sections per episode, aiming for roughly 300–450 Chinese characters per episode. EACH episode must reach at least ${min} CJK characters (汉字) in its section "hanzi" fields combined (Chinese only, no punctuation). Every episode must meet this minimum; add sections and detail per episode until each does.`;
  }
  return `2 to 3 short sections per episode, about 80–140 Chinese characters per episode. EACH episode must reach at least ${min} CJK characters (汉字) in its section "hanzi" fields combined (Chinese only, no punctuation). Every episode must meet this minimum.`;
}

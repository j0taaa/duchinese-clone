import { readFileSync } from "node:fs";
import path from "node:path";

import { lookupWord } from "@/lib/dictionary";

export type VocabularyLevelGroup = {
  key: string;
  title: string;
  characters: Array<{
    hanzi: string;
    pinyin: string | null;
    definition: string | null;
    readCount: number;
    lastReadAt: Date | string | null;
  }>;
};

const hskFiles = [
  { key: "hsk1", title: "HSK 1" },
  { key: "hsk2", title: "HSK 2" },
  { key: "hsk3", title: "HSK 3" },
  { key: "hsk4", title: "HSK 4" },
  { key: "hsk5", title: "HSK 5" },
  { key: "hsk6", title: "HSK 6" },
] as const;

let cachedVocabulary: VocabularyLevelGroup[] | null = null;
let cachedVocabularyCharacters: Set<string> | null = null;

export function getVocabularyLevelGroups() {
  if (cachedVocabulary) {
    return cachedVocabulary;
  }

  cachedVocabulary = hskFiles.map((level) => {
    const text = readFileSync(
      path.join(process.cwd(), "data", "hsk", `${level.key}.txt`),
      "utf8",
    ).trim();

    const characters = Array.from(new Set(Array.from(text))).map((hanzi) => {
      const result = lookupWord(hanzi);

      return {
        hanzi,
        pinyin: result.pinyin,
        definition: result.definition,
        readCount: 0,
        lastReadAt: null,
      };
    });

    return {
      key: level.key,
      title: level.title,
      characters,
    };
  });

  return cachedVocabulary;
}

export function getTrackedVocabularyCharacters() {
  if (cachedVocabularyCharacters) {
    return cachedVocabularyCharacters;
  }

  const characters = new Set(
    getVocabularyLevelGroups().flatMap((level) =>
      level.characters.map((entry) => entry.hanzi),
    ),
  );

  cachedVocabularyCharacters = characters;
  return characters;
}

export function countTrackedVocabularyOccurrences(text: string) {
  const tracked = getTrackedVocabularyCharacters();
  const counts = new Map<string, number>();

  for (const char of Array.from(text)) {
    if (!tracked.has(char)) {
      continue;
    }

    counts.set(char, (counts.get(char) ?? 0) + 1);
  }

  return counts;
}

export function mergeVocabularyReadStats(
  levels: VocabularyLevelGroup[],
  stats: Map<string, { readCount: number; lastReadAt: Date | string | null }>,
) {
  return levels.map((level) => ({
    ...level,
    characters: level.characters.map((entry) => {
      const stat = stats.get(entry.hanzi);

      return {
        ...entry,
        readCount: stat?.readCount ?? 0,
        lastReadAt: stat?.lastReadAt ?? null,
      };
    }),
  }));
}

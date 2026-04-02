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

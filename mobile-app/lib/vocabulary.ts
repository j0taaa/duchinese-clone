import hskWords from "../../data/hsk/words.json";

import type {
  HskLevel,
  VocabularyEntry,
  VocabularyLevelGroup,
} from "@/types/content";

type HskWordRecord = {
  level: number;
  simplified: string;
  pronunciation: string;
  definitions: string;
};

const levelConfig: Array<{ key: string; title: string; hskLevel: HskLevel }> = [
  { key: "hsk1", title: "HSK 1", hskLevel: "1" },
  { key: "hsk2", title: "HSK 2", hskLevel: "2" },
  { key: "hsk3", title: "HSK 3", hskLevel: "3" },
  { key: "hsk4", title: "HSK 4", hskLevel: "4" },
  { key: "hsk5", title: "HSK 5", hskLevel: "5" },
  { key: "hsk6", title: "HSK 6", hskLevel: "6" },
];

let cachedVocabulary: VocabularyLevelGroup[] | null = null;
let cachedDictionary = new Map<string, { pinyin: string | null; definition: string | null }>();

function compactDefinition(definition: string) {
  return definition
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 3)
    .join("; ");
}

function isChineseCharacter(char: string) {
  return /[\u3400-\u9fff]/u.test(char);
}

export function getVocabularyLevelGroups() {
  if (cachedVocabulary) {
    return cachedVocabulary;
  }

  const grouped = new Map<HskLevel, Map<string, VocabularyEntry>>();

  for (const level of levelConfig) {
    grouped.set(level.hskLevel, new Map());
  }

  for (const entry of hskWords as HskWordRecord[]) {
    const level = String(entry.level) as HskLevel;
    const bucket = grouped.get(level);

    if (!bucket) {
      continue;
    }

    const chars = Array.from(entry.simplified).filter(isChineseCharacter);

    for (const hanzi of chars) {
      if (!bucket.has(hanzi)) {
        bucket.set(hanzi, {
          hanzi,
          pinyin: entry.pronunciation ?? null,
          definition: compactDefinition(entry.definitions),
          hskLevel: level,
          readCount: 0,
          lastReadAt: null,
        });
      }

      if (!cachedDictionary.has(hanzi)) {
        cachedDictionary.set(hanzi, {
          pinyin: entry.pronunciation ?? null,
          definition: compactDefinition(entry.definitions),
        });
      }
    }
  }

  cachedVocabulary = levelConfig.map((level) => ({
    key: level.key,
    title: level.title,
    hskLevel: level.hskLevel,
    characters: Array.from(grouped.get(level.hskLevel)?.values() ?? []).sort((left, right) =>
      left.hanzi.localeCompare(right.hanzi, "zh-Hans-CN"),
    ),
  }));

  return cachedVocabulary;
}

export function mergeVocabularyReadStats(
  levels: VocabularyLevelGroup[],
  stats: Map<string, { readCount: number; lastReadAt: string | null }>,
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

export function getReviewCharacters(
  maxHskLevel: HskLevel,
  stats: Map<string, { readCount: number; lastReadAt: string | null }>,
) {
  const maxLevel = Number(maxHskLevel);

  return getVocabularyLevelGroups()
    .flatMap((level) => (Number(level.hskLevel) <= maxLevel ? level.characters : []))
    .map((entry) => ({
      ...entry,
      readCount: stats.get(entry.hanzi)?.readCount ?? 0,
      lastReadAt: stats.get(entry.hanzi)?.lastReadAt ?? null,
    }))
    .sort((left, right) => {
      if (left.lastReadAt === null && right.lastReadAt !== null) {
        return -1;
      }
      if (left.lastReadAt !== null && right.lastReadAt === null) {
        return 1;
      }
      if (left.lastReadAt && right.lastReadAt) {
        const delta =
          new Date(left.lastReadAt).getTime() - new Date(right.lastReadAt).getTime();
        if (delta !== 0) {
          return delta;
        }
      }
      if (left.readCount !== right.readCount) {
        return left.readCount - right.readCount;
      }
      return left.hanzi.localeCompare(right.hanzi, "zh-Hans-CN");
    })
    .slice(0, 6);
}

export function lookupCharacter(char: string) {
  return cachedDictionary.get(char) ?? null;
}

export function extractTrackedCharacters(text: string) {
  const tracked = new Set(
    getVocabularyLevelGroups().flatMap((level) => level.characters.map((entry) => entry.hanzi)),
  );

  return Array.from(new Set(Array.from(text).filter((char) => tracked.has(char))));
}

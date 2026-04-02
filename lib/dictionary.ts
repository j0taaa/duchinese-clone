import Hanzi, { type DefinitionEntry } from "hanzi";

import type { AppStory } from "@/lib/stories";

export type DictionaryToken = {
  text: string;
  pinyin: string | null;
  definition: string | null;
  interactive: boolean;
};

export type TokenizedStorySection = AppStory["sections"][number] & {
  tokens: DictionaryToken[];
};

export type ReaderStory = AppStory & {
  tokenizedSections: TokenizedStorySection[];
};

let started = false;

function ensureDictionary() {
  if (!started) {
    Hanzi.start();
    started = true;
  }
}

function hasChinese(text: string) {
  return /[\u3400-\u9fff]/u.test(text);
}

function compactDefinition(definition: string | null) {
  if (!definition) return null;
  return definition
    .split("/")
    .filter(Boolean)
    .slice(0, 3)
    .join(" / ");
}

function countChineseCharacters(text: string) {
  return Array.from(text).filter((char) => hasChinese(char)).length;
}

function normalizePinyinForMatch(pinyin: string | null) {
  if (!pinyin) return "";

  return numberedPinyinToMarked(pinyin)
    ?.normalize("NFC")
    .replace(/u:/gi, "ü")
    .replace(/v/gi, (char) => (char === "V" ? "Ü" : "ü"))
    .replace(/[^A-Za-z\u00fc\u00dc\u0101\u00e1\u01ce\u00e0\u0113\u00e9\u011b\u00e8\u012b\u00ed\u01d0\u00ec\u014d\u00f3\u01d2\u00f2\u016b\u00fa\u01d4\u00f9\u01d6\u01d8\u01da\u01dc\u01d5\u01d7\u01d9\u01db]+/g, " ")
    .trim()
    .toLowerCase() ?? "";
}

function normalizePinyinWithoutTone(pinyin: string | null) {
  return normalizePinyinForMatch(pinyin)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ü/gi, "u")
    .replace(/[^a-zA-Z]+/g, " ");
}

function scoreEntry(entry: DefinitionEntry) {
  const definition = entry.definition.toLowerCase();
  let score = 0;

  if (definition.includes("surname")) score -= 40;
  if (definition.includes("japanese")) score -= 20;
  if (definition.includes("variant of")) score -= 12;
  if (definition.includes("used in names")) score -= 12;
  if (definition.includes("place name")) score -= 10;
  if (definition.includes("old variant")) score -= 10;
  if (definition.includes("particle")) score += 8;
  if (definition.includes("classifier")) score += 6;
  if (definition.includes("and /")) score += 10;
  if (definition.includes("with /")) score += 8;
  if (definition.includes("to go")) score += 4;
  if (definition.includes("good /")) score += 4;

  return score;
}

function rankEntries(entries: DefinitionEntry[]) {
  return [...entries].sort((left, right) => {
    const scoreDelta = scoreEntry(right) - scoreEntry(left);

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return left.definition.length - right.definition.length;
  });
}

function extractPinyinUnits(pinyin: string) {
  return pinyin.match(/[A-Za-züÜ:]+/g) ?? [];
}

function pickBestEntry(
  entries: DefinitionEntry[] | undefined,
  expectedPinyin: string | null,
) {
  if (!entries?.length) {
    return undefined;
  }

  if (!expectedPinyin) {
    return rankEntries(entries)[0];
  }

  const normalizedExpected = normalizePinyinForMatch(expectedPinyin);
  const normalizedExpectedWithoutTone = normalizePinyinWithoutTone(expectedPinyin);

  const toneAwareMatches = entries.filter(
    (entry) => normalizePinyinForMatch(entry.pinyin) === normalizedExpected,
  );

  if (toneAwareMatches.length) {
    return rankEntries(toneAwareMatches)[0];
  }

  const toneAwarePrefixMatches = entries.filter((entry) =>
    normalizePinyinForMatch(entry.pinyin).startsWith(normalizedExpected),
  );

  if (toneAwarePrefixMatches.length) {
    return rankEntries(toneAwarePrefixMatches)[0];
  }

  const toneLessMatches = entries.filter(
    (entry) =>
      normalizePinyinWithoutTone(entry.pinyin) === normalizedExpectedWithoutTone,
  );

  if (toneLessMatches.length) {
    return rankEntries(toneLessMatches)[0];
  }

  const toneLessPrefixMatches = entries.filter((entry) =>
    normalizePinyinWithoutTone(entry.pinyin).startsWith(
      normalizedExpectedWithoutTone,
    ),
  );

  return rankEntries(toneLessPrefixMatches.length ? toneLessPrefixMatches : entries)[0];
}

function numberedSyllableToMarked(syllable: string) {
  const match = syllable.match(/^([A-Za-züÜvV:]+)([1-5])$/);

  if (!match) {
    return syllable;
  }

  const [, rawBase, toneNumber] = match;
  let base = rawBase;

  if (toneNumber === "5") {
    return base
      .replace(/u:/gi, "ü")
      .replace(/v/gi, (char) => (char === "V" ? "Ü" : "ü"));
  }

  base = base
    .replace(/u:/gi, "ü")
    .replace(/v/gi, (char) => (char === "V" ? "Ü" : "ü"));

  const lower = base.toLowerCase();
  let targetIndex = -1;

  if (lower.includes("a")) {
    targetIndex = lower.indexOf("a");
  } else if (lower.includes("e")) {
    targetIndex = lower.indexOf("e");
  } else if (lower.includes("ou")) {
    targetIndex = lower.indexOf("o");
  } else {
    for (let i = base.length - 1; i >= 0; i -= 1) {
      if ("aeiouüAEIOUÜ".includes(base[i])) {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) {
    return base;
  }

  const toneMap: Record<string, string[]> = {
    a: ["a", "ā", "á", "ǎ", "à"],
    e: ["e", "ē", "é", "ě", "è"],
    i: ["i", "ī", "í", "ǐ", "ì"],
    o: ["o", "ō", "ó", "ǒ", "ò"],
    u: ["u", "ū", "ú", "ǔ", "ù"],
    ü: ["ü", "ǖ", "ǘ", "ǚ", "ǜ"],
    A: ["A", "Ā", "Á", "Ǎ", "À"],
    E: ["E", "Ē", "É", "Ě", "È"],
    I: ["I", "Ī", "Í", "Ǐ", "Ì"],
    O: ["O", "Ō", "Ó", "Ǒ", "Ò"],
    U: ["U", "Ū", "Ú", "Ǔ", "Ù"],
    Ü: ["Ü", "Ǖ", "Ǘ", "Ǚ", "Ǜ"],
  };

  const vowel = base[targetIndex];
  const replacement = toneMap[vowel]?.[Number(toneNumber)] ?? vowel;

  return `${base.slice(0, targetIndex)}${replacement}${base.slice(targetIndex + 1)}`;
}

function numberedPinyinToMarked(pinyin: string | null) {
  if (!pinyin) return null;
  return pinyin
    .trim()
    .split(/\s+/)
    .map((syllable) => numberedSyllableToMarked(syllable))
    .join(" ");
}

export function lookupWord(word: string): DictionaryToken {
  return lookupWordWithPinyin(word, null);
}

export function lookupWordWithPinyin(
  word: string,
  expectedPinyin: string | null,
): DictionaryToken {
  ensureDictionary();

  if (!hasChinese(word)) {
    return {
      text: word,
      pinyin: null,
      definition: null,
      interactive: false,
    };
  }

  const entry = pickBestEntry(Hanzi.definitionLookup(word), expectedPinyin);

  if (!entry) {
    return {
      text: word,
      pinyin: null,
      definition: null,
      interactive: false,
    };
  }

  return {
    text: word,
    pinyin: numberedPinyinToMarked(entry.pinyin),
    definition: compactDefinition(entry.definition),
    interactive: true,
  };
}

export function tokenizeChineseText(text: string) {
  ensureDictionary();
  return Hanzi.segment(text).map((token) => lookupWord(token));
}

export function tokenizeChineseTextWithPinyin(text: string, pinyinText: string) {
  ensureDictionary();

  const pinyinUnits = extractPinyinUnits(pinyinText);
  let pinyinIndex = 0;

  return Hanzi.segment(text).map((token) => {
    const syllableCount = countChineseCharacters(token);

    if (!syllableCount) {
      return lookupWordWithPinyin(token, null);
    }

    const expectedPinyin = pinyinUnits
      .slice(pinyinIndex, pinyinIndex + syllableCount)
      .join(" ");

    pinyinIndex += syllableCount;

    return lookupWordWithPinyin(token, expectedPinyin || null);
  });
}

export function buildReaderStory(story: AppStory): ReaderStory {
  return {
    ...story,
    tokenizedSections: story.sections.map((section) => ({
      ...section,
      tokens: tokenizeChineseTextWithPinyin(section.hanzi, section.pinyin),
    })),
  };
}

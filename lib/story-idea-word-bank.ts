import { readFileSync } from "node:fs";
import path from "node:path";

let cachedWords: string[] | null = null;

function loadWords(): string[] {
  if (cachedWords) {
    return cachedWords;
  }

  const filePath = path.join(process.cwd(), "data", "story-idea-words.txt");
  const text = readFileSync(filePath, "utf8");
  cachedWords = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));

  return cachedWords;
}

function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

/** Distinct English seed words/phrases for topic-idea generation. */
export function pickIdeaSeedWords(count: number): string[] {
  const words = loadWords();
  if (words.length === 0) {
    return [];
  }
  if (words.length <= count) {
    return shuffleInPlace([...words]);
  }
  const copy = [...words];
  shuffleInPlace(copy);
  return copy.slice(0, count);
}

import { type AppStory } from "@/lib/stories";

const keywordEmojiRules: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ["coffee", "cafe", "espresso"], emoji: "☕" },
  { keywords: ["market", "breakfast", "vegetable", "fruit", "food"], emoji: "🥬" },
  { keywords: ["rain", "rainy", "storm", "umbrella"], emoji: "🌧️" },
  { keywords: ["subway", "station", "metro", "train"], emoji: "🚇" },
  { keywords: ["park", "picnic", "lunch", "grass"], emoji: "🌿" },
  { keywords: ["book", "bookshelf", "bookstore", "library", "read"], emoji: "📚" },
  { keywords: ["walk", "river", "street", "city"], emoji: "🚶" },
  { keywords: ["tea", "teahouse"], emoji: "🍵" },
  { keywords: ["home", "room", "apartment"], emoji: "🏠" },
  { keywords: ["weekend", "holiday", "trip"], emoji: "🗓️" },
  { keywords: ["journal", "diary", "note"], emoji: "📝" },
  { keywords: ["dialogue", "conversation", "talk"], emoji: "💬" },
];

const fallbackEmojis = ["✨", "🌤️", "🪴", "🎒", "🧭", "🌆", "📖", "🍊", "🚲", "🎐"];

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
}

function pickMatchedEmojis(text: string) {
  const lowerText = text.toLowerCase();

  return keywordEmojiRules
    .filter((rule) => rule.keywords.some((keyword) => lowerText.includes(keyword)))
    .map((rule) => rule.emoji);
}

export function getStoryEmojiTitle(story: Pick<AppStory, "id" | "slug" | "titleTranslation" | "summary" | "type">) {
  const text = `${story.titleTranslation} ${story.summary} ${story.type}`;
  const seed = `${story.id}-${story.slug}-${story.type}`;
  const matched = Array.from(new Set(pickMatchedEmojis(text)));
  const wantedCount = 3 + (hashString(seed) % 2);
  const chosen = [...matched];
  let offset = hashString(`${seed}-emoji-offset`) % fallbackEmojis.length;

  while (chosen.length < wantedCount) {
    const fallbackEmoji = fallbackEmojis[offset % fallbackEmojis.length] ?? "✨";
    if (!chosen.includes(fallbackEmoji)) {
      chosen.push(fallbackEmoji);
    }
    offset += 1;
  }

  return chosen.slice(0, wantedCount).join("");
}

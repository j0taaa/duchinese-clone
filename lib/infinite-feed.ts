import "server-only";

import { generateStoryWithModel } from "@/lib/ai";
import { buildStoryTopicViaWordBankAndLlm } from "@/lib/story-topic-pipeline";
import { findStoryIdsByIndexedTerm } from "@/lib/story-hanzi-index";
import { lookupWord } from "@/lib/dictionary";
import { partitionStoriesIntoSeriesAndStandalone } from "@/lib/series";
import { type HskLevel, mapHskLevelToStoryLevel, type AppStory } from "@/lib/stories";
import { slugify } from "@/shared/content-utils";
import {
  createGeneratedStory,
  listPublicStories,
  listReadStoryIdsForUser,
  rankVocabularyByStaleness,
  getVocabularyReadStatsForUser,
} from "@/lib/story-service";
import { getVocabularyCharactersUpToLevel } from "@/lib/vocabulary";

const STALE_POOL_SIZE = 40;
const MAX_TERM_STORY_IDS = 500;
const VOCAB_MATCH_ATTEMPTS = 8;

function shuffleInPlace<T>(items: T[]) {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

function pickRandom<T>(items: T[]): T | null {
  if (!items.length) {
    return null;
  }
  return items[Math.floor(Math.random() * items.length)]!;
}

export type InfiniteFeedMode = "vocab" | "random" | "generated";

export type InfiniteFeedNextResult =
  | {
      ok: true;
      mode: InfiniteFeedMode;
      story: AppStory;
      targetHanzi?: string;
    }
  | {
      ok: false;
      error: string;
      code: "NO_STORIES" | "GENERATION_FAILED" | "INVALID_HSK";
    };

async function pickUnreadStandaloneAtHsk(input: {
  standaloneHsk: AppStory[];
  readSet: Set<string>;
}): Promise<AppStory | null> {
  const unread = input.standaloneHsk.filter((s) => !input.readSet.has(s.id));
  return pickRandom(unread);
}

async function tryVocabMatchedStory(input: {
  userId: string;
  hskLevel: HskLevel;
  standaloneById: Map<string, AppStory>;
  standaloneIds: Set<string>;
  readSet: Set<string>;
}): Promise<{ story: AppStory; targetHanzi: string } | null> {
  const stats = await getVocabularyReadStatsForUser(input.userId);
  const ranked = rankVocabularyByStaleness(
    getVocabularyCharactersUpToLevel(input.hskLevel),
    stats,
  );
  const pool = ranked.slice(0, Math.min(STALE_POOL_SIZE, ranked.length));
  if (!pool.length) {
    return null;
  }

  const order = shuffleInPlace([...pool]);
  const tryCount = Math.min(VOCAB_MATCH_ATTEMPTS, order.length);

  for (let i = 0; i < tryCount; i += 1) {
    const entry = order[i]!;
    let ids = await findStoryIdsByIndexedTerm(entry.hanzi);
    if (ids.length > MAX_TERM_STORY_IDS) {
      shuffleInPlace(ids);
      ids = ids.slice(0, MAX_TERM_STORY_IDS);
    }

    const eligible = ids.filter(
      (id) => input.standaloneIds.has(id) && !input.readSet.has(id),
    );
    const chosenId = pickRandom(eligible);
    if (!chosenId) {
      continue;
    }

    const story = input.standaloneById.get(chosenId);
    if (story) {
      return { story, targetHanzi: entry.hanzi };
    }
  }

  return null;
}

async function generateFallbackStory(input: {
  userId: string;
  hskLevel: HskLevel;
}): Promise<AppStory> {
  const stats = await getVocabularyReadStatsForUser(input.userId);
  const ranked = rankVocabularyByStaleness(
    getVocabularyCharactersUpToLevel(input.hskLevel),
    stats,
  );
  const pool = ranked.slice(0, Math.min(STALE_POOL_SIZE, ranked.length));
  shuffleInPlace(pool);
  let three = pool.slice(0, 3);
  if (three.length < 3) {
    const extra = ranked.slice(pool.length, pool.length + 20);
    for (const e of extra) {
      if (three.length >= 3) break;
      if (!three.some((t) => t.hanzi === e.hanzi)) {
        three = [...three, e];
      }
    }
  }
  if (three.length < 3) {
    throw new Error("Not enough vocabulary entries to build focus characters.");
  }

  const focusCharacters = three.slice(0, 3).map((entry) => {
    const looked = lookupWord(entry.hanzi);
    return {
      hanzi: entry.hanzi,
      pinyin: looked.pinyin,
      definition: looked.definition,
    };
  });

  const { topic } = await buildStoryTopicViaWordBankAndLlm({
    userId: input.userId,
    hskLevel: input.hskLevel,
  });
  const { story: generated, model, usage } = await generateStoryWithModel({
    topic,
    hskLevel: input.hskLevel,
    type: "story",
    length: "short",
    focusCharacters,
  });

  const baseSlug =
    slugify(generated.titleTranslation) ||
    slugify(generated.title) ||
    `story-${Date.now()}`;

  return createGeneratedStory({
    userId: input.userId,
    slug: `${baseSlug}-${Date.now().toString().slice(-5)}`,
    title: generated.title,
    titleTranslation: generated.titleTranslation,
    summary: generated.summary,
    excerpt: generated.excerpt,
    hanziText: generated.hanziText,
    pinyinText: generated.pinyinText,
    englishTranslation: generated.englishTranslation,
    sections: generated.sections,
    type: "story",
    hskLevel: input.hskLevel,
    level: mapHskLevelToStoryLevel(input.hskLevel),
    visibility: "public_user",
    lessonLength: "short",
    aiUsage: {
      model,
      promptTokens: usage.promptTokens,
      completionTokens: usage.completionTokens,
      totalTokens: usage.totalTokens,
      costCredits: usage.costCredits,
      providerRequestId: usage.providerRequestId,
    },
  });
}

export async function resolveNextInfiniteStory(input: {
  userId: string | null;
  hskLevel: HskLevel;
}): Promise<InfiniteFeedNextResult> {
  const publicStories = await listPublicStories();
  const { standalone } = partitionStoriesIntoSeriesAndStandalone(publicStories);
  const standaloneHsk = standalone.filter((s) => s.hskLevel === input.hskLevel);
  const standaloneById = new Map(standaloneHsk.map((s) => [s.id, s]));
  const standaloneIds = new Set(standaloneById.keys());

  const readSet = new Set(
    input.userId ? await listReadStoryIdsForUser(input.userId) : [],
  );

  if (!input.userId) {
    const story = await pickUnreadStandaloneAtHsk({ standaloneHsk, readSet });
    if (!story) {
      return {
        ok: false,
        error: "No standalone public lessons at this level yet.",
        code: "NO_STORIES",
      };
    }
    return { ok: true, mode: "random", story };
  }

  const matched = await tryVocabMatchedStory({
    userId: input.userId,
    hskLevel: input.hskLevel,
    standaloneById,
    standaloneIds,
    readSet,
  });

  if (matched) {
    return {
      ok: true,
      mode: "vocab",
      story: matched.story,
      targetHanzi: matched.targetHanzi,
    };
  }

  try {
    const story = await generateFallbackStory({
      userId: input.userId,
      hskLevel: input.hskLevel,
    });
    return { ok: true, mode: "generated", story };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate a story.";
    if (message.includes("OPENROUTER_API_KEY")) {
      return {
        ok: false,
        error: "AI generation is not configured on this server.",
        code: "GENERATION_FAILED",
      };
    }
    const randomUnread = await pickUnreadStandaloneAtHsk({ standaloneHsk, readSet });
    if (randomUnread) {
      return { ok: true, mode: "random", story: randomUnread };
    }
    return {
      ok: false,
      error: message,
      code: "GENERATION_FAILED",
    };
  }
}

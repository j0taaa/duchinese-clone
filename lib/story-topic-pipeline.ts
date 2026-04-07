import "server-only";

import { type OpenRouterUsageSnapshot, generateStoryIdeaWithModel } from "@/lib/ai";
import { pickIdeaSeedWords } from "@/lib/story-idea-word-bank";
import { type AiUsageForStory, recordStandaloneAiUsage } from "@/lib/story-service";
import type { HskLevel } from "@/lib/stories";

const MAX_IDEA_ROUNDS = 3;

function fallbackTopicFromSeeds(words: string[]): string {
  const slice = words.slice(0, 4);
  if (slice.length === 0) {
    return "An everyday slice-of-life scene with clear, learner-friendly Chinese.";
  }
  return `A short slice-of-life scene; optional background flavor may echo: ${slice.join(", ")}. The plot does not need to center on these words.`;
}

function usageToRow(model: string, usage: OpenRouterUsageSnapshot): AiUsageForStory {
  return {
    model,
    promptTokens: usage.promptTokens,
    completionTokens: usage.completionTokens,
    totalTokens: usage.totalTokens,
    costCredits: usage.costCredits,
    providerRequestId: usage.providerRequestId,
  };
}

/** Two-step topic path: word bank → idea LLM (with resample cap) → English topic string for story generation. */
export async function buildStoryTopicViaWordBankAndLlm(input: {
  userId: string;
  hskLevel: HskLevel;
}): Promise<{ topic: string }> {
  let words = pickIdeaSeedWords(5);

  for (let round = 0; round < MAX_IDEA_ROUNDS; round += 1) {
    const out = await generateStoryIdeaWithModel({
      hskLevel: input.hskLevel,
      seedWords: words,
    });

    await recordStandaloneAiUsage({
      userId: input.userId,
      storyId: null,
      aiUsage: usageToRow(out.model, out.usage),
    });

    if (out.status === "idea") {
      return { topic: out.text };
    }

    words = pickIdeaSeedWords(5);
  }

  return { topic: fallbackTopicFromSeeds(words) };
}

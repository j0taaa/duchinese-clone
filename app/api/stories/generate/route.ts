import { NextResponse } from "next/server";
import { z } from "zod";

import { generateSeriesWithModel, generateStoryWithModel } from "@/lib/ai";
import { getServerSession } from "@/lib/session";
import { buildStoryTopicViaWordBankAndLlm } from "@/lib/story-topic-pipeline";
import {
  createGeneratedSeries,
  createGeneratedStory,
  newSeriesGroupSlug,
  validateSuggestedReviewCharactersForUser,
} from "@/lib/story-service";
import {
  hskLevelValues,
  mapHskLevelToStoryLevel,
  storyTypeValues,
  storyVisibilityValues,
} from "@/lib/stories";

const generateSchema = z.object({
  creationMode: z.enum(["story", "series"]).optional().default("story"),
  topic: z.string().trim().optional().default(""),
  hskLevel: z.enum(hskLevelValues),
  type: z.enum(storyTypeValues),
  length: z.enum(["short", "medium", "long"]),
  useVocabularyTargets: z.boolean().optional().default(false),
  reviewCharacters: z.array(z.string().trim().min(1)).max(4).optional().default([]),
  visibility: z.enum(storyVisibilityValues).refine(
    (value) => value !== "public_seeded",
    "Seed visibility is reserved for starter stories.",
  ),
});

function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = generateSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid story request." },
      { status: 400 },
    );
  }

  try {
    const userTopic = parsed.data.topic.trim();
    const needsGeneratedTopic = userTopic.length === 0;
    const topic = needsGeneratedTopic
      ? (
          await buildStoryTopicViaWordBankAndLlm({
            userId: session.user.id,
            hskLevel: parsed.data.hskLevel,
          })
        ).topic
      : userTopic;
    const storyLevel = mapHskLevelToStoryLevel(parsed.data.hskLevel);
    const focusCharacters =
      (parsed.data.creationMode === "story" || parsed.data.creationMode === "series") &&
      needsGeneratedTopic &&
      parsed.data.useVocabularyTargets
        ? await validateSuggestedReviewCharactersForUser({
            userId: session.user.id,
            hskLevel: parsed.data.hskLevel,
            selectedCharacters: parsed.data.reviewCharacters,
          })
        : [];

    if (parsed.data.creationMode === "series") {
      const {
        seriesTitle,
        seriesTitleTranslation,
        seriesSummary,
        episodes,
        model,
        usage,
      } = await generateSeriesWithModel({
        topic,
        hskLevel: parsed.data.hskLevel,
        type: parsed.data.type,
        length: parsed.data.length,
        focusCharacters,
      });

      const seriesGroupSlug = newSeriesGroupSlug();

      const result = await createGeneratedSeries({
        userId: session.user.id,
        seriesGroupSlug,
        seriesTitle,
        seriesTitleTranslation,
        seriesSummary,
        episodes,
        type: parsed.data.type,
        hskLevel: parsed.data.hskLevel,
        level: storyLevel,
        visibility: parsed.data.visibility,
        lessonLength: parsed.data.length,
        aiUsage: {
          model,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          costCredits: usage.costCredits,
          providerRequestId: usage.providerRequestId,
        },
      });

      return NextResponse.json({
        ok: true,
        kind: "series" as const,
        series: {
          slug: result.seriesSlug,
          titleTranslation: seriesTitleTranslation,
        },
        firstStory: {
          slug: result.firstStory.slug,
          titleTranslation: result.firstStory.titleTranslation,
        },
      });
    }

    const { story: generated, model, usage } = await generateStoryWithModel({
      topic,
      hskLevel: parsed.data.hskLevel,
      type: parsed.data.type,
      length: parsed.data.length,
      focusCharacters,
    });

    const baseSlug =
      slugify(generated.titleTranslation) ||
      slugify(generated.title) ||
      `story-${Date.now()}`;

    const story = await createGeneratedStory({
      userId: session.user.id,
      slug: `${baseSlug}-${Date.now().toString().slice(-5)}`,
      title: generated.title,
      titleTranslation: generated.titleTranslation,
      summary: generated.summary,
      excerpt: generated.excerpt,
      hanziText: generated.hanziText,
      pinyinText: generated.pinyinText,
      englishTranslation: generated.englishTranslation,
      sections: generated.sections,
      type: parsed.data.type,
      hskLevel: parsed.data.hskLevel,
      level: storyLevel,
      visibility: parsed.data.visibility,
      lessonLength: parsed.data.length,
      aiUsage: {
        model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        costCredits: usage.costCredits,
        providerRequestId: usage.providerRequestId,
      },
    });

    return NextResponse.json({
      ok: true,
      kind: "story" as const,
      story: {
        id: story.id,
        slug: story.slug,
        title: story.title,
        titleTranslation: story.titleTranslation,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("OPENROUTER_API_KEY")) {
      return NextResponse.json(
        { error: "AI generation is not configured on this server." },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate a story.",
      },
      { status: 500 },
    );
  }
}

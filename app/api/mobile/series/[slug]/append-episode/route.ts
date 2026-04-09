import { NextResponse } from "next/server";

import { generateSeriesNextEpisodeWithModel } from "@/lib/ai";
import { mobileOptions, withMobileCors } from "@/lib/mobile-api";
import { getRequestSession } from "@/lib/session";
import {
  appendGeneratedSeriesEpisode,
  getAccessibleSeriesBySlug,
} from "@/lib/story-service";
import { mapHskLevelToStoryLevel, type AppStory } from "@/lib/stories";

const PRIOR_CONTEXT_MAX_CHARS = 14_000;

function buildPriorEpisodesContext(stories: AppStory[]) {
  const sorted = [...stories].sort(
    (a, b) => (a.seriesEpisode ?? 0) - (b.seriesEpisode ?? 0),
  );
  const blocks = sorted.map((story) => {
    const number = story.seriesEpisode ?? 0;
    const english = story.englishTranslation ?? "";
    const limited =
      english.length > 2000 ? `${english.slice(0, 2000)}\n[... remainder omitted ...]` : english;
    return `## Episode ${number}: ${story.titleTranslation} (${story.title})\nSummary: ${story.summary}\nEnglish translation:\n${limited}`;
  });
  let combined = blocks.join("\n\n---\n\n");
  if (combined.length > PRIOR_CONTEXT_MAX_CHARS) {
    combined =
      "…Earlier material truncated. Below is the latest episode text for continuity.\n\n" +
      combined.slice(combined.length - PRIOR_CONTEXT_MAX_CHARS);
  }
  return combined;
}

export function OPTIONS(request: Request) {
  return mobileOptions(request);
}

export async function POST(
  request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getRequestSession(request);

  if (!session) {
    return withMobileCors(
      request,
      NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    );
  }

  const { slug } = await context.params;
  const series = await getAccessibleSeriesBySlug(slug, session.user.id);

  if (!series || series.stories.length === 0) {
    return withMobileCors(
      request,
      NextResponse.json({ error: "Series not found." }, { status: 404 }),
    );
  }

  const ownerId = series.stories[0]?.authorUserId;
  if (
    !ownerId ||
    ownerId !== session.user.id ||
    !series.stories.every((story) => story.authorUserId === ownerId) ||
    series.stories.some((story) => story.isSeeded)
  ) {
    return withMobileCors(
      request,
      NextResponse.json(
        { error: "Only the author of this series can add episodes." },
        { status: 403 },
      ),
    );
  }

  const ordered = [...series.stories].sort(
    (a, b) => (a.seriesEpisode ?? 0) - (b.seriesEpisode ?? 0),
  );
  const anchor = ordered[0]!;

  try {
    const nextEpisodeNumber =
      Math.max(...series.stories.map((story) => story.seriesEpisode ?? 0)) + 1;
    const { episode, model, usage } = await generateSeriesNextEpisodeWithModel({
      hskLevel: anchor.hskLevel,
      type: anchor.type,
      length: anchor.lessonLength ?? "medium",
      nextEpisodeNumber,
      seriesTitle: anchor.seriesTitle ?? series.title,
      seriesTitleTranslation: anchor.seriesTitleTranslation ?? series.titleTranslation,
      seriesSummary: anchor.seriesSummary ?? series.summary,
      priorEpisodesContext: buildPriorEpisodesContext(ordered),
    });

    const story = await appendGeneratedSeriesEpisode({
      userId: session.user.id,
      seriesGroupSlug: slug,
      nextEpisodeNumber,
      seriesTitle: anchor.seriesTitle ?? series.title,
      seriesTitleTranslation: anchor.seriesTitleTranslation ?? series.titleTranslation,
      seriesSummary: anchor.seriesSummary ?? series.summary,
      episode,
      type: anchor.type,
      hskLevel: anchor.hskLevel,
      level: mapHskLevelToStoryLevel(anchor.hskLevel),
      visibility: anchor.visibility,
      lessonLength: anchor.lessonLength ?? "medium",
      aiUsage: {
        model,
        promptTokens: usage.promptTokens,
        completionTokens: usage.completionTokens,
        totalTokens: usage.totalTokens,
        costCredits: usage.costCredits,
        providerRequestId: usage.providerRequestId,
      },
    });

    return withMobileCors(
      request,
      NextResponse.json({
        ok: true,
        story: {
          id: story.id,
          slug: story.slug,
          titleTranslation: story.titleTranslation,
          episode: nextEpisodeNumber,
        },
      }),
    );
  } catch (error) {
    return withMobileCors(
      request,
      NextResponse.json(
        {
          error:
            error instanceof Error ? error.message : "Failed to generate episode.",
        },
        {
          status:
            error instanceof Error && error.message.includes("OPENROUTER_API_KEY")
              ? 503
              : 500,
        },
      ),
    );
  }
}

import { NextResponse } from "next/server";

import { generateSeriesNextEpisodeWithModel } from "@/lib/ai";
import { getServerSession } from "@/lib/session";
import {
  appendGeneratedSeriesEpisode,
  getAccessibleSeriesBySlug,
} from "@/lib/story-service";
import { mapHskLevelToStoryLevel, type AppStory } from "@/lib/stories";

const PRIOR_CONTEXT_MAX_CHARS = 14_000;

function buildPriorEpisodesContext(stories: AppStory[]): string {
  const sorted = [...stories].sort(
    (a, b) => (a.seriesEpisode ?? 0) - (b.seriesEpisode ?? 0),
  );
  const blocks = sorted.map((s) => {
    const n = s.seriesEpisode ?? 0;
    const en = s.englishTranslation ?? "";
    const cap = 2000;
    const body =
      en.length > cap ? `${en.slice(0, cap)}\n[... remainder omitted ...]` : en;
    return `## Episode ${n}: ${s.titleTranslation} (${s.title})\nSummary: ${s.summary}\nEnglish translation:\n${body}`;
  });
  let combined = blocks.join("\n\n---\n\n");
  if (combined.length > PRIOR_CONTEXT_MAX_CHARS) {
    combined =
      "…Earlier material truncated. Below is the latest episode text for continuity.\n\n" +
      combined.slice(combined.length - PRIOR_CONTEXT_MAX_CHARS);
  }
  return combined;
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await context.params;
  const series = await getAccessibleSeriesBySlug(slug, session.user.id);

  if (!series || series.stories.length === 0) {
    return NextResponse.json({ error: "Series not found." }, { status: 404 });
  }

  const ownerId = series.stories[0]?.authorUserId;
  if (
    !ownerId ||
    ownerId !== session.user.id ||
    !series.stories.every((s) => s.authorUserId === ownerId) ||
    series.stories.some((s) => s.isSeeded)
  ) {
    return NextResponse.json(
      { error: "Only the author of this series can add episodes." },
      { status: 403 },
    );
  }

  const ordered = [...series.stories].sort(
    (a, b) => (a.seriesEpisode ?? 0) - (b.seriesEpisode ?? 0),
  );
  const anchor = ordered[0]!;

  const maxEp = Math.max(...series.stories.map((s) => s.seriesEpisode ?? 0));
  const nextEpisodeNumber = maxEp + 1;

  const priorContext = buildPriorEpisodesContext(ordered);

  const episodeLength = anchor.lessonLength ?? "medium";

  try {
    const { episode, model, usage } = await generateSeriesNextEpisodeWithModel({
      hskLevel: anchor.hskLevel,
      type: anchor.type,
      length: episodeLength,
      nextEpisodeNumber,
      seriesTitle: anchor.seriesTitle ?? series.title,
      seriesTitleTranslation: anchor.seriesTitleTranslation ?? series.titleTranslation,
      seriesSummary: anchor.seriesSummary ?? series.summary,
      priorEpisodesContext: priorContext,
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
      lessonLength: episodeLength,
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
      story: {
        id: story.id,
        slug: story.slug,
        titleTranslation: story.titleTranslation,
        episode: nextEpisodeNumber,
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
          error instanceof Error ? error.message : "Failed to generate episode.",
      },
      { status: 500 },
    );
  }
}

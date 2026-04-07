"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { ReaderStory } from "@/lib/dictionary";
import { getStoryHskLabel } from "@/lib/hsk";
import { type AppSeries } from "@/lib/series";
import { getHskLabel, hskLevelMeta, type AppStory } from "@/lib/stories";

import { AuthorAttribution } from "@/components/author-attribution";
import { ReaderContent } from "@/components/reader-content";
import {
  RecommendedLessons,
  SeriesEpisodesSidebar,
  StorySidebar,
} from "@/components/story-sidebar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReaderLayoutProps = {
  stories: AppStory[];
  story: ReaderStory;
  series?: AppSeries | null;
  readStoryIds?: string[];
};

export function ReaderLayout({
  stories,
  story,
  series,
  readStoryIds = [],
}: ReaderLayoutProps) {
  const hskMeta = hskLevelMeta[story.hskLevel];
  const hskLabel = getStoryHskLabel(story);
  const currentSeriesIndex = series
    ? series.stories.findIndex((seriesStory) => seriesStory.slug === story.slug)
    : -1;
  const previousSeriesStory =
    series && currentSeriesIndex > 0 ? series.stories[currentSeriesIndex - 1] : null;
  const nextSeriesStory =
    series && currentSeriesIndex >= 0 && currentSeriesIndex < series.stories.length - 1
      ? series.stories[currentSeriesIndex + 1]
      : null;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fbf7f1,_#f3eee7_55%,_#f1ece5_100%)] text-[#202020]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] gap-5 px-4 py-4 sm:gap-8 sm:px-6 sm:py-6 xl:px-10">
        <div className="hidden md:block">
          <StorySidebar
            stories={stories}
            activeSlug={story.slug}
            hideDesktop
          />
        </div>

        {series ? (
          <SeriesEpisodesSidebar
            series={series}
            activeSlug={story.slug}
            readStoryIds={readStoryIds}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col gap-4 pb-20 md:gap-5 md:pb-24">
          <div className="space-y-3 md:hidden">
            <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-[#6e625c]">
              <Link
                href="/"
                prefetch={false}
                className={cn(
                  buttonVariants({
                    variant: "ghost",
                    className:
                      "h-9 rounded-full border border-[#eadcd2] bg-white px-3 text-[#5a4d47] hover:bg-[#faf4ef]",
                  }),
                )}
              >
                <ChevronLeft className="size-4" />
                Library
              </Link>
              <span className={["size-3 rounded-full", hskMeta.dotClass].join(" ")} />
              <span>{getHskLabel(story.hskLevel)}</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-reading text-[1.45rem] text-[#241815] sm:text-2xl">
                {story.title}
              </h1>
              <p className="text-[0.88rem] text-[#5f534d]">{story.titleTranslation}</p>
              {story.authorUserId && story.authorName ? (
                <AuthorAttribution
                  authorUserId={story.authorUserId}
                  authorName={story.authorName}
                />
              ) : null}
            </div>
          </div>

          <div className="hidden rounded-[24px] border border-white/70 bg-white/92 p-4 shadow-[0_18px_60px_-42px_rgba(80,45,24,0.34)] sm:rounded-[28px] sm:p-6 md:block">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-[#6e625c] sm:gap-3 sm:text-sm">
                  <Link
                    href="/"
                    prefetch={false}
                    className={cn(
                      buttonVariants({
                        variant: "ghost",
                        className:
                          "h-9 rounded-full border border-[#eadcd2] bg-white px-3 text-[#5a4d47] hover:bg-[#faf4ef]",
                      }),
                    )}
                  >
                    <ChevronLeft className="size-4" />
                    Library
                  </Link>
                  <span className={["size-3 rounded-full", hskMeta.dotClass].join(" ")} />
                  <span>{getHskLabel(story.hskLevel)}</span>
                </div>

                <div className="space-y-2">
                  <h1 className="font-reading text-[1.7rem] text-[#241815] sm:text-4xl">
                    {story.title}
                  </h1>
                  <p className="text-[0.92rem] text-[#5f534d] sm:text-lg">{story.titleTranslation}</p>
                  {story.authorUserId && story.authorName ? (
                    <AuthorAttribution
                      authorUserId={story.authorUserId}
                      authorName={story.authorName}
                    />
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {series ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <SeriesStepButton
                      direction="previous"
                      story={previousSeriesStory}
                    />
                    <SeriesStepButton
                      direction="next"
                      story={nextSeriesStory}
                    />
                  </div>
                ) : null}

                <Badge
                  variant="outline"
                  className={`rounded-full border px-4 py-2 text-sm font-medium ${hskMeta.chipClass}`}
                >
                  {hskLabel}
                </Badge>
              </div>
            </div>
          </div>

          <ReaderContent story={story} variant="page" />

          <div className="hidden md:block">
            <RecommendedLessons
              stories={stories}
              activeSlug={story.slug}
              series={series}
              readStoryIds={readStoryIds}
            />
          </div>
        </div>

      </div>
    </main>
  );
}

function SeriesStepButton({
  direction,
  story,
}: {
  direction: "previous" | "next";
  story: AppStory | null;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  const label = direction === "previous" ? "Previous" : "Next";

  if (!story) {
    return (
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#eadcd2] bg-[#f7f1eb] px-3 text-[0.82rem] font-medium text-[#b7aba4] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm">
        <Icon className="size-4" />
        {label}
      </span>
    );
  }

  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch={false}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#eadcd2] bg-white px-3 text-[0.82rem] font-medium text-[#4b4039] hover:bg-[#faf4ef] sm:h-10 sm:gap-2 sm:px-4 sm:text-sm"
    >
      <Icon className="size-4" />
      {label}
    </Link>
  );
}

